const mysql = require('mysql2');
const express = require('express');
const app = express();
const port = process.env.PORT || 3030;
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const saltRounds = 10;
const http = require('http');


const hostname = '192.168.137.1';


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const cors = require('cors');
app.use(cors("*"));

const db_config = {
  host: 'containers-us-west-40.railway.app',
  user: 'root',
  password: 'SQbM7zf7jcN2HtHpIWUy',
  database: 'railway',
  port: 6325,
};


// Definir un endpoint
app.get('/api/hello', (req, res) => {
  res.json({ message: '¡Hola, mundo!' });
});

// Deifinir endpoint para obtener las ideas desde la base de datos
app.get('/api/ideas', (req, res) => {
    const connection = mysql.createConnection(db_config);

    connection.query('SELECT * FROM railway.Ideas', (err, results) => {
        if (err) {
        res.status(500).json({ message: 'Error al obtener las ideas' });
        } else {
        res.json(results);
        }
    });

    connection.end();
});

//definir endpoint para obtener las ideas por id
app.get('/api/ideas/:id', (req, res) => {
    const connection = mysql.createConnection(db_config);

    connection.query('SELECT * FROM railway.Ideas WHERE IdeaID = ?', [req.params.id], (err, results) => {
        if (err) {
        res.status(500).json({ message: 'Error al obtener las ideas' });
        } else {
        res.json(results);
        }
    });

    connection.end();
});

// Iniciar el servidor
app.listen(port, hostname,() => {
  console.log(`Servidor Express escuchando en el puerto ${hostname}:${port}`);
});
