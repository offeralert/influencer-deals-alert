
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
import { downloadSampleCsv, parseAndValidateCsv } from "@/utils/csvUtils";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";

interface PromoCode {
  brand_name: string;
  promo_code: string;
  description: string;
  expiration_date?: string;
  affiliate_link: string;
  category: string;
  email: string; // Email to match with influencer
  user_id?: string; // Will be populated based on email match
}

const PromoCodeCsvUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [csvExample, setCsvExample] = useState<string>(
    "brand_name,promo_code,description,expiration_date,affiliate_link,category,email\nNike,SAVE20,20% off running shoes,2023-12-31,https://nike.example.com/ref123,Sports,influencer@example.com\nSephora,BEAUTY10,10% off beauty products,2023-11-30,https://sephora.example.com/ref456,Beauty,another@example.com"
  );
  const { user } = useAuth();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setIsLoading(true);
      
      try {
        // Parse and validate the CSV file
        const requiredHeaders = ['brand_name', 'promo_code', 'description', 'category', 'email', 'affiliate_link'];
        const { data, errors } = await parseAndValidateCsv(selectedFile, requiredHeaders, (row) => {
          // Validate required fields in each row
          if (!row.brand_name || !row.promo_code || !row.description || !row.category || !row.email || !row.affiliate_link) {
            return { 
              valid: false, 
              error: 'Missing required fields (brand_name, promo_code, description, category, email, or affiliate_link)' 
            };
          }
          return { valid: true };
        });
        
        if (errors.length > 0) {
          setError(errors.join('\n'));
          setCsvData([]);
        } else {
          // Convert to PromoCode objects
          const promoCodesData = data.map(row => ({
            brand_name: row.brand_name,
            promo_code: row.promo_code,
            description: row.description,
            expiration_date: row.expiration_date || undefined,
            affiliate_link: row.affiliate_link,
            category: row.category,
            email: row.email
          }));
          
          setCsvData(promoCodesData);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to parse CSV file");
        setCsvData([]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleUpload = async () => {
    if (csvData.length === 0) {
      setError("No data to upload");
      return;
    }
    
    setIsUploading(true);
    setProgress(10);
    
    try {
      // First, lookup all the influencer emails to get their user_ids
      const influencerEmails = [...new Set(csvData.map(item => item.email))];
      const emailLookupResponse = await supabase
        .from('profiles')
        .select('id, username, is_influencer')
        .in('username', influencerEmails)
        .eq('is_influencer', true);
      
      if (emailLookupResponse.error) {
        throw new Error(emailLookupResponse.error.message);
      }
      
      setProgress(30);
      
      // Create a mapping of email to user_id
      const emailToUserIdMap: Record<string, string> = {};
      emailLookupResponse.data.forEach(profile => {
        if (profile.username) {
          emailToUserIdMap[profile.username] = profile.id;
        }
      });
      
      // Filter out promo codes with emails that don't match influencers
      const validPromoCodes: PromoCode[] = [];
      const invalidEmails: string[] = [];
      
      csvData.forEach(promoCode => {
        if (emailToUserIdMap[promoCode.email]) {
          validPromoCodes.push({
            ...promoCode,
            user_id: emailToUserIdMap[promoCode.email]
          });
        } else {
          invalidEmails.push(promoCode.email);
        }
      });
      
      if (validPromoCodes.length === 0) {
        throw new Error("No matching influencer emails found. Please check the email addresses in your CSV.");
      }
      
      if (invalidEmails.length > 0) {
        toast.warning(`${invalidEmails.length} promo codes skipped due to invalid influencer emails.`);
      }
      
      setProgress(50);
      
      // Prepare data for upload (remove email field as it's not needed in the database)
      const formattedData = validPromoCodes.map(({ email, ...rest }) => rest);
      
      // Upload the valid promo codes
      const response = await fetch("/api/upload-promo-codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ promoCodes: formattedData }),
      });
      
      setProgress(80);
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Successfully uploaded ${validPromoCodes.length} promo code(s)`);
        
        // Reset the form
        setFile(null);
        setCsvData([]);
        
        // Reset the file input
        const fileInput = document.getElementById('promo-code-csv-upload') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      } else {
        throw new Error(data.error || "Upload failed");
      }
      
      setProgress(100);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to upload promo codes");
      toast.error("Failed to upload promo codes");
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 3000);
    }
  };

  const handleDownloadSample = () => {
    const headers = ["brand_name", "promo_code", "description", "expiration_date", "affiliate_link", "category", "email"];
    const sampleRows = [
      ["Nike", "SAVE20", "20% off running shoes", "2023-12-31", "https://nike.example.com/ref123", "Sports", "influencer@example.com"],
      ["Sephora", "BEAUTY10", "10% off beauty products", "2023-11-30", "https://sephora.example.com/ref456", "Beauty", "another@example.com"],
      ["Amazon", "BOOKS5", "$5 off books over $20", "", "https://amazon.example.com/deals", "Shopping", "third@example.com"]
    ];
    
    downloadSampleCsv("sample-promo-codes.csv", headers, sampleRows);
    toast.success("Sample CSV file downloaded");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Label htmlFor="promo-code-csv-upload">Upload CSV File</Label>
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
          id="promo-code-csv-upload"
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
        
        {progress > 0 && (
          <Progress value={progress} className="w-full" />
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
                <span>Upload {csvData.length} Promo Codes</span>
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
                <TableHead>Brand</TableHead>
                <TableHead>Promo Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Influencer Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {csvData.slice(0, 5).map((promoCode, index) => (
                <TableRow key={index}>
                  <TableCell>{promoCode.brand_name}</TableCell>
                  <TableCell>{promoCode.promo_code}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{promoCode.description}</TableCell>
                  <TableCell>{promoCode.category}</TableCell>
                  <TableCell>{promoCode.email}</TableCell>
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
          Your CSV file should include the columns shown above. The <code>email</code> field must match an existing influencer account.
          The <code>affiliate_link</code> field is required for all promo codes.
        </p>
      </div>
    </div>
  );
};

export default PromoCodeCsvUploader;
