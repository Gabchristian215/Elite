import 'dotenv/config';
import cron from 'node-cron';
import { Client, Intents } from "discord.js";
import { getSealed } from "../controllers/appController.js";
import Product from "../models/productSchema.js";

let channel;
async function checkPriceAndAlert(savedProduct, items){
  const targetId = savedProduct.tcgPlayerId;
  const oldItem = await Product.findOne({ tcgPlayerId: String(targetId) });

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
    console.log('about to send message...')
    if (channel) {
      await channel.send(`${freshItem.name} is now ${newPrice}`);
      console.log('discord message was sent')
    }
    await Product.updateMany(
      { tcgPlayerId: String(targetId) },
      { $set: { price: newPrice } }
    );
  }
}

async function run(limit = "5") {
  const userSetSlugs = await Product.distinct("setSlug", {
    setSlug: { $exists: true, $ne: "" }
  });

  if (!userSetSlugs.length) {
    console.log("No user set slugs found. Save products first.");
    return;
  }

  const processedTcgPlayerIds = new Set();

  for (const setSlug of userSetSlugs) {
    const items = await getSealed(setSlug, limit);
    const savedProducts = await Product.find({ setSlug }).lean();
    const uniqueSavedProducts = [
      ...new Map(savedProducts.map(item => [String(item.tcgPlayerId), item])).values()
    ];

    for (const savedProduct of uniqueSavedProducts) {
      const tcgPlayerId = String(savedProduct.tcgPlayerId);
      if (processedTcgPlayerIds.has(tcgPlayerId)) {
        continue;
      }
      processedTcgPlayerIds.add(tcgPlayerId);
      await checkPriceAndAlert(savedProduct, items);
    }
  }
}

export async function startServices() {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const DISCORD_CHANNEL_ID = '1486736736162680934';
  const discordClient = new Client({ intents: [Intents.FLAGS.GUILDS] });
  await discordClient.login(botToken);
  channel = await discordClient.channels.fetch(DISCORD_CHANNEL_ID);

  await run("5");

  cron.schedule("0 0 * * *", async () => {
    try {
      await run("5");
    } catch (error) {
      console.error("Daily run failed:", error);
    }
  });
}
