# Predict.IO — Simuladora Numérica de Crisis

**Predict.IO** es una herramienta interactiva web desarrollada para modelar matemáticamente los escenarios que ocurren durante una crisis de abastecimiento urbano (bloqueos, escasez, pánico e inflación). 

Este proyecto fue desarrollado como entrega final de la materia de **Métodos Numéricos**, demostrando que la matemática aplicada puede brindar soluciones precisas para la toma de decisiones logísticas, gubernamentales o empresariales.

---

## 🌐 Demo en Vivo

Puedes acceder y utilizar la simuladora directamente desde tu navegador en el siguiente enlace:
👉 **[Predict.IO Live Demo](https://daphmegn.github.io/Predict.IO/)**

---

## 💻 Módulos y Algoritmos Implementados

La herramienta se divide en 5 módulos computacionales principales, los cuales atacan un problema específico de la crisis urbana utilizando los siguientes algoritmos matemáticos:

### Módulo 1: Sistemas de Ecuaciones Lineales (SEL)
* **El problema:** Optimización de redes de transporte y distribución de carburantes/alimentos cuando las rutas están bloqueadas o reducidas.
* **Algoritmos utilizados:**
  * LU Doolittle
  * Método de Jacobi
  * Método de Gauss-Seidel
  * Relajación Sucesiva (SOR)
  * Gradiente Conjugado

### Módulo 2: Ecuaciones Diferenciales Ordinarias (EDO)
* **El problema:** Simulación de la tasa de vaciado de reservas de combustible en plantas de abastecimiento bajo pánico social ($y' = \text{entrada} - \text{consumo}$).
* **Algoritmos utilizados:**
  * Método de Euler
  * Método de Heun
  * Runge-Kutta de 4to Orden (RK4)

### Módulo 3: Interpolación Numérica
* **El problema:** Reconstrucción de curvas continuas de precios de alimentos a partir de datos diarios incompletos o dispersos causados por la especulación.
* **Algoritmos utilizados:**
  * Polinomio de Lagrange
  * Diferencias Divididas de Newton
  * Trazadores Cúbicos (Splines) Naturales

### Módulo 4: Integración Numérica
* **El problema:** Medición del impacto económico midiendo el costo acumulado (área bajo la curva) de la canasta básica familiar a lo largo del mes.
* **Algoritmos utilizados:**
  * Regla del Trapecio Múltiple
  * Regla de Simpson 1/3
  * Regla de Simpson 3/8

### Módulo 5: Raíces de Ecuaciones No Lineales
* **El problema:** Identificación de umbrales críticos de "no retorno", como el día en que el costo sobrepasa los ingresos o el punto donde la escasez detona el colapso.
* **Algoritmos utilizados:**
  * Método de Bisección
  * Método de Newton-Raphson
  * Método de la Secante

---

## 🛠 Tecnologías Utilizadas

* **Estructura y Lógica:** `HTML5`, `Vanilla JavaScript (ES6)`
* **Estilizado:** `CSS3` nativo (con uso de variables CSS para el diseño *Girl Boss* y efectos glassmorphism), `Bootstrap 5` (exclusivamente para sistema de grillas).
* **Visualización de Datos:** `Chart.js` para los gráficos comparativos e interpolaciones.
* **Notación Matemática:** `MathJax` para renderizado de fórmulas algebraicas en la web.

---

## 👤 Autora

Desarrollado por **Daphne Megan Cuevas Alconini**.
*Proyecto Académico - 2026*
