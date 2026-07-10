import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    setName: String,
    setSlug: {
      type: String,
      index: true
    },
    price: {
      type: Number,
      required: true
    },
    image: String,
    url: String,
    tcgPlayerId: {
      type: String,
      required: true,
      index: true
    },
    id: String
  },
  {
    timestamps: true
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
