
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const WhyItMattersSection = () => {
  const brandLogos = [
    {
      name: "Adidas",
      logoUrl: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=100&h=100&fit=crop&crop=center",
      category: "Sports"
    },
    {
      name: "Nike",
      logoUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop&crop=center",
      category: "Sports"
    },
    {
      name: "Neutrogena",
      logoUrl: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=100&h=100&fit=crop&crop=center",
      category: "Beauty"
    },
    {
      name: "Sephora",
      logoUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100&h=100&fit=crop&crop=center",
      category: "Beauty"
    },
    {
      name: "British Airways",
      logoUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=100&h=100&fit=crop&crop=center",
      category: "Travel"
    },
    {
      name: "Expedia",
      logoUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=100&h=100&fit=crop&crop=center",
      category: "Travel"
    },
    {
      name: "Amazon",
      logoUrl: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=100&h=100&fit=crop&crop=center",
      category: "Retail"
    },
    {
      name: "Target",
      logoUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop&crop=center",
      category: "Retail"
    },
    {
      name: "Ulta",
      logoUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=100&h=100&fit=crop&crop=center",
      category: "Beauty"
    },
    {
      name: "JCPenney",
      logoUrl: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=100&h=100&fit=crop&crop=center",
      category: "Retail"
    }
  ];

  // Show 6 logos on mobile, 10 on tablet/desktop
  const mobileLogos = brandLogos.slice(0, 6);
  const desktopLogos = brandLogos;

  return (
    <section className="py-8 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Trusted by Shoppers at Top Brands</h2>
          <p className="text-base md:text-lg text-muted-foreground mb-8 md:mb-12">
            Get exclusive deals and promo codes from your favorite influencers at the brands you love most.
          </p>
          
          {/* Mobile view - 6 logos in 3x2 grid */}
          <div className="grid grid-cols-3 gap-6 md:hidden">
            {mobileLogos.map((brand, index) => (
              <div key={index} className="flex flex-col items-center">
                <Avatar className="w-16 h-16 bg-white shadow-md border-2 border-gray-100">
                  <AvatarImage 
                    src={brand.logoUrl} 
                    alt={`${brand.name} logo`}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gray-100 text-gray-600 font-semibold">
                    {brand.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
            ))}
          </div>

          {/* Desktop/Tablet view - 10 logos in 5x2 grid */}
          <div className="hidden md:grid grid-cols-5 gap-8">
            {desktopLogos.map((brand, index) => (
              <div key={index} className="flex flex-col items-center">
                <Avatar className="w-20 h-20 bg-white shadow-md border-2 border-gray-100 hover:shadow-lg transition-shadow duration-200">
                  <AvatarImage 
                    src={brand.logoUrl} 
                    alt={`${brand.name} logo`}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gray-100 text-gray-600 font-semibold">
                    {brand.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyItMattersSection;
