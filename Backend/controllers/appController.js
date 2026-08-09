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

export function normalizeProduct(item, setSlug) {
  const tcgPlayerId = item.tcgPlayerId == null ? undefined : String(item.tcgPlayerId);

  return {
    name: item.name,
    setName: item.setName,
    setSlug,
    price: item.unopenedPrice ?? item.price,
    image: item.imageCdnUrl200 ?? item.image,
    url: item.tcgPlayerUrl ?? item.url,
    tcgPlayerId,
    id: item.id
  };
}

export async function saveData(product) {
  try {
    if (!Array.isArray(product) || product.length === 0) return;
    const uniqueProducts = [
      ...new Map(
        product
          .filter(item => item.tcgPlayerId != null)
          .map(item => [String(item.tcgPlayerId), item])
      ).values()
    ];
    if (uniqueProducts.length === 0) return;
    await Product.bulkWrite(
      uniqueProducts.map(item => ({
        updateOne: {
          filter: { tcgPlayerId: String(item.tcgPlayerId) },
          update: { $set: { ...item, tcgPlayerId: String(item.tcgPlayerId) } },
          upsert: true
        }
      }))
    );
    console.log("DATA SAVED!!");
  } catch (error) {
    console.error(error);
    throw error;
  }
}
