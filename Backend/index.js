import 'dotenv/config';
import cron from 'node-cron';

async function getSealed(set = 'scarlet', limit = '1') {
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


cron.schedule('* 11,20 * * *', () =>{ 
console.log(filtered);
});


