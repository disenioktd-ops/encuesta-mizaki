const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw96vWwqSPaNxvrIf34vMYX7D4W5ukyJh6Mpg9NrUl4LXj0y-3YmtiRxyChJRJquKp_/exec';
const ADMIN_PASSWORD = 'Mizaki2026!';

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
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
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
        data: ['espera', 'personal', 'ambiente', 'sabor', 'porcion', 'precios'].map(f => fieldAvg(data, f)),
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
      <span class="comment-text">"${escapeHtml(r.comentario)}"</span>
      <span class="comment-date">${formatDate(r.timestamp)}</span>
    </li>
  `).join('');
}

function renderTable(data) {
  const tbody = document.getElementById('responses-body');
  tbody.innerHTML = [...data].reverse().map(r => `
    <tr class="response-row" onclick="toggleDetail(this)">
      <td>${formatDate(r.timestamp)}</td>
      <td>${escapeHtml(r.nombre || '—')}</td>
      <td>${escapeHtml(r.correo || '—')}</td>
      <td>${escapeHtml(r.sucursal)}</td>
      <td>${escapeHtml(r.visitas)}</td>
      <td>${r.espera}</td>
      <td>${r.personal}</td>
      <td>${r.ambiente}</td>
      <td>${r.sabor}</td>
      <td>${r.porcion}</td>
      <td>${r.precios}</td>
      <td>${r.nps}</td>
      <td class="comment-cell">${r.comentario ? escapeHtml(r.comentario).substring(0, 30) + (r.comentario.length > 30 ? '…' : '') : '—'}</td>
    </tr>
    ${r.comentario ? `
    <tr class="detail-row" style="display:none">
      <td colspan="13" class="detail-content"><strong>Comentario:</strong> ${escapeHtml(r.comentario)}</td>
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

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(ts) {
  const d = new Date(ts);
  return isNaN(d) ? String(ts) : d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Expose globals for HTML onclick attributes
window.toggleDetail = toggleDetail;
window.showView = showView;

// --- Init ---
if (checkAuth()) loadData();