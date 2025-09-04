import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Eye, EyeOff, Mail, Phone, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AuthFormProps {
  mode: "login" | "signup" | "forgot";
  onModeChange: (mode: "login" | "signup" | "forgot") => void;
}

const AuthForm = ({ mode, onModeChange }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [language, setLanguage] = useState("en");
  const [dataConsent, setDataConsent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkUser();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        if (!dataConsent) {
          toast({
            title: "Consent Required",
            description: "Please accept the data collection policy to continue.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName,
              phone: phone,
              language: language,
              data_collection_consent: dataConsent,
            },
          },
        });

        if (error) throw error;

        toast({
          title: "Account Created!",
          description: "Please check your email to verify your account.",
        });
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        navigate('/');
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth?mode=reset`,
        });

        if (error) throw error;

        toast({
          title: "Reset Link Sent",
          description: "Please check your email for the password reset link.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "signup": return "Create Account";
      case "login": return "Login";
      case "forgot": return "Forgot Password";
      default: return "Welcome";
    }
  };

  const getDescription = () => {
    switch (mode) {
      case "signup": return "Welcome to Grocery Store";
      case "login": return "Welcome back to Grocery Store";
      case "forgot": return "Reset your account password";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          {mode !== "login" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onModeChange("login")}
              className="w-fit p-1 h-8 mb-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <CardTitle className="text-2xl font-bold text-center">{getTitle()}</CardTitle>
          <CardDescription className="text-center">{getDescription()}</CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {mode === "signup" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Preferred Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            {mode !== "forgot" && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}

            {mode === "signup" && (
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="dataConsent"
                    checked={dataConsent}
                    onCheckedChange={(checked) => setDataConsent(checked as boolean)}
                  />
                  <Label htmlFor="dataConsent" className="text-sm leading-relaxed">
                    I consent to data collection for technical analysis and service improvement. 
                    Your data will be handled according to our{" "}
                    <span className="text-primary underline cursor-pointer">Privacy Policy</span> and{" "}
                    <span className="text-primary underline cursor-pointer">Terms of Service</span>.
                  </Label>
                </div>
              </div>
            )}

            {mode === "login" && (
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="link"
                  className="text-sm p-0 h-auto text-primary"
                  onClick={() => onModeChange("forgot")}
                >
                  Forgot Password?
                </Button>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              variant="grocery"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Please wait..." : getTitle()}
            </Button>
            
            {mode === "login" && (
              <p className="text-sm text-center text-muted-foreground">
                Don't have an account?{" "}
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto text-primary"
                  onClick={() => onModeChange("signup")}
                >
                  Create Account
                </Button>
              </p>
            )}
            
            {mode === "signup" && (
              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{" "}
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto text-primary"
                  onClick={() => onModeChange("login")}
                >
                  Login
                </Button>
              </p>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AuthForm;