import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

interface ProductCardProps {
  product: Product;
  cartQuantity?: number;
  onCartUpdate?: () => void;
  language?: string;
}

const ProductCard = ({ product, cartQuantity = 0, onCartUpdate, language = "en" }: ProductCardProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const displayName = language === "hi" && product.name_hi ? product.name_hi : product.name;
  const hasDiscount = product.discount_percentage && product.discount_percentage > 0;

  const addToCart = async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Login Required",
          description: "Please login to add items to cart",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('cart')
        .upsert({
          user_id: session.user.id,
          product_id: product.id,
          quantity: cartQuantity + 1,
        });

      if (error) throw error;

      toast({
        title: "Added to Cart",
        description: `${displayName} added to cart`,
      });
      
      onCartUpdate?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add to cart",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (newQuantity: number) => {
    if (newQuantity < 0) return;
    
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      if (newQuantity === 0) {
        const { error } = await supabase
          .from('cart')
          .delete()
          .eq('user_id', session.user.id)
          .eq('product_id', product.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart')
          .upsert({
            user_id: session.user.id,
            product_id: product.id,
            quantity: newQuantity,
          });

        if (error) throw error;
      }

      onCartUpdate?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update cart",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-0">
        <div className="relative">
          <div className="aspect-square bg-gray-100 overflow-hidden">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={displayName}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <ShoppingCart className="h-12 w-12" />
              </div>
            )}
          </div>
          
          {hasDiscount && (
            <Badge variant="destructive" className="absolute top-2 left-2">
              {product.discount_percentage}% OFF
            </Badge>
          )}
        </div>
        
        <div className="p-3">
          <div className="space-y-1 mb-3">
            <h3 className="font-semibold text-sm leading-tight line-clamp-2">
              {displayName}
            </h3>
            {product.brand && (
              <p className="text-xs text-muted-foreground">{product.brand}</p>
            )}
            
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg">₹{product.price}</span>
              {hasDiscount && product.original_price && (
                <span className="text-sm text-muted-foreground line-through">
                  ₹{product.original_price}
                </span>
              )}
              <span className="text-xs text-muted-foreground">/{product.unit}</span>
            </div>
          </div>
          
          {cartQuantity > 0 ? (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateQuantity(cartQuantity - 1)}
                disabled={loading}
                className="h-8 w-8 p-0"
              >
                <Minus className="h-3 w-3" />
              </Button>
              
              <span className="font-semibold px-3">{cartQuantity}</span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateQuantity(cartQuantity + 1)}
                disabled={loading || cartQuantity >= product.stock_quantity}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <Button
              variant="grocery-outline"
              size="sm"
              onClick={addToCart}
              disabled={loading || product.stock_quantity === 0}
              className="w-full h-8 text-xs font-semibold"
            >
              {product.stock_quantity === 0 ? "Out of Stock" : "ADD"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;