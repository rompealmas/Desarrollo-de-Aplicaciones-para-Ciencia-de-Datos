const express = require('express');
const app = express();
const PORT = 3000;

// Middleware para parsear el cuerpo de peticiones en formato JSON
app.use(express.json());

// Arreglo en memoria simulando la colección de datos
let productos = [
  { id: 1, nombre: 'Laptop Gamer', precio: 15500 },
  { id: 2, nombre: 'Mouse Inalámbrico', precio: 450 },
  { id: 3, nombre: 'Teclado Mecánico', precio: 1200 }
];

// Ruta base (/) de verificación
app.get('/', (req, res) => {
  res.send('Servidor en línea y funcionando correctamente.');
});

// 1. GET /api/productos - Obtener todos los recursos
app.get('/api/productos', (req, res) => {
  res.status(200).json(productos);
});

// 2. GET /api/productos/:id - Obtener un recurso por ID
app.get('/api/productos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const producto = productos.find(p => p.id === id);

  if (!producto) {
    return res.status(404).json({ mensaje: 'Recurso no encontrado' });
  }

  res.status(200).json(producto);
});

// 3. POST /api/productos - Crear un nuevo recurso
app.post('/api/productos', (req, res) => {
  const { nombre, precio } = req.body;

  if (!nombre || precio === undefined) {
    return res.status(400).json({ mensaje: 'Faltan campos obligatorios (nombre, precio)' });
  }

  // Generación de ID dinámico consecutivo
  const nuevoId = productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1;
  const nuevoProducto = { id: nuevoId, nombre, precio };

  productos.push(nuevoProducto);
  res.status(201).json(nuevoProducto);
});

// 4. PUT /api/productos/:id - Actualizar un recurso existente
app.put('/api/productos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = productos.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ mensaje: 'Recurso no encontrado para actualizar' });
  }

  const { nombre, precio } = req.body;
  productos[index] = {
    ...productos[index],
    nombre: nombre !== undefined ? nombre : productos[index].nombre,
    precio: precio !== undefined ? precio : productos[index].precio
  };

  res.status(200).json(productos[index]);
});

// 5. DELETE /api/productos/:id - Eliminar un recurso por ID
app.delete('/api/productos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = productos.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ mensaje: 'Recurso no encontrado para eliminar' });
  }

  const eliminado = productos.splice(index, 1);
  res.status(200).json({
    mensaje: 'Recurso eliminado exitosamente',
    elemento: eliminado[0]
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});