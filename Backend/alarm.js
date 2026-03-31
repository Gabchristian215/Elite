import {Client, GatewayIntentBits} from 'discord.js'

const DISCORD_BOT_TOKEN = 'MTQ4NjczNTI4ODE1MDUyNDAwOA.GYjJtn.ijW6BvXuFZvqHt61vWdH-ub3-UJHPPJMcwgNQQ';
const DISCORD_CHANNEL_ID = '1486736736162680934';
let price = 78.49;
let newprice = 50;
const client = new Client({ intents: [GatewayIntentBits.Guilds] })
await client.login(DISCORD_BOT_TOKEN);
const channel = await client.channels.fetch(DISCORD_CHANNEL_ID);

async function getAlert() {
if (price !== newprice) {
    console.log('about to send message...')
await channel.send(`ETB is now ${newprice}`);
console.log('discord message was sent')
}
}

getAlert();
client.destroy();
