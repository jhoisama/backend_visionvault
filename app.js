const express = require('express');
const app = express();
const port = process.env.PORT || 3030;
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require("cors");
const MongoClient = require('mongodb').MongoClient;
const punycode = require('punycode');
const Idea = require("./classes/Idea");


const encoded = punycode.encode('xn--jnglmh2h');
console.log(encoded); // Output: jnglmh2h

// Configuración de la base de datos
const mongoURL = 'mongodb+srv://harrisondiaz:aquiles01@cluster0.5y7z6jv.mongodb.net/?retryWrites=true&w=majority';
const databaseName =  'test';
app.use(express.json());

app.use(cors("*"));

//var hostname = '192.168.10.111';

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




app.post('/api/newideas', async (req, res) => {
    try {
        //console.log(req);
        // Connect to the database
        const client = await MongoClient.connect(mongoURL, { retryWrites: true, w: 'majority' });
        const db = client.db(databaseName);
        const ideasCollection = db.collection('Ideas');

        // Check if the IdeaID document exists
        const lastIdea = await ideasCollection.findOne({}, { sort: { IdeaID: -1 } });
        const newIdeaID = lastIdea ? lastIdea.IdeaID + 1 : 1;

        // Create the new idea

        const newIdea = Idea.fromJson(req.body);
        newIdea.IdeaID = newIdeaID;


        // Insert the new idea into the 'Ideas' collection
        const insertResult = await ideasCollection.insertOne(newIdea.toJson());

        // Close the connection
        client.close();

        // Send the response
        if (!insertResult.acknowledged) {
            return res.status(500).json({ message: 'Error creating idea' });
        }

        res.json({ message: 'Idea created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
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


//Endpoint que traiga todos los Throughts de la base de datos segun el email del usuario que se le apsa por parametro con sus Ideas asociadas
app.get('/api/throughts/:userEmail', async (req, res) => {
        const userEmail = req.params.userEmail;

    const client = await MongoClient.connect(mongoURL, { retryWrites: true, w: 'majority'});

    // Obtener el siguiente ID de usuario
    const db = client.db(databaseName);
    const Thought = db.collection('Thoughts');
    const Idea = db.collection('Ideas');

        try {
            // Obtener Thoughts creados por el usuario
            const thoughts = await Thought.find({ UserEmail: userEmail }).toArray();
            //console.log(thoughts);

            // Obtener Ideas creadas por el usuario
            const ideas = await Idea.find({ CreatedBy: userEmail }).toArray();
            //console.log(ideas);
            // Devolver los resultados
            res.json( ideas);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);




// Iniciar el servidor
app.listen(port,() => {
    console.log(`Servidor Express escuchando en el puerto ${port}`);
});
