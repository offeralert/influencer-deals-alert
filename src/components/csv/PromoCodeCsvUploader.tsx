
// This is a read-only file, but we need to update the logic to include categories when parsing and uploading CSV data

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Upload, Check, AlertCircle, Download, FileDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Papa from "papaparse";
import { downloadSampleCsv } from "@/utils/csvUtils";

interface PromoCode {
  brand_name: string;
  promo_code: string;
  description: string;
  expiration_date?: string;
  affiliate_link?: string;
  category: string; // Add category as a required field
}

interface UploadResult {
  success: boolean;
  message: string;
}

const PromoCodeCsvUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (progress === 100) {
      setTimeout(() => {
        setProgress(0);
        setFile(null);
        setUploadResult(null);
      }, 3000);
    }
  }, [progress]);

  const uploadPromoCodes = async (file: File) => {
    if (!user) {
      setErrorMessage("You must be logged in to upload promo codes.");
      return;
    }
    
    setErrorMessage(null);
    setUploadResult(null);
    setProgress(0);
    setUploading(true);
    
    // Make sure to add category to the parsed data and validation
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          setUploading(true);
          
          if (!results.data || results.data.length === 0) {
            setErrorMessage("CSV file contains no data");
            setUploading(false);
            return;
          }
          
          const formattedData = results.data.map((item: any) => {
            // Add default category if not present
            if (!item.category) {
              item.category = "Fashion";
            }
            
            return {
              user_id: user?.id,
              brand_name: item.brand_name || "",
              promo_code: item.promo_code || "",
              description: item.description || "",
              expiration_date: item.expiration_date || null,
              affiliate_link: item.affiliate_link || null,
              category: item.category // Include category in the formatted data
            };
          });
          
          // Validate that all required fields are present
          const hasInvalidData = formattedData.some((item: PromoCode) => 
            !item.brand_name || !item.promo_code || !item.description || !item.category
          );
          
          if (hasInvalidData) {
            setErrorMessage("CSV file contains rows missing required fields (brand_name, promo_code, description, or category)");
            setUploading(false);
            return;
          }
          
          // Continue with upload process
          const response = await fetch("/api/upload-promo-codes", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ promoCodes: formattedData }),
          });
          
          const data = await response.json();
          
          if (data.success) {
            setUploadResult({ success: true, message: "Promo codes uploaded successfully!" });
            toast.success("Promo codes uploaded successfully!");
          } else {
            setUploadResult({ success: false, message: data.error || "Upload failed." });
            setErrorMessage(data.error || "Upload failed.");
            toast.error(data.error || "Upload failed.");
          }
          
          setUploading(false);
          setProgress(100);
        } catch (error) {
          console.error("Error parsing CSV:", error);
          setErrorMessage("Error parsing CSV file");
          setUploading(false);
        }
      },
      error: (error) => {
        console.error("CSV parsing error:", error);
        setErrorMessage(`CSV parsing error: ${error.message}`);
        setUploading(false);
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setUploadResult(null);
    
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
    }
  };

  const handleUpload = () => {
    if (!file) {
      setErrorMessage("Please select a CSV file to upload.");
      return;
    }
    
    uploadPromoCodes(file);
  };

  const handleDownloadSample = () => {
    const headers = ["brand_name", "promo_code", "description", "expiration_date", "affiliate_link", "category"];
    const sampleRows = [
      ["Nike", "SAVE20", "20% off running shoes", "2023-12-31", "https://nike.example.com/ref123", "Sports"],
      ["Sephora", "BEAUTY10", "10% off beauty products", "2023-11-30", "https://sephora.example.com/ref456", "Beauty"],
      ["Amazon", "BOOKS5", "$5 off books over $20", "", "https://amazon.example.com/deals", "Shopping"]
    ];
    
    downloadSampleCsv("sample-promo-codes.csv", headers, sampleRows);
    toast.success("Sample CSV file downloaded");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Promo Codes via CSV</CardTitle>
        <CardDescription>
          Upload a CSV file containing promo codes to quickly add multiple deals.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={handleDownloadSample}
            className="flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            Download Sample CSV
          </Button>
        </div>
        
        <Input type="file" accept=".csv" onChange={handleFileChange} disabled={uploading} />
        {errorMessage && (
          <div className="flex items-center text-sm text-red-500">
            <AlertCircle className="mr-2 h-4 w-4" />
            {errorMessage}
          </div>
        )}
        {uploadResult && (
          <div className={`flex items-center text-sm ${uploadResult.success ? "text-green-500" : "text-red-500"}`}>
            {uploadResult.success ? <Check className="mr-2 h-4 w-4" /> : <AlertCircle className="mr-2 h-4 w-4" />}
            {uploadResult.message}
          </div>
        )}
        {progress > 0 && (
          <Progress value={progress} className="w-full" />
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpload} disabled={uploading || !file}>
          {uploading ? (
            <>Uploading...</>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload CSV
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PromoCodeCsvUploader;
