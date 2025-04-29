"use client";
import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { format, parse, isValid } from "date-fns";
import { importSalesData } from "@/app/dashboard/sales/actions";
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import SalesDashboard from "./SalesDashboard";

interface SalesDataItem {
  productName: string;
  quantitySold: number;
  revenue: number;
  date: Date | null;
  rawData?: Record<string, any>; // Store the original row data
}

interface ColumnMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  headers: string[];
  onConfirm: (mapping: {
    productColumn: string;
    quantityColumn: string | null;
    priceColumn: string;
    dateColumn: string;
    dateFormat: string;
  }) => void;
  isLoading: boolean;
}

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SalesDashboardProps {
  salesData: SalesDataItem[];
}

const commonDateFormats = [
  { label: "MM/DD/YYYY", value: "MM/dd/yyyy" },
  { label: "DD/MM/YYYY", value: "dd/MM/yyyy" },
  { label: "DD-MM-YYYY", value: "dd-MM-yyyy" },
  { label: "YYYY-MM-DD", value: "yyyy-MM-dd" },
  { label: "YYYY/MM/DD", value: "yyyy/MM/dd" },
  { label: "MMM DD, YYYY", value: "MMM dd, yyyy" },
];

// Custom Loader Component
const CircularLoader = () => (
  <div className="flex flex-col items-center justify-center p-6">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent border-blue-400"></div>
    <p className="mt-4 text-white text-lg">Thanks for your patience</p>
  </div>
);

const ColumnMappingModal: React.FC<ColumnMappingModalProps> = ({
  isOpen,
  onClose,
  headers,
  onConfirm,
  isLoading
}) => {
  const [productColumn, setProductColumn] = useState("");
  const [quantityColumn, setQuantityColumn] = useState<string | null>("");
  const [priceColumn, setPriceColumn] = useState("");
  const [dateColumn, setDateColumn] = useState("");
  const [dateFormat, setDateFormat] = useState(commonDateFormats[0].value);
  const [error, setError] = useState<string | null>(null);
  const [useQuantity, setUseQuantity] = useState(true);

  useEffect(() => {
    // Auto-detect columns based on common naming patterns
    if (headers.length > 0) {
      // Try to find product name column
      const productMatch = headers.find(h => 
        /product|item|name|description/i.test(h)
      );
      if (productMatch) setProductColumn(productMatch);

      // Try to find quantity column
      const quantityMatch = headers.find(h => 
        /quantity|qty|amount|count|units/i.test(h)
      );
      if (quantityMatch) setQuantityColumn(quantityMatch);

      // Try to find price/revenue column
      const priceMatch = headers.find(h => 
        /price|revenue|sales|amount|total/i.test(h)
      );
      if (priceMatch) setPriceColumn(priceMatch);

      // Try to find date column
      const dateMatch = headers.find(h => 
        /date|time|timestamp|sold|purchase/i.test(h)
      );
      if (dateMatch) setDateColumn(dateMatch);
    }
  }, [headers]);

  const handleConfirm = () => {
    if (!productColumn) {
      setError("Please select a product name column");
      return;
    }
    
    if (!priceColumn) {
      setError("Please select a price column");
      return;
    }
    
    if (!dateColumn) {
      setError("Please select a date column");
      return;
    }

    onConfirm({
      productColumn,
      quantityColumn: useQuantity ? quantityColumn : null,
      priceColumn,
      dateColumn,
      dateFormat,
    });
  };

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div style={{ background: '#6367B4', borderRadius: '12px' }} className="p-6 w-11/12 max-w-md flex flex-col items-center">
          <CircularLoader />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div style={{ background: '#6367B4', borderRadius: '12px' }} className="p-6 w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 style={{ color: 'white', fontSize: '24px', fontFamily: 'Poppins', fontWeight: '700' }}>Map Excel Columns</h2>
            <p style={{ color: 'white', fontSize: '16px', fontFamily: 'Poppins', fontWeight: '500' }}>
              Choose which columns to import
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{error}</p>
          </div>
        )}

        <div style={{ background: '#5C60AE', borderRadius: '12px' }} className="p-4 space-y-4">
          <div>
            <label className="block text-white text-sm font-medium mb-1">
              Product Name Column <span className="text-red-300">*</span>
            </label>
            <p className="text-xs text-gray-200 mb-1">Select the column containing product names</p>
            <select 
              value={productColumn}
              onChange={e => setProductColumn(e.target.value)}
              className="w-full p-2 border rounded bg-gray-100 text-black"
            >
              <option value="">Select Column</option>
              {headers.map((header, idx) => (
                <option key={idx} value={header}>{header}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-start mb-1">
            <input
              type="checkbox"
              id="useQuantityCheckbox"
              checked={useQuantity}
              onChange={() => setUseQuantity(!useQuantity)}
              className="mt-1 mr-2"
            />
            <label htmlFor="useQuantityCheckbox" className="text-white text-sm font-medium">
              Specify quantity column (if unchecked, each record will count as 1 item)
            </label>
          </div>
          
          {useQuantity && (
            <div>
              <label className="block text-white text-sm font-medium mb-1">
                Quantity Sold Column
              </label>
              <p className="text-xs text-gray-200 mb-1">Select the column containing quantity sold</p>
              <select 
                value={quantityColumn || ""}
                onChange={e => setQuantityColumn(e.target.value)}
                className="w-full p-2 border rounded bg-gray-100 text-black"
              >
                <option value="">Select Column</option>
                {headers.map((header, idx) => (
                  <option key={idx} value={header}>{header}</option>
                ))}
              </select>
            </div>
          )}
          
          <div>
            <label className="block text-white text-sm font-medium mb-1">
              Price/Revenue Column <span className="text-red-300">*</span>
            </label>
            <p className="text-xs text-gray-200 mb-1">Select the column containing price or revenue</p>
            <select 
              value={priceColumn}
              onChange={e => setPriceColumn(e.target.value)}
              className="w-full p-2 border rounded bg-gray-100 text-black"
            >
              <option value="">Select Column</option>
              {headers.map((header, idx) => (
                <option key={idx} value={header}>{header}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-white text-sm font-medium mb-1">
              Sale Date Column <span className="text-red-300">*</span>
            </label>
            <p className="text-xs text-gray-200 mb-1">Select the column containing sale date/timestamp</p>
            <select 
              value={dateColumn}
              onChange={e => setDateColumn(e.target.value)}
              className="w-full p-2 border rounded bg-gray-100 text-black"
            >
              <option value="">Select Column</option>
              {headers.map((header, idx) => (
                <option key={idx} value={header}>{header}</option>
              ))}
            </select>
          </div>
          
          {dateColumn && (
            <div>
              <label className="block text-white text-sm font-medium mb-1">
                Date Format
              </label>
              <p className="text-xs text-gray-200 mb-1">Select the format of your dates</p>
              <select 
                value={dateFormat}
                onChange={e => setDateFormat(e.target.value)}
                className="w-full p-2 border rounded bg-gray-100 text-black"
              >
                {commonDateFormats.map((format, idx) => (
                  <option key={idx} value={format.value}>{format.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-center space-x-4">
          <button 
            onClick={onClose}
            style={{ 
              borderRadius: '12px', 
              border: '3px #D5BBFF solid',
              padding: '8px 24px',
              width: '120px'
            }}
            className="text-white hover:opacity-90"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            style={{ 
              background: '#D5BBFF',
              borderRadius: '12px',
              padding: '8px 24px',
              width: '120px'
            }}
            className="text-black font-medium hover:opacity-90"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// Export data modal
const ExportDataModal: React.FC<ExportDataModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div style={{ background: '#6367B4', borderRadius: 12 }} className="p-6 w-11/12 max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 style={{ color: 'white', fontSize: 24, fontFamily: 'Poppins', fontWeight: '700' }}>Export Data</h2>
          <button onClick={onClose} className="text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <p style={{ color: 'white', fontSize: 16, fontFamily: 'Poppins', fontWeight: '500' }}>
          Choose which data to export
        </p>
        
        <div style={{ background: '#5C60AE', borderRadius: 12 }} className="p-4 mb-6">
          <div className="mb-3">
            <label className="flex items-center space-x-2 text-white">
              <input type="checkbox" className="w-5 h-5" />
              <span>Sales Data</span>
            </label>
          </div>
          
          <div className="mb-3">
            <label className="flex items-center space-x-2 text-white">
              <input type="checkbox" className="w-5 h-5" />
              <span>Reviews Data</span>
            </label>
          </div>
          
          <div>
            <label className="flex items-center space-x-2 text-white">
              <input type="checkbox" className="w-5 h-5" />
              <span>Recommendations</span>
            </label>
          </div>
        </div>
        
        <div className="flex justify-center space-x-4">
          <button 
            onClick={onClose}
            style={{ 
              borderRadius: '12px', 
              border: '3px #D5BBFF solid',
              padding: '8px 24px',
              width: '120px'
            }}
            className="text-white hover:opacity-90"
          >
            Cancel
          </button>
          <button 
            style={{ 
              background: '#D5BBFF',
              borderRadius: '12px',
              padding: '8px 24px',
              width: '120px'
            }}
            className="text-black font-medium hover:opacity-90"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
};

const ExcelUploader: React.FC = () => {
  // File and parsing state
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [showInitialLoader, setShowInitialLoader] = useState(false);
  
  // Results state
  const [salesData, setSalesData] = useState<SalesDataItem[]>([]);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  useEffect(() => {
    setError(null);
  }, [file]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Reset states
    setHeaders([]);
    setRawData([]);
    setSalesData([]);
    setProcessingComplete(false);
    setError(null);
    setFile(selectedFile);
    setSubmitStatus("idle");
    setShowInitialLoader(true); // Show fullscreen loader when file is selected

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        
        if (workbook.SheetNames.length === 0) {
          throw new Error("No sheets found in the workbook");
        }

        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (jsonData.length === 0) {
          throw new Error("No data found in the sheet");
        }

        if (jsonData.length > 0) {
          setHeaders(jsonData[0] as string[]);
          
          // Get the data without the header row
          const dataWithoutHeaders = XLSX.utils.sheet_to_json(sheet);
          setRawData(dataWithoutHeaders);
          
          // Open the modal for column mapping
          setIsModalOpen(true);
        }
      } catch (err) {
        setError(`Error parsing Excel file: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setShowInitialLoader(false);
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setError("Error reading the file");
      setShowInitialLoader(false);
      setIsLoading(false);
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  const handleColumnMappingConfirm = async (mapping: {
    productColumn: string;
    quantityColumn: string | null;
    priceColumn: string;
    dateColumn: string;
    dateFormat: string;
  }) => {
    setIsLoading(true); // Show loader when processing starts
    
    try {
      // Process data with the selected column mapping
      const processedData: SalesDataItem[] = rawData.map((row: any) => {
        let saleDate: Date | null = null;
        
        if (mapping.dateColumn && row[mapping.dateColumn] !== undefined) {
          try {
            // Handle Excel date numbers
            if (typeof row[mapping.dateColumn] === 'number') {
              const excelDate = XLSX.SSF.parse_date_code(row[mapping.dateColumn]);
              saleDate = new Date(excelDate.y, excelDate.m - 1, excelDate.d);
            } else {
              const rawDate = String(row[mapping.dateColumn]).trim();
              const parsedDate = parse(rawDate, mapping.dateFormat, new Date());
              saleDate = isValid(parsedDate) ? parsedDate : null;
            }
                
          } catch (e) {
            console.warn("Date parsing failed:", e);
          }
        }

        // Default quantity to 1 if not specified or column not provided
        const quantity = mapping.quantityColumn && row[mapping.quantityColumn] !== undefined
          ? Number(row[mapping.quantityColumn]) || 1
          : 1;

        // Format the data according to our model requirements
        return {
          productName: String(row[mapping.productColumn] || "Unknown"),
          quantitySold: quantity,  // Default to 1 if not provided
          revenue: Number(row[mapping.priceColumn]) || 0,
          date: saleDate,
        };
      });

      // Filter out invalid entries (no product name or zero revenue)
      const validData = processedData.filter(item => 
        item.productName && 
        item.productName !== "Unknown" && 
        item.revenue >= 0 && 
        item.date !== null
      );
      
      if (validData.length === 0) {
        throw new Error("No valid sales data could be extracted from the file");
      }
      
      setSalesData(validData);
      
      // Send data to the server action
      setSubmitStatus("submitting");
      const result = await importSalesData(validData);
      
      if (result.success) {
        setSubmitStatus("success");
      } else {
        setSubmitStatus("error");
        setError(result.error || "Unknown error occurred while saving data");
      }
      
      setProcessingComplete(true);
    } catch (err) {
      setError(`Error processing data: ${err instanceof Error ? err.message : String(err)}`);
      setSubmitStatus("error");
    } finally {
      setIsLoading(false);
      setIsModalOpen(false); // Close the modal when processing is complete
    }
  };

  const handleReset = () => {
    setFile(null);
    setHeaders([]);
    setRawData([]);
    setSalesData([]);
    setProcessingComplete(false);
    setError(null);
    setSubmitStatus("idle");
  };

  return (
    <div className="p-4 max-w-4xl">      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {/* Show loading overlay when file is initially being processed */}
      {showInitialLoader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div style={{ background: '#6367B4', borderRadius: '12px' }} className="p-6 w-11/12 max-w-md flex flex-col items-center">
            <CircularLoader />
          </div>
        </div>
      )}
      
      {/* File Upload */}
      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <label
            htmlFor="excel-upload"
            className="cursor-pointer px-4 py-2 text-black rounded hover:opacity-90 flex items-center justify-center"
            style={{
              background: "#D5BBFF",
              borderRadius: 7,
            }}
          >
            {/* Icon on the left */}
            <ArrowDownTrayIcon className="w-5 h-5 text-black mr-2" />

            {/* Text label */}
            <span className="font-medium">
              Import Sales Data
            </span>
          </label>

          {/* Hidden file input */}
          <input
            id="excel-upload"
            type="file"
            accept=".xls,.xlsx"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isLoading}
          />

          {/* Filename shown after selection */}
          {file && <span className="text-sm text-gray-600">{file.name}</span>}
        </div>
      </div>

      {/* Column Mapping Modal with loading state */}
      <ColumnMappingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        headers={headers}
        onConfirm={handleColumnMappingConfirm}
        isLoading={isLoading}
      />

      {/* Export Data Modal */}
      <ExportDataModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
      />

      {/* Results */}
      {processingComplete && salesData.length > 0 && (
        <div className="mb-6">
          {/* Removed "Import Complete" and success message */}
          
          {submitStatus === "error" && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              <p>Error saving data to database. Please try again.</p>
            </div>
          )}

          {/* Show the actual dashboard */}
          <SalesDashboard salesData={salesData} />
          
          <div className="mt-4 flex space-x-4">
            
            <button 
              onClick={() => setIsExportModalOpen(true)}
              style={{ background: '#D5BBFF' }}
              className="px-4 py-2 text-black rounded hover:opacity-90"
            >
              Export Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelUploader;