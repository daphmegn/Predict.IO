/* =========================================
   modulo2-edo.js — Ecuaciones Diferenciales Ordinarias
   ========================================= */

'use strict';

(function initModulo2() {
  const container = document.getElementById('modulo2-app');
  if (!container) return;

  function buildUI() {
    return `
    <div class="row g-4">
      <!-- FORMULARIO -->
      <div class="col-12 col-lg-4">
        <div class="card-cs">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="mb-0"><i class="fa fa-sliders me-2"></i>Parámetros del modelo</h5>
          </div>
          
          <div class="d-flex gap-2 mb-3 flex-wrap">
            <button class="btn-autofill flex-fill" id="m2-btnEstable" style="font-size:0.75rem;"><i class="fa fa-shield-halved me-1"></i>Caso Estable</button>
            <button class="btn-autofill flex-fill" id="m2-btnCritico" style="background:linear-gradient(135deg,rgba(247,197,213,1),rgba(224,112,144,1));color:#fff!important;font-size:0.75rem;"><i class="fa fa-triangle-exclamation me-1"></i>Caso Crítico</button>
          </div>

          <div class="mb-3">
            <label class="form-label">R₀ — Reserva inicial (litros)</label>
            <input type="number" class="form-control" id="m2-R0" value="10000" min="0" />
          </div>
          <div class="mb-3">
            <label class="form-label">Capacidad máxima del tanque (litros)</label>
            <input type="number" class="form-control" id="m2-capMax" value="10000" min="1" />
          </div>
          <div class="mb-3">
            <label class="form-label">α — Tasa de abastecimiento/entrada (lit/día)</label>
            <input type="number" class="form-control" id="m2-alpha" value="200" step="any" />
          </div>
          <div class="mb-3">
            <label class="form-label">β — Fracción de consumo diario regular</label>
            <input type="number" class="form-control" id="m2-beta" value="0.05" step="any" min="0" />
          </div>
          <div class="mb-3">
            <label class="form-label">
              γ — Factor de pánico social: <span class="slider-valor" id="m2-panico-val" style="font-weight:700;color:var(--rosa);">0.40</span>
            </label>
            <input type="range" class="form-range" id="m2-gamma" min="0" max="1" step="0.01" value="0.4" />
            <small style="font-size:0.75rem;opacity:0.8;">Un mayor pánico dispara el consumo extra.</small>
          </div>
          <div class="row g-2 mb-3">
            <div class="col-6">
              <label class="form-label">Días a simular</label>
              <input type="number" class="form-control" id="m2-dias" value="60" min="1" max="365" />
            </div>
            <div class="col-6">
              <label class="form-label">Paso (h)</label>
              <input type="number" class="form-control" id="m2-h" value="0.5" step="any" min="0.01" />
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Método Numérico</label>
            <select class="form-select" id="m2-metodo">
              <option value="euler">Euler</option>
              <option value="heun">Heun</option>
              <option value="rk4">RK4 (Runge-Kutta 4)</option>
              <option value="todos" selected>Comparar todos los métodos</option>
            </select>
          </div>
          <button class="btn-cs w-100" id="m2-btnSimular"><i class="fa fa-play me-1"></i>Simular Vaciado</button>
        </div>
      </div>

      <!-- RESULTADOS -->
      <div class="col-12 col-lg-8">
        <div id="m2-alertas"></div>
        <div id="m2-resultados" style="display:none;">

          <div id="m2-colapso-box" class="colapso-box mb-3" style="display:none;">
            <p style="font-size:0.9rem;font-weight:600;margin-bottom:0.1rem;color:#e07090;">Día de colapso estimado (RK4)</p>
            <div class="colapso-num" id="m2-dia-colapso">—</div>
            <p style="font-size:0.8rem;opacity:0.9;margin-top:0.2rem;">cuando la reserva cae por debajo del 20% de la capacidad</p>
          </div>

          <div class="grafico-wrap mb-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <strong style="font-size:0.9rem;">Evolución de la Reserva de Combustible R(t)</strong>
              <button class="btn-export" onclick="exportarPNG('m2-chart','edo_reserva.png')">
                <i class="fa fa-image me-1"></i>PNG
              </button>
            </div>
            <canvas id="m2-chart"></canvas>
          </div>

          <div class="card-cs mb-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h5 class="mb-0"><i class="fa fa-table me-2"></i>Tabla de valores R(t)</h5>
              <button class="btn-export" onclick="exportarCSV('m2-tabla','edo_reserva.csv')">
                <i class="fa fa-download me-1"></i>CSV
              </button>
            </div>
            <div class="tabla-wrapper">
              <table class="tabla-cs" id="m2-tabla"></table>
            </div>
          </div>

          <div class="interp-box fade-in" id="m2-interpretacion"></div>
        </div>
      </div>
    </div>`;
  }

  function bindEvents() {
    const slider = document.getElementById('m2-gamma');
    const sliderVal = document.getElementById('m2-panico-val');
    slider.addEventListener('input', () => { sliderVal.textContent = parseFloat(slider.value).toFixed(2); });
    document.getElementById('m2-btnSimular').addEventListener('click', simular);
    
    document.getElementById('m2-btnEstable').addEventListener('click', () => {
      document.getElementById('m2-alpha').value = 500;
      document.getElementById('m2-beta').value = 0.02;
      document.getElementById('m2-gamma').value = 0.1;
      sliderVal.textContent = "0.10";
      document.getElementById('m2-h').value = 1;
      simular();
    });

    document.getElementById('m2-btnCritico').addEventListener('click', () => {
      document.getElementById('m2-alpha').value = 100;
      document.getElementById('m2-beta').value = 0.08;
      document.getElementById('m2-gamma').value = 0.8;
      sliderVal.textContent = "0.80";
      document.getElementById('m2-h').value = 2; // Paso más grande para notar la diferencia de métodos
      simular();
    });
  }

  // ── MODELO ────────────────────────────────────────────────────
  function f(t, R, alpha, beta, gamma) {
    return alpha - beta * R * (1 + gamma);
  }

  // ── MÉTODOS ───────────────────────────────────────────────────
  function euler(R0, alpha, beta, gamma, dias, h) {
    const ts = [], Rs = [];
    let t = 0, R = R0;
    while (t <= dias + 1e-9) {
      ts.push(t);
      Rs.push(R);
      R = R + h * f(t, R, alpha, beta, gamma);
      t += h;
    }
    return { ts, Rs };
  }

  function heun(R0, alpha, beta, gamma, dias, h) {
    const ts = [], Rs = [];
    let t = 0, R = R0;
    while (t <= dias + 1e-9) {
      ts.push(t);
      Rs.push(R);
      const k1 = f(t, R, alpha, beta, gamma);
      const Rpred = R + h * k1;
      const k2 = f(t + h, Rpred, alpha, beta, gamma);
      R = R + h * (k1 + k2) / 2;
      t += h;
    }
    return { ts, Rs };
  }

  function rk4(R0, alpha, beta, gamma, dias, h) {
    const ts = [], Rs = [];
    let t = 0, R = R0;
    while (t <= dias + 1e-9) {
      ts.push(t);
      Rs.push(R);
      const k1 = f(t, R, alpha, beta, gamma);
      const k2 = f(t + h/2, R + h*k1/2, alpha, beta, gamma);
      const k3 = f(t + h/2, R + h*k2/2, alpha, beta, gamma);
      const k4 = f(t + h, R + h*k3, alpha, beta, gamma);
      R = R + h * (k1 + 2*k2 + 2*k3 + k4) / 6;
      t += h;
    }
    return { ts, Rs };
  }

  // ── SIMULACIÓN ────────────────────────────────────────────────
  function simular() {
    const R0 = parseFloat(document.getElementById('m2-R0').value) || 10000;
    const capMax = parseFloat(document.getElementById('m2-capMax').value) || 10000;
    const alpha = parseFloat(document.getElementById('m2-alpha').value) || 0;
    const beta = parseFloat(document.getElementById('m2-beta').value) || 0;
    const gamma = parseFloat(document.getElementById('m2-gamma').value) || 0;
    const dias = parseInt(document.getElementById('m2-dias').value) || 60;
    const h = parseFloat(document.getElementById('m2-h').value) || 0.5;
    const metodo = document.getElementById('m2-metodo').value;
    
    const umbral = 0.2 * capMax;

    const eulerRes = euler(R0, alpha, beta, gamma, dias, h);
    const heunRes = heun(R0, alpha, beta, gamma, dias, h);
    const rk4Res = rk4(R0, alpha, beta, gamma, dias, h);

    // Guardar RK4 en AppState
    AppState.reservaSimulada = { ts: rk4Res.ts, Rs: rk4Res.Rs, umbral, capMax, alpha, beta, gamma };

    // Día de colapso RK4
    let diaColapso = null;
    for (let i = 0; i < rk4Res.ts.length; i++) {
      if (rk4Res.Rs[i] < umbral) { diaColapso = rk4Res.ts[i]; break; }
    }

    const alertasDiv = document.getElementById('m2-alertas');
    alertasDiv.innerHTML = '';
    if (diaColapso !== null) {
      alertasDiv.innerHTML = crearAlerta('danger', 'triangle-exclamation',
        `¡ALERTA CRÍTICA! La reserva de combustible cae por debajo del umbral del 20% (${fmt(umbral,0)} litros) en el <strong>día ${fmt(diaColapso,1)}</strong>.`);
    }

    document.getElementById('m2-resultados').style.display = '';
    const colBox = document.getElementById('m2-colapso-box');
    if (diaColapso !== null) {
      colBox.style.display = '';
      document.getElementById('m2-dia-colapso').textContent = `Día ${fmt(diaColapso, 1)}`;
    } else {
      colBox.style.display = 'none';
    }

    // Datos para gráfico/tabla según método seleccionado
    const usarEuler = metodo === 'euler' || metodo === 'todos';
    const usarHeun = metodo === 'heun' || metodo === 'todos';
    const usarRk4 = metodo === 'rk4' || metodo === 'todos';

    // Gráfico
    destruirChart('m2-chart');
    const ctx = document.getElementById('m2-chart').getContext('2d');
    const opts = baseChartOptions('Vaciado de Reserva de Combustible R(t)');
    const datasets = [];
    if (usarRk4) datasets.push({
      label: 'RK4',
      data: rk4Res.ts.filter((_,i)=>i%2===0).map((_,i)=>({x:rk4Res.ts[i*2],y:rk4Res.Rs[i*2]})),
      borderColor: COLORES.rosa, backgroundColor: 'transparent',
      borderWidth: 3, pointRadius: 0, tension: 0.3,
    });
    if (usarHeun) datasets.push({
      label: 'Heun',
      data: heunRes.ts.filter((_,i)=>i%2===0).map((_,i)=>({x:heunRes.ts[i*2],y:heunRes.Rs[i*2]})),
      borderColor: COLORES.menta, backgroundColor: 'transparent',
      borderWidth: 2, borderDash: [6, 4], pointRadius: 0, tension: 0.3,
    });
    if (usarEuler) datasets.push({
      label: 'Euler',
      data: eulerRes.ts.filter((_,i)=>i%2===0).map((_,i)=>({x:eulerRes.ts[i*2],y:eulerRes.Rs[i*2]})),
      borderColor: COLORES.lavanda, backgroundColor: 'transparent',
      borderWidth: 2, borderDash: [2, 2], pointRadius: 0, tension: 0.3,
    });
    // Línea umbral
    datasets.push({
      label: 'Umbral 20%',
      data: [{x:0,y:umbral},{x:dias,y:umbral}],
      borderColor: '#e07090', backgroundColor: 'transparent',
      borderWidth: 2, borderDash: [8,4], pointRadius: 0,
    });

    new Chart(ctx, {
      type: 'line',
      data: { datasets },
      options: {
        ...opts,
        parsing: false,
        scales: {
          x: { ...opts.scales.x, type: 'linear', title: { display: true, text: 'Día', color: opts.scales.x.ticks.color } },
          y: { ...opts.scales.y, title: { display: true, text: 'Reserva (litros)', color: opts.scales.y.ticks.color } },
        }
      }
    });

    // Tabla
    const diasEnteros = Array.from({length: dias + 1}, (_, i) => i);
    function interpolar(ts, Rs, d) {
      let best = 0;
      for (let i = 0; i < ts.length; i++) if (Math.abs(ts[i] - d) < Math.abs(ts[best] - d)) best = i;
      return Rs[best];
    }
    const filas = diasEnteros.filter(d => d % 5 === 0 || d === 1 || d === dias).map(d => ({
      d,
      e: interpolar(eulerRes.ts, eulerRes.Rs, d),
      h2: interpolar(heunRes.ts, heunRes.Rs, d),
      r: interpolar(rk4Res.ts, rk4Res.Rs, d),
    }));

    document.getElementById('m2-tabla').innerHTML = `
      <thead><tr>
        <th>Día</th>
        ${usarEuler ? '<th>R_Euler (lit)</th>' : ''}
        ${usarHeun ? '<th>R_Heun (lit)</th>' : ''}
        ${usarRk4 ? '<th>R_RK4 (lit)</th>' : ''}
      </tr></thead>
      <tbody>
        ${filas.map(f2 => `<tr>
          <td>${f2.d}</td>
          ${usarEuler ? `<td>${fmt(f2.e,2)}</td>` : ''}
          ${usarHeun ? `<td>${fmt(f2.h2,2)}</td>` : ''}
          ${usarRk4 ? `<td>${fmt(f2.r,2)}</td>` : ''}
        </tr>`).join('')}
      </tbody>`;

    // Diferencias
    const eFin = eulerRes.Rs[eulerRes.Rs.length-1];
    const hFin = heunRes.Rs[heunRes.Rs.length-1];
    const rFin = rk4Res.Rs[rk4Res.Rs.length-1];

    document.getElementById('m2-interpretacion').innerHTML = `
      <h5><i class="fa fa-comment-dots me-2"></i>Respuestas a la Simulación</h5>
      <ul style="padding-left:1.2rem;margin-bottom:0;">
        <li style="margin-bottom:0.5rem"><strong>¿En cuántos días la reserva llega a un nivel crítico?</strong><br>
        ${diaColapso !== null ? `En <strong>${fmt(diaColapso, 1)} días</strong> la reserva cruza el umbral del 20% (${umbral} litros).` : 'Con los parámetros actuales, la reserva <strong>NO</strong> alcanza un nivel crítico durante el periodo simulado.'}</li>
        
        <li style="margin-bottom:0.5rem"><strong>¿Qué pasa si aumenta el consumo diario (β) o el pánico (γ)?</strong><br>
        El decaimiento (R'(t)) se vuelve mucho más negativo. La curva caerá en picada más rápidamente, provocando un desabastecimiento en menos días. ¡Intenta subir el *Factor de pánico* para verlo en acción!</li>
        
        <li style="margin-bottom:0.5rem"><strong>¿Qué pasa si se reduce el abastecimiento (α)?</strong><br>
        La pendiente se hace incapaz de compensar el consumo base. Si α es 0 (bloqueo total), la ecuación se convierte en un decaimiento exponencial puro.</li>
        
        <li style="margin-bottom:0.5rem"><strong>¿Qué método da una aproximación más estable?</strong><br>
        <strong>RK4 (Runge-Kutta de 4to orden)</strong>. Procesa 4 evaluaciones de la derivada por paso (k1 a k4), haciéndolo robusto incluso si el tamaño de paso (h) es grande.</li>
        
        <li><strong>¿Cuál es la diferencia final entre Euler, Heun y RK4?</strong><br>
        En el día ${dias}, la proyección de <strong>Euler</strong> es de ${fmt(eFin,1)} L (error de orden 1), <strong>Heun</strong> estima ${fmt(hFin,1)} L (orden 2) y <strong>RK4</strong> proyecta ${fmt(rFin,1)} L (orden 4). La diferencia acumulada entre el método más básico (Euler) y el más preciso (RK4) es de <strong>${fmt(Math.abs(eFin - rFin), 2)} litros</strong>.</li>
      </ul>
    `;
  }

  // ── INICIALIZACIÓN ─────────────────────────────────────────────
  container.innerHTML = buildUI();
  bindEvents();

})();
