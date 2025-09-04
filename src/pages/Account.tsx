import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  Phone, 
  Mail, 
  Settings, 
  Headphones,
  LogOut,
  Package,
  Heart,
  MapPin,
  Globe
} from "lucide-react";

interface Profile {
  full_name?: string;
  phone?: string;
  language: string;
}

const Account = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setProfile(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  const menuItems = [
    { icon: Package, label: "Your Orders", path: "/orders" },
    { icon: Heart, label: "Wishlist", action: () => toast({ title: "Coming Soon", description: "Wishlist feature will be available soon" }) },
    { icon: MapPin, label: "Manage Addresses", action: () => toast({ title: "Coming Soon", description: "Address management will be available soon" }) },
    { icon: Headphones, label: "Support", action: () => toast({ title: "Support", description: "For support, please email: support@grocerystore.com" }) },
    { icon: Settings, label: "Settings", action: () => toast({ title: "Coming Soon", description: "Settings will be available soon" }) },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="max-w-md mx-auto p-4">
          <div className="text-center py-12">
            <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Please Login</h2>
            <p className="text-muted-foreground mb-4">
              Login to access your account
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
          <div className="animate-pulse space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
          <h1 className="text-2xl font-bold">Account</h1>
        </div>

        <div className="p-4 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    {profile?.full_name || "User"}
                  </h3>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 mr-2" />
                      {user.email}
                    </div>
                    {profile?.phone && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 mr-2" />
                        {profile.phone}
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="secondary" className="text-xs">
                        {profile?.language === 'hi' ? 'हिंदी' : 'English'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Menu Items */}
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        if (item.path) {
                          navigate(item.path);
                        } else if (item.action) {
                          item.action();
                        }
                      }}
                      className="w-full flex items-center space-x-3 p-4 hover:bg-accent transition-colors"
                    >
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <span className="flex-1 text-left">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* App Info */}
          <Card>
            <CardContent className="p-4">
              <div className="text-center space-y-2">
                <h3 className="font-semibold">Grocery Store</h3>
                <p className="text-sm text-muted-foreground">
                  Fresh groceries delivered to your doorstep
                </p>
                <p className="text-xs text-muted-foreground">
                  Version 1.0.0
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Logout Button */}
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Account;