// URL de la API local
const API_URL = 'http://localhost:3000/api/productos';

// Función asíncrona para consumir los datos de la API
async function cargarDatos() {
  try {
    const respuesta = await fetch(API_URL);
    if (!respuesta.ok) {
      throw new Error(`Error en la petición: ${respuesta.status}`);
    }

    const productos = await respuesta.json();

    // 1. Renderizar los datos en la tabla HTML
    renderizarTabla(productos);

    // 2. Renderizar la gráfica con Chart.js
    renderizarGrafica(productos);

  } catch (error) {
    console.error('Error al obtener datos de la API:', error);
  }
}

// Función para insertar filas en la tabla del DOM
function renderizarTabla(productos) {
  const tbody = document.getElementById('cuerpo-tabla');
  tbody.innerHTML = '';

  productos.forEach(producto => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${producto.id}</td>
      <td>${producto.nombre}</td>
      <td>$${parseFloat(producto.precio).toFixed(2)}</td>
    `;
    tbody.appendChild(fila);
  });
}

// Función para configurar e instanciar la gráfica de Chart.js
function renderizarGrafica(productos) {
  // Extraer etiquetas (nombres) y valores (precios) en arreglos separados
  const nombres = productos.map(p => p.nombre);
  const precios = productos.map(p => parseFloat(p.precio));

  const ctx = document.getElementById('miGrafica').getContext('2d');

  new Chart(ctx, {
    type: 'bar', // Tipo de gráfico: barras
    data: {
      labels: nombres,
      datasets: [{
        label: 'Precio en MXN ($)',
        data: precios,
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Precio ($)'
          }
        }
      }
    }
  });
}

// Ejecutar al cargar el script
cargarDatos();