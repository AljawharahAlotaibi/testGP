import mongoose from "mongoose";

const SaleSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    quantitySold: { type: Number, required: true },
    revenue: { type: Number, required: true },
    date: { type: Date, required: true },
});

export const SaleModel = mongoose.models.Sale || mongoose.model("Sale", SaleSchema);

// Defines a Sale schema with fields:

//     productName: Name of the product (e.g., "Latte").
//     quantitySold: Number of units sold.
//     revenue: How much money was made.
//     date: When the sale happened.

// Uses mongoose.model() to create a model that interacts with MongoDB.