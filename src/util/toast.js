import { Toast } from 'bootstrap';

export function showToast({ title = '', message = '', type = 'info', delay = 5000 }) {
  // Create toast container if it doesn't exist
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    document.body.appendChild(container);
  }

  // Create toast element
  const toastEl = document.createElement('div');
  toastEl.className = `toast align-items-center border-0`;
  toastEl.style.backgroundColor =
    type === 'success'
      ? 'var(--color-accent)'
      : type === 'error'
      ? 'var(--color-error)'
      : type === 'warning'
      ? 'var(--color-warning)'
      : 'var(--color-error)';
  toastEl.style.color = 'var(--text-inverse)';
  toastEl.setAttribute('role', 'alert');
  toastEl.setAttribute('aria-live', 'assertive');
  toastEl.setAttribute('aria-atomic', 'true');

  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        <strong>${title}</strong><br />
        ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  // Style the close button with accent color tone
  const closeBtn = toastEl.querySelector('.btn-close');
  closeBtn.style.filter = 'invert(50%) sepia(90%) saturate(300%) hue-rotate(75deg)';
  closeBtn.style.width = '1.5rem';
  closeBtn.style.height = '1.5rem';
  closeBtn.style.fontSize = '1.25rem';
  closeBtn.style.padding = '0.75rem';
  closeBtn.style.minWidth = '2.5rem';
  closeBtn.style.minHeight = '2.5rem';

  const bodyEl = toastEl.querySelector('.toast-body');
  bodyEl.style.fontSize = '1.1rem';
  bodyEl.style.lineHeight = '1.4';

  container.appendChild(toastEl);

  // Initialize and show the toast
  const toast = new Toast(toastEl, { delay });
  toast.show();

  // Remove from DOM after hidden
  toastEl.addEventListener('hidden.bs.toast', () => {
    toastEl.remove();
  });
}

// dev quick test
window.testToast = () => {
  showToast({ title: '테스트', message: '토스트 정상 출력 👍', type: 'success' });
};
