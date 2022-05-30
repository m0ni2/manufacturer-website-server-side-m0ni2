const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



// mongo

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@mrtools.5n8hr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    try {
        await client.connect();
        const productCollection = client.db("mrTools").collection("product");
        const reviewsCollection = client.db("mrTools").collection("reviews");

        // get all products
        app.get('/product', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
            console.log('products data send')
        });

        // get single product
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.find(query);
            res.send(product);
            console.log('single product data send')
        });

        // get last 3 reviews
        app.get('/reviews', async (req, res) => {
            const query = {};
            const cursor = reviewsCollection.find(query);
            const reviews = await cursor.toArray();
            const lastThreeReviews = reviews.reverse().slice(0, 3);
            res.send(lastThreeReviews);
            console.log('reviews Send')
        });

        // post reviews
        app.post('/reviews', async (req, res) => {
            const query = {};
            const options = { upsert: true };
            const newReview = { $set: req.body };
            const result = await reviewsCollection.updateOne(query, newReview, options);
            res.send(result);
            console.log('review added')
        });

    }
    finally {
        // client.close();
    }
};
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('MrTools Server Is Running');
});

app.listen(port, () => {
    console.log('Listening to port', port);
});