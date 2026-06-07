/* =========================================
   modulo4-integracion.js — Integración Numérica
   ========================================= */

'use strict';

(function initModulo4() {
  const container = document.getElementById('modulo4-app');
  if (!container) return;

  let currentCaso = 'critico';

  function buildUI() {
    return `
    <div class="row g-4">
      <!-- FORMULARIO -->
      <div class="col-12 col-lg-4">
        <div class="card-cs">
          <h5 class="mb-3"><i class="fa fa-sliders me-2"></i>Parámetros de la Canasta Básica</h5>

          <div class="d-flex gap-2 mb-3 flex-wrap">
            <button class="btn-autofill flex-fill" id="m4-btnEstable" style="font-size:0.75rem;"><i class="fa fa-shield-halved me-1"></i>Precios Estables</button>
            <button class="btn-autofill flex-fill" id="m4-btnCritico" style="background:linear-gradient(135deg,rgba(247,197,213,1),rgba(224,112,144,1));color:#fff!important;font-size:0.75rem;"><i class="fa fa-arrow-trend-up me-1"></i>Inflación Crítica</button>
          </div>

          <p class="mb-2" style="font-size:0.85rem;font-weight:600;">Consumo familiar diario (kg)</p>
          <div class="row g-2 mb-3">
            <div class="col-4">
              <label class="form-label" style="font-size:0.75rem;">Pollo</label>
              <input type="number" class="form-control" id="m4-c-pollo" value="1.0" step="any" min="0" />
            </div>
            <div class="col-4">
              <label class="form-label" style="font-size:0.75rem;">Arroz</label>
              <input type="number" class="form-control" id="m4-c-arroz" value="0.5" step="any" min="0" />
            </div>
            <div class="col-4">
              <label class="form-label" style="font-size:0.75rem;">Verduras</label>
              <input type="number" class="form-control" id="m4-c-verdu" value="1.5" step="any" min="0" />
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Número de subdivisiones (n)</label>
            <input type="number" class="form-control" id="m4-n" value="30" min="2" max="1000" />
            <small style="font-size:0.7rem;opacity:0.7;">Para un mes completo, usar n=30 aproxima el gasto por día.</small>
          </div>

          <div class="mb-3">
            <label class="form-label">Método de Integración</label>
            <select class="form-select" id="m4-metodo">
              <option value="trapecio">Regla del Trapecio</option>
              <option value="s13">Simpson 1/3</option>
              <option value="s38">Simpson 3/8</option>
              <option value="todos" selected>Comparar todos los métodos</option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label">Ingreso familiar mensual (Bs)</label>
            <input type="number" class="form-control" id="m4-ingreso" value="3500" min="0" />
          </div>

          <button class="btn-cs w-100" id="m4-btnCalc"><i class="fa fa-calculator me-1"></i>Calcular Gasto Mensual</button>
        </div>
      </div>

      <!-- RESULTADOS -->
      <div class="col-12 col-lg-8">
        <div id="m4-alertas"></div>
        <div id="m4-resultados" style="display:none;">

          <details class="algo-details fade-in mb-3">
            <summary><i class="fa fa-microchip"></i> ¿Qué algoritmo utiliza este módulo?</summary>
            <p><strong>Integración Numérica:</strong> Aproxima el área bajo la curva (gasto acumulado) dividiendo el dominio en <i>n</i> franjas.</p>
            <ul>
              <li><strong>Trapecio:</strong> Une los puntos con líneas rectas. Tiene un error proporcional a <i>h&sup2;</i>.</li>
              <li><strong>Simpson 1/3:</strong> Ajusta parábolas perfectas cada 3 puntos. Es ultra preciso si la curva es suave.</li>
              <li><strong>Simpson 3/8:</strong> Ajusta polinomios cúbicos cada 4 puntos. Similar precisión a 1/3 pero útil para <i>n</i> múltiplo de 3.</li>
            </ul>
          </details>

          <div class="row g-3 mb-3">
            <div class="col-12 col-sm-6">
              <div class="resultado-box text-center" style="height:100%;">
                <h5><i class="fa fa-wallet me-2"></i>Gasto mensual total</h5>
                <div class="valor-grande" style="color:var(--menta);font-size:1.8rem;" id="m4-gasto-val">—</div>
                <div style="font-size:0.8rem;opacity:0.7;">Bolivianos (Bs)</div>
              </div>
            </div>
            <div class="col-12 col-sm-6">
              <div class="resultado-box text-center" style="height:100%; border-bottom: 4px solid #e07090;">
                <h5 style="color:#e07090;"><i class="fa fa-arrow-down-long me-2"></i>Pérdida de poder adquisitivo</h5>
                <div class="valor-grande" style="color:#e07090;font-size:1.8rem;" id="m4-perdida-val">—</div>
                <div style="font-size:0.78rem;opacity:0.8;font-weight:600;" id="m4-perdida-pct">—</div>
              </div>
            </div>
          </div>

          <div class="grafico-wrap mb-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <strong style="font-size:0.9rem;">Área bajo la curva: Costo Diario de la Canasta Básica</strong>
              <button class="btn-export" onclick="exportarPNG('m4-chart','integracion_gasto.png')">
                <i class="fa fa-image me-1"></i>PNG
              </button>
            </div>
            <canvas id="m4-chart"></canvas>
          </div>

          <div class="card-cs mb-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h5 class="mb-0"><i class="fa fa-table me-2"></i>Comparación de métodos</h5>
              <button class="btn-export" onclick="exportarCSV('m4-tabla-metodos','integracion_comparacion.csv')">
                <i class="fa fa-download me-1"></i>CSV
              </button>
            </div>
            <div class="tabla-wrapper">
              <table class="tabla-cs" id="m4-tabla-metodos"></table>
            </div>
          </div>

          <div class="interp-box fade-in" id="m4-interpretacion"></div>
        </div>
      </div>
    </div>`;
  }

  function bindEvents() {
    document.getElementById('m4-btnCalc').addEventListener('click', calcular);
    
    document.getElementById('m4-btnEstable').addEventListener('click', () => {
      currentCaso = 'estable';
      document.getElementById('m4-alertas').innerHTML = crearAlerta('success', 'check', 'Parámetros cargados para una economía estable (inflación mínima).');
      calcular();
    });

    document.getElementById('m4-btnCritico').addEventListener('click', () => {
      currentCaso = 'critico';
      document.getElementById('m4-alertas').innerHTML = crearAlerta('warning', 'triangle-exclamation', 'Parámetros cargados para una crisis severa (incremento acelerado de precios).');
      calcular();
    });
  }

  // ── FUNCIONES DE PRECIO CONTINUAS P(t) ──────────────────────────
  function getFuncionesPrecios() {
    if (currentCaso === 'estable') {
      return {
        pollo: (t) => 15 + 0.02 * t,              // Lineal muy suave
        arroz: (t) => 8 + 0.01 * t,               // Casi constante
        verdu: (t) => 10 + 0.05 * t               // Sube un poquito
      };
    } else {
      return {
        pollo: (t) => 15 + 0.5 * t + 0.04 * t * t, // Cuadrática (se dispara al final)
        arroz: (t) => 8 + 0.2 * t + 0.01 * t * t,  // Cuadrática
        verdu: (t) => 10 + 0.8 * t                 // Lineal muy empinada
      };
    }
  }

  // ── ALGORITMOS DE INTEGRACIÓN ───────────────────────────────────

  function trapecio(f, a, b, n) {
    const h = (b - a) / n;
    let s = f(a) + f(b);
    for (let i = 1; i < n; i++) s += 2 * f(a + i * h);
    return s * h / 2;
  }

  function simpson13(f, a, b, n) {
    // n debe ser par
    if (n % 2 !== 0) n++;
    const h = (b - a) / n;
    let s = f(a) + f(b);
    for (let i = 1; i < n; i++) s += (i % 2 === 0 ? 2 : 4) * f(a + i * h);
    return s * h / 3;
  }

  function simpson38(f, a, b, n) {
    // n debe ser múltiplo de 3
    while (n % 3 !== 0) n++;
    const h = (b - a) / n;
    let s = f(a) + f(b);
    for (let i = 1; i < n; i++) {
      s += (i % 3 === 0 ? 2 : 3) * f(a + i * h);
    }
    return s * 3 * h / 8;
  }

  // ── CÁLCULO PRINCIPAL ─────────────────────────────────────────
  function calcular() {
    const cPollo = parseFloat(document.getElementById('m4-c-pollo').value) || 0;
    const cArroz = parseFloat(document.getElementById('m4-c-arroz').value) || 0;
    const cVerdu = parseFloat(document.getElementById('m4-c-verdu').value) || 0;
    let n = parseInt(document.getElementById('m4-n').value) || 30;
    const metodo = document.getElementById('m4-metodo').value;
    const ingreso = parseFloat(document.getElementById('m4-ingreso').value) || 3500;
    
    const alertasDiv = document.getElementById('m4-alertas');
    if(!alertasDiv.innerHTML.includes('alert')) alertasDiv.innerHTML = ''; 

    const precios = getFuncionesPrecios();

    // Costo total diario de la canasta básica en el tiempo t
    const fCanasta = (t) => (cPollo * precios.pollo(t)) + (cArroz * precios.arroz(t)) + (cVerdu * precios.verdu(t));
    
    // Intervalo de días (del día 1 al día 30, ancho = 29 días integrados)
    const a = 1, b = 30;

    // Ajuste automático de n
    const alertas = [];
    let nS13 = n, nS38 = n;

    if (metodo === 's13' || metodo === 'todos') {
      if (nS13 % 2 !== 0) {
        nS13++;
        alertas.push(crearAlerta('info', 'circle-info', `Simpson 1/3 requiere 'n' par. Se ajustó automáticamente a n = ${nS13}.`));
      }
    }
    if (metodo === 's38' || metodo === 'todos') {
      while (nS38 % 3 !== 0) nS38++;
      if (nS38 !== n) {
        alertas.push(crearAlerta('info', 'circle-info', `Simpson 3/8 requiere 'n' múltiplo de 3. Se ajustó automáticamente a n = ${nS38}.`));
      }
    }

    if(alertas.length > 0) alertasDiv.innerHTML += alertas.join('');

    // Calcular el área bajo la curva (gasto mensual)
    const gastTrap = trapecio(fCanasta, a, b, n);
    const gastS13 = simpson13(fCanasta, a, b, nS13);
    const gastS38 = simpson38(fCanasta, a, b, nS38);
    
    // Gasto si los precios se quedaban congelados en el Día 1
    const costoBaseDia1 = fCanasta(1);
    const gastSinInflacion = costoBaseDia1 * (b - a); 

    let gastoPrincipal;
    switch (metodo) {
      case 'trapecio': gastoPrincipal = gastTrap; break;
      case 's13': gastoPrincipal = gastS13; break;
      case 's38': gastoPrincipal = gastS38; break;
      default: gastoPrincipal = gastS13; // Simpson 1/3 por defecto en "Todos"
    }

    const perdidaBs = gastoPrincipal - gastSinInflacion;
    const perdidaPct = (perdidaBs / gastSinInflacion * 100).toFixed(1);

    document.getElementById('m4-resultados').style.display = '';
    document.getElementById('m4-gasto-val').textContent = `Bs ${fmt(gastoPrincipal, 2)}`;
    document.getElementById('m4-perdida-val').textContent = `Bs ${fmt(perdidaBs, 2)}`;
    document.getElementById('m4-perdida-pct').textContent = `+${perdidaPct}% de sobrecosto vs inflación cero`;

    // Impacto por producto
    const prods = [
      { name: 'Pollo', calc: simpson13((t) => cPollo * precios.pollo(t), a, b, nS13), base: cPollo * precios.pollo(1) * (b-a) },
      { name: 'Arroz', calc: simpson13((t) => cArroz * precios.arroz(t), a, b, nS13), base: cArroz * precios.arroz(1) * (b-a) },
      { name: 'Verduras', calc: simpson13((t) => cVerdu * precios.verdu(t), a, b, nS13), base: cVerdu * precios.verdu(1) * (b-a) }
    ];
    prods.forEach(p => p.impacto = p.calc - p.base);
    prods.sort((p1, p2) => p2.impacto - p1.impacto); // Mayor impacto primero

    // Tabla comparación de métodos
    const ref = gastS13; // Consideramos S13 el más preciso (exacto para polinomios de grado 2)
    document.getElementById('m4-tabla-metodos').innerHTML = `
      <thead><tr><th>Método</th><th>n usado</th><th>Gasto Estimado (Bs)</th><th>Error abs. vs S(1/3)</th></tr></thead>
      <tbody>
        <tr><td>Trapecio Compuesto</td><td>${n}</td><td>${fmt(gastTrap,4)}</td><td>${fmtSci(Math.abs(gastTrap-ref),4)}</td></tr>
        <tr style="background:rgba(201,184,232,0.15)"><td><strong>Simpson 1/3</strong></td><td>${nS13}</td><td><strong>${fmt(gastS13,4)}</strong></td><td>0.0000e+0</td></tr>
        <tr><td>Simpson 3/8</td><td>${nS38}</td><td>${fmt(gastS38,4)}</td><td>${fmtSci(Math.abs(gastS38-ref),4)}</td></tr>
        <tr style="border-top:2px solid var(--texto);"><td>Presupuesto Sin Inflación</td><td>—</td><td>${fmt(gastSinInflacion,2)}</td><td>—</td></tr>
      </tbody>`;

    // Gráfico de área
    destruirChart('m4-chart');
    const ctx = document.getElementById('m4-chart').getContext('2d');
    const opts = baseChartOptions('Evolución del Costo Diario de la Canasta');
    const xs = Array.from({length:30}, (_, i) => 1 + i); // días del 1 al 30
    const ysPrice = xs.map(x => fCanasta(x));
    const ysBase = xs.map(() => fCanasta(1));

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: xs.map(x => `Día ${x}`),
        datasets: [
          {
            label: 'Costo Real Diario P(t) (Bs)',
            data: ysPrice,
            borderColor: COLORES.rosa,
            backgroundColor: 'rgba(247, 197, 213, 0.4)', // Rosa semitransparente
            fill: true, borderWidth: 3, pointRadius: 2, tension: 0.3,
          },
          {
            label: 'Costo Congelado (Día 1)',
            data: ysBase,
            borderColor: COLORES.menta,
            backgroundColor: 'transparent',
            borderWidth: 2, borderDash: [6,4], pointRadius: 0,
          }
        ]
      },
      options: {
        ...opts,
        scales: {
          x: { ...opts.scales.x, title: { display: false } },
          y: { ...opts.scales.y, title: { display: true, text: 'Costo Diario (Bs)' }, min: 0 },
        }
      }
    });

    // Interpretación respondiendo a las 5 preguntas
    document.getElementById('m4-interpretacion').innerHTML = `
      <h5><i class="fa fa-comment-dots me-2"></i>Respuestas a la Simulación</h5>
      <ul style="padding-left:1.2rem;margin-bottom:0;">
        <li style="margin-bottom:0.5rem"><strong>¿Cuánto gastó la familia durante el mes?</strong><br>
        El área bajo la curva roja indica un gasto mensual acumulado de <strong>Bs ${fmt(gastoPrincipal,2)}</strong>. Representa el <strong>${((gastoPrincipal/ingreso)*100).toFixed(1)}%</strong> de su ingreso.</li>
        
        <li style="margin-bottom:0.5rem"><strong>¿Cuánto hubiera gastado si los precios no subían?</strong><br>
        Si los precios se congelaban en el Día 1 (línea verde punteada), el gasto habría sido de solo <strong>Bs ${fmt(gastSinInflacion,2)}</strong>.</li>
        
        <li style="margin-bottom:0.5rem"><strong>¿Cuál fue la pérdida aproximada del poder adquisitivo?</strong><br>
        La inflación generó un gasto extra invisible de <strong>Bs ${fmt(perdidaBs,2)}</strong>. Este es dinero que la familia perdió solo por la crisis de precios.</li>
        
        <li style="margin-bottom:0.5rem"><strong>¿Qué producto afectó más al gasto mensual?</strong><br>
        El producto que más castigó el bolsillo fue <strong>${prods[0].name}</strong>, sumando un sobrecosto de Bs ${fmt(prods[0].impacto,2)} por sí solo a lo largo del mes.</li>
        
        <li><strong>¿Qué método de integración fue más preciso?</strong><br>
        <strong>Simpson 1/3</strong> es matemáticamente el más exacto aquí. Como la curva de precios simulada incluye polinomios de grado 2 (parábolas), Simpson 1/3 (que ajusta parábolas perfectas) tiene un error teórico de 0. La Regla del Trapecio (que usa líneas rectas) subestima ligeramente el área cuando la curva es cóncava hacia arriba.</li>
      </ul>
    `;
  }

  // ── INICIALIZACIÓN ─────────────────────────────────────────────
  container.innerHTML = buildUI();
  bindEvents();

})();
