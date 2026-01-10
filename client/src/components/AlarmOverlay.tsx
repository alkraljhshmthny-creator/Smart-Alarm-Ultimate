import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Alarm, Settings } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Pause, AlertTriangle, Loader2, Brain, CheckCircle2, XCircle } from "lucide-react";
import { useUpdateAlarm } from "@/hooks/use-alarms";
import { Card } from "@/components/ui/card";

// Simple Audio Context for alarm sound
const ALARM_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/995/995-preview.mp3"; 

interface AlarmOverlayProps {
  alarm: Alarm | null;
  settings: Settings | undefined;
  onDismiss: () => void;
  onSnooze: () => void;
}

const RIDDLES_EN = [
  { q: "What has keys but can't open locks?", a: "Piano" },
  { q: "What has to be broken before you can use it?", a: "Egg" },
  { q: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind.", a: "Echo" }
];

const RIDDLES_AR = [
  { q: "ما هو الشيء الذي يكتب ولا يقرأ؟", a: "القلم" },
  { q: "له أسنان ولا يعض؟", a: "المشط" },
  { q: "أنا ابن الماء وإذا وضعوني في الماء مت، من أنا؟", a: "الثلج" }
];

export function AlarmOverlay({ alarm, settings, onDismiss, onSnooze }: AlarmOverlayProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [mode, setMode] = useState<"ring" | "puzzle" | "ad">("ring");
  const [puzzle, setPuzzle] = useState<{ q: string, a: string | number } | null>(null);
  const [answer, setAnswer] = useState("");
  const [adTimer, setAdTimer] = useState(3);
  const [error, setError] = useState(false);
  const updateAlarm = useUpdateAlarm();

  // Initialize Audio
  useEffect(() => {
    if (alarm) {
      audioRef.current = new Audio(ALARM_SOUND_URL);
      audioRef.current.loop = true;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.error("Autoplay prevented", e));
      setMode("ring");
    }
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [alarm]);

  // Generate Puzzle
  const startPuzzle = () => {
    setMode("puzzle");
    if (settings?.isPro && settings.theme !== 'dark_space') { 
      // Pro Mode: Hard Math (simulated logic for Pro math)
      // Actually let's just use the Pro check
      const n1 = Math.floor(Math.random() * 50) + 50;
      const n2 = Math.floor(Math.random() * 50) + 10;
      const n3 = Math.floor(Math.random() * 20);
      setPuzzle({
        q: `(${n1} + ${n2}) - ${n3} = ?`,
        a: (n1 + n2) - n3
      });
    } else {
      // Free Mode: Riddles or Simple Math
      const isAr = settings?.language === 'ar';
      const riddles = isAr ? RIDDLES_AR : RIDDLES_EN;
      const randomRiddle = riddles[Math.floor(Math.random() * riddles.length)];
      setPuzzle(randomRiddle);
    }
  };

  const checkAnswer = () => {
    if (!puzzle) return;
    const isCorrect = String(answer).toLowerCase().trim() === String(puzzle.a).toLowerCase().trim();
    if (isCorrect) {
      // Turn off alarm in DB
      if (alarm) {
        updateAlarm.mutate({ id: alarm.id, isActive: false });
      }
      onDismiss();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1000);
      setAnswer("");
    }
  };

  const handleSnooze = () => {
    if (settings?.isPro) {
      onSnooze();
    } else {
      setMode("ad");
      let t = 3;
      setAdTimer(t);
      const interval = setInterval(() => {
        t -= 1;
        setAdTimer(t);
        if (t <= 0) {
          clearInterval(interval);
          onSnooze();
        }
      }, 1000);
    }
  };

  if (!alarm) return null;

  const isAr = settings?.language === 'ar';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-md"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {mode === "ring" && (
            <Card className="p-8 text-center border-primary/50 shadow-2xl shadow-primary/20 bg-card/50">
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-24 h-24 rounded-full bg-primary/20 mx-auto mb-6 flex items-center justify-center border-2 border-primary"
              >
                <AlertTriangle className="w-12 h-12 text-primary" />
              </motion.div>
              
              <h2 className="text-4xl font-display font-bold text-foreground mb-2 text-glow">
                {alarm.time}
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                {alarm.label || (isAr ? "استيقظ!" : "Wake Up!")}
              </p>

              <div className="space-y-4">
                <Button 
                  onClick={startPuzzle}
                  className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 rounded-xl"
                >
                  <CheckCircle2 className="w-6 h-6 mr-2" />
                  {isAr ? "إيقاف (حل اللغز)" : "Stop (Solve Puzzle)"}
                </Button>
                
                <Button 
                  onClick={handleSnooze}
                  variant="outline"
                  className="w-full h-12 text-lg border-primary/30 hover:bg-primary/10 text-primary"
                >
                  <Loader2 className="w-5 h-5 mr-2" />
                  {isAr ? "غفوة (5 دقائق)" : "Snooze (5 min)"}
                </Button>
              </div>
            </Card>
          )}

          {mode === "puzzle" && (
            <Card className="p-8 text-center border-primary/50 shadow-2xl bg-card/50">
              <div className="w-16 h-16 rounded-full bg-accent/20 mx-auto mb-6 flex items-center justify-center">
                <Brain className="w-8 h-8 text-accent" />
              </div>
              
              <h3 className="text-2xl font-bold mb-6 text-foreground">
                {isAr ? "حل اللغز لإيقاف المنبه" : "Solve to Dismiss"}
              </h3>
              
              <div className="bg-background/50 p-6 rounded-xl mb-6 border border-border">
                <p className="text-lg font-medium">{puzzle?.q}</p>
              </div>

              <div className="flex gap-2">
                <Input
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder={isAr ? "الإجابة..." : "Answer..."}
                  className={`h-12 text-lg ${error ? "border-destructive ring-destructive" : "border-primary/50"}`}
                  onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
                />
                <Button 
                  onClick={checkAnswer}
                  className="h-12 w-24 bg-primary hover:bg-primary/90 font-bold"
                >
                  {isAr ? "تحقق" : "Check"}
                </Button>
              </div>
              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-destructive mt-4 font-bold"
                >
                  {isAr ? "إجابة خاطئة!" : "Incorrect Answer!"}
                </motion.p>
              )}
            </Card>
          )}

          {mode === "ad" && (
            <Card className="p-8 text-center border-border bg-card/90">
              <div className="flex flex-col items-center py-10">
                <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
                <h3 className="text-xl font-bold mb-2">
                  {isAr ? "جاري تحميل الإعلان..." : "Loading Ad..."}
                </h3>
                <p className="text-muted-foreground">
                  {isAr ? `يرجى الانتظار ${adTimer} ثواني` : `Please wait ${adTimer}s`}
                </p>
              </div>
            </Card>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
