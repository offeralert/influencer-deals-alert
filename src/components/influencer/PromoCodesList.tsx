
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { isExpired, isExpiringSoon } from "@/utils/dateUtils";
import { usePromoCodesRealtime } from "@/hooks/usePromoCodesRealtime";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PromoCodesListProps {
  onPromoCodeUpdated?: () => void;
}

const PromoCodesList = ({ onPromoCodeUpdated }: PromoCodesListProps) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Use real-time hook instead of manual state management
  const { promoCodes, loading } = usePromoCodesRealtime();

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting promo code:", error);
        toast.error("Failed to delete promo code");
        return;
      }

      // Real-time hook will automatically update the list
      onPromoCodeUpdated?.();
    } catch (error) {
      console.error("Error in handleDelete:", error);
      toast.error("Failed to delete promo code");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };


  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Promo Codes</CardTitle>
          <CardDescription>
            Manage and track your promotional codes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            Loading promo codes...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (promoCodes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Promo Codes</CardTitle>
          <CardDescription>
            Manage and track your promotional codes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Plus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No promo codes yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by adding your first promo code to share with your audience.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Your Promo Codes</CardTitle>
          <CardDescription>
            Manage and track your promotional codes ({promoCodes.length} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand Name</TableHead>
                  <TableHead>Brand Website</TableHead>
                  <TableHead>Brand Instagram</TableHead>
                  <TableHead>Promo Code</TableHead>
                  <TableHead>Expiration Date</TableHead>
                  <TableHead>Affiliate Link</TableHead>
                  <TableHead>Promo Details</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promoCodes.map((code) => (
                  <TableRow 
                    key={code.id}
                    className={
                      isExpired(code.expiration_date) 
                        ? "bg-red-50 dark:bg-red-950/10" 
                        : isExpiringSoon(code.expiration_date)
                        ? "bg-yellow-50 dark:bg-yellow-950/10"
                        : ""
                    }
                  >
                    <TableCell className="font-medium">{code.brand_name}</TableCell>
                    <TableCell>
                      {code.brand_url ? (
                        <a 
                          href={code.brand_url.startsWith('http') ? code.brand_url : `https://${code.brand_url}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline truncate max-w-[150px] inline-block"
                        >
                          {code.brand_url.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                        </a>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="font-mono">
                      {code.brand_instagram_handle?.startsWith('@') 
                        ? code.brand_instagram_handle 
                        : `@${code.brand_instagram_handle || ''}`
                      }
                    </TableCell>
                    <TableCell className="font-mono font-semibold">{code.promo_code}</TableCell>
                    <TableCell>
                      {code.expiration_date ? (
                        <div className="flex items-center gap-2">
                          <span>{new Date(code.expiration_date).toLocaleDateString()}</span>
                          {isExpired(code.expiration_date) && (
                            <Badge variant="destructive" className="text-xs">Expired</Badge>
                          )}
                          {isExpiringSoon(code.expiration_date) && !isExpired(code.expiration_date) && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400 text-xs">
                              Soon
                            </Badge>
                          )}
                        </div>
                      ) : (
                        "No expiration"
                      )}
                    </TableCell>
                    <TableCell>
                      {code.affiliate_link ? (
                        <a 
                          href={code.affiliate_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline truncate max-w-[150px] inline-block"
                        >
                          Link
                        </a>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{code.description}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => setDeleteId(code.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Promo Code</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this promo code? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PromoCodesList;
