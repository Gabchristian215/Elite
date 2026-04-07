import 'dotenv/config';
import express from "express";
import cron from 'node-cron';
import {MongoClient} from "mongodb";
import {Client, GatewayIntentBits} from 'discord.js'

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

async function comparePrices(targetId, items){
  const oldItem = await collection.findOne({ tcgPlayerId: targetId });

  if (!oldItem) {
    console.log("Item not found in DB");
    return;
  }

  const freshItem = items.find(
    item => String(item.tcgPlayerId) === String(targetId)
  );

  if (!freshItem) {
    console.log("Fresh API item not found");
    return;
  }

  const oldPrice = oldItem.price;
  const newPrice = freshItem.unopenedPrice ?? freshItem.price;

  if (oldPrice < newPrice) {
    console.log(`${freshItem.name} increased`);
  } else if (oldPrice > newPrice) {
    console.log(`${freshItem.name} decreased`);
  } else {
    console.log('price is the same');
  }

  if (oldPrice !== newPrice) {
    await collection.updateOne(
      { tcgPlayerId: String(targetId) },
      { $set: { price: newPrice } }
    );
  }
}

const DISCORD_BOT_TOKEN = 'MTQ4NjczNTI4ODE1MDUyNDAwOA.GYjJtn.ijW6BvXuFZvqHt61vWdH-ub3-UJHPPJMcwgNQQ';
const DISCORD_CHANNEL_ID = '1486736736162680934';
const clients = new Client({ intents: [GatewayIntentBits.Guilds] })
await clients.login(DISCORD_BOT_TOKEN);
const channel = await clients.channels.fetch(DISCORD_CHANNEL_ID);

async function getAlert(targetId, items) {
  const oldItem = await collection.findOne({ tcgPlayerId: targetId });
   if (!oldItem) {
    console.log("Item not found in DB");
    return;
  }
   const freshItem = items.find(
    item => String(item.tcgPlayerId) === String(targetId));
    if (!freshItem) {
    console.log("Fresh API item not found");
    return;
  }
  const oldPrice = oldItem.price;
  const newPrice = freshItem.unopenedPrice ?? freshItem.price;
if (oldPrice !== newPrice) {
    console.log('about to send message...')
await channel.send(`ETB is now ${newPrice}`);
console.log('discord message was sent')
}
}
await getAlert(targetId, items);
await clients.destroy();

 
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

async function run() {
   await getSealed(set, limit);
   await comparePrices();
}

run();

/*cron.schedule('0 0 2 * * *', () =>{
run();
}); */