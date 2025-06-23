
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DealCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-16" />
        </div>
        
        <Skeleton className="h-10 w-full mb-3 rounded-md" />
        
        <div className="flex items-center justify-between mb-0">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-12" />
        </div>
      </CardContent>
      
      <CardFooter className="border-t p-3 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-7 w-12" />
      </CardFooter>
    </Card>
  );
}
