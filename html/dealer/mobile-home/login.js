(() => {
  const form = document.querySelector('#mobile-login-form');
  const idInput = document.querySelector('#login-id');
  const passwordInput = document.querySelector('#login-password');
  const saveId = document.querySelector('#save-id');
  const toggle = document.querySelector('#password-toggle');
  const toast = document.querySelector('.login-toast');
  let toastTimer;

  const savedId = localStorage.getItem('linqDealerSavedId');
  if (savedId) idInput.value = savedId;

  function showToast(message) {
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 2200);
  }

  toggle.addEventListener('click', () => {
    const visible = passwordInput.type === 'text';
    passwordInput.type = visible ? 'password' : 'text';
    toggle.setAttribute('aria-label', visible ? '비밀번호 표시' : '비밀번호 숨기기');
    toggle.innerHTML = `<i data-lucide="${visible ? 'eye' : 'eye-off'}"></i>`;
    window.lucide?.createIcons({attrs:{'stroke-width':2}});
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (saveId.checked) localStorage.setItem('linqDealerSavedId', idInput.value.trim());
    else localStorage.removeItem('linqDealerSavedId');
    window.location.href = './index.html';
  });

  document.querySelector('#login-language').addEventListener('change', event => {
    showToast(event.target.value === 'ko' ? '한국어로 설정되었습니다.' : 'English 화면은 추후 연결됩니다.');
  });
  document.querySelectorAll('[data-demo-action]').forEach(button => button.addEventListener('click', () => showToast(`${button.dataset.demoAction} 기능은 실제 계정 서버 연결 시 제공됩니다.`)));
  window.lucide?.createIcons({attrs:{'stroke-width':2}});
})();
