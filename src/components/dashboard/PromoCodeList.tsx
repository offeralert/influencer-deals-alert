
import { useState } from "react";
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PromoCodeEditor from "@/components/PromoCodeEditor";
import { isExpired, isExpiringSoon } from "@/utils/dateUtils";

interface PromoCode {
  id: string;
  brand_name: string;
  promo_code: string;
  description: string;
  expiration_date: string | null;
  affiliate_link: string | null;
  created_at: string;
  category: string;
}

interface PromoCodeListProps {
  promoCodes: PromoCode[];
  loadingPromoCodes: boolean;
  onEditPromoCode: (id: string) => void;
  onDeletePromoCode: (id: string) => void;
  onPromoCodeUpdated: () => void;
  editingPromoCodeId: string | null;
  onCancelEdit: () => void;
}

const PromoCodeList = ({
  promoCodes,
  loadingPromoCodes,
  onEditPromoCode,
  onDeletePromoCode,
  onPromoCodeUpdated,
  editingPromoCodeId,
  onCancelEdit
}: PromoCodeListProps) => {
  // Check if there are any expired or expiring soon promo codes
  const hasExpiredCodes = promoCodes.some(code => isExpired(code.expiration_date));
  const hasExpiringSoonCodes = promoCodes.some(
    code => isExpiringSoon(code.expiration_date) && !isExpired(code.expiration_date)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Current Promo Codes</span>
          {/* Only show badge legend if there are expired or expiring soon codes */}
          {(hasExpiredCodes || hasExpiringSoonCodes) && (
            <div className="flex gap-2 text-sm font-normal">
              {hasExpiredCodes && (
                <Badge variant="outline" className="bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-400">
                  Expired
                </Badge>
              )}
              {hasExpiringSoonCodes && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400">
                  Expiring Soon
                </Badge>
              )}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loadingPromoCodes ? (
          <div className="text-center py-4">Loading promo codes...</div>
        ) : promoCodes.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Affiliate Link</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promoCodes.map((code) => (
                  <TableRow key={code.id} className={
                    isExpired(code.expiration_date) 
                      ? "bg-red-50 dark:bg-red-950/10" 
                      : isExpiringSoon(code.expiration_date)
                      ? "bg-yellow-50 dark:bg-yellow-950/10"
                      : ""
                  }>
                    {editingPromoCodeId === code.id ? (
                      <TableCell colSpan={7}>
                        <PromoCodeEditor 
                          promoCode={code} 
                          onSave={onPromoCodeUpdated} 
                          onCancel={onCancelEdit} 
                        />
                      </TableCell>
                    ) : (
                      <>
                        <TableCell className="font-medium">{code.brand_name}</TableCell>
                        <TableCell className="font-mono">{code.promo_code}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-brand-light dark:bg-brand-dark rounded-full text-xs">
                            {code.category}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{code.description}</TableCell>
                        <TableCell>
                          {code.expiration_date 
                            ? (
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
                            )
                            : "No expiration"
                          }
                        </TableCell>
                        <TableCell>
                          {code.affiliate_link ? (
                            <a 
                              href={code.affiliate_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-brand-green hover:underline truncate max-w-[150px] inline-block"
                            >
                              {code.affiliate_link}
                            </a>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => onEditPromoCode(code.id)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => onDeletePromoCode(code.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-4 border rounded-md bg-muted/20">
            You haven't added any promo codes yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PromoCodeList;
