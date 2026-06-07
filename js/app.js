'use strict';

// ── ESTADO GLOBAL ──────────────────────────────────────────────
const AppState = {
  reservaSimulada: null,
  preciosInterpolados: null,
  ingresoFamiliar: 3000,
  selSolucion: null,
  selMatriz: null,
  selDemanda: null,
};

// ── SIDEBAR ────────────────────────────────────────────────────
(function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const btnOpen = document.getElementById('btnOpenSidebar');
  const btnClose = document.getElementById('btnCloseSidebar');

  function open() { sidebar.classList.add('open'); overlay.classList.add('active'); document.body.style.overflow = 'hidden'; }
  function close() { sidebar.classList.remove('open'); overlay.classList.remove('active'); document.body.style.overflow = ''; }

  btnOpen.addEventListener('click', open);
  btnClose.addEventListener('click', close);
  overlay.addEventListener('click', close);

  // Cerrar al hacer click en link del sidebar
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', () => { close(); });
  });

  // Resaltar link activo en scroll
  const sections = ['inicio','modulo1','modulo2','modulo3','modulo4','modulo5','conclusiones'];
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + 120;
    let active = sections[0];
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= scrollY) active = id;
    });
    document.querySelectorAll('.sidebar-link').forEach(l => {
      l.classList.toggle('active', l.getAttribute('data-section') === active);
    });
  }, { passive: true });
})();

// ── TEMA ───────────────────────────────────────────────────────
(function initTheme() {
  const saved = localStorage.getItem('predictio-theme') || 'light';
  applyTheme(saved);

  document.getElementById('btnTheme').addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
    applyTheme(cur === 'dark' ? 'light' : 'dark');
  });
  document.getElementById('btnThemeSidebar').addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
    applyTheme(cur === 'dark' ? 'light' : 'dark');
  });

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('predictio-theme', theme);
    const icon1 = document.getElementById('themeIcon');
    const icon2 = document.getElementById('themeIconSidebar');
    const txt = document.getElementById('themeTextSidebar');
    const isDark = theme === 'dark';
    if (icon1) icon1.className = isDark ? 'fa fa-sun' : 'fa fa-moon';
    if (icon2) icon2.className = isDark ? 'fa fa-sun' : 'fa fa-moon';
    if (txt) txt.textContent = isDark ? 'Modo claro' : 'Modo oscuro';
  }
})();

// ── SCROLL SUAVE ───────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 68;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ── UTILIDADES ─────────────────────────────────────────────────
function fmt(n, d = 6) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  if (!isFinite(n)) return n > 0 ? '+Inf' : '-Inf';
  return Number(n).toFixed(d);
}
function fmtSci(n, d = 4) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  if (!isFinite(n)) return n > 0 ? '+Inf' : '-Inf';
  const abs = Math.abs(n);
  if (abs !== 0 && (abs < 1e-3 || abs >= 1e6)) return n.toExponential(d);
  return n.toFixed(d);
}
function crearAlerta(tipo, icono, msg) {
  return `<div class="alerta-cs alerta-${tipo}"><i class="fa fa-${icono}"></i><span>${msg}</span></div>`;
}
function exportarCSV(tablaId, nombre) {
  const t = document.getElementById(tablaId);
  if (!t) return;
  const rows = Array.from(t.querySelectorAll('tr'));
  const csv = rows.map(r => Array.from(r.querySelectorAll('th,td')).map(c => `"${c.textContent.trim()}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nombre || 'tabla.csv';
  a.click();
}
function exportarPNG(canvasId, nombre) {
  const c = document.getElementById(canvasId);
  if (!c) return;
  const a = document.createElement('a');
  a.href = c.toDataURL('image/png');
  a.download = nombre || 'grafico.png';
  a.click();
}
function destruirChart(id) {
  const c = document.getElementById(id);
  if (!c) return;
  const ex = Chart.getChart(c);
  if (ex) ex.destroy();
}
function norma(v) { return Math.sqrt(v.reduce((s, vi) => s + vi * vi, 0)); }
function matVec(A, x) {
  return A.map(row => row.reduce((s, v, j) => s + v * x[j], 0));
}
function errorRel(xN, xO) {
  const num = norma(xN.map((v, i) => v - xO[i]));
  const den = norma(xN) || 1;
  return num / den;
}
function renderMath(el) {
  if (window.MathJax && window.MathJax.typesetPromise) {
    window.MathJax.typesetPromise(el ? [el] : []).catch(() => {});
  }
}

const COLORES = {
  lavanda:'#C9B8E8', lavandaD:'rgba(201,184,232,0.6)',
  rosa:'#F7C5D5', rosaD:'rgba(247,197,213,0.6)',
  menta:'#B8E8D8', mentaD:'rgba(184,232,216,0.6)',
  durazno:'#FFD6B8', duraznoD:'rgba(255,214,184,0.6)',
  celeste:'#B8D4E8', celesteD:'rgba(184,212,232,0.6)',
  rojo:'#F08080',
};

function baseChartOptions(titulo) {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  const tc = dark ? '#e8dff5' : '#4A3F5C';
  const gc = dark ? 'rgba(200,185,230,0.1)' : 'rgba(74,63,92,0.08)';
  return {
    responsive: true, maintainAspectRatio: true,
    plugins: {
      legend: { labels: { color: tc, font: { family: 'Poppins', size: 11 } } },
      title: titulo ? { display: true, text: titulo, color: tc, font: { family: 'Poppins', size: 13, weight: '700' } } : { display: false },
      tooltip: { backgroundColor: dark ? '#3D3150' : '#fff', titleColor: tc, bodyColor: dark ? '#c9b8e8' : '#6a5f7a', borderColor: '#C9B8E8', borderWidth: 1, cornerRadius: 10, titleFont: { family: 'Poppins' }, bodyFont: { family: 'Poppins' } },
    },
    scales: {
      x: { ticks: { color: tc, font: { family: 'Poppins', size: 10 } }, grid: { color: gc } },
      y: { ticks: { color: tc, font: { family: 'Poppins', size: 10 } }, grid: { color: gc } },
    },
  };
}

// Exponer globales
window.AppState = AppState;
window.fmt = fmt; window.fmtSci = fmtSci;
window.crearAlerta = crearAlerta;
window.exportarCSV = exportarCSV; window.exportarPNG = exportarPNG;
window.destruirChart = destruirChart;
window.norma = norma; window.matVec = matVec; window.errorRel = errorRel;
window.renderMath = renderMath;
window.COLORES = COLORES; window.baseChartOptions = baseChartOptions;
