import { Card, CardContent } from "@/components/ui/card";

interface Category {
  id: string;
  name: string;
  name_hi?: string;
  icon_url?: string;
}

interface CategoryGridProps {
  categories: Category[];
  onCategorySelect: (categoryId: string) => void;
  language?: string;
}

const CategoryGrid = ({ categories, onCategorySelect, language = "en" }: CategoryGridProps) => {
  return (
    <div className="grid grid-cols-4 gap-3">
      {categories.map((category) => {
        const displayName = language === "hi" && category.name_hi ? category.name_hi : category.name;
        
        return (
          <Card
            key={category.id}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
            onClick={() => onCategorySelect(category.id)}
          >
            <CardContent className="p-3 text-center">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center text-2xl">
                  {category.icon_url || "🛒"}
                </div>
                <span className="text-xs font-medium text-center leading-tight">
                  {displayName}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CategoryGrid;