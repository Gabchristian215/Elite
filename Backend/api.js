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
    console.log(`Full API response:`, data);
const item = data?.data ?? [];
console.log(`getSealed returned ${item.length} items`);
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
    return [];
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
    const apiIds = items.map(item => String(item.tcgPlayerId)).slice(0, 20).join(", ");
    console.log(`Fresh API item not found. DB tcgPlayerId=${targetId}; API tcgPlayerIds(sample)=[${apiIds}]`);
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

const botToken = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CHANNEL_ID = '1486736736162680934';
const clients = new Client({ intents: [GatewayIntentBits.Guilds] })
await clients.login(botToken);
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
    const apiIds = items.map(item => String(item.tcgPlayerId)).slice(0, 20).join(", ");
    console.log(`Fresh API item not found. DB tcgPlayerId=${targetId}; API tcgPlayerIds(sample)=[${apiIds}]`);
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

async function run(set, limit = "5") {
  const items = await getSealed(set, limit);
  const fetchedSetNames = [...new Set(items.map(item => item.setName).filter(Boolean))];

  if (fetchedSetNames.length === 0) {
    console.log(`No set names found from API for set=${set}`);
    return;
  }

  const savedProducts = await collection.find({ setName: { $in: fetchedSetNames } }).toArray();

  for (const savedProduct of savedProducts) {
    await comparePrices(savedProduct.tcgPlayerId, items);
    await getAlert(savedProduct.tcgPlayerId, items);
  }
}

async function start() {
  await client.connect();
  console.log("Mongo connected");

  app.listen(port, () => {
    console.log(`Server running on ${port}` )
  });


run("151", "5");
}
start().catch(error => {
  console.error("Startup failed:", error);
  process.exit(1);
});