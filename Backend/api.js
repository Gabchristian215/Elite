import 'dotenv/config';
import express from "express";
import cron from 'node-cron';
import {MongoClient} from "mongodb";

const app = express();
const port = 3000;
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const db = client.db("elite") // database name
const collection = db.collection("products") // collection name

app.use(express.json());

async function getSealed(set, limit = "5") {
  try {
    const response = await fetch(
      `https://www.pokemonpricetracker.com/api/v2/sealed-products?language=english&set=${set}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.Poke_API}`,
        },
      }
    );

    const data = await response.json();
const item = data?.data ?? [];
  return item.map(item =>({
    name: item.name,
  setName: item.setName,
  price: item.unopenedPrice,
  image: item.imageCdnUrl200,
  url: item.tcgPlayerUrl,
  tcgPlayerId: item.tcgPlayerId,
  id: item.id
}));
  } catch (error) {
    console.log("couldnt catch api key", error.message);
  }
}


async function saveData(product) {
  try {
   if (!Array.isArray(product) || product.length === 0) return;
    await client.connect();
    await collection.insertMany(product);
    console.log("DATA SAVED!!")
  } catch(error){
    console.error(error);
  } finally{
    await client.close();
  }
}
 
app.get("/getSealed", async (req, res) => {
    try{
    const { set, limit = "5" } = req.query;
     if (!set) {
      return res.status(400).json({ error: "set query param is required" });
    }
    const product = await getSealed(set, limit);
    res.json(product); // sends to frontend
    } catch (error){
        res.status(500).json({error: error.message || "failed to fetch data"});
    }
})

app.post("/saveDb", async (req, res) => {
try{
    const { set, limit = "5" } = req.body ||  {};

    if (!set) {
      return res.status(400).json({ error: "set is required" });
    }
    const product = await getSealed(set, limit);

     if (!Array.isArray(product) || product.length === 0) {
      return res.status(400).json({ error: "No products found to save" });
    }
  await saveData(product);
  res.status(200).json({ message: "saved to Database" }); // sends to frontend
} catch(error){
  res.status(500).json({error: error.message || "cannot save to Database"})
}
})


app.listen(port, () => {
console.log(`Server running on ${port}` )
});

// have data saved to mongo db
// nodemon Backend/api.js
