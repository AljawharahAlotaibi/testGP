// app/dashboard/sales/actions.ts
"use server";

import dbConnect from "@/lib/db";
import { SaleModel } from "./sales.model"; // Update with your actual path

interface SalesDataItem {
  productName: string;
  quantitySold: number;
  revenue: number;
  date: Date | null;
}

export async function importSalesData(data: SalesDataItem[]) {
  try {
    await dbConnect(); // Ensure the database connection is established
    
    // Format data to match the model schema
    const formattedData = data.map(item => ({
      productName: item.productName,
      quantitySold: item.quantitySold,
      revenue: item.revenue,
      date: item.date || new Date() // Use current date as fallback
    }));
    
    // Use the SaleModel directly
    await SaleModel.insertMany(formattedData);
    
    return { success: true };
  } catch (error) {
    console.error("Database operation failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}