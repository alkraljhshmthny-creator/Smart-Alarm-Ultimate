import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ClockDisplayProps {
  isAr: boolean;
  className?: string;
}

export function ClockDisplay({ isAr, className }: ClockDisplayProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={cn("text-center py-10", className)}>
      <h1 className="text-7xl md:text-9xl font-display font-black tracking-tighter text-glow text-foreground select-none tabular-nums">
        {format(time, "HH:mm")}
        <span className="text-4xl md:text-6xl text-primary/80 align-top ml-2">
          {format(time, "ss")}
        </span>
      </h1>
      <p className="mt-4 text-xl text-muted-foreground font-medium uppercase tracking-widest">
        {format(time, "EEEE, d MMMM", { locale: isAr ? ar : undefined })}
      </p>
    </div>
  );
}
