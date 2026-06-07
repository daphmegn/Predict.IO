/* =========================================
   modulo1-sel.js — Sistemas de Ecuaciones Lineales
   ========================================= */

'use strict';

(function initModulo1() {
  const container = document.getElementById('modulo1-app');
  if (!container) return;

  // Initialization moved to the end of the IIFE

  // ── HTML ──────────────────────────────────────────────────────
  function buildUI() {
    return `
    <div class="row g-4">
      <!-- FORMULARIO -->
      <div class="col-12 col-lg-5">
        <div class="card-cs">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="mb-0"><i class="fa fa-sliders me-2"></i>Configuración de la Red</h5>
            <button class="btn-autofill" id="m1-btnAuto"><i class="fa fa-magic me-1"></i>Llenar matriz factible</button>
          </div>

          <p class="mb-1" style="font-size:0.85rem;font-weight:600;">Matriz A (3×3) — Distribución o Rutas</p>
          <div class="d-flex align-items-center gap-3 mb-3">
            <span style="font-size:1.8rem;color:var(--lavanda);">[</span>
            <div class="matriz-grid" id="gridA"></div>
            <span style="font-size:1.8rem;color:var(--lavanda);">]</span>
          </div>

          <p class="mb-1" style="font-size:0.85rem;font-weight:600;">Vector b — Demanda mínima (toneladas)</p>
          <div class="d-flex align-items-center gap-3 mb-3">
            <span style="font-size:1.8rem;color:var(--rosa);">{</span>
            <div class="vector-grid" id="gridB"></div>
            <span style="font-size:1.8rem;color:var(--rosa);">}</span>
          </div>

          <div class="mb-3">
            <label class="form-label">Costo unitario de transporte (Bs/ton)</label>
            <input type="number" class="form-control" id="m1-costo" value="50" min="0" step="any" />
            <small style="font-size:0.75rem;opacity:0.7;">Para calcular el costo de transporte total.</small>
          </div>

          <div class="mb-3">
            <label class="form-label">Método de solución</label>
            <select class="form-select" id="m1-metodo">
              <option value="lu">LU Doolittle</option>
              <option value="jacobi">Jacobi</option>
              <option value="gauss">Gauss-Seidel</option>
              <option value="sor">SOR (Relajación)</option>
              <option value="cgradiente">Gradiente Conjugado</option>
              <option value="todos">Comparar Todos los Métodos</option>
            </select>
          </div>

          <div id="params-iterativos" class="mb-3" style="display:none;">
            <div class="row g-2">
              <div class="col-6">
                <label class="form-label">Tolerancia</label>
                <input type="number" class="form-control" id="m1-tol" value="1e-6" step="any" />
              </div>
              <div class="col-6">
                <label class="form-label">Máx. iteraciones</label>
                <input type="number" class="form-control" id="m1-maxiter" value="100" min="1" />
              </div>
            </div>
          </div>

          <div id="params-sor" class="mb-3" style="display:none;">
            <label class="form-label">Parámetro omega (0–2)</label>
            <input type="number" class="form-control" id="m1-omega" value="1.25" min="0" max="2" step="0.01" />
          </div>

          <div class="d-flex gap-2 flex-wrap">
            <button class="btn-cs w-100" id="m1-btnCalc"><i class="fa fa-play me-1"></i>Calcular Abastecimiento</button>
          </div>
        </div>
      </div>

      <!-- RESULTADOS -->
      <div class="col-12 col-lg-7">
        <div id="m1-alertas"></div>
        <div id="m1-resultados" style="display:none;">

          <div class="resultado-box fade-in mb-3">
            <div class="d-flex justify-content-between">
              <h5><i class="fa fa-truck me-2"></i>Toneladas asignadas por Planta</h5>
              <div class="text-end">
                <div style="font-size:0.75rem;opacity:0.8;">Costo de Transporte Total</div>
                <div style="font-size:1.1rem;font-weight:700;color:var(--menta);">Bs <span id="m1-costo-total">0</span></div>
              </div>
            </div>
            <div id="m1-solucion" class="row g-2 mt-2"></div>
          </div>

          <div class="card-cs mb-3">
            <h5><i class="fa fa-microscope me-2"></i>Verificación: Ax vs Demanda (b)</h5>
            <div id="m1-verificacion"></div>
          </div>

          <div id="m1-comparacion-wrap" style="display:none;" class="card-cs mb-3">
            <h5 class="mb-3"><i class="fa fa-trophy me-2"></i>Comparación de Métodos</h5>
            <div class="tabla-wrapper">
              <table class="tabla-cs" id="m1-tabla-comp"></table>
            </div>
          </div>

          <div id="m1-tabla-iter-wrap" style="display:none;" class="card-cs mb-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h5 class="mb-0"><i class="fa fa-list-ol me-2"></i>Tabla de iteraciones</h5>
              <button class="btn-export" onclick="exportarCSV('m1-tabla-iter','sel_iteraciones.csv')">
                <i class="fa fa-download me-1"></i>CSV
              </button>
            </div>
            <div class="tabla-wrapper">
              <table class="tabla-cs" id="m1-tabla-iter"></table>
            </div>
          </div>

          <div class="grafico-wrap mb-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <strong style="font-size:0.9rem;">Distribución por Planta (toneladas)</strong>
              <button class="btn-export" onclick="exportarPNG('m1-chart','sel_distribucion.png')">
                <i class="fa fa-image me-1"></i>PNG
              </button>
            </div>
            <canvas id="m1-chart"></canvas>
          </div>

          <div class="interp-box fade-in" id="m1-interpretacion"></div>
        </div>
      </div>
    </div>`;
  }

  // ── VALORES POR DEFECTO ────────────────────────────────────────
  const A_FACTIBLE = [
    [5, 1, 1], // Estrictamente diagonal dominante
    [1, 4, 1],
    [2, 0, 6]
  ];
  const B_FACTIBLE = [100, 150, 200];

  function buildMatrizInputs() {
    const gridA = document.getElementById('gridA');
    const gridB = document.getElementById('gridB');
    gridA.innerHTML = '';
    gridB.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const inp = document.createElement('input');
        inp.type = 'number';
        inp.className = 'form-control';
        inp.id = `m1-a${i}${j}`;
        inp.value = A_FACTIBLE[i][j];
        inp.step = 'any';
        gridA.appendChild(inp);
      }
    }
    for (let i = 0; i < 3; i++) {
      const inp = document.createElement('input');
      inp.type = 'number';
      inp.className = 'form-control';
      inp.id = `m1-b${i}`;
      inp.value = B_FACTIBLE[i];
      inp.step = 'any';
      gridB.appendChild(inp);
    }
  }

  function leerMatriz() {
    const A = [], b = [];
    for (let i = 0; i < 3; i++) {
      A.push([]);
      for (let j = 0; j < 3; j++) {
        A[i].push(parseFloat(document.getElementById(`m1-a${i}${j}`).value) || 0);
      }
      b.push(parseFloat(document.getElementById(`m1-b${i}`).value) || 0);
    }
    return { A, b };
  }

  // ── EVENTOS ────────────────────────────────────────────────────
  function bindEvents() {
    buildMatrizInputs();

    document.getElementById('m1-metodo').addEventListener('change', actualizarParams);
    document.getElementById('m1-btnCalc').addEventListener('click', calcular);
    document.getElementById('m1-btnAuto').addEventListener('click', () => {
      buildMatrizInputs(); // Restaura la matriz diagonal dominante factible
      document.getElementById('m1-alertas').innerHTML = crearAlerta('success', 'check', 'Matriz estrictamente diagonal dominante cargada.');
    });
    actualizarParams();
  }

  function actualizarParams() {
    const met = document.getElementById('m1-metodo').value;
    const iterativos = ['jacobi', 'gauss', 'sor', 'cgradiente', 'todos'];
    document.getElementById('params-iterativos').style.display = iterativos.includes(met) ? '' : 'none';
    document.getElementById('params-sor').style.display = (met === 'sor' || met === 'todos') ? '' : 'none';
  }

  // ── CÁLCULO PRINCIPAL ─────────────────────────────────────────
  function calcular() {
    const { A, b } = leerMatriz();
    const metodo = document.getElementById('m1-metodo').value;
    const costoUnitario = parseFloat(document.getElementById('m1-costo').value) || 0;
    const alertasDiv = document.getElementById('m1-alertas');
    alertasDiv.innerHTML = '';

    // Validaciones
    const det = determinante3x3(A);
    const alertas = [];

    if (Math.abs(det) < 1e-12) {
      alertasDiv.innerHTML = crearAlerta('danger', 'triangle-exclamation',
        'La matriz A es singular (det ≈ 0). No hay solución única. Hay bloqueos totales o inconsistencias.');
      return;
    }

    if (!esDiagonalDominante(A)) {
      alertas.push(crearAlerta('warning', 'circle-exclamation',
        'La matriz no es estrictamente diagonal dominante. Los métodos iterativos podrían no converger.'));
    }

    const tol = parseFloat(document.getElementById('m1-tol')?.value) || 1e-6;
    const maxIter = parseInt(document.getElementById('m1-maxiter')?.value) || 100;
    const omega = parseFloat(document.getElementById('m1-omega')?.value) || 1.25;

    let resLU, resJac, resGS, resSOR, resGC;
    let resultadoPrincipal;
    const comparacion = [];

    try {
      if (metodo === 'lu' || metodo === 'todos') {
        resLU = luDoolittle(A, b);
        if (metodo === 'lu') resultadoPrincipal = resLU;
        comparacion.push({ nombre: 'LU Doolittle', res: resLU });
      }
      if (metodo === 'jacobi' || metodo === 'todos') {
        resJac = jacobi(A, b, tol, maxIter);
        if (metodo === 'jacobi') resultadoPrincipal = resJac;
        comparacion.push({ nombre: 'Jacobi', res: resJac });
      }
      if (metodo === 'gauss' || metodo === 'todos') {
        resGS = gaussSeidel(A, b, tol, maxIter);
        if (metodo === 'gauss') resultadoPrincipal = resGS;
        comparacion.push({ nombre: 'Gauss-Seidel', res: resGS });
      }
      if (metodo === 'sor' || metodo === 'todos') {
        resSOR = sor(A, b, omega, tol, maxIter);
        if (metodo === 'sor') resultadoPrincipal = resSOR;
        comparacion.push({ nombre: 'SOR', res: resSOR });
      }
      if (metodo === 'cgradiente' || metodo === 'todos') {
        resGC = gradienteConjugado(A, b, tol, maxIter, alertas);
        if (metodo === 'cgradiente') resultadoPrincipal = resGC;
        comparacion.push({ nombre: 'Gradiente Conjugado', res: resGC });
      }
    } catch (err) {
      alertasDiv.innerHTML = crearAlerta('danger', 'bug', 'Error en el cálculo: ' + err.message);
      return;
    }

    // Si es "todos", usamos LU como principal confiable
    if (metodo === 'todos') resultadoPrincipal = resLU;

    if (!resultadoPrincipal || !resultadoPrincipal.x) {
      alertasDiv.innerHTML = crearAlerta('danger', 'triangle-exclamation', 'No se pudo obtener solución.');
      return;
    }

    if (resultadoPrincipal.diverge) {
      alertas.push(crearAlerta('danger', 'triangle-exclamation',
        `El método seleccionado divergió. Prueba "Llenar matriz factible" o ajusta parámetros.`));
    }

    alertasDiv.innerHTML = alertas.join('');

    mostrarResultados(resultadoPrincipal, comparacion, A, b, metodo, det, costoUnitario);
  }

  // ── MOSTRAR RESULTADOS ─────────────────────────────────────────
  function mostrarResultados(resPrinc, comparacion, A, b, metodo, det, costoUnitario) {
    document.getElementById('m1-resultados').style.display = '';
    const x = resPrinc.x;
    const plantas = ['Planta 1', 'Planta 2', 'Planta 3'];

    // Costo total
    const totalTon = x.reduce((s, val) => s + Math.max(0, val), 0); // sumar envíos positivos
    const costoTotal = totalTon * costoUnitario;
    document.getElementById('m1-costo-total').textContent = fmt(costoTotal, 2);

    // Solución
    const solDiv = document.getElementById('m1-solucion');
    solDiv.innerHTML = plantas.map((p, i) => `
      <div class="col-4 text-center">
        <div style="background:rgba(201,184,232,0.15);border-radius:12px;padding:0.8rem;">
          <div style="font-size:0.8rem;font-weight:600;color:var(--lavanda);">${p}</div>
          <div class="valor-grande" style="font-size:1.3rem;">${fmt(x[i], 2)}</div>
          <div style="font-size:0.75rem;opacity:0.7;">toneladas</div>
        </div>
      </div>`).join('');

    // Verificación Ax
    const Ax = matVec(A, x);
    const resid = b.map((bi, i) => Math.abs(Ax[i] - bi));
    const maxResid = Math.max(...resid);
    document.getElementById('m1-verificacion').innerHTML = `
      <div class="tabla-wrapper">
        <table class="tabla-cs">
          <thead><tr><th>Ecuación (Zona)</th><th>Ax (Entregado)</th><th>b (Demanda)</th><th>Error residual</th></tr></thead>
          <tbody>
            ${['Norte', 'Centro', 'Sur'].map((z, i) => `<tr>
              <td>${z}</td>
              <td>${fmt(Ax[i], 4)}</td>
              <td>${fmt(b[i], 4)}</td>
              <td>${fmtSci(resid[i], 4)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <p class="mt-2" style="font-size:0.82rem;">
        <strong>Norma residual:</strong> ${fmtSci(maxResid, 4)} &nbsp;|&nbsp;
        <strong>det(A):</strong> ${fmt(det, 4)}
      </p>`;

    // Comparación si eligió Todos
    const compWrap = document.getElementById('m1-comparacion-wrap');
    if (metodo === 'todos') {
      compWrap.style.display = '';
      let html = `<thead><tr><th>Método</th><th>x₁</th><th>x₂</th><th>x₃</th><th>Iteraciones</th><th>Diverge</th></tr></thead><tbody>`;
      comparacion.forEach(c => {
        const cx = c.res.x || [0,0,0];
        html += `<tr>
          <td><strong>${c.nombre}</strong></td>
          <td>${fmt(cx[0], 2)}</td>
          <td>${fmt(cx[1], 2)}</td>
          <td>${fmt(cx[2], 2)}</td>
          <td>${c.res.iteraciones ? c.res.iteraciones.length : 'Directo'}</td>
          <td>${c.res.diverge ? '<span style="color:#e07090">Sí</span>' : 'No'}</td>
        </tr>`;
      });
      html += `</tbody>`;
      document.getElementById('m1-tabla-comp').innerHTML = html;
    } else {
      compWrap.style.display = 'none';
    }

    // Tabla iteraciones
    const wrap = document.getElementById('m1-tabla-iter-wrap');
    const tablaIter = document.getElementById('m1-tabla-iter');
    if (resPrinc.iteraciones && resPrinc.iteraciones.length > 0) {
      wrap.style.display = '';
      let htmlIter = `<thead><tr><th>#</th><th>x₁</th><th>x₂</th><th>x₃</th><th>Error relativo</th></tr></thead><tbody>`;
      resPrinc.iteraciones.forEach(it => {
        htmlIter += `<tr>
          <td>${it.k}</td>
          <td>${fmt(it.x[0], 4)}</td>
          <td>${fmt(it.x[1], 4)}</td>
          <td>${fmt(it.x[2], 4)}</td>
          <td>${fmtSci(it.err, 4)}</td>
        </tr>`;
      });
      htmlIter += `</tbody>`;
      tablaIter.innerHTML = htmlIter;
    } else {
      wrap.style.display = 'none';
    }

    // Gráfico
    destruirChart('m1-chart');
    const ctx = document.getElementById('m1-chart').getContext('2d');
    const opts = baseChartOptions('Aporte por Planta (x)');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: plantas,
        datasets: [{
          label: 'Toneladas a enviar',
          data: x.map(v => Math.max(0, parseFloat(v.toFixed(4)))),
          backgroundColor: [COLORES.lavandaD, COLORES.rosaD, COLORES.mentaD],
          borderColor: [COLORES.lavanda, COLORES.rosa, COLORES.menta],
          borderWidth: 2,
          borderRadius: 10,
        }]
      },
      options: { ...opts, plugins: { ...opts.plugins, legend: { display: false } } }
    });

    // Interpretación
    const maxIdx = x.indexOf(Math.max(...x));
    const minIdx = x.indexOf(Math.min(...x));
    const estable = maxResid < 1e-3;
    let numMetodo = comparacion.find(c => c.res === resPrinc)?.nombre || 'Seleccionado';
    
    document.getElementById('m1-interpretacion').innerHTML = `
      <h5><i class="fa fa-comment-dots me-2"></i>Análisis del Escenario</h5>
      <p>La solución óptima para satisfacer la demanda es enviar <strong>${fmt(x[maxIdx], 1)} ton</strong> desde la <strong>${plantas[maxIdx]}</strong> (mayor carga) y <strong>${fmt(x[minIdx], 1)} ton</strong> desde la <strong>${plantas[minIdx]}</strong>.</p>
      <p>El costo total de transporte asociado a esta distribución es de <strong>Bs ${fmt(costoTotal, 2)}</strong>.</p>
      <p>El sistema ${estable ? 'es numéricamente estable' : 'presenta inestabilidad o divergencia'} (residual: ${fmtSci(maxResid, 4)}). </p>
      <p><i class="fa fa-truck-fast me-1" style="color:var(--menta);"></i> <strong>Si una ruta se bloquea:</strong> Coloca un 0 en el coeficiente de la matriz A correspondiente. Verás cómo el costo de transporte cambia drásticamente o el sistema se vuelve irresoluble (matriz singular).</p>
      ${metodo === 'todos' ? '<p>Al comparar los métodos, los iterativos (Gauss-Seidel, SOR) son ideales para matrices con diagonal dominante, mientras que LU siempre resuelve si el determinante no es cero.</p>' : ''}`;
  }

  // ── ALGORITMOS ─────────────────────────────────────────────────

  function determinante3x3(A) {
    return A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1])
         - A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0])
         + A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);
  }

  function esDiagonalDominante(A) {
    const n = A.length;
    for (let i = 0; i < n; i++) {
      let suma = 0;
      for (let j = 0; j < n; j++) if (j !== i) suma += Math.abs(A[i][j]);
      if (Math.abs(A[i][i]) <= suma) return false;
    }
    return true;
  }

  function copiarMatriz(M) { return M.map(f => [...f]); }

  // LU Doolittle
  function luDoolittle(A, b) {
    const n = 3;
    const L = Array.from({length:n}, () => new Array(n).fill(0));
    const U = copiarMatriz(A);
    for (let i = 0; i < n; i++) L[i][i] = 1;

    for (let k = 0; k < n - 1; k++) {
      if (Math.abs(U[k][k]) < 1e-15) throw new Error('Pivote nulo en LU');
      for (let i = k + 1; i < n; i++) {
        L[i][k] = U[i][k] / U[k][k];
        for (let j = k; j < n; j++) U[i][j] -= L[i][k] * U[k][j];
      }
    }
    const y = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      let s = b[i];
      for (let j = 0; j < i; j++) s -= L[i][j] * y[j];
      y[i] = s;
    }
    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      let s = y[i];
      for (let j = i + 1; j < n; j++) s -= U[i][j] * x[j];
      x[i] = s / U[i][i];
    }
    return { x, iteraciones: null };
  }

  // Jacobi
  function jacobi(A, b, tol, maxIter) {
    const n = 3;
    let x = new Array(n).fill(0);
    const iters = [];
    let diverge = false;
    for (let k = 1; k <= maxIter; k++) {
      const xNuevo = new Array(n).fill(0);
      for (let i = 0; i < n; i++) {
        let s = b[i];
        for (let j = 0; j < n; j++) if (j !== i) s -= A[i][j] * x[j];
        xNuevo[i] = s / A[i][i];
      }
      const err = errorRel(xNuevo, x);
      iters.push({ k, x: [...xNuevo], err });
      x = xNuevo;
      if (!isFinite(err) || err > 1e10) { diverge = true; break; }
      if (err < tol) break;
    }
    return { x, iteraciones: iters, diverge };
  }

  // Gauss-Seidel
  function gaussSeidel(A, b, tol, maxIter) {
    const n = 3;
    let x = new Array(n).fill(0);
    const iters = [];
    let diverge = false;
    for (let k = 1; k <= maxIter; k++) {
      const xViejo = [...x];
      for (let i = 0; i < n; i++) {
        let s = b[i];
        for (let j = 0; j < n; j++) if (j !== i) s -= A[i][j] * x[j];
        x[i] = s / A[i][i];
      }
      const err = errorRel(x, xViejo);
      iters.push({ k, x: [...x], err });
      if (!isFinite(err) || err > 1e10) { diverge = true; break; }
      if (err < tol) break;
    }
    return { x, iteraciones: iters, diverge };
  }

  // SOR
  function sor(A, b, omega, tol, maxIter) {
    const n = 3;
    let x = new Array(n).fill(0);
    const iters = [];
    let diverge = false;
    for (let k = 1; k <= maxIter; k++) {
      const xViejo = [...x];
      for (let i = 0; i < n; i++) {
        let s = b[i];
        for (let j = 0; j < n; j++) if (j !== i) s -= A[i][j] * x[j];
        const gs = s / A[i][i];
        x[i] = (1 - omega) * x[i] + omega * gs;
      }
      const err = errorRel(x, xViejo);
      iters.push({ k, x: [...x], err });
      if (!isFinite(err) || err > 1e10) { diverge = true; break; }
      if (err < tol) break;
    }
    return { x, iteraciones: iters, diverge };
  }

  // Gradiente Conjugado
  function gradienteConjugado(A, b, tol, maxIter, alertas) {
    const n = 3;
    let simetrica = true;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        if (Math.abs(A[i][j] - A[j][i]) > 1e-10) { simetrica = false; break; }

    let Aw = A, bw = b;
    if (!simetrica) {
      if(alertas) alertas.push(crearAlerta('info', 'circle-info', 'Gradiente Conjugado: Matriz asimétrica. Se aplicó At*A.'));
      const At = A[0].map((_, j) => A.map(row => row[j]));
      Aw = At.map(row => A[0].map((_, j) => row.reduce((s, v, k) => s + v * A[k][j], 0)));
      bw = At.map(row => row.reduce((s, v, k) => s + v * b[k], 0));
    }

    let x = new Array(n).fill(0);
    let r = bw.map((bi, i) => bi - matVec(Aw, x)[i]);
    let p = [...r];
    const iters = [];
    let diverge = false;

    for (let k = 1; k <= maxIter; k++) {
      const Ap = matVec(Aw, p);
      const rr = r.reduce((s, v) => s + v * v, 0);
      const pAp = p.reduce((s, v, i) => s + v * Ap[i], 0);
      if (Math.abs(pAp) < 1e-15) break;
      const alpha = rr / pAp;
      const xNuevo = x.map((v, i) => v + alpha * p[i]);
      const rNuevo = r.map((v, i) => v - alpha * Ap[i]);
      const rrNuevo = rNuevo.reduce((s, v) => s + v * v, 0);
      const beta = rrNuevo / (rr || 1);
      p = rNuevo.map((v, i) => v + beta * p[i]);
      const err = errorRel(xNuevo, x);
      iters.push({ k, x: [...xNuevo], err });
      x = xNuevo;
      r = rNuevo;
      if (!isFinite(err) || err > 1e10) { diverge = true; break; }
      if (Math.sqrt(rrNuevo) < tol) break;
    }
    return { x, iteraciones: iters, diverge };
  }

  // ── INICIALIZACIÓN ─────────────────────────────────────────────
  container.innerHTML = buildUI();
  bindEvents();
  renderMath(container);

})();
