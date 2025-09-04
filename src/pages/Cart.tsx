import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CartItemWithProduct {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image_url?: string;
    unit: string;
    stock_quantity: number;
  };
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchCartItems();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCartItems = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cart')
        .select(`
          id,
          quantity,
          product:products (
            id,
            name,
            price,
            image_url,
            unit,
            stock_quantity
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setCartItems(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load cart items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 0) return;

    try {
      setUpdating(cartItemId);

      if (newQuantity === 0) {
        const { error } = await supabase
          .from('cart')
          .delete()
          .eq('id', cartItemId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart')
          .update({ quantity: newQuantity })
          .eq('id', cartItemId);

        if (error) throw error;
      }

      await fetchCartItems();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update cart",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      setUpdating(cartItemId);
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;

      toast({
        title: "Removed",
        description: "Item removed from cart",
      });

      await fetchCartItems();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  const calculateItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="max-w-md mx-auto p-4">
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Please Login</h2>
            <p className="text-muted-foreground mb-4">
              Login to view your cart and place orders
            </p>
            <Button onClick={() => navigate('/auth')} variant="grocery">
              Login
            </Button>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="max-w-md mx-auto p-4">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="max-w-md mx-auto p-4">
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-4">
              Add some groceries to get started
            </p>
            <Button onClick={() => navigate('/')} variant="grocery">
              Start Shopping
            </Button>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-primary text-primary-foreground p-4">
          <h1 className="text-2xl font-bold">Cart</h1>
          <p className="text-sm opacity-90">{calculateItemCount()} items</p>
        </div>

        {/* Cart Items */}
        <div className="p-4 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex space-x-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      ₹{item.product.price} / {item.product.unit}
                    </p>
                    <p className="font-bold">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                  
                  <div className="flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                      disabled={updating === item.id}
                      className="p-1 h-auto text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={updating === item.id}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      
                      <span className="font-semibold px-2">{item.quantity}</span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={updating === item.id || item.quantity >= item.product.stock_quantity}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Checkout Summary */}
        <div className="fixed bottom-16 left-0 right-0 bg-card border-t p-4">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>₹20.00</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{(calculateTotal() + 20).toFixed(2)}</span>
                </div>
                
                <Button 
                  variant="grocery" 
                  size="lg" 
                  className="w-full mt-4"
                  onClick={() => navigate('/checkout')}
                >
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Cart;