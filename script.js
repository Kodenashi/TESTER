function updatePreview(evtOrForm) {
  let form = null;

  if (evtOrForm && evtOrForm.nodeName === 'FORM') {
    form = evtOrForm;
  } else if (evtOrForm && evtOrForm.target) {
    form = evtOrForm.target.closest('form');
  } else {
    form = document.querySelector('form.template-form.active');
  }
  if (!form) return;

  const lines = [];

  form.querySelectorAll('input, textarea, select').forEach(el => {
    if (el.classList.contains('change-text')) return; 
    if (el.type === 'button') return;
    if (el.style.display === "none") return; 

    const val = (el.value || '').trim();
    if (!val) return;

    const labelEl = el.previousElementSibling;
    const label = labelEl ? labelEl.textContent.trim() : '';
    lines.push(`${label} ${val}`.trim());
  });

  const changeEls = form.querySelectorAll('#changeRequests .change-text');
  changeEls.forEach((el, idx) => {
    const val = (el.value || '').trim();
    if (val) lines.push(`Change Request ${idx + 1}: ${val}`);
  });

  const preview = form.querySelector('.preview-box');
  if (preview) preview.textContent = lines.join('\n');
}

document.querySelectorAll('form.template-form').forEach(form => {
  form.addEventListener('input', updatePreview);
});

function copyPreview(formId) {
  const preview = document.querySelector(`#${formId} .preview-box`);
  if (!preview) return;
  navigator.clipboard.writeText(preview.textContent || '').then(() => {
    alert('Copied to clipboard!');
  });
}

function resetForm(formOrId) {
  const form = typeof formOrId === "string"
    ? document.getElementById(formOrId)
    : formOrId;

  if (!form) return;

  form.reset();

  const preview = form.querySelector('.preview-box');
  if (preview) preview.textContent = '';

  const changeFields = form.querySelectorAll('#changeRequests .change-request-field');
  changeFields.forEach(f => f.remove());

  const pegaReason = form.querySelector('#pegaReasonWrapper');
  if (pegaReason) pegaReason.style.display = "none";

  const osadReasonWrapper = form.querySelector('#pegaOsadReasonWrapper');
  if (osadReasonWrapper) {
    osadReasonWrapper.style.display = "none";
    const osadReason = form.querySelector('#pegaOsadReason');
    if (osadReason) osadReason.value = "";
  }
}

function hideAllForms() {
  document.querySelectorAll('.template-form.active').forEach(f => f.classList.remove('active'));
}

function hideOtherContainers(currentContainer) {
  document.querySelectorAll('.template-selector-container').forEach(c => {
    c.style.display = (c === currentContainer) ? '' : 'none';
  });
}

function addBackButtons(form) {
  if (!form) return;

  if (!form.querySelector('.btn-back.top')) {
    const topBtn = document.createElement('button');
    topBtn.type = 'button';
    topBtn.className = 'btn-back top';
    topBtn.textContent = '← Back to template selector';
    topBtn.style.margin = '8px 0 12px';
    topBtn.addEventListener('click', backToSelector);
    form.insertBefore(topBtn, form.firstChild);
  }

  if (!form.querySelector('.btn-back.bottom')) {
    const bottomBtn = document.createElement('button');
    bottomBtn.type = 'button';
    bottomBtn.className = 'btn-back bottom';
    bottomBtn.textContent = '← Back to template selector';
    bottomBtn.style.margin = '12px 0 8px';
    bottomBtn.addEventListener('click', backToSelector);
    form.appendChild(bottomBtn);
  }
}

function backToSelector() {
  document.querySelectorAll('form.template-form.active').forEach(f => {
    resetForm(f);
    f.classList.remove('active');
  });

  document.querySelectorAll('.template-selector-container').forEach(c => (c.style.display = ''));
  document.querySelectorAll('.template-selector-container select').forEach(sel => {
    sel.style.display = '';
    sel.value = '';
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showPegaForm() {
  const dropdown = document.getElementById('pegaDropdown');
  const selectedId = dropdown.value;
  const pegaContainer = dropdown.closest('.template-selector-container');

  hideAllForms();
  if (!selectedId) return;

  const form = document.getElementById(selectedId);
  if (form) {
    form.classList.add('active');
    addBackButtons(form);
    updatePreview(form);

    const osadSelect = form.querySelector('#pegaOsad');
    const reasonWrapper = form.querySelector('#pegaReasonWrapper');
    if (osadSelect && reasonWrapper) {
      osadSelect.addEventListener('change', () => {
        if (osadSelect.value === "Y") {
          reasonWrapper.style.display = "block";
        } else {
          reasonWrapper.style.display = "none";
        }
        updatePreview(form);
      });
    }
  }

  hideOtherContainers(pegaContainer);
  dropdown.style.display = 'none';
}

function showPPCCForm() {
  const dropdown = document.getElementById('ppccDropdown');
  const selectedId = dropdown.value;
  const ppccContainer = dropdown.closest('.template-selector-container');

  hideAllForms();
  if (!selectedId) return;

  const form = document.getElementById(selectedId);
  if (form) {
    form.classList.add('active');
    addBackButtons(form);
    updatePreview(form);
  }

  hideOtherContainers(ppccContainer);
  dropdown.style.display = 'none';
}

function showOSADForm() {
  const dropdown = document.getElementById('osadDropdown');
  const selectedId = dropdown.value;
  const osadContainer = dropdown.closest('.template-selector-container');

  hideAllForms();
  if (!selectedId) return;

  const form = document.getElementById(selectedId);
  if (form) {
    form.classList.add('active');
    addBackButtons(form);
    updatePreview(form);
  }

  hideOtherContainers(osadContainer);
  dropdown.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
  const addBtn = document.getElementById('addChangeBtn');
  const container = document.getElementById('changeRequests');

  if (addBtn && container) {
    addBtn.addEventListener('click', () => {
      const form = addBtn.closest('form');

      const wrapper = document.createElement('div');
      wrapper.className = 'change-request-field';

      const textarea = document.createElement('textarea');
      textarea.className = 'change-text';
      textarea.placeholder = 'Describe the change request...';
      textarea.addEventListener('input', updatePreview);

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'btn-delete';
      delBtn.textContent = 'Delete';
      delBtn.addEventListener('click', () => {
        wrapper.remove();
        updatePreview(form);
      });

      wrapper.appendChild(textarea);
      wrapper.appendChild(delBtn);
      container.appendChild(wrapper);

      updatePreview(form);
    });
  }
});

function toggleOsadReason() {
  const osadDropdown = document.getElementById("pegaOsad");
  const osadReasonWrapper = document.getElementById("pegaOsadReasonWrapper");

  if (osadDropdown.value === "Y") {
    osadReasonWrapper.style.display = "block";
  } else {
    osadReasonWrapper.style.display = "none";
    document.getElementById("pegaOsadReason").value = ""; 
  }
}
