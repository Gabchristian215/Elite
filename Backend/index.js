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

/// script test 

async function getSealed(set = 'scarlet', limit = 1) {
  try{
  const response = await fetch(`https://www.pokemonpricetracker.com/api/v2/sealed-products?language=english&set=${set}&limit=${limit}`,{
    headers: {
      Authorization: `Bearer ${process.env.Poke_API}`
    }
})
const data = await response.json();
return data;
  }catch (error){
    console.log("couldnt catch api key", error.message);
  }
}
  const result = await getSealed();
   const items = result?.data ?? [];


  const filtered = items.map(item =>({
    name: item.name,
  setName: item.setName,
  price: item.unopenedPrice,
  image: item.imageCdnUrl200,
  url: item.tcgPlayerUrl,
  tcgPlayerId: item.tcgPlayerId,
  id: item.id
}));

async function saveData() {
  try {
    await client.connect();
    await collection.insertMany(filtered);
    console.log("DATA SAVED!!")
  } catch(error){
    console.error(error);
  } finally{
    await client.close();
  }
}

async function comparePrices(){
  await client.connect();
  const targetId = "478275";
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
  const newPrice = freshItem.unopenedPrice;

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


async function run(){
console.log(filtered);
await saveData();
await comparePrices();
await client.close()
}
run();
/*cron.schedule('0 2 * * * *', () =>{
run();
});
*/