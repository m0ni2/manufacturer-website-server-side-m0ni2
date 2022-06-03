const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
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


const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized Access' });
    }

    const accessToken = authHeader.split(' ')[1];
    jwt.verify(accessToken, process.env.PRIVATE_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' });
        }
        req.decoded = decoded;
        next();
    });

};

const run = async () => {
    try {
        await client.connect();
        const productCollection = client.db("mrTools").collection("product");
        const reviewsCollection = client.db("mrTools").collection("reviews");
        const ordersCollection = client.db("mrTools").collection("orders");
        const usersCollection = client.db("mrTools").collection("users");

        // generate token
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const accessToken = jwt.sign(user, process.env.PRIVATE_KEY, {
                expiresIn: '1d'
            });
            res.send({ accessToken })
            console.log('accessToken send')
        });

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
            const product = await productCollection.findOne(query);
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
            const newReview = req.body;
            const result = await reviewsCollection.insertOne(newReview);
            res.send(result);
            console.log('review added')
        });


        app.post('/order', async (req, res) => {
            const newOrder = req.body;
            const result = await ordersCollection.insertOne(newOrder);
            res.send(result);
            console.log('order added')
        });

        app.get('/order/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const cursor = ordersCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
            console.log('orders send')
        });

        // app.delete('/order/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) };
        //     const result = await ordersCollection.deleteOne(query);
        //     req.send(result)
        //     console.log('data deleted')
        // })



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