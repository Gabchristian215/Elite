import 'dotenv/config';
import cron from 'node-cron';
import { MongoClient } from "mongodb";
import { Client, Intents } from "discord.js";
import { getSealed } from "./controllers/appController.js";

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const db = client.db("elite")
const collection = db.collection("products")

let channel;

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


async function run(limit = "5") {
  const userSetSlugs = await collection.distinct("setSlug", {
    setSlug: { $exists: true, $ne: "" }
  });

  if (!userSetSlugs.length) {
    console.log("No user set slugs found. Save products first.");
    return;
  }

  for (const setSlug of userSetSlugs) {
    const items = await getSealed(setSlug, limit);
    const savedProducts = await collection.find({ setSlug }).toArray();

    for (const savedProduct of savedProducts) {
      await comparePrices(savedProduct.tcgPlayerId, items);
      await getAlert(savedProduct.tcgPlayerId, items);
    }
  }
}

export async function startServices() {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const DISCORD_CHANNEL_ID = '1486736736162680934';
  const discordClient = new Client({ intents: [Intents.FLAGS.GUILDS] });
  await discordClient.login(botToken);
  channel = await discordClient.channels.fetch(DISCORD_CHANNEL_ID);

  await client.connect();
  console.log("Mongo connected");

  await run("5");

  cron.schedule("0 0 * * *", async () => {
    try {
      await run("5");
    } catch (error) {
      console.error("Daily run failed:", error);
    }
  });
}
