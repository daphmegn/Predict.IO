/* =========================================
   modulo5-raices.js — Búsqueda de Raíces
   ========================================= */

'use strict';

(function initModulo5() {
  const container = document.getElementById('modulo5-app');
  if (!container) return;

  // Initialization moved to the bottom

  function buildUI() {
    return `
    <div class="row g-4">
      <!-- FORMULARIO -->
      <div class="col-12 col-lg-5">
        <div class="card-cs">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="mb-0"><i class="fa fa-sliders me-2"></i>Configuración de Raíces</h5>
            <button class="btn-autofill" id="m5-btnAuto"><i class="fa fa-magic me-1"></i>Llenar ejemplo</button>
          </div>

          <div class="mb-3">
            <label class="form-label">Función del modelo</label>
            <select class="form-select" id="m5-funcion">
              <option value="f1">F1: Día de quiebre (Costo acumulado supera Ingreso)</option>
              <option value="f2">F2: Reserva de carburante (Consumo iguala entrada)</option>
              <option value="f3">F3: Umbral de tensión social (Inestabilidad masiva)</option>
            </select>
          </div>

          <div class="formula-box" id="m5-formula-disp" style="font-size:0.9rem; margin-bottom:1.5rem;">
            <!-- Formula goes here -->
          </div>

          <div class="mb-3">
            <label class="form-label">Método Numérico</label>
            <select class="form-select" id="m5-metodo">
              <option value="biseccion">Bisección</option>
              <option value="newton">Newton-Raphson</option>
              <option value="secante">Secante</option>
              <option value="todos">Comparar los 3</option>
            </select>
          </div>

          <div class="row g-2 mb-3">
            <div class="col-6">
              <label class="form-label">Punto a / x₀</label>
              <input type="number" class="form-control" id="m5-a" value="10" step="any" />
              <small style="font-size:0.7rem;opacity:0.7;">Bisección, Newton, Secante</small>
            </div>
            <div class="col-6">
              <label class="form-label">Punto b / x₁</label>
              <input type="number" class="form-control" id="m5-b" value="30" step="any" />
              <small style="font-size:0.7rem;opacity:0.7;">Bisección y Secante</small>
            </div>
          </div>

          <div class="row g-2 mb-3">
            <div class="col-6">
              <label class="form-label">Tolerancia</label>
              <input type="number" class="form-control" id="m5-tol" value="1e-5" step="any" />
            </div>
            <div class="col-6">
              <label class="form-label">Max Iteraciones</label>
              <input type="number" class="form-control" id="m5-maxiter" value="50" min="1" />
            </div>
          </div>

          <button class="btn-cs w-100" id="m5-btnCalc"><i class="fa fa-calculator me-1"></i>Encontrar Raíz</button>
        </div>
      </div>

      <!-- RESULTADOS -->
      <div class="col-12 col-lg-7">
        <div id="m5-alertas"></div>
        <div id="m5-resultados" style="display:none;">

          <details class="algo-details fade-in mb-3">
            <summary><i class="fa fa-microchip"></i> ¿Qué algoritmo utiliza este módulo?</summary>
            <p><strong>Raíces de Ecuaciones No Lineales:</strong> Busca el punto <i>x</i> donde <i>f(x) = 0</i> (umbral crítico).</p>
            <ul>
              <li><strong>Bisección:</strong> Corta el intervalo a la mitad iterativamente. Lento (convergencia lineal) pero infalible si hay cambio de signo.</li>
              <li><strong>Newton-Raphson:</strong> Usa la tangente (derivada) para saltar rápidamente a la raíz. Convergencia cuadrática, pero falla si la derivada es cero.</li>
              <li><strong>Secante:</strong> Aproxima la derivada con dos puntos. Casi tan rápido como Newton y no requiere la ecuación de la derivada.</li>
            </ul>
          </details>

          <div class="resultado-box fade-in mb-3">
            <h5><i class="fa fa-crosshairs me-2"></i>Raíz encontrada (Punto crítico)</h5>
            <div class="row g-2" id="m5-raiz-res"></div>
          </div>

          <div class="grafico-wrap mb-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <strong style="font-size:0.9rem;">Comportamiento de la función f(x)</strong>
              <button class="btn-export" onclick="exportarPNG('m5-chart','raices_funcion.png')">
                <i class="fa fa-image me-1"></i>PNG
              </button>
            </div>
            <canvas id="m5-chart"></canvas>
          </div>

          <div class="card-cs mb-3" id="m5-tabla-wrap">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h5 class="mb-0"><i class="fa fa-list-ol me-2"></i>Iteraciones y Convergencia</h5>
              <button class="btn-export" onclick="exportarCSV('m5-tabla-iter','raices_iteraciones.csv')">
                <i class="fa fa-download me-1"></i>CSV
              </button>
            </div>
            <div class="tabla-wrapper">
              <table class="tabla-cs" id="m5-tabla-iter"></table>
            </div>
          </div>

          <div class="interp-box fade-in" id="m5-interpretacion"></div>
        </div>
      </div>
    </div>`;
  }

  // ── FUNCIONES ──────────────────────────────────────────────────
  const FNS = {
    f1: {
      f: (x) => 5 * x * x + 20 * x - 3000,
      tex: '\\[ f(x) = 5x^2 + 20x - 3000 = 0 \\]',
      desc: 'Día x en el que el gasto (modelado por 5x² + 20x) alcanza el ingreso de 3000 Bs.',
      defA: 10, defB: 30, unit: 'días'
    },
    f2: {
      f: (x) => 200 - 0.05 * x * (1 + 0.4 * Math.exp(0.02 * x)),
      tex: '\\[ f(R) = 200 - 0.05 R (1 + 0.4 e^{0.02 R}) = 0 \\]',
      desc: 'Reserva R crítica donde la tasa de consumo iguala a la entrada constante de 200 L.',
      defA: 2000, defB: 4000, unit: 'litros'
    },
    f3: {
      f: (x) => 0.5 * Math.exp(0.3 * x) - 10,
      tex: '\\[ f(x) = 0.5 e^{0.3x} - 10 = 0 \\]',
      desc: 'Día x en el que el índice de tensión social llega al umbral crítico de 10 puntos.',
      defA: 0, defB: 15, unit: 'días'
    }
  };

  // Derivada numérica central
  function deriv(f, x) {
    const h = 1e-5;
    return (f(x + h) - f(x - h)) / (2 * h);
  }

  function bindEvents() {
    document.getElementById('m5-funcion').addEventListener('change', actualizarFormula);
    document.getElementById('m5-btnAuto').addEventListener('click', () => {
      const fn = document.getElementById('m5-funcion').value;
      if (fn === 'f1') cargarDatosF1();
      else if (fn === 'f2') cargarDatosF2();
      else cargarDatosF3();
    });
    document.getElementById('m5-btnCalc').addEventListener('click', calcularRaices);
  }

  function actualizarFormula() {
    const fn = document.getElementById('m5-funcion').value;
    const box = document.getElementById('m5-formula-disp');
    box.innerHTML = `${FNS[fn].tex}<div style="font-size:0.8rem;margin-top:5px;opacity:0.8">${FNS[fn].desc}</div>`;
    renderMath(box);
  }

  function cargarDatosF1() {
    document.getElementById('m5-funcion').value = 'f1';
    document.getElementById('m5-a').value = 10;
    document.getElementById('m5-b').value = 30;
    actualizarFormula();
  }
  function cargarDatosF2() {
    document.getElementById('m5-funcion').value = 'f2';
    document.getElementById('m5-a').value = 2000;
    document.getElementById('m5-b').value = 4000;
    actualizarFormula();
  }
  function cargarDatosF3() {
    document.getElementById('m5-funcion').value = 'f3';
    document.getElementById('m5-a').value = 0;
    document.getElementById('m5-b').value = 15;
    actualizarFormula();
  }

  // ── MÉTODOS ────────────────────────────────────────────────────
  function calcConvergencia(errAct, errAnt, pAnt) {
    if (errAnt < 1e-12 || errAct === 0) return pAnt;
    const p = Math.log(errAct) / Math.log(errAnt);
    return isNaN(p) || !isFinite(p) ? pAnt : p;
  }

  function biseccion(f, a, b, tol, maxIter) {
    const iters = [];
    if (f(a) * f(b) > 0) return { error: 'No hay cambio de signo en [a,b].' };
    let c = a;
    for (let k = 1; k <= maxIter; k++) {
      c = (a + b) / 2;
      const fc = f(c);
      const err = (b - a) / 2;
      iters.push({ k, x: c, fx: fc, err, p: 1 }); // bisección converge linealmente (p~1)
      if (Math.abs(fc) < 1e-15 || err < tol) break;
      if (f(a) * fc < 0) b = c; else a = c;
    }
    return { raiz: c, iters };
  }

  function newton(f, x0, tol, maxIter) {
    const iters = [];
    let x = x0;
    let errAnt = 1;
    let p = 2;
    for (let k = 1; k <= maxIter; k++) {
      const fx = f(x);
      const dfx = deriv(f, x);
      if (Math.abs(dfx) < 1e-12) return { error: 'Derivada nula. Newton no converge.' };
      const xNuevo = x - fx / dfx;
      const err = Math.abs(xNuevo - x);
      if (k > 1) p = calcConvergencia(err, errAnt, p);
      iters.push({ k, x: xNuevo, fx: f(xNuevo), err, p });
      x = xNuevo;
      errAnt = err;
      if (err < tol) break;
    }
    return { raiz: x, iters };
  }

  function secante(f, x0, x1, tol, maxIter) {
    const iters = [];
    let xm1 = x0, x = x1;
    let errAnt = 1;
    let p = 1.618;
    for (let k = 1; k <= maxIter; k++) {
      const fx = f(x);
      const fxm1 = f(xm1);
      if (Math.abs(fx - fxm1) < 1e-12) return { error: 'División por cero en Secante.' };
      const xNuevo = x - fx * (x - xm1) / (fx - fxm1);
      const err = Math.abs(xNuevo - x);
      if (k > 1) p = calcConvergencia(err, errAnt, p);
      iters.push({ k, x: xNuevo, fx: f(xNuevo), err, p });
      xm1 = x;
      x = xNuevo;
      errAnt = err;
      if (err < tol) break;
    }
    return { raiz: x, iters };
  }

  function calcularRaices() {
    const fnKey = document.getElementById('m5-funcion').value;
    const fObj = FNS[fnKey];
    const f = fObj.f;
    const met = document.getElementById('m5-metodo').value;
    const a = parseFloat(document.getElementById('m5-a').value);
    const b = parseFloat(document.getElementById('m5-b').value);
    const tol = parseFloat(document.getElementById('m5-tol').value) || 1e-5;
    const max = parseInt(document.getElementById('m5-maxiter').value) || 50;

    const alertasDiv = document.getElementById('m5-alertas');
    alertasDiv.innerHTML = '';
    const alertas = [];

    const res = {};
    if (met === 'biseccion' || met === 'todos') {
      const rb = biseccion(f, a, b, tol, max);
      if (rb.error) alertas.push(crearAlerta('danger', 'triangle-exclamation', 'Bisección: ' + rb.error));
      else res.bis = rb;
    }
    if (met === 'newton' || met === 'todos') {
      const rn = newton(f, a, tol, max); // x0 = a
      if (rn.error) alertas.push(crearAlerta('danger', 'triangle-exclamation', 'Newton: ' + rn.error));
      else res.newt = rn;
    }
    if (met === 'secante' || met === 'todos') {
      const rs = secante(f, a, b, tol, max); // x0 = a, x1 = b
      if (rs.error) alertas.push(crearAlerta('danger', 'triangle-exclamation', 'Secante: ' + rs.error));
      else res.sec = rs;
    }

    if (alertas.length > 0 && Object.keys(res).length === 0) {
      alertasDiv.innerHTML = alertas.join('');
      return;
    }
    alertasDiv.innerHTML = alertas.join('');

    mostrarResultados(res, met, fnKey, f, a, b);
  }

  function mostrarResultados(res, met, fnKey, f, a, b) {
    document.getElementById('m5-resultados').style.display = '';
    const fObj = FNS[fnKey];
    
    // Tarjetas de resultado
    let htmlRes = '';
    const colors = { bis: COLORES.lavanda, newt: COLORES.rosa, sec: COLORES.menta };
    const names = { bis: 'Bisección', newt: 'Newton', sec: 'Secante' };
    
    for (const k in res) {
      htmlRes += `
        <div class="col-12 col-sm-4 text-center">
          <div style="background:rgba(201,184,232,0.1);border-radius:12px;padding:1rem;border-bottom:3px solid ${colors[k]}">
            <div style="font-size:0.8rem;font-weight:600;">${names[k]}</div>
            <div class="valor-grande" style="color:${colors[k]}">${fmt(res[k].raiz, 4)}</div>
            <div style="font-size:0.75rem;opacity:0.7;">${fObj.unit} (en ${res[k].iters.length} iters)</div>
          </div>
        </div>`;
    }
    document.getElementById('m5-raiz-res').innerHTML = htmlRes;

    // Tabla (mostrar la del método más rápido si son varios, o el elegido)
    let bestK = Object.keys(res)[0];
    for (const k in res) {
      if (res[k].iters.length < res[bestK].iters.length) bestK = k;
    }
    
    let htmlTabla = `<thead><tr><th>Iter</th><th>x (aprox)</th><th>f(x)</th><th>Error abs.</th><th>Orden p</th></tr></thead><tbody>`;
    res[bestK].iters.forEach(it => {
      htmlTabla += `<tr>
        <td>${it.k}</td>
        <td>${fmt(it.x, 6)}</td>
        <td>${fmtSci(it.fx, 4)}</td>
        <td>${fmtSci(it.err, 4)}</td>
        <td>${fmt(it.p, 2)}</td>
      </tr>`;
    });
    htmlTabla += `</tbody>`;
    document.getElementById('m5-tabla-iter').innerHTML = htmlTabla;

    // Interpretación detallada
    const orderHTML = Object.keys(res).map(k => {
      const iters = res[k].iters;
      const finalP = iters.length > 2 ? iters[iters.length-1].p : (k==='bis'?1:k==='newt'?2:1.618);
      return `<li><strong>${names[k]}:</strong> Convergencia estimada $p \\approx ${fmt(finalP, 2)}$ 
        (${k==='bis'?'Lineal':k==='newt'?'Cuadrática':'Superlineal'}) — ${iters.length} iteraciones.</li>`;
    }).join('');

    let msg = `<h5><i class="fa fa-comment-dots me-2"></i>Análisis del Modelo</h5>`;
    msg += `<p style="margin-bottom:0.5rem;"><strong>1. Punto Crítico (Solución):</strong><br>
    El cruce exacto del sistema ocurre en <strong>${fmt(res[bestK].raiz, 4)} ${fObj.unit}</strong>.</p>`;
    
    msg += `<p style="margin-bottom:0.5rem;"><strong>2. Velocidad y Orden de Convergencia:</strong><br>
    <ul style="margin-bottom:0.5rem;">${orderHTML}</ul></p>`;

    msg += `<p style="margin-bottom:0.5rem;"><strong>3. Robustez vs Sensibilidad a Condición Inicial:</strong><br>
    <ul style="padding-left:1.2rem;margin-bottom:0;">
      <li style="margin-bottom:0.3rem"><strong>Bisección:</strong> Es el más <strong>robusto</strong>. Siempre convergerá mientras le des un intervalo $[a, b]$ donde la función cambie de signo. Sin embargo, su velocidad es muy lenta (requiere dividir el intervalo a la mitad repetidas veces).</li>
      <li style="margin-bottom:0.3rem"><strong>Newton-Raphson:</strong> Es el más <strong>rápido</strong> (salto cuadrático), pero es extremadamente <strong>sensible a la condición inicial ($x_0$)</strong>. Si inicias en un punto donde la curva es casi plana (derivada cercana a cero), la tangente se dispara y el método diverge.</li>
      <li><strong>Secante:</strong> Ofrece un excelente equilibrio. Tiene convergencia casi tan rápida como Newton, pero es menos sensible ya que aproxima la pendiente cortando la curva en dos puntos ($x_0, x_1$) en lugar de depender de la derivada puntual.</li>
    </ul></p>`;

    document.getElementById('m5-interpretacion').innerHTML = msg;
    renderMath(document.getElementById('m5-interpretacion')); // Para renderizar posibles MathJax

    // Gráfico
    destruirChart('m5-chart');
    const ctx = document.getElementById('m5-chart').getContext('2d');
    const opts = baseChartOptions('Búsqueda de raíz f(x) = 0');
    
    // Generar curva
    let minX = Math.min(a, res[bestK].raiz) - (b-a)*0.2;
    let maxX = Math.max(b, res[bestK].raiz) + (b-a)*0.2;
    if (minX === maxX) { minX -= 5; maxX += 5; }
    
    const step = (maxX - minX) / 100;
    const curveData = [];
    for (let x = minX; x <= maxX; x += step) curveData.push({x, y: f(x)});
    
    const datasets = [{
      label: 'f(x)',
      data: curveData,
      borderColor: COLORES.lavanda,
      borderWidth: 2, pointRadius: 0, tension: 0.2, type: 'line'
    }];
    
    // Eje X = 0
    datasets.push({
      label: 'Eje 0',
      data: [{x: minX, y:0}, {x: maxX, y:0}],
      borderColor: '#e07090', borderWidth: 1.5, borderDash: [6,4], pointRadius: 0, type: 'line'
    });

    // Puntos de raíces
    for (const k in res) {
      datasets.push({
        label: `Raíz ${names[k]}`,
        data: [{x: res[k].raiz, y: 0}],
        backgroundColor: colors[k], borderColor: colors[k],
        pointRadius: 7, pointHoverRadius: 9, type: 'scatter'
      });
    }

    new Chart(ctx, {
      type: 'scatter',
      data: { datasets },
      options: {
        ...opts, parsing: false,
        scales: {
          x: { ...opts.scales.x, title: { display: true, text: `Variable x (${fObj.unit})` } },
          y: { ...opts.scales.y, title: { display: true, text: 'f(x)' } },
        }
      }
    });
  }

  // ── INICIALIZACIÓN ─────────────────────────────────────────────
  container.innerHTML = buildUI();
  bindEvents();
  cargarDatosF1(); // por defecto

})();
