
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { FileText, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CsvUnifiedRow {
  fullName: string;
  socialMediaHandle: string;
  email: string;
  profileImageUrl?: string;
  brandName: string;
  promoCode: string;
  expirationDate?: string;
  affiliateLink?: string;
  description: string;
}

const UnifiedCsvUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CsvUnifiedRow[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csvExample, setCsvExample] = useState<string>(
    "fullName,socialMediaHandle,email,profileImageUrl,brandName,promoCode,expirationDate,affiliateLink,description\nJohn Smith,@johnsmith,john@example.com,https://example.com/john.jpg,Nike,NIKE20,2025-12-31,https://nike.com/ref=john,20% off on all Nike products\nJohn Smith,@johnsmith,john@example.com,https://example.com/john.jpg,Adidas,ADIDAS15,2026-01-15,https://adidas.com/ref=john,15% off on selected items\nJane Doe,@janedoe,jane@example.com,,Puma,PUMA10,2025-10-31,https://puma.com/ref=jane,10% off on all Puma products"
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      
      // Read and parse the CSV file
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === 'string') {
          try {
            const parsedData = parseCSV(text);
            setCsvData(parsedData);
          } catch (err: any) {
            setError(err.message || "Failed to parse CSV file. Please check the format.");
            setCsvData([]);
          }
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const parseCSV = (csvText: string): CsvUnifiedRow[] => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    // Validate required headers
    const requiredHeaders = [
      'fullName', 'socialMediaHandle', 'email', 
      'brandName', 'promoCode', 'description'
    ];
    
    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
    
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
    }
    
    const result: CsvUnifiedRow[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue; // Skip empty lines
      
      const values = lines[i].split(',').map(value => value.trim());
      const row: Record<string, string> = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      result.push({
        fullName: row.fullName,
        socialMediaHandle: row.socialMediaHandle,
        email: row.email,
        profileImageUrl: row.profileImageUrl || undefined,
        brandName: row.brandName,
        promoCode: row.promoCode,
        expirationDate: row.expirationDate || undefined,
        affiliateLink: row.affiliateLink || undefined,
        description: row.description
      });
    }
    
    return result;
  };

  const handleUpload = async () => {
    if (csvData.length === 0) {
      setError("No data to upload");
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Upload both influencers and their promo codes in one operation
      const response = await supabase.functions.invoke('upload-unified-data', {
        body: { data: csvData }
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (response.data?.error) {
        throw new Error(response.data.error);
      }
      
      toast.success(`Successfully uploaded ${csvData.length} entries`);
      
      // Reset the form
      setFile(null);
      setCsvData([]);
      
      // Reset the file input
      const fileInput = document.getElementById('unified-csv-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to upload data");
      toast.error("Failed to upload data");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="unified-csv-upload">Upload CSV File</Label>
          <Input
            id="unified-csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-end">
          <Button
            onClick={handleUpload}
            disabled={csvData.length === 0 || isUploading}
            className="flex items-center gap-2"
          >
            {isUploading ? (
              <>Processing...</>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Upload {csvData.length} Entries</span>
              </>
            )}
          </Button>
        </div>
      </div>
      
      {csvData.length > 0 && (
        <div className="border rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Influencer</TableHead>
                <TableHead>Social Media</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Promo Code</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {csvData.slice(0, 5).map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>{entry.fullName}</TableCell>
                  <TableCell>{entry.socialMediaHandle}</TableCell>
                  <TableCell>{entry.email}</TableCell>
                  <TableCell>{entry.brandName}</TableCell>
                  <TableCell>{entry.promoCode}</TableCell>
                  <TableCell>
                    {entry.expirationDate || <span className="text-gray-400">None</span>}
                  </TableCell>
                  <TableCell className="truncate max-w-[200px]">
                    {entry.description}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {csvData.length > 5 && (
            <div className="p-2 text-center text-sm text-muted-foreground">
              Showing 5 of {csvData.length} records
            </div>
          )}
        </div>
      )}
      
      <div className="mt-8 space-y-4">
        <h3 className="text-lg font-medium">CSV Format Example</h3>
        <Textarea 
          value={csvExample}
          readOnly
          rows={5}
          className="font-mono text-xs bg-muted"
        />
        <p className="text-sm text-muted-foreground">
          Your CSV file should include the columns shown above. The <code>profileImageUrl</code>, <code>expirationDate</code>, and <code>affiliateLink</code> fields are optional.
          Each row represents one influencer + one promo code. If an influencer has multiple promo codes, they'll appear in multiple rows with the same influencer details.
        </p>
      </div>
    </div>
  );
};

export default UnifiedCsvUploader;
