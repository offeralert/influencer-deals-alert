
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

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
        "group block p-2 transition-all hover:shadow-md border border-border bg-card rounded-lg",
        className
      )}
    >
      <div className="space-y-0.5">
        <h3 className="text-sm font-medium">{name}</h3>
        <p className="text-xs text-muted-foreground">{count} offers</p>
      </div>
    </Link>
  );
};

export default CategoryCard;
