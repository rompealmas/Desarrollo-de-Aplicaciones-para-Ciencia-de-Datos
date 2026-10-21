require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');

// Librerías para Práctica 4
const multer = require('multer');
const fs = require('fs');
const csv = require('csv-parser');
const { Parser } = require('json2csv');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de Multer para subir archivos a la carpeta 'uploads'
const upload = multer({ dest: 'uploads/' });

// Middlewares
app.use(cors());
app.use(express.json());

// Verificación inicial a BD
(async () => {
  try {
    const connection = await db.getConnection();
    console.log('Conectado exitosamente a la base de datos MySQL');
    connection.release();
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error.message);
  }
})();

// === RUTAS ANTERIORES (Prácticas 2.2 y 2.3) ===
app.get('/', (req, res) => res.send('Servidor API REST en línea.'));


app.get('/api/productos', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM productos');
    res.status(200).json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});


app.get('/api/productos/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM productos WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ mensaje: 'No encontrado' });
    res.status(200).json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});


app.post('/api/productos', async (req, res) => {
  try {
    const { nombre, precio } = req.body;
    const [result] = await db.query('INSERT INTO productos (nombre, precio) VALUES (?, ?)', [nombre, precio]);
    res.status(201).json({ id: result.insertId, nombre, precio });
  } catch (error) { res.status(500).json({ error: error.message }); }
});


app.put('/api/productos/:id', async (req, res) => {
  try {
    
    const { nombre, precio } = req.body;
    const [result] = await db.query('UPDATE productos SET nombre = ?, precio = ? WHERE id = ?', [nombre, precio, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'No encontrado' });
    res.status(200).json({ id: req.params.id, nombre, precio });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/productos/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM productos WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'No encontrado' });
    res.status(200).json({ mensaje: 'Eliminado exitosamente' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// === NUEVAS RUTAS (PRÁCTICA 4 - TEMA 2.5) ===

// IMPORTACIÓN (JSON y CSV)
app.post('/api/productos/importar', upload.single('archivo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ mensaje: 'No se subió ningún archivo' });
    }

    const rutaArchivo = req.file.path;
    const nombreOriginal = req.file.originalname.toLowerCase();

    // PROCESAR JSON
    if (nombreOriginal.endsWith('.json') || req.file.mimetype === 'application/json') {
      const datosCrudos = fs.readFileSync(rutaArchivo, 'utf8');
      const registros = JSON.parse(datosCrudos);
      
      for (const item of registros) {
        await db.query('INSERT INTO productos (nombre, precio) VALUES (?, ?)', [item.nombre, item.precio]);
      }
      
      fs.unlinkSync(rutaArchivo); // Eliminar temporal
      return res.status(200).json({ mensaje: `Importación JSON exitosa. Se insertaron ${registros.length} registros.` });
    }
    
    // PROCESAR CSV
    else if (nombreOriginal.endsWith('.csv') || req.file.mimetype === 'text/csv') {
      const resultados = [];
      fs.createReadStream(rutaArchivo)
        .pipe(csv())
        .on('data', (data) => resultados.push(data))
        .on('end', async () => {
          for (const item of resultados) {
            await db.query('INSERT INTO productos (nombre, precio) VALUES (?, ?)', [item.nombre, item.precio]);
          }
          fs.unlinkSync(rutaArchivo); // Eliminar temporal
          return res.status(200).json({ mensaje: `Importación CSV exitosa. Se insertaron ${resultados.length} registros.` });
        });
    } else {
      fs.unlinkSync(rutaArchivo); // Si es otro formato, eliminar y rechazar
      return res.status(400).json({ mensaje: 'Formato no soportado. Usa .json o .csv' });
    }

  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno en la importación', error: error.message });
  }
});

// EXPORTACIÓN (JSON y CSV)
app.get('/api/productos/exportar/:formato', async (req, res) => {
  try {
    const { formato } = req.params;
    const [registros] = await db.query('SELECT * FROM productos');

    if (formato === 'json') {
      res.setHeader('Content-Disposition', 'attachment; filename=datos_exportados.json');
      res.setHeader('Content-Type', 'application/json');
      return res.send(JSON.stringify(registros, null, 2));
    } 
    else if (formato === 'csv') {
      const conversorCsv = new Parser();
      const csvData = conversorCsv.parse(registros);
      res.setHeader('Content-Disposition', 'attachment; filename=datos_exportados.csv');
      res.setHeader('Content-Type', 'text/csv');
      return res.send(csvData);
    } 
    else {
      return res.status(400).json({ mensaje: 'Formato inválido. Usa /exportar/json o /exportar/csv' });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno en la exportación', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});