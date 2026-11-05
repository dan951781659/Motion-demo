#!/usr/bin/env node
/**
 * 把 device-baseline/*.html 打包成「单文件自带资源」的版本。
 *
 * 背景：分享链接（资料库网页快照）只会带走根目录资源，device-baseline/ 下的
 * css / js / 图片不会被带走，导致设备预览只剩无样式 HTML。打包后每个页面
 * 不依赖任何同目录或上级目录文件，HTML 被取到就能完整渲染。
 *
 * 用法：
 *   node tools/bundle-device-pages.cjs            # 打包（原始文件备份到 device-baseline/_src/）
 *   node tools/bundle-device-pages.cjs --restore  # 用备份还原
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', 'device-baseline');
const SRC = path.join(ROOT, '_src');
const TMP = '/tmp/motion-bundle-assets';

const MIME = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.gif': 'image/gif', '.otf': 'font/otf', '.ttf': 'font/ttf',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.json': 'application/json'
};

const uriCache = new Map();

function hash(buf) {
  return crypto.createHash('sha1').update(buf).digest('hex').slice(0, 12);
}

function optimize(file, buf) {
  const ext = path.extname(file).toLowerCase();
  if (!['.png', '.jpg', '.jpeg'].includes(ext) || buf.length < 60 * 1024) return { buf, ext };
  fs.mkdirSync(TMP, { recursive: true });
  const out = path.join(TMP, hash(buf) + (ext === '.png' ? '.jpg' : ext));
  if (fs.existsSync(out)) return { buf: fs.readFileSync(out), ext: path.extname(out) };
  try {
    if (ext === '.png') {
      let alpha = false;
      try {
        alpha = /hasAlpha: yes/.test(execFileSync('sips', ['-g', 'hasAlpha', file], { encoding: 'utf8' }));
      } catch (_) {}
      if (alpha) {
        execFileSync('sips', ['-Z', '1000', file, '--out', out.replace(/\.jpg$/, '.png')], { stdio: 'ignore' });
        const p = out.replace(/\.jpg$/, '.png');
        return { buf: fs.readFileSync(p), ext: '.png' };
      }
    }
    execFileSync('sips', ['-Z', '1000', '-s', 'format', 'jpeg', '-s', 'formatOptions', '76', file, '--out', out], { stdio: 'ignore' });
    return { buf: fs.readFileSync(out), ext: out.slice(out.lastIndexOf('.')) };
  } catch (e) {
    return { buf, ext };
  }
}

function dataURI(file) {
  if (uriCache.has(file)) return uriCache.get(file);
  if (!fs.existsSync(file)) return null;
  let buf = fs.readFileSync(file);
  let ext = path.extname(file).toLowerCase();
  const opt = optimize(file, buf);
  buf = opt.buf; ext = opt.ext;
  const mime = MIME[ext] || MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
  const uri = 'data:' + mime + ';base64,' + buf.toString('base64');
  uriCache.set(file, uri);
  return uri;
}

function resolveAsset(raw, baseDir) {
  let p = raw.trim().replace(/^['"]|['"]$/g, '');
  if (!p || /^(data:|https?:|#|blob:)/i.test(p)) return null;
  p = p.split('?')[0].split('#')[0];
  const abs = path.resolve(baseDir, p);
  return fs.existsSync(abs) ? abs : null;
}

function inlineCssUrls(css, cssDir) {
  return css.replace(/url\(([^)]*)\)/gi, (m, inner) => {
    const abs = resolveAsset(inner, cssDir);
    if (!abs) return m;
    const uri = dataURI(abs);
    return uri ? 'url("' + uri + '")' : m;
  });
}

function readCss(href, baseDir) {
  const abs = resolveAsset(href, baseDir);
  if (!abs) return null;
  let css = fs.readFileSync(abs, 'utf8');
  css = inlineCssUrls(css, path.dirname(abs));
  return { abs, css };
}

function readJs(src, baseDir) {
  const abs = resolveAsset(src, baseDir);
  if (!abs) return null;
  let js = fs.readFileSync(abs, 'utf8');
  // 把 JS 里写死的图片路径换成内联数据，避免运行时再去取子目录资源
  js = js.replace(/(['"])((?:\.\.\/)?assets\/[^'"]+\.(?:png|jpe?g|webp|svg))\1/gi, (m, q, rel) => {
    const a = resolveAsset(rel, baseDir);
    if (!a) return m;
    const uri = dataURI(a);
    return uri ? q + uri + q : m;
  });
  // 摄像头画面是拼路径的，单独替换成预置映射
  js = js.replace(/const files=\[(.*?)\];/, 'const files=[$1];');
  js = js.replace(/'assets\/immersive-camera\/'\+file/g, 'window.__MOTION_CAM__[file]');
  return { abs, js };
}

function cameraMap(baseDir) {
  const dir = path.join(baseDir, 'assets', 'immersive-camera');
  if (!fs.existsSync(dir)) return '';
  const map = {};
  for (const f of fs.readdirSync(dir)) {
    const uri = dataURI(path.join(dir, f));
    if (uri) map[f] = uri;
  }
  return 'window.__MOTION_CAM__=' + JSON.stringify(map) + ';';
}

function bundleHtml(file) {
  const baseDir = path.dirname(file);
  let html = fs.readFileSync(file, 'utf8');
  const headAdd = [];
  const tailScripts = [];

  // 1. 去掉外网字体（国内网络不可达，且快照里也取不到）
  html = html.replace(/<link[^>]*rel=["']preconnect["'][^>]*>/gi, '');
  html = html.replace(/<link[^>]*href=["']https:\/\/fonts\.googleapis\.com[^"']*["'][^>]*>/gi, '');
  html = html.replace(/<link[^>]*href=["']https:\/\/fonts\.gstatic\.com[^"']*["'][^>]*>/gi, '');

  // 2. CSS → <style>
  html = html.replace(/<link\b([^>]*?)href=["']([^"']+)["']([^>]*?)>/gi, (m, pre, href, post) => {
    if (!/stylesheet/i.test(pre + post)) return m;
    const hit = readCss(href, baseDir);
    if (!hit) return m;
    return '<style data-src="' + href + '">\n' + hit.css + '\n</style>';
  });

  // 3. JS → <script>
  //    defer 的脚本必须延后到解析完成，否则 i18n 等在 DOM 就绪前执行会失效，
  //    统一挪到 </body> 前，顺序不变，语义与 defer 一致。
  html = html.replace(/<script\b([^>]*?)src=["']([^"']+)["']([^>]*?)><\/script>/gi, (m, pre, src, post) => {
    const hit = readJs(src, baseDir);
    if (!hit) return m;
    const tag = '<script data-src="' + src + '">\n' + hit.js + '\n</script>';
    if (/\bdefer\b|\basync\b/i.test(pre + post)) {
      tailScripts.push(tag);
      return '';
    }
    return tag;
  });

  // 3.5 页面内联 <style> 里的 url() 也要内联
  html = html.replace(/<style([^>]*)>([\s\S]*?)<\/style>/gi, (m, attrs, css) => {
    if (/data-src=/.test(attrs)) return m;
    return '<style' + attrs + '>' + inlineCssUrls(css, baseDir) + '</style>';
  });

  // 4. 图片 / poster / srcset / 内联 style 背景
  html = html.replace(/\b(src|href|poster)=["']((?:\.\.\/)?assets\/[^"']+)["']/gi, (m, attr, rel) => {
    const abs = resolveAsset(rel, baseDir);
    if (!abs) return m;
    const uri = dataURI(abs);
    return uri ? attr + '="' + uri + '"' : m;
  });
  html = html.replace(/\bsrcset=["']([^"']+)["']/gi, (m, val) => {
    const parts = val.split(',').map(s => s.trim()).filter(Boolean).map(item => {
      const [u, d] = item.split(/\s+/);
      const abs = resolveAsset(u, baseDir);
      const uri = abs && dataURI(abs);
      return uri ? uri + (d ? ' ' + d : '') : item;
    });
    return 'srcset="' + parts.join(', ') + '"';
  });
  html = html.replace(/style=["']([^"']*url\([^"']+)["']/gi, (m, val) => {
    return 'style="' + inlineCssUrls(val, baseDir) + '"';
  });

  // 5. 摄像头映射表
  const cam = cameraMap(baseDir);
  if (cam && (/__MOTION_CAM__/.test(html) || tailScripts.some(t => t.includes('__MOTION_CAM__')))) {
    tailScripts.unshift('<script>' + cam + '</script>');
  }

  if (headAdd.length) html = html.replace(/<\/head>/i, headAdd.join('\n') + '\n</head>');
  if (tailScripts.length) html = html.replace(/<\/body>/i, tailScripts.join('\n') + '\n</body>');

  fs.writeFileSync(file, html);
  return { file, size: Buffer.byteLength(html) };
}

function restore() {
  let n = 0;
  for (const f of fs.readdirSync(SRC)) {
    if (!f.endsWith('.html')) continue;
    fs.copyFileSync(path.join(SRC, f), path.join(ROOT, f));
    n++;
  }
  console.log('已还原 ' + n + ' 个页面');
}

if (process.argv.includes('--restore')) {
  restore();
  process.exit(0);
}

fs.mkdirSync(SRC, { recursive: true });
const pages = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));
let total = 0;
for (const f of pages) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(path.join(SRC, f))) fs.copyFileSync(p, path.join(SRC, f));
  const r = bundleHtml(p);
  total += r.size;
  console.log((f + '                          ').slice(0, 34), (r.size / 1024).toFixed(0) + ' KB');
}
console.log('页面数 ' + pages.length + '，合计 ' + (total / 1024 / 1024).toFixed(1) + ' MB');
