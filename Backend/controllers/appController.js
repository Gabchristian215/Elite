import Product from "../models/productSchema.js";

export async function getSealed(set, limit = "5") {
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
    return item.map(item => ({
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

export async function saveData(product) {
  try {
    if (!Array.isArray(product) || product.length === 0) return;
    await Product.insertMany(product);
    console.log("DATA SAVED!!");
  } catch (error) {
    console.error(error);
  }
}
