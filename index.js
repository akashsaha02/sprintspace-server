const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

dotenv.config();

const app = express();

// middlewares
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

//verify jwt token
const verifyToken = (req, res, next) => {
    const token = req?.cookies?.token;
    if (!token) {
        return res.status(403).send("A token is required for authentication");
    }
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;
        // console.log("decoded", decoded);
    } catch (err) {
        return res.status(401).send("Invalid Token");
    }
    return next();
};


const PORT = 3000 || process.env.PORT;


// MongoDB Database Connection

const uri = process.env.MONGODB_URI;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
async function run() {
    try {
        // await client.connect();
        console.log("Connected to the server");
        const database = client.db("speintSpace");
        const eventsCollection = database.collection("events");
        const registrationCollection = database.collection("registrations");

        // jwt

        app.post('/jwt', (req, res) => {
            const { user } = req.body;
            const token = jwt.sign({ user }, process.env.JWT_SECRET, { expiresIn: '5h' });
            res.cookie('token', token, { httpOnly: true, secure: false }).send({ Success: 'Token sent' });
        });

        app.post('/logout', (req, res) => {
            res.clearCookie('token', {
                httpOnly: true,
                secure: false
            }).send({ Success: 'Logged out' });
        });


        // Events operation

        app.get('/events', async (req, res) => {
            const events = await eventsCollection.find().toArray();
            res.send(events);
        });

        app.get('/events/details/:id', verifyToken, async (req, res) => {

            if (req.user.email !== req.query.email) {
                return res.status(403).send("Not authorized");
            }
            const id = req.params.id;
            if (!ObjectId.isValid(id)) {
                return res.status(400).send('Invalid event ID');
            }
            const event = await eventsCollection.findOne({ _id: new ObjectId(id) });
            res.send(event);
        });

        // app.get('/running', async (req, res) => {
        //     const currentDate = new Date().toISOString().split("T")[0];
        //     const campaignst = await campaignsCollection.find({ deadline: { $gt: currentDate } }).limit(6).toArray();
        //     res.send(campaignst);
        // });

        // app.get('/campaigns/:id/donations', async (req, res) => {
        //     const id = req.params.id;
        //     if (!ObjectId.isValid(id)) {
        //         return res.status(400).send('Invalid campaign ID');
        //     }
        //     const donations = await donatationCollection.find({ campaignId: id }).toArray();
        //     res.send(donations);
        // });



        app.post('/events', verifyToken, async (req, res) => {
            if (req.user.email !== req.query.email) {
                return res.status(403).send("Not authorized");
            }

            const newEvent = req.body;
            // console.log(newCampaign);
            const result = await eventsCollection.insertOne(newEvent);
            res.send(result);
        });

        app.put('/events/:id', verifyToken, async (req, res) => {
            if (req.user.email !== req.query.email) {
                return res.status(403).send("Not authorized");
            }
            const id = req.params.id;
            const updatedEvent = req.body;
            const result = await eventsCollection.updateOne({ _id: new ObjectId(id) }, { $set: updatedEvent });
            res.send(result);
        });

        app.delete('/events/:id', verifyToken, async (req, res) => {
            if (req.user.email !== req.query.email) {
                return res.status(403).send("Not authorized");
            }

            const id = req.params.id;
            const result = await eventsCollection.deleteOne({ _id: new ObjectId(id) });
            res.send(result);
        });

        // Registration Operations

        app.get('/registrations',verifyToken, async (req, res) => {
            const registrations = await registrationCollection.find().toArray();
            res.send(registrations);
        });

        app.get('/registrations/:id',verifyToken, async (req, res) => {
            const id = req.params.id;
            if (!ObjectId.isValid(id)) {
                return res.status(400).send('Invalid registration ID');
            }
            const registration = await registrationCollection.findOne({ _id: new ObjectId(id) });
            res.send(registration);
        });

        app.post('/registrations',verifyToken, async (req, res) => {
            const newRegistration = req.body;
            const result = await registrationCollection.insertOne(newRegistration);
            res.send(result);
        });

        app.put('/registrations/:id',verifyToken, async (req, res) => {
            const id = req.params.id;
            const updatedRegistration = req.body;
            delete updatedRegistration._id; // Ensure _id is not included in the update
            const result = await registrationCollection.updateOne({ _id: new ObjectId(id) }, { $set: updatedRegistration });
            res.send(result);
        });

        app.delete('/registrations/:id',verifyToken, async (req, res) => {
            const id = req.params.id;
            const result = await registrationCollection.deleteOne({ _id: new ObjectId(id) });
            res.send(result);
        });


        // Testing

        app.get('/', (req, res) => {
            res.send('Hello World');
        });

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch (error) {
        console.error(error);
    }
}

run().catch(console.dir);

// UqPicmzp4D60s6k6
// tenet025


