import React, { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Info, Eye, TrendingUp } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSolver } from "../components/puzzle/SolverContext";
import { useAuth } from "@/lib/AuthContext";

import PuzzleBoard from "../components/puzzle/PuzzleBoard";
import SolverControls from "../components/puzzle/SolverControls";
import HintAnalysis from "../components/puzzle/HintAnalysis";
import DebugPanel from "../components/puzzle/DebugPanel";

export default function SolverPage() {
  const {
    board, isRunning, currentRun, stats, hints, mlParams,
    handleStart, handlePause, handleReset,
    hintAdjacencyStats, pieces
  } = useSolver();

  const { user: authUser, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Track page view - Using singular PageView entity as expected by SDK
  const { data: pageViews } = useQuery({
    queryKey: ['pageViews'],
    queryFn: () => base44.entities.PageView.list(),
    initialData: [],
  });

  // Get global runs count - Using plural GlobalStats entity as expected by SDK
  const { data: globalStats } = useQuery({
    queryKey: ['globalStats'],
    queryFn: () => base44.entities.GlobalStats.list(),
    initialData: [],
  });

  const recordVisitMutation = useMutation({
    mutationFn: async () => {
      // Use the pre-existing authUser from context instead of re-calling the API 
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
    // Only record the visit once auth state is determined
    recordVisitMutation.mutate();
  }, []);

  // Calculate online visitors (visited in last 5 minutes)
  const onlineVisitors = pageViews.filter(view => {
    const viewTime = new Date(view.created_at);
    const now = new Date();
    const diffMinutes = (now - viewTime) / (1000 * 60);
    return diffMinutes <= 5;
  }).length;

  // Get total global runs
  const globalRunsStat = globalStats.find(stat => stat.stat_name === 'total_global_runs');
  const totalGlobalRuns = globalRunsStat?.stat_value || 0;

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
                  {onlineVisitors} Online
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/50 rounded-lg px-6 py-3 border border-slate-800 backdrop-blur-sm">
            <div className="flex flex-col items-center justify-center h-full">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-400 leading-none">Total Global Runs:</span>
                <span className="text-lg font-bold text-white leading-none">
                  {totalGlobalRuns.toLocaleString()}
                </span>
              </div>
              <span className="text-xs text-slate-500 mt-1">updates every 10 seconds</span>
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
        
        <Alert className="bg-blue-900/20 border-blue-500/30 text-blue-200">
            <Info className="h-4 w-4 text-blue-400" />
            <AlertTitle>Current Placement Strategy</AlertTitle>
            <AlertDescription>
              {alertDescription}
            </AlertDescription>
        </Alert>

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
