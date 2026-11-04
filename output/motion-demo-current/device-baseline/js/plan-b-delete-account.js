(() => {
  'use strict';
  // Deliberately isolated prototype: no account API or shared storage mutations.
  const $ = id => document.getElementById(id);
  let step = 'review', sentAt = 0, resendAt = 0, verified = false, busy = false;
  const modal = $('finalModal');
  const screen = $('deleteScreen');
  const home = () => { location.href = 'plan-b-account-settings.html'; };
  function showStep(next) {
    step = next;
    ['review','verify','done'].forEach(name => { $(name + 'Step').hidden = name !== next; });
    $('stepLabel').textContent = next === 'review' ? '1 OF 2' : next === 'verify' ? '2 OF 2' : 'COMPLETE';
    $('backBtn').hidden = next === 'done';
    screen.scrollTop = 0;
    $(next + 'Step').querySelector('h1').focus({preventScroll:true});
  }
  function error(message) {
    $('codeError').textContent = message;
    $('verificationCode').setAttribute('aria-invalid', message ? 'true' : 'false');
    if (message) $('verificationCode').focus();
  }
  function closeModal() {
    if (busy) return;
    modal.hidden = true;
    screen.inert = false;
    $('verifyForm').querySelector('[type=submit]').focus();
  }
  $('acknowledge').addEventListener('change', () => { $('continueBtn').disabled = !$('acknowledge').checked; });
  $('continueBtn').addEventListener('click', () => { if ($('acknowledge').checked) showStep('verify'); });
  $('backBtn').addEventListener('click', () => { if (step === 'verify') { verified = false; showStep('review'); } else home(); });
  document.querySelectorAll('[data-keep]').forEach(button => button.addEventListener('click', home));
  $('sendCodeBtn').addEventListener('click', () => {
    if (Date.now() < resendAt) return;
    sentAt = Date.now(); resendAt = sentAt + 30000; verified = false;
    $('verificationCode').value = ''; error('');
    $('codeStatus').textContent = 'The verification code is ready. It expires in 5 minutes.';
    updateResend(); $('verificationCode').focus();
  });
  function updateResend() {
    const seconds = Math.max(0, Math.ceil((resendAt - Date.now()) / 1000));
    $('sendCodeBtn').disabled = seconds > 0;
    $('sendCodeBtn').textContent = seconds ? `Resend code in ${seconds}s` : sentAt ? 'Resend code' : 'Send code';
  }
  setInterval(updateResend, 1000);
  $('verificationCode').addEventListener('input', () => { verified = false; error(''); });
  $('verifyForm').addEventListener('submit', event => {
    event.preventDefault();
    const value = $('verificationCode').value.trim();
    if (!sentAt) return error('Select Send code to get a verification code first.');
    if (Date.now() - sentAt > 300000) return error('This code has expired. Select Resend code to try again.');
    if (!/^\d{6}$/.test(value)) return error('Enter the 6-digit verification code.');
    if (value !== '123456') return error('Incorrect code. Please try again.');
    error(''); verified = true; screen.inert = true; modal.hidden = false; $('cancelDeleteBtn').focus();
  });
  $('cancelDeleteBtn').addEventListener('click', () => { closeModal(); if (!busy) home(); });
  modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });
  document.addEventListener('keydown', event => {
    if (modal.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); closeModal(); }
    if (event.key === 'Tab') {
      const buttons = [...modal.querySelectorAll('button:not(:disabled)')];
      if (!buttons.length) { event.preventDefault(); return; }
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  $('confirmDeleteBtn').addEventListener('click', () => {
    if (busy || !verified || !$('acknowledge').checked) return;
    if (Date.now() - sentAt > 300000) { closeModal(); verified = false; return error('Verification has expired. Request a new code.'); }
    busy = true;
    modal.setAttribute('aria-busy','true');
    $('cancelDeleteBtn').disabled = $('confirmDeleteBtn').disabled = true;
    $('confirmDeleteBtn').textContent = 'Closing account…';
    $('deleteStatus').textContent = 'Processing account closure…';
    modal.querySelector('[role=dialog]').focus();
    setTimeout(() => {
      busy = false; verified = false; modal.hidden = true; screen.inert = false;
      modal.removeAttribute('aria-busy'); showStep('done');
    }, 1200);
  });
})();
