import { useState } from "react";
import { useAlarms, useCreateAlarm, useUpdateAlarm, useDeleteAlarm } from "@/hooks/use-alarms";
import { useSettings } from "@/hooks/use-settings";
import { ClockDisplay } from "@/components/ClockDisplay";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Clock, Settings as SettingsIcon, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAlarmSchema, InsertAlarm } from "@shared/schema";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Home() {
  const { data: alarms = [], isLoading } = useAlarms();
  const { data: settings } = useSettings();
  const createAlarm = useCreateAlarm();
  const updateAlarm = useUpdateAlarm();
  const deleteAlarm = useDeleteAlarm();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isAr = settings?.language === "ar";

  const form = useForm<InsertAlarm>({
    resolver: zodResolver(insertAlarmSchema),
    defaultValues: {
      time: "07:00",
      label: "",
      isActive: true,
      days: []
    }
  });

  const onSubmit = (data: InsertAlarm) => {
    createAlarm.mutate(data, {
      onSuccess: () => {
        setIsDialogOpen(false);
        form.reset();
      }
    });
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen pb-20 px-4 md:px-8 max-w-4xl mx-auto pt-6">
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <span className="font-display font-bold text-xl hidden md:inline-block">ULTIMATE ALARM</span>
        </div>
        <Link href="/settings">
          <Button variant="ghost" size="icon" className="rounded-full w-12 h-12 hover:bg-muted">
            <SettingsIcon className="w-6 h-6" />
          </Button>
        </Link>
      </header>

      <ClockDisplay isAr={isAr} className="mb-12" />

      <div className="flex justify-between items-end mb-6">
        <h2 className="text-2xl font-bold font-display">
          {isAr ? "المنبهات" : "Alarms"}
          <span className="text-primary ml-2 text-sm font-sans font-normal bg-primary/10 px-2 py-1 rounded-md">
            {alarms.length}
          </span>
        </h2>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="rounded-2xl shadow-lg shadow-primary/25 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all hover:scale-105">
              <Plus className="w-5 h-5 mr-2" />
              {isAr ? "منبه جديد" : "New Alarm"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-3xl border-border/50 bg-card/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">
                {isAr ? "ضبط منبه جديد" : "Set New Alarm"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="time" className="text-muted-foreground">{isAr ? "الوقت" : "Time"}</Label>
                <Input 
                  id="time" 
                  type="time" 
                  className="text-5xl h-24 text-center font-display rounded-2xl bg-background border-2 border-border focus:border-primary focus:ring-0"
                  {...form.register("time")} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="label" className="text-muted-foreground">{isAr ? "العنوان" : "Label"}</Label>
                <Input 
                  id="label" 
                  placeholder={isAr ? "عمل، رياضة..." : "Work, Gym..."} 
                  className="h-12 rounded-xl bg-background border-border"
                  {...form.register("label")} 
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-14 text-lg font-bold rounded-xl" 
                disabled={createAlarm.isPending}
              >
                {createAlarm.isPending ? <div className="animate-spin mr-2">C</div> : null}
                {isAr ? "حفظ المنبه" : "Save Alarm"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-card/50 rounded-2xl animate-pulse" />)}
        </div>
      ) : alarms.length === 0 ? (
        <div className="text-center py-20 bg-card/30 rounded-3xl border-2 border-dashed border-border">
          <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg">
            {isAr ? "لا يوجد منبهات نشطة" : "No active alarms yet"}
          </p>
        </div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {alarms.map((alarm) => (
            <motion.div variants={item} key={alarm.id}>
              <Card className="p-6 flex items-center justify-between rounded-2xl border-border/50 bg-card/60 hover:bg-card/80 transition-colors group">
                <div className="flex flex-col">
                  <span className={cn(
                    "text-4xl font-display font-bold transition-colors",
                    alarm.isActive ? "text-foreground text-glow" : "text-muted-foreground"
                  )}>
                    {alarm.time}
                  </span>
                  <span className="text-muted-foreground font-medium text-sm mt-1">
                    {alarm.label || (isAr ? "بدون عنوان" : "No Label")}
                  </span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-background/50 p-1 rounded-full border border-border">
                    <Switch
                      checked={alarm.isActive ?? false}
                      onCheckedChange={(checked) => updateAlarm.mutate({ id: alarm.id, isActive: checked })}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteAlarm.mutate(alarm.id)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full w-10 h-10 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
