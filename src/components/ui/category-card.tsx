
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface CategoryCardProps {
  name: string;
  image: string;
  count?: number;
  href: string;
  className?: string;
}

const CategoryCard = ({ name, image, count, href, className }: CategoryCardProps) => {
  return (
    <Link
      to={href}
      className={cn(
        "group relative overflow-hidden rounded-lg transition-all hover:shadow-lg",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20 transition-all group-hover:from-black/90" />
      <img
        src={image}
        alt={name}
        className="h-56 w-full object-cover transition-all duration-500 group-hover:scale-105"
      />
      <div className="absolute bottom-0 left-0 p-4">
        <h3 className="text-xl font-semibold text-white">{name}</h3>
        <p className="text-sm text-white/80">156 offers</p>
      </div>
    </Link>
  );
};

export default CategoryCard;
