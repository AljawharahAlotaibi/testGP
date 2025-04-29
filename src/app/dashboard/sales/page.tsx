"use client";
import React from "react";
import ImportButton from "./importButton";

export default function SalesDashboard() {   
  return ( 
    <div className="p-6 text-white"> 
      <h1 className="text-2xl font-bold mb-6">Sales Dashboard</h1>
      <ImportButton />  
    </div> 
  );
}
