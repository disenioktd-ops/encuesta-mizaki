const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw96vWwqSPaNxvrIf34vMYX7D4W5ukyJh6Mpg9NrUl4LXj0y-3YmtiRxyChJRJquKp_/exec';

// --- Pills (sucursal) ---
document.querySelectorAll('#sucursal-group .pill').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('#sucursal-group .pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    document.getElementById('sucursal').value = pill.dataset.value;
  });
});

// --- Estrellas ---
document.querySelectorAll('.stars').forEach(group => {
  const field = group.dataset.field;
  const hidden = document.getElementById(field);
  const stars = group.querySelectorAll('.star');

  stars.forEach((star, idx) => {
    star.addEventListener('mouseenter', () => paintStars(stars, idx));
    star.addEventListener('mouseleave', () => paintStars(stars, parseInt(hidden.value || '0') - 1));
    star.addEventListener('click', () => {
      hidden.value = star.dataset.value;
      paintStars(stars, idx);
    });
  });
});

function paintStars(stars, upTo) {
  stars.forEach((s, i) => s.classList.toggle('active', i <= upTo));
}

// --- NPS ---
document.querySelectorAll('.nps-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nps-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('nps').value = btn.dataset.value;
  });
});

// --- Submit ---
document.getElementById('survey-form').addEventListener('submit', async e => {
  e.preventDefault();

  const errorEl = document.getElementById('error-msg');
  const btn = document.querySelector('.btn-submit');
  if (!errorEl || !btn) {
    console.error('Missing required DOM elements');
    return;
  }

  const data = {
    sucursal:   document.getElementById('sucursal').value,
    visitas:    document.querySelector('input[name="visitas"]:checked')?.value || '',
    espera:     document.getElementById('espera').value,
    personal:   document.getElementById('personal').value,
    ambiente:   document.getElementById('ambiente').value,
    sabor:      document.getElementById('sabor').value,
    porcion:    document.getElementById('porcion').value,
    precios:    document.getElementById('precios').value,
    nps:        document.getElementById('nps').value,
    comentario: document.getElementById('comentario').value.trim(),
    nombre:     document.getElementById('nombre').value.trim(),
    correo:     document.getElementById('correo').value.trim()
  };

  const required = [
    [data.sucursal,  'Selecciona una sucursal'],
    [data.visitas,   'Indica cuántas veces nos has visitado'],
    [data.espera,    'Califica el tiempo de espera'],
    [data.personal,  'Califica la atención del personal'],
    [data.ambiente,  'Califica el ambiente'],
    [data.sabor,     'Califica el sabor y calidad'],
    [data.porcion,   'Califica el tamaño de la porción'],
    [data.precios,   'Califica los precios'],
    [data.nps,       'Indica qué tan probable es que nos recomiendes'],
    [data.nombre,    'Escribe tu nombre completo para obtener el descuento'],
    [data.correo,    'Escribe tu correo electrónico para obtener el descuento'],
  ];

  const failed = required.find(([val]) => !val);
  if (failed) {
    errorEl.textContent = failed[1];
    errorEl.style.display = 'block';
    errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  errorEl.style.display = 'none';

  btn.textContent = 'Enviando...';
  btn.disabled = true;

  try {
    // Google Apps Script blocks CORS responses in the browser, so fetch will
    // often throw even when the data IS saved in the sheet. The optimistic
    // redirect is intentional — this is the standard approach for GAS forms.
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 8000)
    );
    const params = new URLSearchParams({ action: 'submit', ...data });
    await Promise.race([
      fetch(`${APPS_SCRIPT_URL}?${params}`),
      timeout
    ]);
  } catch (err) {
    // Log error but still redirect — data was likely saved (GAS CORS quirk)
    console.warn('Fetch note (data likely saved):', err.message);
  }

  window.location.href = 'gracias.html';
});
