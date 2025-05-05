
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

const SearchBar = ({ 
  placeholder = "Search...", 
  value = "", 
  onChange = () => {}, 
  className = "",
  disabled = false
}: SearchBarProps) => {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 pr-10"
        disabled={disabled}
      />
      {value && !disabled && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
          onClick={() => onChange("")}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default SearchBar;
