import { useState, useEffect } from "react";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CategoryGrid from "@/components/grocery/CategoryGrid";
import ProductCard from "@/components/grocery/ProductCard";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  name_hi?: string;
  icon_url?: string;
}

interface Product {
  id: string;
  name: string;
  name_hi?: string;
  description?: string;
  price: number;
  original_price?: number;
  discount_percentage?: number;
  image_url?: string;
  brand?: string;
  unit: string;
  stock_quantity: number;
}

interface CartItem {
  product_id: string;
  quantity: number;
}

const Home = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    if (user) {
      fetchCartItems();
    }
  }, [user]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCartItems = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('cart')
        .select('product_id, quantity')
        .eq('user_id', user.id);

      if (error) throw error;
      setCartItems(data || []);
    } catch (error: any) {
      console.error('Error fetching cart items:', error);
    }
  };

  const getCartQuantity = (productId: string) => {
    const item = cartItems.find(item => item.product_id === productId);
    return item?.quantity || 0;
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Grocery Store</h1>
              <div className="flex items-center text-sm opacity-90">
                <MapPin className="h-4 w-4 mr-1" />
                <span>Delivery in 30 minutes</span>
              </div>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for groceries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background text-foreground"
            />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Categories */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Categories</h2>
          <CategoryGrid
            categories={categories}
            onCategorySelect={handleCategorySelect}
          />
        </div>

        {/* Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {selectedCategory 
                  ? categories.find(c => c.id === selectedCategory)?.name || "Products"
                  : searchQuery 
                    ? `Search Results for "${searchQuery}"`
                    : "Top Selling"
                }
              </span>
              {selectedCategory && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                  className="text-primary"
                >
                  View All
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-lg mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    cartQuantity={getCartQuantity(product.id)}
                    onCartUpdate={fetchCartItems}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Home;