
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface CategoryCardProps {
  name: string;
  image?: string;
  count?: number;
  href: string;
  className?: string;
}

const CategoryCard = ({ name, count = 0, href, className }: CategoryCardProps) => {
  return (
    <Link
      to={href}
      className={cn(
        "group block transition-all hover:shadow-md border border-border bg-card",
        className
      )}
    >
      <div className="space-y-0.5 md:space-y-1">
        <h3 className="text-base md:text-xl font-semibold">{name}</h3>
        <p className="text-xs md:text-sm text-muted-foreground">{count} offers</p>
      </div>
    </Link>
  );
};

export default CategoryCard;
