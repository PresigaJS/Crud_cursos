const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs'); // Corrección en la importación del módulo fs

const app = express();
const PUERTO = process.env.PORT || 5000;
app.use(express.static('public'));

const whitelist = [`http://localhost:${PUERTO}`];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      console.log('CORS Error: Not allowed by CORS');
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));
app.use(express.static(__dirname)); 

app.use(express.json()); // Middleware para parsear solicitudes JSON

// Ruta para guardar los cursos en un archivo JSON
app.post('/guardar-cursos', (req, res) => {
    const cursos = req.body; // Obtenemos los cursos desde el cuerpo de la solicitud

    // Convertimos los cursos a formato JSON
    const jsonString = JSON.stringify(cursos);

    // Especificamos la ruta del archivo JSON donde se guardarán los cursos
    const archivoJSON = path.join(__dirname, 'cursos.json');

    // Imprimir la ruta del archivo en la consola
    console.log('Ruta del archivo JSON:', archivoJSON);

    // Escribimos los cursos en el archivo JSON
    fs.writeFile(archivoJSON, jsonString, (err) => {
        if (err) {
            console.error('Error al guardar cursos en JSON:', err);
            res.status(500).json({ error: 'Error al guardar cursos en JSON.' });
        } else {
            console.log('Cursos guardados en JSON correctamente:', cursos);
            res.status(200).json({ message: 'Cursos guardados en JSON correctamente.' });
        }
    });
});

app.get('/', cors(corsOptions), (req, res) => {
  res.sendFile(path.join(__dirname, '/html/principal.html'));
});

app.listen(PUERTO, () => {
    console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
});

// Ruta para guardar un nuevo curso en el archivo JSON
app.post('/guardar-nuevo-curso', (req, res) => {
  const nuevoCurso = req.body; // Obtener el nuevo curso desde el cuerpo de la solicitud

  // Especificar la ruta del archivo JSON donde se guardarán los cursos
  const archivoJSON = path.join(__dirname, 'cursos.json');

  // Leer los cursos existentes del archivo JSON
  fs.readFile(archivoJSON, 'utf8', (err, data) => {
      if (err) {
          console.error('Error al leer el archivo JSON:', err);
          res.status(500).json({ error: 'Error al leer el archivo JSON.' });
          return;
      }

      let cursos = [];
      if (data) {
          cursos = JSON.parse(data); // Parsear los cursos existentes del archivo JSON
      }

      // Agregar el nuevo curso a los cursos existentes
      cursos.push(nuevoCurso);

      // Escribir los cursos actualizados en el archivo JSON
      fs.writeFile(archivoJSON, JSON.stringify(cursos), (err) => {
          if (err) {
              console.error('Error al guardar el nuevo curso en JSON:', err);
              res.status(500).json({ error: 'Error al guardar el nuevo curso en JSON.' });
          } else {
              console.log('Nuevo curso guardado en JSON correctamente:', nuevoCurso);
              res.status(200).json({ message: 'Nuevo curso guardado en JSON correctamente.' });
          }
      });
  });
});
