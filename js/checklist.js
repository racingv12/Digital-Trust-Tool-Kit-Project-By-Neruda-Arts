/* =========================================================
   Before-you-post checklist
   "Print the checklist" prints only the checklist section,
   so it fits on one page. "Clear ticks" unticks every box.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const printBtn = document.getElementById('checklist-print');
  const clearBtn = document.getElementById('checklist-clear');

  if (printBtn) {
    printBtn.addEventListener('click', () => {
      document.body.classList.add('print-checklist');
      window.print();
    });
    window.addEventListener('afterprint', () => {
      document.body.classList.remove('print-checklist');
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      document.querySelectorAll('#checklist input[type="checkbox"]').forEach(box => {
        box.checked = false;
      });
    });
  }
});
