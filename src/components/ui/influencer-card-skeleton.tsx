
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const InfluencerCardSkeleton = () => {
  return (
    <Card className="overflow-hidden h-[88px]">
      <CardContent className="p-3 h-full">
        <div className="flex items-center gap-3 h-full">
          <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
          <div className="flex-1 min-w-0 space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-8 w-16 flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
};

export default InfluencerCardSkeleton;
