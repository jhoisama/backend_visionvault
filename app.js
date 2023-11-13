const express = require('express');
const app = express();
const port = process.env.PORT || 3030;
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require("cors");
const MongoClient = require('mongodb').MongoClient;
const punycode = require('punycode');

const encoded = punycode.encode('xn--jnglmh2h');
console.log(encoded); // Output: jnglmh2h

// Configuración de la base de datos
const mongoURL = 'mongodb+srv://harrisondiaz:aquiles01@cluster0.5y7z6jv.mongodb.net/?retryWrites=true&w=majority';
const databaseName =  'test';

// Configuración de los middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors("*"));

var hostname = '192.168.10.111';

// Definir un endpoint
app.get('/api/hello', (req, res) => {
    res.json({ message: '¡Hola, mundo!' });
});

// Definir endpoint para obtener las ideas desde la base de datos MongoDB
app.get('/api/ideas', async (req, res) => {
    // Conectarse a la base de datos
    const client = await MongoClient.connect(mongoURL, { retryWrites: true, w: 'majority'});

    // Obtener la colección de ideas
    const db = client.db(databaseName);
    const collection = db.collection('Ideas');

    // Obtener las ideas
    const results = await collection.find().toArray();

    // Cerrar la conexión
    client.close();

    // Enviar la respuesta
    res.json(results);
});

// Definir endpoint para obtener una idea por ID desde la base de datos MongoDB
app.get('/api/ideas/:id', async (req, res) => {
    // Obtener el ID de la idea
    const ideaId = parseInt(req.params.id);

    // Validar el ID
    if (isNaN(ideaId)) {
        return res.status(400).json({ message: 'ID de la idea no válido' });
    }

    // Conectarse a la base de datos
    const client = await MongoClient.connect(mongoURL, { retryWrites: true, w: 'majority'});

    // Obtener la colección de ideas
    const db = client.db(databaseName);
    const collection = db.collection('Ideas');

    // Obtener la idea
    const result = await collection.findOne({ IdeaID: ideaId });

    // Cerrar la conexión
    client.close();

    // Enviar la respuesta
    if (!result) {
        return res.status(404).json({ message: 'Idea no encontrada' });
    } else {
        res.json(result);
    }
});


app.post('/api/ideas', async (req, res) => {
    // Conectarse a la base de datos
    const client = await MongoClient.connect(mongoURL, { retryWrites: true, w: 'majority'});

    // Obtener el siguiente ID de idea
    const db = client.db(databaseName);
    const countersCollection = db.collection('Ideas');

    const counterResult = await countersCollection.findOneAndUpdate(
        { _id: 'IdeaID' },
        { $inc: { value: 1 } },
        { returnOriginal: false }
    );

    if (!counterResult.value) {
        return res.status(500).json({ message: 'Error al generar el ID de la idea' });
    }

    const newIdeaID = counterResult.value.value;

    // Crear la nueva idea
    const newIdea = {
        IdeaID: newIdeaID,
        Title: req.body.Title,
        Description: req.body.Description,
        CreatedBy: req.body.CreatedBy
    };

    const ideasCollection = db.collection('Ideas');
    const insertResult = await ideasCollection.insertOne(newIdea);

    if (!insertResult.acknowledged) {
        return res.status(500).json({ message: 'Error al crear la idea' });
    }

    // Cerrar la conexión
    client.close();

    // Enviar la respuesta
    res.json({ message: 'Idea creada exitosamente' });
});


// definir un end point de tipo post para crear usuarios nuevos en la base de datos
app.post('/api/users', async (req, res) => {
    // Conectarse a la base de datos
    const client = await MongoClient.connect(mongoURL, { retryWrites: true, w: 'majority'});

    // Obtener el siguiente ID de usuario
    const db = client.db(databaseName);
    const countersCollection = db.collection('Users');

    const counterResult = await countersCollection.findOneAndUpdate(
        { _id: 'UserID' },
        { $inc: { value: 1 } },
        { returnOriginal: false }
    );

    if (!counterResult.value) {
        return res.status(500).json({ message: 'Error al generar el ID de usuario' });
    } else {
        const newUserID = counterResult.value.value;

        // Continue with the rest of the code
    }

    if (!counterResult.value) {
        return res.status(500).json({ message: 'Error al generar el ID de usuario' });
    }

    const newUserID = counterResult.value.value;

    // Crear el nuevo usuario
    let userImageURL = null;
    const userImageURLFromRequest = req.body.UserImageURL;

    if (userImageURLFromRequest) {
        userImageURL = userImageURLFromRequest;
    }

    const newUser = {
        UserID: newUserID,
        UserName: req.body.UserName,
        UserLastname: req.body.UserLastname,
        UserEmail: req.body.UserEmail,
        UserPassword: req.body.UserPassword,
        UserImageURL: userImageURL,
    };

    const usersCollection = db.collection('Users');
    const insertResult = await usersCollection.insertOne(newUser);

    if (!insertResult.acknowledged) {
        return res.status(500).json({ message: 'Error al crear el usuario' });
        console.log("Error al crear el usuario");
    }

    // Cerrar la conexión
    client.close();

    // Enviar la respuesta
    res.json({ message: 'Usuario creado exitosamente' });
    console.log("Usuario creado exitosamente");
});



// Iniciar el servidor
app.listen(port, hostname,() => {
    console.log(`Servidor Express escuchando en el puerto ${hostname}:${port}`);
});
