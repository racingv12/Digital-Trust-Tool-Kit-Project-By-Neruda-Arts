/* =========================================================
   Before-you-post checklist
   "Print the checklist" prints only the checklist section,
   so it fits on one page. "Clear ticks" unticks every box.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const printBtn = document.getElementById('checklist-print');
  const clearBtn = document.getElementById('checklist-clear');

  // "Print the checklist" and "Print the activities" each print only their own section
  // (the CSS hides everything else while the body has the class).
  const printButtons = [
    [printBtn, 'print-checklist'],
    [document.getElementById('activities-print'), 'print-activities']
  ];
  printButtons.forEach(([btn, cls]) => {
    if (!btn) return;
    btn.addEventListener('click', () => {
      document.body.classList.add(cls);
      window.print();
    });
  });
  window.addEventListener('afterprint', () => {
    document.body.classList.remove('print-checklist', 'print-activities');
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      document.querySelectorAll('#checklist input[type="checkbox"]').forEach(box => {
        box.checked = false;
      });
    });
  }
});
