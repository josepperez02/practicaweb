const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const path = require('path');
 
const app = express();
const port = 3000;
 
// Middleware para parsear el cuerpo de las solicitudes
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
 
// Configuración de la conexión a la base de datos
const connection = mysql.createConnection({
    host: '172.30.30.35',
    user: 'root',
    password: 'root',
    database: 'NEXASCORE'
});
 
connection.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err.stack);
        return;
    }
    console.log('Conectado a la base de datos con el ID:', connection.threadId);
});
 
// Servir archivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));
 
// Ruta para registrar un estudiante
app.post('/registrarEstudiante', (req, res) => {
    const { identificacion, nombre, correo, telefono, contrasena } = req.body;
 
    // Encriptar la contraseña
    bcrypt.hash(contrasena, 10, (err, hash) => {
        if (err) {
            return res.status(500).send('Error al encriptar la contraseña');
        }
 
        const query = 'INSERT INTO Sistemas_3W3 (Identificacion, Nombre_y_Apellidos, Correo_Electronico, Numero_Telefonico, Contrasena) VALUES (?, ?, ?, ?, ?)';
        connection.query(query, [identificacion, nombre, correo, telefono, hash], (err, results) => {
            if (err) {
                return res.status(500).send('Error al registrar el estudiante');
            }
            res.send('Estudiante registrado correctamente');
        });
    });
});
 
// Ruta para iniciar sesión
app.post('/iniciarSesion', (req, res) => {
    const { identificacion, contrasena } = req.body;
 
    const query = 'SELECT * FROM Sistemas_3W3 WHERE Identificacion = ?';
    connection.query(query, [identificacion], (err, results) => {
        if (err) {
            return res.status(500).send('Error al consultar la base de datos');
        }
 
        if (results.length === 0) {
            return res.status(404).send('Usuario no encontrado');
        }
 
        const estudiante = results[0];
 
        // Comparar la contraseña encriptada
        bcrypt.compare(contrasena, estudiante.Contrasena, (err, result) => {
            if (err || !result) {
                return res.status(401).send('Contraseña incorrecta');
            }
 
            // Redirigir a la página de bienvenida con el nombre del estudiante
            res.redirect(`/welcome.html?nombre=${encodeURIComponent(estudiante.Nombre_y_Apellidos)}`);
        });
    });
});
 
// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});