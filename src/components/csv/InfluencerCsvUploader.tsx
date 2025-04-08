
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Database, FileText, Upload, FileDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { downloadSampleCsv } from "@/utils/csvUtils";

interface CsvInfluencer {
  fullName: string;
  socialMediaHandle: string;
  email: string;
  profileImageUrl?: string;
}

const InfluencerCsvUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CsvInfluencer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csvExample, setCsvExample] = useState<string>(
    "fullName,socialMediaHandle,email,profileImageUrl\nJohn Smith,@johnsmith,john@example.com,https://example.com/john.jpg\nJane Doe,@janedoe,jane@example.com,"
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
          } catch (err) {
            setError("Failed to parse CSV file. Please check the format.");
            setCsvData([]);
          }
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const parseCSV = (csvText: string): CsvInfluencer[] => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    // Validate required headers
    const requiredHeaders = ['fullName', 'socialMediaHandle', 'email'];
    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
    
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
    }
    
    const result: CsvInfluencer[] = [];
    
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
        profileImageUrl: row.profileImageUrl || undefined
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
      // For each influencer, we need to:
      // 1. Create a new user in Supabase auth
      // 2. Update their profile record
      
      const response = await supabase.functions.invoke('upload-influencers', {
        body: { influencers: csvData }
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      toast.success(`Successfully uploaded ${csvData.length} influencer(s)`);
      
      // Reset the form
      setFile(null);
      setCsvData([]);
      
      // Reset the file input
      const fileInput = document.getElementById('influencer-csv-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to upload influencers");
      toast.error("Failed to upload influencers");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadSample = () => {
    const headers = ["fullName", "socialMediaHandle", "email", "profileImageUrl"];
    const sampleRows = [
      ["John Smith", "@johnsmith", "john@example.com", "https://example.com/john.jpg"],
      ["Jane Doe", "@janedoe", "jane@example.com", ""],
      ["Alex Johnson", "@alexj", "alex@example.com", "https://example.com/alex.jpg"]
    ];
    
    downloadSampleCsv("sample-influencers.csv", headers, sampleRows);
    toast.success("Sample CSV file downloaded");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Label htmlFor="influencer-csv-upload">Upload CSV File</Label>
          </div>
          <Button 
            variant="outline" 
            onClick={handleDownloadSample}
            className="flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            Download Sample CSV
          </Button>
        </div>
        
        <Input
          id="influencer-csv-upload"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        
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
                <span>Upload {csvData.length} Influencers</span>
              </>
            )}
          </Button>
        </div>
      </div>
      
      {csvData.length > 0 && (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>Social Media</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Profile Image</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {csvData.slice(0, 5).map((influencer, index) => (
                <TableRow key={index}>
                  <TableCell>{influencer.fullName}</TableCell>
                  <TableCell>{influencer.socialMediaHandle}</TableCell>
                  <TableCell>{influencer.email}</TableCell>
                  <TableCell>
                    {influencer.profileImageUrl ? 
                      <span className="text-xs text-green-600">Has Image</span> : 
                      <span className="text-xs text-gray-400">No Image</span>}
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
          rows={4}
          className="font-mono text-xs bg-muted"
        />
        <p className="text-sm text-muted-foreground">
          Your CSV file should include the columns shown above. The <code>profileImageUrl</code> field is optional.
        </p>
      </div>
    </div>
  );
};

export default InfluencerCsvUploader;
