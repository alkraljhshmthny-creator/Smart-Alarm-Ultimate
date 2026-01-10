import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Check, Crown, Palette, Globe, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { cn } from "@/lib/utils";

const WALLET_ADDR = "CafoCvqgkJKKij6Q8xeT95zHaNsktX8Bpf5fu5NUcoRG";

export default function SettingsPage() {
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();
  const [hash, setHash] = useState("");
  const [verifying, setVerifying] = useState(false);

  const isAr = settings?.language === "ar";

  const handleVerify = () => {
    if (!hash) return;
    setVerifying(true);
    // Mock verification delay
    setTimeout(() => {
      updateSettings.mutate({ isPro: true });
      setVerifying(false);
      setHash("");
    }, 2000);
  };

  if (!settings) return null;

  return (
    <div className="min-h-screen px-4 md:px-8 max-w-3xl mx-auto pt-6 pb-20">
      <header className="flex items-center gap-4 mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-card">
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold font-display">{isAr ? "الإعدادات" : "Settings"}</h1>
      </header>

      <div className="space-y-8">
        {/* PRO UPGRADE CARD */}
        <Card className={cn(
          "border-2 overflow-hidden relative",
          settings.isPro 
            ? "bg-gradient-to-br from-primary/20 to-accent/20 border-primary/50" 
            : "bg-card border-border"
        )}>
          {settings.isPro && (
            <div className="absolute top-0 right-0 p-4">
              <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                <Check className="w-4 h-4" /> PRO ACTIVE
              </div>
            </div>
          )}
          
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Crown className={cn("w-8 h-8", settings.isPro ? "text-primary" : "text-yellow-500")} />
              {isAr ? "نسخة المحترفين" : "Pro Version"}
            </CardTitle>
            <CardDescription className="text-base">
              {isAr 
                ? "تخلص من الإعلانات، تحديات صعبة، وثيمات حصرية."
                : "Remove ads, unlock hard math puzzles, and exclusive themes."}
            </CardDescription>
          </CardHeader>
          
          {!settings.isPro && (
            <CardContent className="space-y-6">
              <div className="bg-background/50 p-4 rounded-xl border border-border">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  {isAr ? "عنوان المحفظة (Trust Wallet)" : "Wallet Address (Trust Wallet)"}
                </Label>
                <div className="flex items-center gap-2 mt-2">
                  <code className="text-xs md:text-sm font-mono break-all bg-black/20 p-2 rounded w-full">
                    {WALLET_ADDR}
                  </code>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{isAr ? "رمز العملية (Hash)" : "Transaction Hash"}</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="0x..." 
                    value={hash}
                    onChange={(e) => setHash(e.target.value)}
                    className="bg-background"
                  />
                  <Button 
                    onClick={handleVerify} 
                    disabled={verifying || !hash}
                    className="min-w-[100px]"
                  >
                    {verifying ? "..." : (isAr ? "تفعيل" : "Verify")}
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* APPEARANCE */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-6 h-6 text-primary" />
              {isAr ? "المظهر" : "Appearance"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>{isAr ? "الثيم" : "Theme"}</Label>
                <Select 
                  value={settings.theme || "dark_space"} 
                  onValueChange={(val) => updateSettings.mutate({ theme: val })}
                >
                  <SelectTrigger className="h-12 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark_space">Dark Space (Default)</SelectItem>
                    <SelectItem value="sunset">Sunset</SelectItem>
                    <SelectItem value="royal_gold">Royal Gold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{isAr ? "اللغة" : "Language"}</Label>
                <Select 
                  value={settings.language || "en"} 
                  onValueChange={(val) => updateSettings.mutate({ language: val })}
                >
                  <SelectTrigger className="h-12 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">العربية (Arabic)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
