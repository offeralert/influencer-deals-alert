
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { FileText, Upload, User, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import InfluencerCsvUploader from "@/components/csv/InfluencerCsvUploader";
import PromoCodeCsvUploader from "@/components/csv/PromoCodeCsvUploader";
import UnifiedCsvUploader from "@/components/csv/UnifiedCsvUploader";

const CsvUpload = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container max-w-6xl py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h2 className="text-2xl font-semibold mb-2">Authentication Required</h2>
              <p className="text-muted-foreground">
                You need to be logged in to access this page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // In a real app, check if user has admin permissions
  // For now, we'll allow any authenticated user to access

  return (
    <div className="container max-w-6xl py-8">
      <h1 className="text-3xl font-bold mb-8">CSV Upload Tool</h1>
      
      <Tabs defaultValue="unified" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="unified" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Unified Upload</span>
          </TabsTrigger>
          <TabsTrigger value="influencers" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Influencers</span>
          </TabsTrigger>
          <TabsTrigger value="promocodes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Promo Codes</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="unified">
          <Card>
            <CardHeader>
              <CardTitle>Unified Upload (Influencers + Promo Codes)</CardTitle>
              <CardDescription>
                Upload a single CSV file containing both influencer data and their promo codes, with one row per influencer-promo code combination.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UnifiedCsvUploader />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="influencers">
          <Card>
            <CardHeader>
              <CardTitle>Upload Influencers</CardTitle>
              <CardDescription>
                Upload a CSV file containing influencer data to bulk import into the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InfluencerCsvUploader />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="promocodes">
          <Card>
            <CardHeader>
              <CardTitle>Upload Promo Codes</CardTitle>
              <CardDescription>
                Upload a CSV file containing promo code data to bulk import into the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PromoCodeCsvUploader />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CsvUpload;
