// ===============================
// Custom JS for Admin Panel
// ===============================

// Confirm before delete
document.addEventListener('DOMContentLoaded', () => {
  const deleteForms = document.querySelectorAll('form[action*="DELETE"]');
  deleteForms.forEach(form => {
    form.addEventListener('submit', e => {
      if (!confirm('Are you sure you want to delete this item?')) {
        e.preventDefault();
      }
    });
  });
});

// Auto dismiss flash messages
setTimeout(() => {
  const alerts = document.querySelectorAll('.alert');
  alerts.forEach(a => a.remove());
}, 3000);
