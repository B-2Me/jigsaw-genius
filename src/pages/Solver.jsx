import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { supabase } from "@/lib/supabase-client"; // Required for real-time subscription
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Info, Eye, TrendingUp } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSolver } from "../components/puzzle/SolverContext";
import { useAuth } from "@/lib/AuthContext";

import PuzzleBoard from "../components/puzzle/PuzzleBoard";
import SolverControls from "../components/puzzle/SolverControls";
import HintAnalysis from "../components/puzzle/HintAnalysis";

export default function SolverPage() {
  const {
    board, isRunning, currentRun, stats, hints, mlParams,
    handleStart, handlePause, handleReset,
    hintAdjacencyStats, pieces,
    onlineCount // 1. From Context (Presence)
  } = useSolver();

  const { user: authUser } = useAuth();
  const queryClient = useQueryClient();
  
  // State for real-time Global Runs
  const [globalRuns, setGlobalRuns] = useState(0);

  // --- 1. Total Visits Logic (Keep this!) ---
  const { data: pageViews } = useQuery({
    queryKey: ['pageViews'],
    queryFn: () => base44.entities.PageView.list(),
    initialData: [],
  });

  const recordVisitMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.PageView.create({
        page_name: "Solver",
        visitor_email: authUser?.email || "anonymous"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pageViews'] });
    },
  });

  useEffect(() => {
    // Record visit on mount
    recordVisitMutation.mutate();
  }, []);
  // ------------------------------------------


  // --- 2. Global Runs Real-time Logic (New) ---
  useEffect(() => {
    // A. Fetch initial value once
    const fetchInitialGlobalRuns = async () => {
      const { data, error } = await supabase
        .from('global_stats')
        .select('stat_value')
        .eq('stat_name', 'total_global_runs')
        .single();
      
      if (data && !error) {
        setGlobalRuns(data.stat_value);
      }
    };
    fetchInitialGlobalRuns();

    // B. Subscribe to live changes
    const subscription = supabase
      .channel('global-stats-live')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'global_stats' }, 
        (payload) => {
          if (payload.new.stat_name === 'total_global_runs') {
            setGlobalRuns(payload.new.stat_value);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);
  // --------------------------------------------

  const alertDescription = mlParams.useCalibration
    ? `Data collection mode is active. The solver uses uniform random selection to gather comprehensive statistics. When disabled, the solver will use rarity-weighted ML to prioritize pieces based on their historical performance.`
    : `Machine learning mode is active. The solver uses rarity-weighted scoring to select pieces based on their historical performance. Selection probabilities are shown for each optimal piece/rotation.`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Eternity II Puzzle Solver
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            A non-backtracking statistical solver with dynamic rarity-based learning. Customize iteration speed and board update frequency for optimal performance.
          </p>
        </div>

        {/* Stats Display */}
        <div className="flex justify-center gap-6 flex-wrap">
          {/* Total Visits Card */}
          <div className="bg-slate-950/50 rounded-lg px-6 py-3 border border-slate-800 backdrop-blur-sm">
            <div className="flex items-center gap-3 h-full">
              <Eye className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-400 leading-none">Total Visits:</span>
              <span className="text-lg font-bold text-white leading-none">
                {pageViews.length.toLocaleString()}
              </span>
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-700">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-green-400 font-medium leading-none">
                  {onlineCount} Online
                </span>
              </div>
            </div>
          </div>

          {/* Global Runs Card (Real-time) */}
          <div className="bg-slate-950/50 rounded-lg px-6 py-3 border border-slate-800 backdrop-blur-sm">
            <div className="flex flex-col items-center justify-center h-full">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-400 leading-none">Total Global Runs:</span>
                <span className="text-lg font-bold text-white leading-none">
                  {globalRuns.toLocaleString()}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 tracking-wider">
              <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Updates every 10 seconds
              </div>
              </span>
            </div>
          </div>
        </div>

        <SolverControls
          isRunning={isRunning}
          onStart={handleStart}
          onPause={handlePause}
          onReset={handleReset}
          currentStats={stats}
        />

        <PuzzleBoard
          board={board}
          hints={hints}
          currentRun={currentRun}
          isRunning={isRunning}
        />

        {stats.completedSolutions > 0 && (
          <Alert className="bg-green-900/20 border-green-500/30 text-green-100">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              🎉 Congratulations! Found {stats.completedSolutions} complete solution{stats.completedSolutions > 1 ? 's' : ''}!
            </AlertDescription>
          </Alert>
        )}

        <HintAnalysis hintAdjacencyStats={hintAdjacencyStats} pieces={pieces} />

      </div>
    </div>
  );
}
