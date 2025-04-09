
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export const CATEGORIES = [
  "Fashion",
  "Fitness",
  "Food",
  "Tech",
  "Home",
  "Jewelry",
  "Travel",
  "Beauty"
];

interface CategoryFilterProps {
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
}

const CategoryFilter = ({ selectedCategories, onChange }: CategoryFilterProps) => {
  const handleCategoryToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      onChange(selectedCategories.filter(c => c !== category));
    } else {
      onChange([...selectedCategories, category]);
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="font-medium mb-2">Categories</h3>
      <div className="space-y-2">
        {CATEGORIES.map((category) => (
          <div key={category} className="flex items-center space-x-2">
            <Checkbox 
              id={`category-${category}`} 
              checked={selectedCategories.includes(category)}
              onCheckedChange={() => handleCategoryToggle(category)}
            />
            <Label 
              htmlFor={`category-${category}`}
              className="cursor-pointer text-sm"
            >
              {category}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
