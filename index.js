const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

dotenv.config();

const app = express();

// middlewares
app.use(cors());
app.use(express.json());


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
        // const donatationCollection = database.collection("donations");


        // campaigns operation

        app.get('/events', async (req, res) => {
            const events = await eventsCollection.find().toArray();
            res.send(events);
        });

        app.get('/events/details/:id', async (req, res) => {
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



        app.post('/events', async (req, res) => {
            const newEvent = req.body;
            // console.log(newCampaign);
            const result = await eventsCollection.insertOne(newEvent);
            res.send(result);
        });

        // app.put('/campaigns/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const updatedCampaign = req.body;
        //     const result = await campaignsCollection.updateOne({ _id: new ObjectId(id) }, { $set: updatedCampaign });
        //     res.send(result);
        // });

        // app.delete('/campaigns/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const result = await campaignsCollection.deleteOne({ _id: new ObjectId(id) });
        //     res.send(result);
        // });


        // donation operation

        // app.get('/donations', async (req, res) => {
        //     const donations = await donatationCollection.find().toArray();
        //     res.send(donations);
        // });

        // app.post('/donations', async (req, res) => {
        //     const newDonation = req.body;
        //     // console.log(newDonation);
        //     const result = await donatationCollection.insertOne(newDonation);
        //     res.send(result);
        // });

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


