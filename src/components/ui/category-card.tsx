
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface CategoryCardProps {
  id: string;
  name: string;
  imageUrl: string;
  count: number;
}

export function CategoryCard({ id, name, imageUrl, count }: CategoryCardProps) {
  return (
    <Link to={`/category/${id}`}>
      <Card className="group overflow-hidden relative h-[160px] transition-all duration-200 hover:shadow-md">
        <div className="absolute inset-0">
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        </div>
        <div className="absolute bottom-0 p-4 text-white">
          <h3 className="font-semibold text-lg">{name}</h3>
          <p className="text-sm text-white/80">{count} influencers</p>
        </div>
      </Card>
    </Link>
  );
}
