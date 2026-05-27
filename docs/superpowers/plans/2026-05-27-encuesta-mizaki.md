# Encuesta de Calidad MIZAKI — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir un sitio web de encuesta de satisfacción con identidad visual MIZAKI, que guarda respuestas en Google Sheets y tiene un panel de administración con gráficas y tabla de respuestas individuales.

**Architecture:** Sitio estático (HTML/CSS/JS puro). La encuesta envía datos vía `fetch()` GET a un Google Apps Script Web App, el cual escribe una fila en Google Sheets. El panel admin obtiene los datos desde el mismo Apps Script y los visualiza con Chart.js. Hospedado en GitHub Pages de forma gratuita.

**Tech Stack:** HTML5, CSS3 (custom properties), Vanilla JavaScript ES6+, Google Apps Script, Google Sheets, Chart.js 4 (CDN), GitHub Pages

---

## Estructura de archivos

```
encuesta-mizaki/
├── index.html          → Formulario público de encuesta
├── gracias.html        → Pantalla post-envío
├── admin.html          → Panel de administración
└── assets/
    ├── logo.png        → Logo MIZAKI (guardado manualmente del chat)
    ├── style.css       → Todos los estilos
    ├── survey.js       → Lógica del formulario
    └── admin.js        → Lógica del panel admin
```

---

## Task 1: Scaffolding — Crear estructura de archivos

**Files:**
- Create: `index.html`
- Create: `gracias.html`
- Create: `admin.html`
- Create: `assets/style.css`
- Create: `assets/survey.js`
- Create: `assets/admin.js`

- [ ] **Paso 1.1: Crear carpeta `assets/`**

  En la carpeta raíz del proyecto (`encuesta-mizaki/`), crear la carpeta `assets/`.

- [ ] **Paso 1.2: Guardar el logo**

  Guardar la imagen del logo completo de MIZAKI ("MIZAKI RESTAURANTE FUSIÓN JAPONESA" con fondo blanco) como `assets/logo.png`. Esta imagen fue compartida en el chat de diseño.

- [ ] **Paso 1.3: Crear archivos vacíos**

  Crear los siguientes archivos vacíos (se llenarán en tareas posteriores):
  - `index.html`
  - `gracias.html`
  - `admin.html`
  - `assets/style.css`
  - `assets/survey.js`
  - `assets/admin.js`

- [ ] **Paso 1.4: Verificar estructura**

  El árbol del proyecto debe verse así:
  ```
  encuesta-mizaki/
  ├── index.html
  ├── gracias.html
  ├── admin.html
  └── assets/
      ├── logo.png
      ├── style.css
      ├── survey.js
      └── admin.js
  ```

- [ ] **Paso 1.5: Commit**

  ```bash
  git init
  git add .
  git commit -m "chore: scaffolding inicial del proyecto"
  ```

---

## Task 2: Google Apps Script — Backend y Google Sheets

**Archivos involucrados:** Script en Google Drive (externo al repositorio)

- [ ] **Paso 2.1: Crear Google Sheet**

  1. Ir a [drive.google.com](https://drive.google.com)
  2. Crear nueva hoja de cálculo
  3. Nombrarla: `Encuesta MIZAKI`
  4. En la pestaña inferior, renombrar la hoja `Hoja1` a `Respuestas`
  5. Copiar el **ID** de la hoja desde la URL:
     ```
     https://docs.google.com/spreadsheets/d/ESTE_ES_EL_ID/edit
     ```

- [ ] **Paso 2.2: Abrir Apps Script**

  En la hoja de cálculo: `Extensiones > Apps Script`

- [ ] **Paso 2.3: Pegar el código del script**

  Borrar todo el contenido del editor y pegar exactamente este código. Reemplazar `TU_SHEET_ID_AQUI` con el ID copiado en el paso 2.1, y cambiar `Mizaki2024!` por la contraseña que quieras usar para el admin:

  ```javascript
  const SHEET_ID = 'TU_SHEET_ID_AQUI';
  const SHEET_NAME = 'Respuestas';
  const ADMIN_PASSWORD = 'Mizaki2024!';

  function doGet(e) {
    const action = e.parameter.action;
    if (action === 'submit') return handleSubmit(e);
    if (action === 'getData') return handleGetData(e);
    return ContentService.createTextOutput(JSON.stringify({ error: 'accion invalida' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  function handleSubmit(e) {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp','Sucursal','Visitas','Espera','Personal','Ambiente','Sabor','Porcion','Precios','NPS','Comentario']);
    }
    sheet.appendRow([
      new Date(),
      e.parameter.sucursal || '',
      e.parameter.visitas || '',
      Number(e.parameter.espera) || 0,
      Number(e.parameter.personal) || 0,
      Number(e.parameter.ambiente) || 0,
      Number(e.parameter.sabor) || 0,
      Number(e.parameter.porcion) || 0,
      Number(e.parameter.precios) || 0,
      Number(e.parameter.nps) || 0,
      e.parameter.comentario || ''
    ]);
    return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  function handleGetData(e) {
    if (e.parameter.password !== ADMIN_PASSWORD) {
      return ContentService.createTextOutput(JSON.stringify({ error: 'unauthorized' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }
    const rows = data.slice(1);
    const result = rows.map(row => ({
      timestamp: row[0] instanceof Date ? row[0].toISOString() : String(row[0]),
      sucursal:  row[1],
      visitas:   row[2],
      espera:    row[3],
      personal:  row[4],
      ambiente:  row[5],
      sabor:     row[6],
      porcion:   row[7],
      precios:   row[8],
      nps:       row[9],
      comentario: row[10]
    }));
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
  ```

- [ ] **Paso 2.4: Guardar y nombrar el proyecto**

  `Ctrl+S` → Nombrar el proyecto: `Encuesta MIZAKI API`

- [ ] **Paso 2.5: Desplegar como Web App**

  1. Clic en `Implementar > Nueva implementación`
  2. Tipo: `Aplicación web`
  3. Ejecutar como: `Yo`
  4. Quién tiene acceso: `Cualquier persona`
  5. Clic en `Implementar`
  6. Autorizar los permisos cuando se solicite
  7. **Copiar la URL** de la Web App — tiene este formato:
     ```
     https://script.google.com/macros/s/XXXXXXXXXX/exec
     ```

- [ ] **Paso 2.6: Probar el endpoint de submit**

  Abrir en el navegador esta URL (reemplazando con la URL real):
  ```
  https://script.google.com/macros/s/TU_URL/exec?action=submit&sucursal=Ibero&visitas=Primera%20vez&espera=5&personal=5&ambiente=4&sabor=5&porcion=4&precios=3&nps=9&comentario=Prueba
  ```
  Debe responder: `{"status":"ok"}` y aparecer una fila en Google Sheets.

---

## Task 3: style.css — Sistema de diseño completo

**Files:**
- Write: `assets/style.css`

- [ ] **Paso 3.1: Escribir el CSS completo**

  Escribir el siguiente contenido en `assets/style.css`:

  ```css
  /* === Variables === */
  :root {
    --bg:        #000000;
    --surface:   #111111;
    --border:    #222222;
    --accent:    #F3033E;
    --text:      #FFFFFF;
    --muted:     #888888;
    --star-off:  #333333;
    --font:      'Red Hat Display', sans-serif;
    --radius:    8px;
    --max-w:     640px;
  }

  /* === Reset === */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* === Base === */
  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font);
    font-size: 16px;
    line-height: 1.6;
    min-height: 100vh;
  }

  /* === Survey layout === */
  .survey-container {
    max-width: var(--max-w);
    margin: 0 auto;
    padding: 0 20px 60px;
  }

  .survey-header {
    text-align: center;
    padding: 32px 0 24px;
  }

  .logo-wrapper {
    background: #fff;
    display: inline-block;
    padding: 16px 24px;
    border-radius: var(--radius);
    margin-bottom: 20px;
  }

  .logo { height: 60px; width: auto; display: block; }

  .tagline {
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  /* === Form group === */
  .form-group {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
    margin-bottom: 16px;
  }

  .question-label {
    display: block;
    font-weight: 700;
    font-size: 1rem;
    margin-bottom: 14px;
  }

  .optional { font-weight: 400; color: var(--muted); font-size: .875rem; }
  .hint { font-size: .8rem; color: var(--muted); margin-bottom: 14px; }

  /* === Pills (sucursal) === */
  .pill-group { display: flex; flex-wrap: wrap; gap: 8px; }

  .pill {
    padding: 8px 18px;
    background: transparent;
    border: 1.5px solid var(--border);
    border-radius: 50px;
    color: var(--text);
    font-family: var(--font);
    font-size: .9rem;
    cursor: pointer;
    transition: all .15s ease;
  }
  .pill:hover { border-color: var(--accent); color: var(--accent); }
  .pill.active { background: var(--accent); border-color: var(--accent); color: #fff; font-weight: 700; }

  /* === Radios === */
  .radio-group { display: flex; flex-direction: column; gap: 10px; }

  .radio-option { display: flex; align-items: center; gap: 10px; cursor: pointer; }
  .radio-option input[type="radio"] { display: none; }

  .radio-custom {
    width: 20px; height: 20px;
    border-radius: 50%;
    border: 2px solid var(--muted);
    flex-shrink: 0;
    transition: all .15s ease;
    position: relative;
  }

  .radio-option input[type="radio"]:checked + .radio-custom {
    border-color: var(--accent);
    background: var(--accent);
  }

  .radio-option input[type="radio"]:checked + .radio-custom::after {
    content: '';
    position: absolute;
    width: 8px; height: 8px;
    background: #fff;
    border-radius: 50%;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
  }

  .radio-text { font-size: .95rem; }

  /* === Star ratings === */
  .rating-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid var(--border);
  }
  .rating-row:last-of-type { border-bottom: none; }

  .rating-label { font-size: .9rem; flex: 1; }

  .stars { display: flex; gap: 4px; }

  .star {
    font-size: 1.6rem;
    cursor: pointer;
    color: var(--star-off);
    transition: color .1s ease;
    user-select: none;
    line-height: 1;
  }
  .star.active { color: var(--accent); }

  /* === NPS grid === */
  .nps-grid {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    gap: 6px;
    margin-top: 10px;
  }

  .nps-btn {
    aspect-ratio: 1;
    background: transparent;
    border: 1.5px solid var(--border);
    border-radius: 4px;
    color: var(--text);
    font-family: var(--font);
    font-size: .85rem;
    font-weight: 700;
    cursor: pointer;
    transition: all .15s ease;
  }
  .nps-btn:hover { border-color: var(--accent); color: var(--accent); }
  .nps-btn.active { background: var(--accent); border-color: var(--accent); color: #fff; }

  /* === Textarea === */
  .textarea-field {
    width: 100%;
    background: var(--bg);
    border: 1.5px solid var(--border);
    border-radius: var(--radius);
    color: var(--text);
    font-family: var(--font);
    font-size: .95rem;
    padding: 12px;
    resize: vertical;
    transition: border-color .15s ease;
  }
  .textarea-field:focus { outline: none; border-color: var(--accent); }
  .textarea-field::placeholder { color: var(--muted); }

  /* === Error === */
  .error-msg {
    background: rgba(243,3,62,.1);
    border: 1px solid var(--accent);
    border-radius: var(--radius);
    color: var(--accent);
    padding: 12px 16px;
    margin-bottom: 16px;
    font-size: .9rem;
  }

  /* === Submit === */
  .btn-submit {
    width: 100%;
    padding: 16px;
    background: var(--accent);
    border: none;
    border-radius: var(--radius);
    color: #fff;
    font-family: var(--font);
    font-size: 1rem;
    font-weight: 900;
    letter-spacing: .08em;
    cursor: pointer;
    transition: opacity .15s ease;
    margin-top: 8px;
  }
  .btn-submit:hover { opacity: .9; }
  .btn-submit:disabled { opacity: .5; cursor: not-allowed; }

  /* === Footer === */
  .survey-footer {
    text-align: center;
    padding: 24px 0;
    color: var(--muted);
    font-size: .8rem;
    letter-spacing: .05em;
  }

  /* === Thank you page === */
  .thanks-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 40px 20px;
  }
  .thanks-container .logo-wrapper { margin-bottom: 32px; }
  .checkmark { font-size: 4rem; color: var(--accent); margin-bottom: 16px; }
  .thanks-content h1 { font-size: 1.75rem; font-weight: 900; margin-bottom: 12px; }
  .thanks-content p { color: var(--muted); margin-bottom: 8px; }
  .subtext { font-style: italic; }

  /* === Admin === */
  .admin-body { background: #0a0a0a; }

  .admin-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px 60px;
  }

  .admin-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px 0;
    border-bottom: 1px solid var(--border);
    margin-bottom: 24px;
  }

  .logo-wrapper--small { padding: 8px 12px; }
  .logo--small { height: 36px; }

  .admin-title { flex: 1; font-size: 1.25rem; font-weight: 700; }

  .btn-logout {
    background: transparent;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--muted);
    font-family: var(--font);
    font-size: .8rem;
    padding: 6px 14px;
    cursor: pointer;
  }
  .btn-logout:hover { border-color: var(--accent); color: var(--accent); }

  /* Stats bar */
  .stats-bar {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 20px;
  }

  .stat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px;
    text-align: center;
  }

  .stat-value { display: block; font-size: 2rem; font-weight: 900; color: var(--accent); }
  .stat-label { font-size: .8rem; color: var(--muted); }

  /* Filter */
  .filter-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; font-size: .9rem; }

  .branch-select {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text);
    font-family: var(--font);
    font-size: .9rem;
    padding: 6px 12px;
  }

  /* View toggle */
  .view-toggle { display: flex; gap: 8px; margin-bottom: 20px; }

  .toggle-btn {
    padding: 8px 20px;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--muted);
    font-family: var(--font);
    font-size: .9rem;
    cursor: pointer;
  }
  .toggle-btn.active { background: var(--accent); border-color: var(--accent); color: #fff; font-weight: 700; }

  /* Charts */
  .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }

  .chart-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
  }

  .chart-card h3, .comments-card h3 {
    font-size: .9rem;
    font-weight: 700;
    margin-bottom: 16px;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: .05em;
  }

  /* Comments */
  .comments-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
    margin-bottom: 16px;
  }

  .comments-list { list-style: none; display: flex; flex-direction: column; gap: 12px; }

  .comment-item {
    padding: 12px;
    background: var(--bg);
    border-radius: var(--radius);
    border-left: 3px solid var(--accent);
  }

  .comment-branch {
    display: inline-block;
    font-size: .75rem;
    background: var(--accent);
    color: #fff;
    padding: 2px 8px;
    border-radius: 50px;
    margin-bottom: 6px;
    font-weight: 700;
  }

  .comment-text { display: block; font-size: .9rem; margin-bottom: 4px; }
  .comment-date { font-size: .75rem; color: var(--muted); }
  .no-comments { color: var(--muted); font-size: .9rem; text-align: center; padding: 20px; }

  /* Table */
  .table-wrapper {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow-x: auto;
  }

  table { width: 100%; border-collapse: collapse; font-size: .85rem; }

  th {
    background: var(--bg);
    color: var(--muted);
    text-align: left;
    padding: 12px 10px;
    font-size: .75rem;
    text-transform: uppercase;
    letter-spacing: .05em;
    border-bottom: 1px solid var(--border);
    white-space: nowrap;
  }

  td { padding: 10px; border-bottom: 1px solid var(--border); white-space: nowrap; }

  .response-row { cursor: pointer; }
  .response-row:hover td { background: #1a1a1a; }

  .detail-content {
    background: #0d0d0d;
    color: var(--muted);
    font-size: .85rem;
    white-space: normal;
    padding: 12px 16px !important;
  }

  /* States */
  .loading-state, .error-state { text-align: center; padding: 60px 20px; color: var(--muted); }
  .error-state { color: var(--accent); }

  /* === Responsive === */
  @media (max-width: 600px) {
    .nps-grid { grid-template-columns: repeat(5, 1fr); }
    .rating-row { flex-direction: column; align-items: flex-start; gap: 8px; }
    .charts-grid { grid-template-columns: 1fr; }
    .stats-bar { grid-template-columns: 1fr; }
    .admin-header { flex-wrap: wrap; }
  }
  ```

- [ ] **Paso 3.2: Verificar manualmente**

  Abrir `index.html` en el navegador (doble clic). La página debe mostrar fondo negro. El CSS está cargado correctamente si no hay fondo blanco.

- [ ] **Paso 3.3: Commit**

  ```bash
  git add assets/style.css
  git commit -m "feat: design system CSS con paleta MIZAKI"
  ```

---

## Task 4: survey.js — Lógica del formulario

**Files:**
- Write: `assets/survey.js`

- [ ] **Paso 4.1: Escribir survey.js**

  Reemplazar `TU_URL_DE_APPS_SCRIPT_AQUI` con la URL del paso 2.5. Misma contraseña que pusiste en el Apps Script:

  ```javascript
  const APPS_SCRIPT_URL = 'TU_URL_DE_APPS_SCRIPT_AQUI';

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

    const data = {
      sucursal:  document.getElementById('sucursal').value,
      visitas:   document.querySelector('input[name="visitas"]:checked')?.value || '',
      espera:    document.getElementById('espera').value,
      personal:  document.getElementById('personal').value,
      ambiente:  document.getElementById('ambiente').value,
      sabor:     document.getElementById('sabor').value,
      porcion:   document.getElementById('porcion').value,
      precios:   document.getElementById('precios').value,
      nps:       document.getElementById('nps').value,
      comentario: document.getElementById('comentario').value.trim()
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
      [data.nps,       '¿Qué tan probable es que nos recomiendes?'],
    ];

    const errorEl = document.getElementById('error-msg');
    const failed = required.find(([val]) => !val);
    if (failed) {
      errorEl.textContent = failed[1];
      errorEl.style.display = 'block';
      errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    errorEl.style.display = 'none';

    const btn = document.querySelector('.btn-submit');
    btn.textContent = 'Enviando...';
    btn.disabled = true;

    try {
      const params = new URLSearchParams({ action: 'submit', ...data });
      await fetch(`${APPS_SCRIPT_URL}?${params}`);
    } catch (err) {
      console.error('Submit error:', err);
    }

    window.location.href = 'gracias.html';
  });
  ```

- [ ] **Paso 4.2: Commit**

  ```bash
  git add assets/survey.js
  git commit -m "feat: logica de formulario con validacion y envio a Apps Script"
  ```

---

## Task 5: index.html — Página de encuesta

**Files:**
- Write: `index.html`

- [ ] **Paso 5.1: Escribir index.html**

  ```html
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex">
    <title>Encuesta de Calidad — MIZAKI</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@400;500;700;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/style.css">
  </head>
  <body>
    <div class="survey-container">

      <header class="survey-header">
        <div class="logo-wrapper">
          <img src="assets/logo.png" alt="MIZAKI Restaurante Fusión Japonesa" class="logo">
        </div>
        <p class="tagline">Cuéntanos tu experiencia</p>
      </header>

      <main>
        <form id="survey-form" novalidate>

          <!-- Sucursal -->
          <div class="form-group">
            <label class="question-label">¿En qué sucursal estuviste?</label>
            <div class="pill-group" id="sucursal-group">
              <button type="button" class="pill" data-value="La Campiña">La Campiña</button>
              <button type="button" class="pill" data-value="Ibero">Ibero</button>
              <button type="button" class="pill" data-value="Plaza Norte">Plaza Norte</button>
            </div>
            <input type="hidden" id="sucursal">
          </div>

          <!-- P1: Visitas -->
          <div class="form-group">
            <label class="question-label">1. ¿Cuántas veces nos has visitado?</label>
            <div class="radio-group">
              <label class="radio-option">
                <input type="radio" name="visitas" value="Primera vez">
                <span class="radio-custom"></span>
                <span class="radio-text">Primera vez</span>
              </label>
              <label class="radio-option">
                <input type="radio" name="visitas" value="De 2 a 5 veces">
                <span class="radio-custom"></span>
                <span class="radio-text">De 2 a 5 veces</span>
              </label>
              <label class="radio-option">
                <input type="radio" name="visitas" value="Más de 5 veces">
                <span class="radio-custom"></span>
                <span class="radio-text">Más de 5 veces</span>
              </label>
            </div>
          </div>

          <!-- P2–P7: Estrellas -->
          <div class="form-group">
            <label class="question-label">Califica del 1 al 5:</label>
            <p class="hint">1 = Muy malo &nbsp;•&nbsp; 5 = Muy bueno</p>

            <div class="rating-row">
              <span class="rating-label">2. Tiempo de espera</span>
              <div class="stars" data-field="espera">
                <span class="star" data-value="1">★</span><span class="star" data-value="2">★</span>
                <span class="star" data-value="3">★</span><span class="star" data-value="4">★</span>
                <span class="star" data-value="5">★</span>
              </div>
            </div>
            <input type="hidden" id="espera">

            <div class="rating-row">
              <span class="rating-label">3. Atención del personal</span>
              <div class="stars" data-field="personal">
                <span class="star" data-value="1">★</span><span class="star" data-value="2">★</span>
                <span class="star" data-value="3">★</span><span class="star" data-value="4">★</span>
                <span class="star" data-value="5">★</span>
              </div>
            </div>
            <input type="hidden" id="personal">

            <div class="rating-row">
              <span class="rating-label">4. Ambiente (música, iluminación, temperatura)</span>
              <div class="stars" data-field="ambiente">
                <span class="star" data-value="1">★</span><span class="star" data-value="2">★</span>
                <span class="star" data-value="3">★</span><span class="star" data-value="4">★</span>
                <span class="star" data-value="5">★</span>
              </div>
            </div>
            <input type="hidden" id="ambiente">

            <div class="rating-row">
              <span class="rating-label">5. Sabor y calidad de los alimentos</span>
              <div class="stars" data-field="sabor">
                <span class="star" data-value="1">★</span><span class="star" data-value="2">★</span>
                <span class="star" data-value="3">★</span><span class="star" data-value="4">★</span>
                <span class="star" data-value="5">★</span>
              </div>
            </div>
            <input type="hidden" id="sabor">

            <div class="rating-row">
              <span class="rating-label">6. Tamaño de la porción</span>
              <div class="stars" data-field="porcion">
                <span class="star" data-value="1">★</span><span class="star" data-value="2">★</span>
                <span class="star" data-value="3">★</span><span class="star" data-value="4">★</span>
                <span class="star" data-value="5">★</span>
              </div>
            </div>
            <input type="hidden" id="porcion">

            <div class="rating-row">
              <span class="rating-label">7. Precios de los alimentos</span>
              <div class="stars" data-field="precios">
                <span class="star" data-value="1">★</span><span class="star" data-value="2">★</span>
                <span class="star" data-value="3">★</span><span class="star" data-value="4">★</span>
                <span class="star" data-value="5">★</span>
              </div>
            </div>
            <input type="hidden" id="precios">
          </div>

          <!-- P8: NPS -->
          <div class="form-group">
            <label class="question-label">8. ¿Qué tan probable es que recomiendes MIZAKI a tus conocidos?</label>
            <p class="hint">1 = Nada probable &nbsp;•&nbsp; 10 = Muy probable</p>
            <div class="nps-grid">
              <button type="button" class="nps-btn" data-value="1">1</button>
              <button type="button" class="nps-btn" data-value="2">2</button>
              <button type="button" class="nps-btn" data-value="3">3</button>
              <button type="button" class="nps-btn" data-value="4">4</button>
              <button type="button" class="nps-btn" data-value="5">5</button>
              <button type="button" class="nps-btn" data-value="6">6</button>
              <button type="button" class="nps-btn" data-value="7">7</button>
              <button type="button" class="nps-btn" data-value="8">8</button>
              <button type="button" class="nps-btn" data-value="9">9</button>
              <button type="button" class="nps-btn" data-value="10">10</button>
            </div>
            <input type="hidden" id="nps">
          </div>

          <!-- P9: Comentarios -->
          <div class="form-group">
            <label class="question-label" for="comentario">
              9. Sugerencias y comentarios <span class="optional">(opcional)</span>
            </label>
            <textarea id="comentario" class="textarea-field" rows="4"
              placeholder="Escribe aquí tus comentarios o sugerencias..."></textarea>
          </div>

          <p id="error-msg" class="error-msg" style="display:none"></p>

          <button type="submit" class="btn-submit">ENVIAR</button>
        </form>
      </main>

      <footer class="survey-footer">
        <p>MIZAKI · Restaurante Fusión Japonesa</p>
      </footer>
    </div>

    <script src="assets/survey.js"></script>
  </body>
  </html>
  ```

- [ ] **Paso 5.2: Probar en navegador**

  Abrir `index.html` en el navegador. Verificar:
  - [ ] Logo MIZAKI visible sobre fondo blanco
  - [ ] Fondo negro, texto blanco
  - [ ] Los 3 pills de sucursal se marcan en rojo al hacer clic
  - [ ] Las estrellas se iluminan en rojo al hover y al hacer clic
  - [ ] Los 10 botones NPS funcionan igual
  - [ ] Al intentar enviar sin llenar todo, aparece el mensaje de error en rojo
  - [ ] Al llenar todo y enviar, redirige a `gracias.html`
  - [ ] Verificar en Google Sheets que apareció la fila con los datos

- [ ] **Paso 5.3: Commit**

  ```bash
  git add index.html
  git commit -m "feat: pagina de encuesta completa con 9 preguntas"
  ```

---

## Task 6: gracias.html — Pantalla de confirmación

**Files:**
- Write: `gracias.html`

- [ ] **Paso 6.1: Escribir gracias.html**

  ```html
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gracias — MIZAKI</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@400;700;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/style.css">
  </head>
  <body>
    <div class="thanks-container">
      <div class="logo-wrapper">
        <img src="assets/logo.png" alt="MIZAKI" class="logo">
      </div>
      <div class="thanks-content">
        <div class="checkmark">✓</div>
        <h1>¡Gracias por tu opinión!</h1>
        <p>Tu retroalimentación nos ayuda a ofrecerte una mejor experiencia.</p>
        <p class="subtext">Hasta la próxima visita.</p>
      </div>
    </div>
  </body>
  </html>
  ```

- [ ] **Paso 6.2: Verificar en navegador**

  Abrir `gracias.html`. Debe verse: fondo negro, logo MIZAKI, palomita roja, texto de agradecimiento.

- [ ] **Paso 6.3: Commit**

  ```bash
  git add gracias.html
  git commit -m "feat: pagina de confirmacion post-envio"
  ```

---

## Task 7: admin.js — Lógica del panel de administración

**Files:**
- Write: `assets/admin.js`

- [ ] **Paso 7.1: Escribir admin.js**

  Reemplazar `TU_URL_DE_APPS_SCRIPT_AQUI` con la misma URL del paso 2.5. Usar **exactamente la misma contraseña** que pusiste en el Apps Script:

  ```javascript
  const APPS_SCRIPT_URL = 'TU_URL_DE_APPS_SCRIPT_AQUI';
  const ADMIN_PASSWORD = 'Mizaki2024!'; // igual que en el Apps Script

  let allData = [];
  let avgChart = null;
  let visitsChart = null;

  // --- Auth ---
  function checkAuth() {
    const stored = localStorage.getItem('mizaki_admin_auth');
    if (stored === ADMIN_PASSWORD) return true;
    const entered = prompt('Contraseña de administrador:');
    if (entered !== ADMIN_PASSWORD) {
      alert('Contraseña incorrecta.');
      window.location.href = 'index.html';
      return false;
    }
    localStorage.setItem('mizaki_admin_auth', entered);
    return true;
  }

  document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('mizaki_admin_auth');
    window.location.href = 'index.html';
  });

  // --- Load data ---
  async function loadData() {
    try {
      const params = new URLSearchParams({ action: 'getData', password: ADMIN_PASSWORD });
      const res = await fetch(`${APPS_SCRIPT_URL}?${params}`);
      const data = await res.json();
      if (data.error) { showError(); return; }
      allData = data;
      document.getElementById('loading').style.display = 'none';
      document.getElementById('dashboard').style.display = 'block';
      renderAll(allData);
      document.getElementById('branch-filter').addEventListener('change', () => {
        const v = document.getElementById('branch-filter').value;
        renderAll(v === 'all' ? allData : allData.filter(r => r.sucursal === v));
      });
    } catch (err) {
      showError();
    }
  }

  function showError() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error-state').style.display = 'block';
  }

  // --- Render all ---
  function renderAll(data) {
    renderStats(data);
    renderAvgChart(data);
    renderVisitsChart(data);
    renderComments(data);
    renderTable(data);
  }

  function renderStats(data) {
    document.getElementById('total-responses').textContent = data.length;
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    const week = data.filter(r => new Date(r.timestamp) >= weekAgo).length;
    document.getElementById('week-responses').textContent = week;
    const npsVals = data.map(r => Number(r.nps)).filter(v => v > 0);
    document.getElementById('avg-nps').textContent = npsVals.length
      ? (npsVals.reduce((a, b) => a + b, 0) / npsVals.length).toFixed(1)
      : '—';
  }

  function fieldAvg(data, field) {
    const vals = data.map(r => Number(r[field])).filter(v => v > 0);
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : 0;
  }

  function renderAvgChart(data) {
    const ctx = document.getElementById('avgChart').getContext('2d');
    if (avgChart) avgChart.destroy();
    avgChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Tiempo espera', 'Personal', 'Ambiente', 'Sabor', 'Porción', 'Precios'],
        datasets: [{
          data: ['espera','personal','ambiente','sabor','porcion','precios'].map(f => fieldAvg(data, f)),
          backgroundColor: '#F3033E',
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        scales: {
          x: { min: 0, max: 5, ticks: { color: '#888' }, grid: { color: '#222' } },
          y: { ticks: { color: '#ccc' }, grid: { color: '#222' } }
        },
        plugins: { legend: { display: false } }
      }
    });
  }

  function renderVisitsChart(data) {
    const ctx = document.getElementById('visitsChart').getContext('2d');
    const counts = { 'Primera vez': 0, 'De 2 a 5 veces': 0, 'Más de 5 veces': 0 };
    data.forEach(r => { if (r.visitas in counts) counts[r.visitas]++; });
    if (visitsChart) visitsChart.destroy();
    visitsChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(counts),
        datasets: [{
          data: Object.values(counts),
          backgroundColor: ['#F3033E', '#666', '#333'],
          borderColor: '#111',
          borderWidth: 2
        }]
      },
      options: { plugins: { legend: { labels: { color: '#ccc' } } } }
    });
  }

  function renderComments(data) {
    const list = document.getElementById('comments-list');
    const items = data.filter(r => r.comentario && r.comentario.trim()).slice(-10).reverse();
    if (!items.length) {
      list.innerHTML = '<li class="no-comments">Aún no hay comentarios.</li>';
      return;
    }
    list.innerHTML = items.map(r => `
      <li class="comment-item">
        <span class="comment-branch">${r.sucursal}</span>
        <span class="comment-text">"${r.comentario}"</span>
        <span class="comment-date">${formatDate(r.timestamp)}</span>
      </li>
    `).join('');
  }

  function renderTable(data) {
    const tbody = document.getElementById('responses-body');
    tbody.innerHTML = [...data].reverse().map(r => `
      <tr class="response-row" onclick="toggleDetail(this)">
        <td>${formatDate(r.timestamp)}</td>
        <td>${r.sucursal}</td>
        <td>${r.visitas}</td>
        <td>${r.espera}</td>
        <td>${r.personal}</td>
        <td>${r.ambiente}</td>
        <td>${r.sabor}</td>
        <td>${r.porcion}</td>
        <td>${r.precios}</td>
        <td>${r.nps}</td>
        <td class="comment-cell">${r.comentario ? r.comentario.substring(0,30) + (r.comentario.length > 30 ? '…' : '') : '—'}</td>
      </tr>
      ${r.comentario ? `
      <tr class="detail-row" style="display:none">
        <td colspan="11" class="detail-content"><strong>Comentario:</strong> ${r.comentario}</td>
      </tr>` : ''}
    `).join('');
  }

  function toggleDetail(row) {
    const next = row.nextElementSibling;
    if (next && next.classList.contains('detail-row'))
      next.style.display = next.style.display === 'none' ? 'table-row' : 'none';
  }

  function showView(view) {
    document.getElementById('view-summary').style.display = view === 'summary' ? 'block' : 'none';
    document.getElementById('view-detail').style.display  = view === 'detail'  ? 'block' : 'none';
    document.getElementById('btn-summary').classList.toggle('active', view === 'summary');
    document.getElementById('btn-detail').classList.toggle('active',  view === 'detail');
  }

  // Exponer globalmente para los onclick del HTML
  window.toggleDetail = toggleDetail;
  window.showView = showView;

  function formatDate(ts) {
    const d = new Date(ts);
    return isNaN(d) ? ts : d.toLocaleDateString('es-MX', { day:'2-digit', month:'2-digit', year:'numeric' });
  }

  // --- Init ---
  if (checkAuth()) loadData();
  ```

- [ ] **Paso 7.2: Commit**

  ```bash
  git add assets/admin.js
  git commit -m "feat: logica del panel de administracion con graficas y tabla"
  ```

---

## Task 8: admin.html — Panel de administración

**Files:**
- Write: `admin.html`

- [ ] **Paso 8.1: Escribir admin.html**

  ```html
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title>Admin — MIZAKI Encuesta</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@400;500;700;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/style.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  </head>
  <body class="admin-body">
    <div class="admin-container">

      <header class="admin-header">
        <div class="logo-wrapper logo-wrapper--small">
          <img src="assets/logo.png" alt="MIZAKI" class="logo logo--small">
        </div>
        <h1 class="admin-title">Panel de Resultados</h1>
        <button id="logout-btn" class="btn-logout">Cerrar sesión</button>
      </header>

      <div id="loading" class="loading-state">Cargando datos...</div>
      <div id="error-state" class="error-state" style="display:none">
        Error al cargar datos. Verifica la URL del Apps Script en admin.js.
      </div>

      <div id="dashboard" style="display:none">

        <!-- Stats -->
        <div class="stats-bar">
          <div class="stat-card">
            <span class="stat-value" id="total-responses">—</span>
            <span class="stat-label">Total respuestas</span>
          </div>
          <div class="stat-card">
            <span class="stat-value" id="week-responses">—</span>
            <span class="stat-label">Esta semana</span>
          </div>
          <div class="stat-card">
            <span class="stat-value" id="avg-nps">—</span>
            <span class="stat-label">NPS promedio</span>
          </div>
        </div>

        <!-- Filter -->
        <div class="filter-bar">
          <label for="branch-filter">Sucursal:</label>
          <select id="branch-filter" class="branch-select">
            <option value="all">Todas</option>
            <option value="La Campiña">La Campiña</option>
            <option value="Ibero">Ibero</option>
            <option value="Plaza Norte">Plaza Norte</option>
          </select>
        </div>

        <!-- View toggle -->
        <div class="view-toggle">
          <button class="toggle-btn active" id="btn-summary" onclick="showView('summary')">Resumen</button>
          <button class="toggle-btn" id="btn-detail" onclick="showView('detail')">Detalle</button>
        </div>

        <!-- Summary view -->
        <div id="view-summary">
          <div class="charts-grid">
            <div class="chart-card">
              <h3>Promedios de calificación</h3>
              <canvas id="avgChart"></canvas>
            </div>
            <div class="chart-card">
              <h3>Frecuencia de visitas</h3>
              <canvas id="visitsChart"></canvas>
            </div>
          </div>
          <div class="comments-card">
            <h3>Últimos comentarios</h3>
            <ul id="comments-list" class="comments-list"></ul>
          </div>
        </div>

        <!-- Detail view -->
        <div id="view-detail" style="display:none">
          <div class="table-wrapper">
            <table id="responses-table">
              <thead>
                <tr>
                  <th>Fecha</th><th>Sucursal</th><th>Visitas</th>
                  <th>Espera</th><th>Personal</th><th>Ambiente</th>
                  <th>Sabor</th><th>Porción</th><th>Precios</th>
                  <th>NPS</th><th>Comentario</th>
                </tr>
              </thead>
              <tbody id="responses-body"></tbody>
            </table>
          </div>
        </div>

      </div>
    </div>

    <script src="assets/admin.js"></script>
  </body>
  </html>
  ```

- [ ] **Paso 8.2: Probar el panel completo**

  Abrir `admin.html` en el navegador. Verificar:
  - [ ] Aparece el prompt de contraseña
  - [ ] Con contraseña incorrecta redirige a index.html
  - [ ] Con contraseña correcta carga el dashboard
  - [ ] Se muestran los datos enviados en el Task 5
  - [ ] La gráfica de barras muestra promedios en rojo
  - [ ] La gráfica de dona muestra distribución de visitas
  - [ ] El botón "Detalle" muestra la tabla
  - [ ] Hacer clic en una fila expande el comentario
  - [ ] El filtro por sucursal actualiza todas las métricas
  - [ ] "Cerrar sesión" redirige a index.html

- [ ] **Paso 8.3: Commit**

  ```bash
  git add admin.html
  git commit -m "feat: panel de administracion con graficas Chart.js y tabla detalle"
  ```

---

## Task 9: Despliegue en GitHub Pages

- [ ] **Paso 9.1: Crear repositorio en GitHub**

  1. Ir a [github.com](https://github.com) e iniciar sesión (o crear cuenta)
  2. Clic en `New repository`
  3. Nombre: `encuesta-mizaki`
  4. Visibilidad: **Public** (necesario para GitHub Pages gratis)
  5. No agregar README ni .gitignore
  6. Clic en `Create repository`

- [ ] **Paso 9.2: Conectar el repo local y hacer push**

  ```bash
  git remote add origin https://github.com/TU_USUARIO/encuesta-mizaki.git
  git branch -M main
  git push -u origin main
  ```

- [ ] **Paso 9.3: Activar GitHub Pages**

  1. En el repositorio, ir a `Settings > Pages`
  2. Source: `Deploy from a branch`
  3. Branch: `main` / `/ (root)`
  4. Clic en `Save`
  5. Esperar ~2 minutos

- [ ] **Paso 9.4: Verificar el sitio publicado**

  La URL será: `https://TU_USUARIO.github.io/encuesta-mizaki/`

  Verificar:
  - [ ] `https://TU_USUARIO.github.io/encuesta-mizaki/` → encuesta carga correctamente
  - [ ] `https://TU_USUARIO.github.io/encuesta-mizaki/admin.html` → panel admin funciona
  - [ ] Enviar una respuesta de prueba desde el sitio publicado → aparece en Google Sheets

- [ ] **Paso 9.5: Guardar las URLs definitivas**

  Registrar estas URLs para compartir con el equipo:
  - **Encuesta pública:** `https://TU_USUARIO.github.io/encuesta-mizaki/`
  - **Panel admin:**     `https://TU_USUARIO.github.io/encuesta-mizaki/admin.html`
  - **Google Sheet:**    URL de la hoja de cálculo creada en Task 2

---

## Checklist de verificación final

- [ ] Encuesta se ve bien en celular (Chrome mobile)
- [ ] Encuesta se ve bien en computadora
- [ ] Todas las validaciones funcionan (no permite enviar incompleto)
- [ ] Cada envío crea una fila nueva en Google Sheets
- [ ] Panel admin muestra los datos correctamente filtrados por sucursal
- [ ] Vista detalle muestra todas las respuestas individuales
- [ ] Expandir fila muestra comentario completo
- [ ] Cerrar sesión funciona correctamente
