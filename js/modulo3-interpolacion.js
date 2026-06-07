/* =========================================
   modulo3-interpolacion.js — Interpolación Numérica
   ========================================= */

'use strict';

(function initModulo3() {
  const container = document.getElementById('modulo3-app');
  if (!container) return;

  let currentCaso = 'critico';

  const PRODUCTOS_DATA = {
    papa: {
      estable: { xs: [1, 10, 20, 30], ys: [8, 8.5, 9, 8.8] },
      critico: { xs: [1, 5, 10, 15, 20, 25, 30], ys: [8, 10, 15, 22, 35, 50, 80] }
    },
    fideo: {
      estable: { xs: [1, 15, 30], ys: [6, 6.2, 6.5] },
      critico: { xs: [1, 10, 20, 30], ys: [6, 12, 25, 45] }
    },
    carne: {
      estable: { xs: [1, 8, 16, 24, 30], ys: [35, 36, 35, 37, 36] },
      critico: { xs: [1, 10, 20, 30], ys: [35, 45, 65, 100] }
    }
  };

  const PROD_LABELS = {
    papa: 'Papa (Bs/kg)',
    fideo: 'Fideo (Bs/kg)',
    carne: 'Carne (Bs/kg)'
  };

  function buildUI() {
    return `
    <div class="row g-4">
      <!-- FORMULARIO -->
      <div class="col-12 col-lg-5">
        <div class="card-cs">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="mb-0"><i class="fa fa-sliders me-2"></i>Configuración</h5>
          </div>

          <div class="d-flex gap-2 mb-3 flex-wrap">
            <button class="btn-autofill flex-fill" id="m3-btnEstable" style="font-size:0.75rem;"><i class="fa fa-shield-halved me-1"></i>Caso Estable</button>
            <button class="btn-autofill flex-fill" id="m3-btnCritico" style="background:linear-gradient(135deg,rgba(247,197,213,1),rgba(224,112,144,1));color:#fff!important;font-size:0.75rem;"><i class="fa fa-triangle-exclamation me-1"></i>Caso Crítico</button>
          </div>

          <div class="mb-3">
            <label class="form-label">Producto a analizar</label>
            <select class="form-select" id="m3-producto">
              <option value="papa">Papa</option>
              <option value="fideo">Fideo</option>
              <option value="carne">Carne</option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label">Puntos de control (Día — Precio)</label>
            <div class="tabla-wrapper">
              <table class="tabla-cs" id="m3-tabla-puntos">
                <thead><tr><th>#</th><th>Día</th><th>Precio (Bs)</th><th></th></tr></thead>
                <tbody id="m3-tbody"></tbody>
              </table>
            </div>
            <div class="mt-2 d-flex gap-2">
              <button class="btn-cs btn-cs-sm" id="m3-addRow"><i class="fa fa-plus me-1"></i>Agregar fila</button>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Estimar precio en el día sin dato (x):</label>
            <input type="number" class="form-control" id="m3-diaEstimar" value="12" min="0" step="any" />
          </div>

          <div class="mb-3">
            <label class="form-label">Método de Interpolación</label>
            <select class="form-select" id="m3-metodo">
              <option value="lagrange">Lagrange</option>
              <option value="newton">Newton — Diferencias Divididas</option>
              <option value="splines">Splines Cúbicos Naturales</option>
              <option value="todos" selected>Comparar todos los métodos</option>
            </select>
          </div>

          <button class="btn-cs w-100" id="m3-btnInterp"><i class="fa fa-calculator me-1"></i>Reconstruir Curva</button>
        </div>
      </div>

      <!-- RESULTADOS -->
      <div class="col-12 col-lg-7">
        <div id="m3-alertas"></div>
        <div id="m3-resultados" style="display:none;">

          <details class="algo-details fade-in mb-3">
            <summary><i class="fa fa-microchip"></i> ¿Qué algoritmo utiliza este módulo?</summary>
            <p><strong>Interpolación Numérica:</strong> Reconstruye una curva continua a partir de puntos dispersos de precios.</p>
            <ul>
              <li><strong>Lagrange:</strong> Construye un único polinomio global. Con muchos puntos sufre oscilaciones violentas (Fenómeno de Runge).</li>
              <li><strong>Newton:</strong> Utiliza diferencias divididas, permitiendo agregar nuevos puntos fácilmente.</li>
              <li><strong>Splines Cúbicos:</strong> Une cada par de puntos con polinomios de grado 3, forzando suavidad (derivadas continuas) en las uniones. Es el más seguro.</li>
            </ul>
          </details>

          <div class="resultado-box fade-in mb-3">
            <h5><i class="fa fa-tag me-2"></i>Precio estimado en el día <span id="m3-dia-est-label">—</span></h5>
            <div id="m3-precios-estimados" class="row g-2 mt-2"></div>
          </div>

          <div class="grafico-wrap mb-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <strong style="font-size:0.9rem;">Curva de precios interpolada P(t)</strong>
              <button class="btn-export" onclick="exportarPNG('m3-chart','interpolacion_precios.png')">
                <i class="fa fa-image me-1"></i>PNG
              </button>
            </div>
            <canvas id="m3-chart"></canvas>
          </div>

          <div id="m3-tabla-newton-wrap" style="display:none;" class="card-cs mb-3">
            <h5><i class="fa fa-table me-2"></i>Tabla de Diferencias Divididas (Newton)</h5>
            <div class="tabla-wrapper"><table class="tabla-cs" id="m3-tabla-newton"></table></div>
          </div>

          <div class="interp-box fade-in" id="m3-interpretacion"></div>
        </div>
      </div>
    </div>`;
  }

  function renderTablaDefault() {
    const prod = document.getElementById('m3-producto').value;
    const datos = PRODUCTOS_DATA[prod][currentCaso];
    cargarTabla(datos.xs, datos.ys);
  }

  function cargarTabla(xs, ys) {
    const tbody = document.getElementById('m3-tbody');
    tbody.innerHTML = '';
    for (let i = 0; i < xs.length; i++) agregarFila(xs[i], ys[i]);
  }

  function agregarFila(dia = '', precio = '') {
    const tbody = document.getElementById('m3-tbody');
    const filas = tbody.querySelectorAll('tr');
    if (filas.length >= 12) return; // limit
    const idx = filas.length + 1;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-size:0.8rem;color:var(--lavanda);font-weight:600;">${idx}</td>
      <td><input type="number" class="form-control" style="width:90px;" value="${dia}" step="any" /></td>
      <td><input type="number" class="form-control" style="width:90px;" value="${precio}" step="any" /></td>
      <td><button class="btn-export btn-cs-sm" style="padding:0.2rem 0.6rem;" onclick="this.closest('tr').remove()"><i class="fa fa-times"></i></button></td>`;
    tbody.appendChild(tr);
  }

  function leerPuntos() {
    const rows = document.querySelectorAll('#m3-tbody tr');
    const xs = [], ys = [];
    rows.forEach(r => {
      const inputs = r.querySelectorAll('input');
      const x = parseFloat(inputs[0].value);
      const y = parseFloat(inputs[1].value);
      if (!isNaN(x) && !isNaN(y)) { xs.push(x); ys.push(y); }
    });
    return { xs, ys };
  }

  function bindEvents() {
    document.getElementById('m3-producto').addEventListener('change', renderTablaDefault);
    document.getElementById('m3-addRow').addEventListener('click', () => agregarFila());
    document.getElementById('m3-btnInterp').addEventListener('click', interpolar);
    
    document.getElementById('m3-btnEstable').addEventListener('click', () => {
      currentCaso = 'estable';
      document.getElementById('m3-diaEstimar').value = 15;
      renderTablaDefault();
      interpolar();
    });
    document.getElementById('m3-btnCritico').addEventListener('click', () => {
      currentCaso = 'critico';
      document.getElementById('m3-diaEstimar').value = 12;
      renderTablaDefault();
      interpolar();
    });
  }

  // ── ALGORITMOS ─────────────────────────────────────────────────

  function lagrange(xs, ys, t) {
    const n = xs.length;
    let resultado = 0;
    for (let i = 0; i < n; i++) {
      let term = ys[i];
      for (let j = 0; j < n; j++) {
        if (j !== i) term *= (t - xs[j]) / (xs[i] - xs[j]);
      }
      resultado += term;
    }
    return resultado;
  }

  function buildDifDiv(xs, ys) {
    const n = xs.length;
    const tabla = Array.from({length:n}, (_, i) => new Array(n).fill(0));
    for (let i = 0; i < n; i++) tabla[i][0] = ys[i];
    for (let j = 1; j < n; j++) {
      for (let i = 0; i < n - j; i++) {
        tabla[i][j] = (tabla[i+1][j-1] - tabla[i][j-1]) / (xs[i+j] - xs[i]);
      }
    }
    return tabla;
  }

  function newton(xs, ys, t) {
    const tabla = buildDifDiv(xs, ys);
    const n = xs.length;
    let resultado = tabla[0][0];
    let prod = 1;
    for (let j = 1; j < n; j++) {
      prod *= (t - xs[j-1]);
      resultado += tabla[0][j] * prod;
    }
    return resultado;
  }

  function splinesCubicos(xs, ys, t) {
    const n = xs.length;
    if (n < 3) return lagrange(xs, ys, t);
    const m = n - 1;
    const h = xs.slice(1).map((v, i) => v - xs[i]);

    // Sistema tridiagonal para M (momentos)
    const size = n - 2;
    if (size <= 0) return lagrange(xs, ys, t);
    const diag = new Array(size).fill(0);
    const sup = new Array(size - 1).fill(0);
    const sub = new Array(size - 1).fill(0);
    const rhs = new Array(size).fill(0);

    for (let i = 0; i < size; i++) {
      diag[i] = 2 * (h[i] + h[i+1]);
      if (i > 0) sub[i-1] = h[i];
      if (i < size-1) sup[i] = h[i+1];
      rhs[i] = 6 * ((ys[i+2]-ys[i+1])/h[i+1] - (ys[i+1]-ys[i])/h[i]);
    }

    const M = thomas(sub, diag, sup, rhs);
    const Mfull = [0, ...M, 0];

    // Buscar intervalo
    let k = m - 1;
    for (let i = 0; i < m; i++) {
      if (t >= xs[i] && t <= xs[i+1]) { k = i; break; }
    }
    const dx = t - xs[k];
    const hk = h[k];
    const a = ys[k];
    const b = (ys[k+1]-ys[k])/hk - hk*(2*Mfull[k]+Mfull[k+1])/6;
    const c = Mfull[k]/2;
    const d = (Mfull[k+1]-Mfull[k])/(6*hk);
    return a + b*dx + c*dx*dx + d*dx*dx*dx;
  }

  function thomas(sub, diag, sup, rhs) {
    const n = diag.length;
    const c = [...diag];
    const d = [...rhs];
    const x = new Array(n).fill(0);
    for (let i = 1; i < n; i++) {
      const m = sub[i-1] / c[i-1];
      c[i] -= m * sup[i-1];
      d[i] -= m * d[i-1];
    }
    x[n-1] = d[n-1] / c[n-1];
    for (let i = n-2; i >= 0; i--) x[i] = (d[i] - sup[i]*x[i+1]) / c[i];
    return x;
  }

  function curvaInterpolada(xs, ys, metodo, nPuntos = 200) {
    const xMin = Math.min(...xs), xMax = Math.max(...xs);
    const step = (xMax - xMin) / nPuntos;
    const txs = [], tys = [];
    for (let t = xMin; t <= xMax + 1e-9; t += step) {
      txs.push(t);
      let y;
      if (metodo === 'lagrange') y = lagrange(xs, ys, t);
      else if (metodo === 'newton') y = newton(xs, ys, t);
      else y = splinesCubicos(xs, ys, t);
      tys.push(y);
    }
    return { txs, tys };
  }

  // ── INTERPOLACIÓN PRINCIPAL ────────────────────────────────────
  function interpolar() {
    const { xs, ys } = leerPuntos();
    const metodo = document.getElementById('m3-metodo').value;
    const diaEst = parseFloat(document.getElementById('m3-diaEstimar').value);
    const alertasDiv = document.getElementById('m3-alertas');
    alertasDiv.innerHTML = '';

    if (xs.length < 3) {
      alertasDiv.innerHTML = crearAlerta('danger', 'triangle-exclamation', 'Se necesitan al menos 3 puntos de control.');
      return;
    }

    // Ordenar por x
    const idx = xs.map((_,i)=>i).sort((a,b)=>xs[a]-xs[b]);
    const xsSorted = idx.map(i=>xs[i]);
    const ysSorted = idx.map(i=>ys[i]);

    // Revisar si hay xs repetidos (error de división por cero)
    for(let i=0; i<xsSorted.length-1; i++){
      if(xsSorted[i] === xsSorted[i+1]) {
        alertasDiv.innerHTML = crearAlerta('danger', 'triangle-exclamation', 'No pueden haber dos días iguales en los puntos de control.');
        return;
      }
    }

    const alertas = [];
    const xMin = Math.min(...xsSorted), xMax = Math.max(...xsSorted);

    if (diaEst < xMin || diaEst > xMax) {
      alertas.push(crearAlerta('warning', 'circle-exclamation',
        `El día ${diaEst} está fuera del rango de datos [${xMin}, ${xMax}]. Esto es EXTRAPOLACIÓN y es muy inestable en Lagrange/Newton.`));
    }
    if (xsSorted.length >= 6 && (metodo === 'lagrange' || metodo === 'newton' || metodo === 'todos')) {
      alertas.push(crearAlerta('warning', 'wave-square',
        'Cuidado: Con 6 o más puntos dispersos, Lagrange y Newton sufren el <strong>Fenómeno de Runge</strong> (oscilaciones salvajes en los extremos).'));
    }

    alertasDiv.innerHTML = alertas.join('');

    const metodos = metodo === 'todos' ? ['lagrange','newton','splines'] : [metodo];
    const estimados = {};
    metodos.forEach(m => {
      if (m === 'lagrange') estimados.lagrange = lagrange(xsSorted, ysSorted, diaEst);
      else if (m === 'newton') estimados.newton = newton(xsSorted, ysSorted, diaEst);
      else estimados.splines = splinesCubicos(xsSorted, ysSorted, diaEst);
    });

    // Guardar en AppState
    const curvaRef = curvaInterpolada(xsSorted, ysSorted, metodo === 'todos' ? 'splines' : metodo);
    AppState.preciosInterpolados = {
      xs: curvaRef.txs, ys: curvaRef.tys,
      xsData: xsSorted, ysData: ysSorted,
      metodo: metodo === 'todos' ? 'splines' : metodo,
      producto: document.getElementById('m3-producto').value,
    };

    document.getElementById('m3-resultados').style.display = '';
    document.getElementById('m3-dia-est-label').textContent = diaEst;

    // Precios estimados tarjetas
    const colores = { lagrange: COLORES.lavanda, newton: COLORES.rosa, splines: COLORES.menta };
    const nombresMet = { lagrange: 'Lagrange', newton: 'Newton', splines: 'Splines' };
    
    document.getElementById('m3-precios-estimados').innerHTML = metodos.map(m => `
      <div class="col-12 col-sm-4 text-center">
        <div style="background:rgba(201,184,232,0.1);border-radius:12px;padding:0.8rem;border-bottom:3px solid ${colores[m]};">
          <div style="font-size:0.8rem;font-weight:600;">${nombresMet[m]}</div>
          <div class="valor-grande" style="color:${colores[m]};font-size:1.4rem;">${fmt(estimados[m], 2)}</div>
          <div style="font-size:0.75rem;opacity:0.7;">Bs</div>
        </div>
      </div>`).join('');

    // Gráfico
    destruirChart('m3-chart');
    const ctx = document.getElementById('m3-chart').getContext('2d');
    const opts = baseChartOptions(`Curva interpolada: ${PROD_LABELS[document.getElementById('m3-producto').value]}`);
    const datasets = [];

    metodos.forEach((m, mi) => {
      const col = [COLORES.lavanda, COLORES.rosa, COLORES.menta][mi % 3];
      const curva = curvaInterpolada(xsSorted, ysSorted, m);
      datasets.push({
        label: nombresMet[m],
        data: curva.txs.map((x, i) => ({ x, y: curva.tys[i] })),
        borderColor: col, backgroundColor: 'transparent',
        borderWidth: 2, pointRadius: 0, tension: 0, type: 'line',
      });
    });

    // Puntos de datos scatter
    datasets.push({
      label: 'Datos reales',
      data: xsSorted.map((x, i) => ({ x, y: ysSorted[i] })),
      backgroundColor: COLORES.durazno, borderColor: '#c8844a',
      borderWidth: 2, pointRadius: 6, type: 'scatter',
    });

    // Punto estimado
    const pEst = estimados[metodos[metodos.length-1]]; // tomar el ultimo
    datasets.push({
      label: `Día ${diaEst} (est.)`,
      data: [{ x: diaEst, y: pEst }],
      backgroundColor: '#e07090', borderColor: '#e07090',
      pointRadius: 9, pointHoverRadius: 11, pointStyle: 'triangle', type: 'scatter',
    });

    new Chart(ctx, {
      type: 'scatter',
      data: { datasets },
      options: {
        ...opts, parsing: false,
        scales: {
          x: { ...opts.scales.x, title: { display: true, text: 'Día del mes' } },
          y: { ...opts.scales.y, title: { display: true, text: 'Precio (Bs)' } },
        }
      }
    });

    // Tabla Newton
    const newtonWrap = document.getElementById('m3-tabla-newton-wrap');
    if (metodo === 'newton' || metodo === 'todos') {
      newtonWrap.style.display = '';
      const tabla = buildDifDiv(xsSorted, ysSorted);
      const n = xsSorted.length;
      let html = '<thead><tr><th>i</th><th>x_i</th><th>y_i</th>';
      for (let j = 1; j < n; j++) html += `<th>Orden ${j}</th>`;
      html += '</tr></thead><tbody>';
      for (let i = 0; i < n; i++) {
        html += `<tr><td>${i}</td><td>${xsSorted[i]}</td><td>${ysSorted[i]}</td>`;
        for (let j = 1; j < n; j++) {
          html += `<td>${i + j < n ? fmt(tabla[i][j], 4) : '—'}</td>`;
        }
        html += '</tr>';
      }
      html += '</tbody>';
      document.getElementById('m3-tabla-newton').innerHTML = html;
    } else {
      newtonWrap.style.display = 'none';
    }

    // Calcular mayor incremento de todos los productos en este caso
    let mayorIncName = '';
    let mayorIncVal = -1;
    for (const p in PRODUCTOS_DATA) {
      const ysP = PRODUCTOS_DATA[p][currentCaso].ys;
      const inc = (ysP[ysP.length-1] - ysP[0]) / ysP[0] * 100;
      if (inc > mayorIncVal) { mayorIncVal = inc; mayorIncName = p; }
    }
    const currInc = ((ysSorted[ysSorted.length-1] - ysSorted[0]) / ysSorted[0] * 100).toFixed(1);

    // Confiabilidad (Splines vs Lagrange en el punto medio)
    const midPoint = xMin + (xMax - xMin)/2;
    const diffMid = Math.abs(lagrange(xsSorted, ysSorted, midPoint) - splinesCubicos(xsSorted, ysSorted, midPoint));

    document.getElementById('m3-interpretacion').innerHTML = `
      <h5><i class="fa fa-comment-dots me-2"></i>Respuestas a la Simulación</h5>
      <ul style="padding-left:1.2rem;margin-bottom:0;">
        <li style="margin-bottom:0.5rem"><strong>¿Cuál sería el precio en un día sin dato (x=${diaEst})?</strong><br>
        Según el modelo de Splines (el más confiable), el precio estimado sería de <strong>Bs ${fmt(estimados.splines || estimados.lagrange, 2)}</strong>.</li>
        
        <li style="margin-bottom:0.5rem"><strong>¿Cómo se comporta la curva de precios?</strong><br>
        En este ${currentCaso === 'estable' ? 'Caso Estable, los precios fluctúan suavemente (oscilación natural de mercado)' : 'Caso Crítico, la curva muestra un crecimiento exponencial o polinómico agresivo, típico de hiperinflación o desabastecimiento severo'}. El producto actual subió un <strong>${currInc}%</strong> en total.</li>
        
        <li style="margin-bottom:0.5rem"><strong>¿Qué producto tuvo mayor incremento?</strong><br>
        Analizando los datos del caso actual, el producto con la peor inflación es <strong>${PROD_LABELS[mayorIncName]}</strong> con un devastador incremento del <strong>${fmt(mayorIncVal, 1)}%</strong>.</li>
        
        <li style="margin-bottom:0.5rem"><strong>¿Qué tan confiable es la interpolación?</strong><br>
        ${diffMid < 1.5 ? 'Altamente confiable. Lagrange y Splines arrojan curvas muy similares sin desviaciones extremas.' : 'Confiabilidad moderada/baja en polinomios únicos. Existe una diferencia significativa entre métodos en los puntos intermedios, indicando tensión en la curva.'}</li>
        
        <li><strong>¿Qué pasa si los datos son muy dispersos?</strong><br>
        Si hay grandes huecos de días entre datos o usas muchos puntos dispersos, <strong>Lagrange y Newton sufren oscilaciones violentas</strong> (Fenómeno de Runge). En esos casos, los <strong>Splines Cúbicos</strong> son la única forma segura de interpolar porque unen los puntos tramo por tramo.</li>
      </ul>
    `;
  }

  // ── INICIALIZACIÓN ─────────────────────────────────────────────
  container.innerHTML = buildUI();
  bindEvents();
  renderTablaDefault();

})();
