require('dotenv').config();
const express = require('express');
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

// Verificación inicial de conexión a la base de datos
(async () => {
  try {
    const connection = await db.getConnection();
    console.log('Conectado exitosamente a la base de datos MySQL');
    connection.release();
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error.message);
  }
})();

// Ruta base
app.get('/', (req, res) => {
  res.send('Servidor API REST con base de datos en línea.');
});

// 1. GET /api/productos - Obtener todos los registros desde la BD
app.get('/api/productos', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM productos');
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', error: error.message });
  }
});

// 2. GET /api/productos/:id - Obtener un registro por ID
app.get('/api/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM productos WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: 'Recurso no encontrado' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', error: error.message });
  }
});

// 3. POST /api/productos - Insertar un nuevo producto en la BD
app.post('/api/productos', async (req, res) => {
  try {
    const { nombre, precio } = req.body;

    if (!nombre || precio === undefined) {
      return res.status(400).json({ mensaje: 'Faltan campos obligatorios (nombre, precio)' });
    }

    const [result] = await db.query(
      'INSERT INTO productos (nombre, precio) VALUES (?, ?)',
      [nombre, precio]
    );

    res.status(201).json({
      id: result.insertId,
      nombre,
      precio
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', error: error.message });
  }
});

// 4. PUT /api/productos/:id - Actualizar un producto en la BD
app.put('/api/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, precio } = req.body;

    const [result] = await db.query(
      'UPDATE productos SET nombre = ?, precio = ? WHERE id = ?',
      [nombre, precio, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Recurso no encontrado para actualizar' });
    }

    res.status(200).json({
      id: parseInt(id),
      nombre,
      precio
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', error: error.message });
  }
});

// 5. DELETE /api/productos/:id - Eliminar un producto de la BD
app.delete('/api/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM productos WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Recurso no encontrado para eliminar' });
    }

    res.status(200).json({ mensaje: 'Recurso eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});