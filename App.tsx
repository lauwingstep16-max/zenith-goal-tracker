/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Dumbbell, 
  Music, 
  Mic, 
  Plus, 
  Camera, 
  X, 
  Save,
  ChevronRight,
  BookOpen,
  Code,
  Coffee,
  Heart,
  Target,
  Circle,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Goal {
  id: string;
  header: string;
  activity: string;
  current: number;
  dailyTarget: number;
  totalDuration: number; // in days
  startDate: string; // ISO string
}

const INITIAL_GOALS: Goal[] = [
  {
    id: 'exercise',
    header: '一嚮',
    activity: 'EXERCISE',
    current: 0,
    dailyTarget: 30,
    totalDuration: 30,
    startDate: new Date().toISOString(),
  },
  {
    id: 'piano',
    header: '一往',
    activity: 'PIANO',
    current: 0,
    dailyTarget: 30,
    totalDuration: 30,
    startDate: new Date().toISOString(),
  },
  {
    id: 'speech',
    header: '一貫',
    activity: 'SPEECH',
    current: 0,
    dailyTarget: 15,
    totalDuration: 30,
    startDate: new Date().toISOString(),
  },
];

const getIconByHeader = (header: string) => {
  if (header === '一嚮') return <Dumbbell className="w-5 h-5" />;
  if (header === '一往') return <Music className="w-5 h-5" />;
  if (header === '一貫') return <Mic className="w-5 h-5" />;
  return <Target className="w-5 h-5" />;
};

const ProgressRing = ({ percentage, color }: { percentage: number; color: string }) => {
  const radius = 30;
  const stroke = 4;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  return (
    <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
      <circle
        stroke="white"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        opacity={0.3}
      />
      <motion.circle
        stroke={color}
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={circumference + ' ' + circumference}
        style={{ strokeDashoffset }}
        strokeLinecap="round"
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </svg>
  );
};

export default function App() {
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('zenith_goals');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_GOALS;
      }
    }
    return INITIAL_GOALS;
  });

  const [bgImage, setBgImage] = useState(() => {
    const saved = localStorage.getItem('zenith_bg');
    const oldDefault = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1920';
    const newDefault = 'https://images.unsplash.com/photo-1471506480208-91b3a4cc78be?auto=format&fit=crop&q=80&w=1920';
    
    if (!saved || saved === oldDefault) {
      return newDefault;
    }
    return saved;
  });
  const [showCards, setShowCards] = useState(true);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [fabStep, setFabStep] = useState<'select' | 'add'>('select');
  const [selectedGoalIndex, setSelectedGoalIndex] = useState<number | null>(null);
  const [addTimeValue, setAddTimeValue] = useState(30);
  const [editingGoalIndex, setEditingGoalIndex] = useState<number | null>(null);
  const [draftGoal, setDraftGoal] = useState<Goal | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingGoalIndex !== null) {
      setDraftGoal({ ...goals[editingGoalIndex] });
    } else {
      setDraftGoal(null);
    }
  }, [editingGoalIndex, goals]);

  useEffect(() => {
    localStorage.setItem('zenith_goals', JSON.stringify(goals));
  }, [goals]);

  const getProgressColor = (goal: Goal) => {
    const start = new Date(goal.startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const daysElapsed = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const expectedProgress = goal.dailyTarget * daysElapsed;
    
    if (goal.current < expectedProgress * 0.8) return '#ef4444'; // Red
    if (goal.current < expectedProgress * 1.1) return '#facc15'; // Yellow
    return '#22c55e'; // Green
  };

  const handleAddTime = () => {
    if (selectedGoalIndex !== null) {
      const newGoals = [...goals];
      newGoals[selectedGoalIndex].current += addTimeValue;
      setGoals(newGoals);
      setIsFabOpen(false);
      setFabStep('select');
      setSelectedGoalIndex(null);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGoalIndex !== null && draftGoal) {
      const newGoals = [...goals];
      newGoals[editingGoalIndex] = { ...draftGoal };
      setGoals(newGoals);
      setEditingGoalIndex(null);
    }
  };

  const handleBgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const result = event.target.result as string;
          setBgImage(result);
          localStorage.setItem('zenith_bg', result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div 
      className="relative h-screen w-full overflow-hidden flex flex-col font-sans text-white"
      style={{ 
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center bottom',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Bottom Bar / Camera & Flip Icons */}
      <div className="absolute bottom-6 left-6 z-10 flex items-center gap-3">
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-colors"
          title="Change Background"
        >
          <Camera className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setShowCards(!showCards)}
          className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-colors"
          title={showCards ? "Hide Cards" : "Show Cards"}
        >
          {showCards ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleBgChange} 
          className="hidden" 
          accept="image/*"
        />
      </div>

      {/* Main Content: Vertical Stack */}
      <div className="flex-1 flex flex-col items-center pt-10 px-4">
        {/* Top Cards Row */}
        <AnimatePresence>
          {showCards && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full flex justify-between items-start max-w-md gap-2"
            >
              {goals.map((goal, index) => {
                const color = getProgressColor(goal);
                const totalGoal = goal.dailyTarget * goal.totalDuration;
                const percentage = totalGoal > 0 ? (goal.current / totalGoal) * 100 : 0;

                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.8, ease: "easeOut" }}
                    onClick={() => setEditingGoalIndex(index)}
                    className="relative w-[32%] aspect-[3/4] bg-white/5 backdrop-blur-[10px] rounded-[20px] border border-white/10 flex flex-col items-center justify-between py-4 px-2 cursor-pointer hover:bg-white/15 transition-all shadow-2xl group"
                  >
                    <div className="text-center w-full">
                      <h3 className="text-base font-medium tracking-[0.3em] opacity-90 mb-2 uppercase">{goal.header}</h3>
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="opacity-90 group-hover:scale-110 transition-transform duration-300">
                          {getIconByHeader(goal.header)}
                        </div>
                        <span className="text-[9px] font-bold tracking-[0.1em] opacity-90">{goal.activity}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center w-full">
                      <div className="relative">
                        <ProgressRing percentage={percentage} color={color} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[7px] font-bold opacity-90">{Math.round(percentage)}%</span>
                        </div>
                      </div>
                      <div className="mt-2 text-center">
                        <span className="text-[9px] font-medium block">{goal.current}/{goal.dailyTarget} min</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Quote */}
      <div className="pb-[136px] text-center">
        <p className="text-2xl font-bold tracking-[0.3em] opacity-90 drop-shadow-md font-songti">
          一路向前，一步一生。
        </p>
      </div>

      {/* FAB */}
      <div className="absolute bottom-8 right-8 z-20">
        <AnimatePresence>
          {isFabOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="absolute bottom-16 right-0 w-40 bg-yellow-400 rounded-2xl p-2.5 text-black shadow-2xl border border-yellow-500/50"
            >
              {fabStep === 'select' ? (
                <div className="space-y-1">
                  {goals.map((goal, i) => (
                    <button
                      key={goal.id}
                      onClick={() => {
                        setSelectedGoalIndex(i);
                        setFabStep('add');
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-black/5 transition-colors group text-left"
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-black/10 rounded-lg group-hover:bg-black/20 transition-colors">
                          {React.cloneElement(getIconByHeader(goal.header) as React.ReactElement, { className: 'w-3.5 h-3.5 text-black' })}
                        </div>
                        <span className="text-xs font-bold">{goal.activity}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-black/40" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <button onClick={() => setFabStep('select')} className="text-[10px] font-bold text-black/60 hover:text-black">Back</button>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-black">
                      {goals[selectedGoalIndex!].activity}
                    </h4>
                    <div className="w-6" />
                  </div>
                  
                  <div className="text-center">
                    <span className="text-3xl font-black text-black">{addTimeValue}</span>
                    <span className="text-xs text-black/60 ml-1">min</span>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="120"
                    value={addTimeValue}
                    onChange={(e) => setAddTimeValue(parseInt(e.target.value))}
                    className="w-full h-2 bg-black/20 rounded-lg appearance-none cursor-pointer accent-black"
                  />

                  <button
                    onClick={handleAddTime}
                    className="w-full py-2 bg-black text-yellow-400 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-95"
                  >
                    加一點
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => {
            setIsFabOpen(!isFabOpen);
            if (!isFabOpen) {
              setFabStep('select');
              setSelectedGoalIndex(null);
            }
          }}
          className={`p-4 rounded-full shadow-2xl transition-all active:scale-90 ${
            isFabOpen ? 'bg-white text-black rotate-45' : 'bg-yellow-400 text-black'
          }`}
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Slide-Up Overlay for Editing */}
      <AnimatePresence>
        {editingGoalIndex !== null && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingGoalIndex(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm z-30"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 bg-[#f86b1d] rounded-t-[32px] p-8 z-40 text-white"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black uppercase tracking-tight">Edit Goal</h2>
                <button 
                  onClick={() => setEditingGoalIndex(null)}
                  className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/70">Activity Name</label>
                  <input
                    type="text"
                    value={draftGoal?.activity || ''}
                    onChange={(e) => {
                      if (draftGoal) setDraftGoal({ ...draftGoal, activity: e.target.value });
                    }}
                    className="w-full p-4 bg-white/20 rounded-2xl border-none focus:ring-2 focus:ring-white transition-all text-white font-bold placeholder:text-white/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-white/70">Daily Target (min)</label>
                    <input
                      type="number"
                      value={draftGoal?.dailyTarget || 0}
                      onChange={(e) => {
                        if (draftGoal) setDraftGoal({ ...draftGoal, dailyTarget: parseInt(e.target.value) || 0 });
                      }}
                      className="w-full p-4 bg-white/20 rounded-2xl border-none focus:ring-2 focus:ring-white transition-all text-white font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-white/70">Total Duration (days)</label>
                    <input
                      type="number"
                      value={draftGoal?.totalDuration || 0}
                      onChange={(e) => {
                        if (draftGoal) setDraftGoal({ ...draftGoal, totalDuration: parseInt(e.target.value) || 0 });
                      }}
                      className="w-full p-4 bg-white/20 rounded-2xl border-none focus:ring-2 focus:ring-white transition-all text-white font-bold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-white text-[#f86b1d] rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

