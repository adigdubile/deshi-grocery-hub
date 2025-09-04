import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Package, Calendar, IndianRupee } from "lucide-react";
import { format } from "date-fns";

interface Order {
  id: string;
  total_amount: number;
  delivery_fee: number;
  status: string;
  payment_method: string;
  created_at: string;
  order_items: {
    quantity: number;
    unit_price: number;
    product: {
      name: string;
      image_url?: string;
    };
  }[];
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          delivery_fee,
          status,
          payment_method,
          created_at,
          order_items (
            quantity,
            unit_price,
            product:products (
              name,
              image_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="max-w-md mx-auto p-4">
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Please Login</h2>
            <p className="text-muted-foreground">
              Login to view your order history
            </p>
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
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-primary text-primary-foreground p-4">
          <h1 className="text-2xl font-bold">Your Orders</h1>
          <p className="text-sm opacity-90">{orders.length} orders</p>
        </div>

        {/* Orders List */}
        <div className="p-4 space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
              <p className="text-muted-foreground">
                Your order history will appear here
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Order #{order.id.slice(-8).toUpperCase()}
                    </CardTitle>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(new Date(order.created_at), 'MMM dd, yyyy')}
                    </div>
                    <div className="flex items-center">
                      <IndianRupee className="h-4 w-4 mr-1" />
                      ₹{order.total_amount}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {order.order_items.slice(0, 2).map((item, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {item.product.image_url ? (
                            <img
                              src={item.product.image_url}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity} × ₹{item.unit_price}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {order.order_items.length > 2 && (
                      <p className="text-xs text-muted-foreground">
                        +{order.order_items.length - 2} more items
                      </p>
                    )}
                    
                    <div className="pt-2 border-t">
                      <div className="flex justify-between text-sm">
                        <span>Payment Method</span>
                        <span className="capitalize">
                          {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Orders;