
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface CategoryCardProps {
  name: string;
  image?: string; // Make image optional
  count?: number;
  href: string;
  className?: string;
}

const CategoryCard = ({ name, count = 0, href, className }: CategoryCardProps) => {
  return (
    <Link
      to={href}
      className={cn(
        "group block p-4 rounded-lg transition-all hover:shadow-md border border-border bg-card",
        className
      )}
    >
      <div className="space-y-1">
        <h3 className="text-xl font-semibold">{name}</h3>
        <p className="text-sm text-muted-foreground">{count} offers</p>
      </div>
    </Link>
  );
};

export default CategoryCard;
