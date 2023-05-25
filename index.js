const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rqhkoll.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
});

async function run() {
  try {

    client.connect((error) => {
      if (error) {
          console.error(error);
          return;
      }
  });
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const toysCollection = client.db('toysServer').collection('toys');

    // const indexKeys = {name: 1 };
    // const indexOption = {name: "toyName"};

    // const res = await toysCollection.createIndex(indexKeys , indexOption);

    app.get('/searchbytoyname/:text' , async (req , res) => {
    
      const searchedText = req.params.text;
      const result = await toysCollection.find({name: { $regex: searchedText , $options: "i"}
        }).toArray();
      res.send(result);
    })

    app.get('/alltoys' , async(req , res) => {
      const toys = toysCollection.find();
      const result = await toys.toArray();
      res.send(result);
    })

    app.get('/toyswithlimit' , async(req , res) => {
      const toys = toysCollection.find().limit(20);
      const result = await toys.toArray();
      res.send(result);
    })

    app.get('/toysbycategory/:category' , async(req , res) => {
      const toys = toysCollection.find({category: req.params.category});
      const result = await toys.toArray();
      res.send(result);
    } )

    app.get('/singletoy/:id' , async(req , res) => {
      const id = req.params.id;
      const toy = {_id: new ObjectId(id)};
      const result = await toysCollection.findOne(toy);
      res.send(result);
    })

    app.post('/addtoy' , async(req , res) => {
      const newToy  = req.body;
      console.log(newToy)
      const result = await toysCollection.insertOne(newToy);
      res.send(result);
    })

    app.get('/toysbyemail/:email/:sort' , async(req , res) => {
      let toys 
      if(req.params.sort === "1"){
         toys = toysCollection.find({sellerEmail: req.params.email}).sort({price: 1});
      }
      else{
         toys = toysCollection.find({sellerEmail: req.params.email});
      }
      
      const result = await toys.toArray();
      res.send(result);
    })

    app.put('/toysupdate/:id' , async(req , res) => {
      const id = req.params.id;
      const newToy  = req.body;
      const toy = {_id: new ObjectId(id)};
      const options = {upsert: true};
      const updatedToy = {
        $set: {
          price: newToy.price,
          quantity: newToy.quantity,
          description: newToy.description
        }
      }
      const result = await toysCollection.updateOne(toy , updatedToy , options);
      res.send(result);
    })

    app.delete('/deletetoy/:id' , async(req , res) => {
      const id = req.params.id;
      const toy = {_id: new ObjectId(id)};
      const result = await toysCollection.deleteOne(toy);
      res.send(result);
    })



    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/' , (req , res) => {
    res.send('Toy Market Server is running')
})

app.listen(port , () => {
    console.log(`Toy Market Server is running on port: ${port}`);
})