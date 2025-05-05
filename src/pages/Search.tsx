import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getUniversalPromoCodes } from "@/utils/supabaseQueries";
import SearchBar from "@/components/ui/search-bar";
import DealsView from "@/components/explore/DealsView";
import { Deal } from "@/types/explore";

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [searchResults, setSearchResults] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const { data, error } = await getUniversalPromoCodes();

        if (error) {
          console.error("Error fetching data:", error);
          setLoading(false);
          return;
        }

        if (!data) {
          console.error("No data received");
          setLoading(false);
          return;
        }

        const filteredResults = data.filter((item) => {
          const searchTerm = query.toLowerCase();
          return (
            item.brand_name?.toLowerCase().includes(searchTerm) ||
            item.description?.toLowerCase().includes(searchTerm) ||
            item.promo_code?.toLowerCase().includes(searchTerm) ||
            item.category?.toLowerCase().includes(searchTerm)
          );
        });

        setSearchResults(
          filteredResults.map((item) => ({
            id: item.id || "",
            title: item.description || "",
            brandName: item.brand_name || "",
            discount: item.promo_code || "",
            promoCode: item.promo_code || "",
            expiryDate: item.expiration_date,
            affiliateLink: item.affiliate_link || "#",
            influencerName: item.influencer_name || "Unknown Influencer",
            influencerImage:
              item.influencer_image ||
              "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
            influencerId: item.influencer_id || "",
            category: item.category || "Fashion",
          }))
        );
      } catch (error) {
        console.error("Error during search:", error);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchResults();
    } else {
      setSearchResults([]);
      setLoading(false);
    }
  }, [query]);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Search Results</h1>
      <SearchBar placeholder="Search deals, brands, and more..." disabled />

      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : searchResults.length > 0 ? (
        <DealsView deals={searchResults} />
      ) : query ? (
        <div className="text-center py-4">No results found for "{query}"</div>
      ) : (
        <div className="text-center py-4">Please enter a search term.</div>
      )}
    </div>
  );
};

export default Search;
