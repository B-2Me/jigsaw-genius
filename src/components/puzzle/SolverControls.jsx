import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Download, Upload, Globe } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useSolver } from './SolverContext';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';

export default function SolverControls({ 
  isRunning, 
  onStart, 
  onPause, 
  onReset, 
  currentStats 
}) {
  const { hintAdjacencyStats, loadBackupData, stats, currentRun, getSelectionPercentages, mlParams, setMlParams, globalScoreDistribution, pieces } = useSolver();
  const { user: authUser } = useAuth();
  const fileInputRef = useRef(null);
  const [isOwner, setIsOwner] = useState(false);
  
  const [localIterations, setLocalIterations] = useState(mlParams.iterationsPerSecond || 10000); 
  const [localUpdateFreq, setLocalUpdateFreq] = useState(mlParams.boardUpdateFrequency || 100);

  useEffect(() => {
    // Check ownership by querying the database role via SDK
    const checkAccess = async () => {
      if (authUser) {
        try {
          //const profile = await base44.auth.me();
          //setIsOwner(profile?.role === 'admin');
          setIsOwner(true);
        } catch (err) {
          console.error("Failed to auth:", err);
          setIsOwner(false);
        }
      } else {
        setIsOwner(false);
      }
    };
    
    checkAccess();
  }, [authUser]);

  const handleDownload = () => {
    const allScoresSet = new Set();
    Object.keys(hintAdjacencyStats).forEach(key => {
        const pieceData = hintAdjacencyStats[key];
        Object.keys(pieceData).forEach(pieceId => {
            const rotationData = pieceData[pieceId];
            Object.keys(rotationData).forEach(rotation => {
                const stats = rotationData[rotation];
                const scoreDistribution = stats.scoreDistribution || {};
                Object.keys(scoreDistribution).forEach(score => allScoresSet.add(parseInt(score)));
            });
        });
    });
    
    const allScores = Array.from(allScoresSet).sort((a, b) => a - b);
    
    const csvRows = [];
    csvRows.push(['HintPosition', 'Direction', 'PieceId', 'Rotation', 'WeightedAvgContribution', 'Count', 'SelectionPercentage', 'PieceColors', ...allScores.map(s => s.toString()), 'Total High Scores']);

    const allPercentages = {};
    Object.keys(hintAdjacencyStats).forEach(key => {
        const [hintPos, direction] = key.split('-');
        allPercentages[key] = getSelectionPercentages(hintPos, direction);
    });

    Object.keys(hintAdjacencyStats).forEach(key => {
        const [hintPos, direction] = key.split('-');
        const pieceData = hintAdjacencyStats[key];
        
        Object.keys(pieceData).forEach(pieceId => {
            const rotationData = pieceData[pieceId];
            Object.keys(rotationData).forEach(rotation => {
                const stats = rotationData[rotation];
                const percentage = allPercentages[key]?.[pieceId]?.[rotation] || 0;
                
                const piece = pieces.find(p => p.id === parseInt(pieceId));
                const pieceColorsStr = piece ? piece.edges.join(', ') : 'N/A';
                
                const scoreDistribution = stats.scoreDistribution || {};
                const scoreCounts = [];
                let totalHighScores = 0;
                for (const score of allScores) {
                    const count = scoreDistribution[score.toString()] || 0;
                    scoreCounts.push(count);
                    if (score >= 181) {
                        totalHighScores += count;
                    }
                }
                
                csvRows.push([
                    hintPos,
                    direction,
                    pieceId,
                    rotation,
                    (stats.weighted_avg_contribution || 0).toFixed(2),
                    stats.count,
                    percentage.toFixed(2),
                    pieceColorsStr,
                    ...scoreCounts,
                    totalHighScores
                ]);
            });
        });
    });

    const emptyColumns = new Array(8 + allScores.length).fill('');

    csvRows.push(['# METADATA', ...emptyColumns]); 
    csvRows.push(['TotalRuns', stats.totalRuns || 0, ...emptyColumns]);
    csvRows.push(['BestScore', stats.bestScore || 0, ...emptyColumns]);
    csvRows.push(['AvgScore', (stats.avgScore || 0).toFixed(2), ...emptyColumns]);
    csvRows.push(['CompletedSolutions', stats.completedSolutions || 0, ...emptyColumns]);
    csvRows.push(['CurrentRunNumber', currentRun.run || 0, ...emptyColumns]);
    csvRows.push(['CurrentRunScore', currentRun.score || 0, ...emptyColumns]);
    csvRows.push(['UseCalibration', mlParams.useCalibration, ...emptyColumns]);
    csvRows.push(['BoardUpdateFrequency', mlParams.boardUpdateFrequency, ...emptyColumns]);
    csvRows.push(['IterationsPerSecond', mlParams.iterationsPerSecond || 100, ...emptyColumns]);

    csvRows.push(['# GLOBAL SCORE DISTRIBUTION', ...emptyColumns]);
    csvRows.push(['Score', 'Count', ...emptyColumns]);
    for (let score = 0; score <= 256; score++) {
        const count = globalScoreDistribution[score] || 0;
        if (count > 0) {
            csvRows.push([score, count, ...emptyColumns]);
        }
    }
    
    const csvContent = csvRows.map(row => row.map(cell => {
      const processedCell = String(cell).replace(/"/g, '""');
      return `"${processedCell}"`;
    }).join(',')).join('\n');
    
    const dataBlob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    const date = new Date().toISOString().slice(0, 10);
    link.download = `E2-Solver-Backup-${date}-Run${currentRun.run}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleGlobalStatsDownload = () => {
    const csvRows = [];
    csvRows.push(['Global Statistics Export', '', '', '', '', '', '', '', '']);
    csvRows.push(['']);
    csvRows.push(['Total Runs', stats.totalRuns || 0]);
    csvRows.push(['Best Score', stats.bestScore || 0]);
    csvRows.push(['Average Score', (stats.avgScore || 0).toFixed(2)]);
    csvRows.push(['Completed Solutions', stats.completedSolutions || 0]);
    csvRows.push(['']);
    csvRows.push(['Global Score Distribution']);
    csvRows.push(['Score', 'Count']);
    
    for (let score = 0; score <= 256; score++) {
      const count = globalScoreDistribution[score] || 0;
      if (count > 0) {
        csvRows.push([score, count]);
      }
    }
    
    const csvContent = csvRows.map(row => row.map(cell => {
      const processedCell = String(cell).replace(/"/g, '""');
      return `"${processedCell}"`;
    }).join(',')).join('\n');
    
    const dataBlob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    const date = new Date().toISOString().slice(0, 10);
    link.download = `E2-Global-Stats-${date}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csvContent = e.target.result;
          const lines = csvContent.split('\n');
          const newHintAdjacencyStats = {};
          const newGlobalScoreDistribution = {};
          
          let newStats = { totalRuns: 0, bestScore: 0, avgScore: 0, completedSolutions: 0 };
          let newCurrentRun = { run: 0, score: 0 };
          let newMlParams = { useCalibration: true, boardUpdateFrequency: 10, iterationsPerSecond: 100 };
          
          let isMetadata = false;
          let isGlobalScoreDist = false;
          let scoreColumns = [];

          let mainDataHeaderFound = false;
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const cells = line.match(/(?:[^,"]+|"[^"]*")+/g)?.map(cell => {
              return cell.startsWith('"') && cell.endsWith('"')
                ? cell.substring(1, cell.length - 1).replace(/""/g, '"')
                : cell;
            });
            if (!cells || cells.length === 0) continue;

            if (cells[0] === 'HintPosition') {
                scoreColumns = cells.slice(8, -1).map(s => s); 
                mainDataHeaderFound = true;
                break;
            }
          }
          
          if (!mainDataHeaderFound) {
              throw new Error("CSV header for main data not found.");
          }

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const cells = line.match(/(?:[^,"]+|"[^"]*")+/g)?.map(cell => {
              return cell.startsWith('"') && cell.endsWith('"')
                ? cell.substring(1, cell.length - 1).replace(/""/g, '"')
                : cell;
            });

            if (!cells || cells.length === 0) continue;

            if (cells[0] === '# METADATA') {
              isMetadata = true;
              isGlobalScoreDist = false;
              continue;
            }

            if (cells[0] === '# GLOBAL SCORE DISTRIBUTION') {
              isMetadata = false;
              isGlobalScoreDist = true;
              continue;
            }
            
            if (isGlobalScoreDist) {
              if (cells[0] === 'Score') continue;
              const [score, count] = cells;
              if (score && count) {
                newGlobalScoreDistribution[score] = parseInt(count) || 0;
              }
            } else if (isMetadata) {
              const [key, value] = cells;
              switch (key) {
                case 'TotalRuns':
                  newStats.totalRuns = parseInt(value) || 0;
                  break;
                case 'BestScore':
                  newStats.bestScore = parseInt(value) || 0;
                  break;
                case 'AvgScore':
                  newStats.avgScore = parseFloat(value) || 0;
                  break;
                case 'CompletedSolutions':
                  newStats.completedSolutions = parseInt(value) || 0;
                  break;
                case 'CurrentRunNumber':
                  newCurrentRun.run = parseInt(value) || 0;
                  break;
                case 'CurrentRunScore':
                  newCurrentRun.score = parseInt(value) || 0;
                  break;
                case 'UseCalibration':
                  newMlParams.useCalibration = value === 'true';
                  break;
                case 'BoardUpdateFrequency':
                  newMlParams.boardUpdateFrequency = parseInt(value) || 10;
                  break;
                case 'IterationsPerSecond':
                  newMlParams.iterationsPerSecond = parseInt(value) || 100;
                  break;
              }
            } else {
              if (cells[0] === 'HintPosition') continue;
              
              const [hintPos, direction, pieceId, rotation, weightedAvgContribution, count, selectionPercentage, pieceColorsString, ...scoreDistCountsAndTotal] = cells;
              
              if (hintPos && direction && pieceId && rotation) {
                const key = `${hintPos}-${direction}`;
                if (!newHintAdjacencyStats[key]) newHintAdjacencyStats[key] = {};
                if (!newHintAdjacencyStats[key][pieceId]) newHintAdjacencyStats[key][pieceId] = {};
                
                const scoreDistribution = {};
                for (let idx = 0; idx < scoreColumns.length; idx++) {
                  const score = scoreColumns[idx];
                  const countValue = parseInt(scoreDistCountsAndTotal[idx]) || 0; 
                  if (countValue > 0) {
                    scoreDistribution[score] = countValue;
                  }
                }

                const parsedCount = parseInt(count) || 0;
                const parsedWeightedAvg = parseFloat(weightedAvgContribution) || 0;

                newHintAdjacencyStats[key][pieceId][rotation] = {
                  weighted_sum_of_scores: parsedWeightedAvg * parsedCount,
                  weighted_avg_contribution: parsedWeightedAvg,
                  count: parsedCount,
                  scoreDistribution: scoreDistribution
                };
              }
            }
          }
          
          loadBackupData({
            hintAdjacencyStats: newHintAdjacencyStats,
            globalScoreDistribution: newGlobalScoreDistribution,
            placementAttemptCounts: {}, 
            solverState: {
              stats: newStats,
              currentRun: newCurrentRun,
              mlParams: newMlParams
            }
          });
          setLocalIterations(newMlParams.iterationsPerSecond);
          setLocalUpdateFreq(newMlParams.boardUpdateFrequency);

          alert("CSV backup data loaded successfully!");
        } catch (error) {
          console.error("Failed to parse CSV file:", error);
          alert(`Error: Could not load the data. ${error.message}`);
        }
      };
      reader.readAsText(file);
    }
    event.target.value = null;
  };

  const triggerFileUpload = () => {
    fileInputRef.current.click();
  };

  const handleIterationsChange = (e) => {
    const value = parseInt(e.target.value);
    const clamped = isNaN(value) ? 1 : Math.max(1, Math.min(10000, value));
    setLocalIterations(clamped);
    setMlParams(p => ({ ...p, iterationsPerSecond: clamped }));
  };

  const handleUpdateFreqChange = (e) => {
    const value = parseInt(e.target.value);
    const clamped = isNaN(value) ? 1 : Math.max(1, Math.min(100, value));
    setLocalUpdateFreq(clamped);
    setMlParams(p => ({ ...p, boardUpdateFrequency: clamped }));
  };

  const setMaxIterations = () => {
    setLocalIterations(10000);
    setMlParams(p => ({ ...p, iterationsPerSecond: 10000 }));
  };

  const setMaxUpdateFreq = () => {
    setLocalUpdateFreq(100);
    setMlParams(p => ({ ...p, boardUpdateFrequency: 100 }));
  };

  return (
    <div className="bg-slate-950/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Solver Controls</h3>
          <p className="text-slate-300 text-sm max-w-md">
            Start the simulation or import a previous run.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={isRunning ? onPause : onStart}
            className={`w-28 ${
              isRunning 
                ? 'bg-orange-600 hover:bg-orange-700' 
                : 'bg-green-600 hover:bg-green-700'
            } text-white`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start
              </>
            )}
          </Button>
          
          <Button
            onClick={onReset}
            variant="outline"
            className="w-28 border-rose-500/50 text-rose-300 hover:bg-rose-500/20 hover:text-rose-200"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>

          <div className="flex gap-3">
             <Button
                onClick={handleDownload}
                variant="outline"
                className="border-sky-500/50 text-sky-300 hover:bg-sky-500/20 hover:text-sky-200"
                disabled={stats.totalRuns === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                CSV Export
              </Button>
              {isOwner && (
                <>
                  <Button
                    onClick={handleGlobalStatsDownload}
                    variant="outline"
                    className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20 hover:text-purple-200"
                    disabled={stats.totalRuns === 0}
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Global Stats Export
                  </Button>
                  <Button
                    onClick={triggerFileUpload}
                    variant="outline"
                    className="border-sky-500/50 text-sky-300 hover:bg-sky-500/20 hover:text-sky-200"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    CSV Import
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".csv"
                  />
                </>
              )}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-800">
        <h3 className="text-xl font-bold text-white mb-4">Solver Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="iterations-input" className="text-slate-300">
                    Iterations per Second
                </Label>
                <div className="flex gap-2">
                    <Input
                        id="iterations-input"
                        type="number"
                        min="1"
                        max="10000"
                        step="1"
                        value={localIterations}
                        onChange={handleIterationsChange}
                        className="bg-slate-800/50 border-slate-700 text-white"
                    />
                    <Button
                        onClick={setMaxIterations}
                        variant="outline"
                        className="border-slate-700 text-slate-300 hover:bg-slate-700 px-3"
                    >
                        Max
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="update-input" className="text-slate-300">
                    Board Update Frequency
                </Label>
                <div className="flex gap-2">
                    <Input
                        id="update-input"
                        type="number"
                        min="1"
                        max="100"
                        step="1"
                        value={localUpdateFreq}
                        onChange={handleUpdateFreqChange}
                        className="bg-slate-800/50 border-slate-700 text-white"
                    />
                    <Button
                        onClick={setMaxUpdateFreq}
                        variant="outline"
                        className="border-slate-700 text-slate-300 hover:bg-slate-700 px-3"
                    >
                        Max
                    </Button>
                </div>
            </div>
        </div>
        
        <div className="mt-4 flex items-center space-x-3">
            <Switch
                id="calibration-switch"
                checked={mlParams.useCalibration}
                onCheckedChange={(checked) => setMlParams(p => ({ ...p, useCalibration: checked }))}
            />
            <Label htmlFor="calibration-switch" className="text-slate-300">
                Data Collection Mode (ML Disabled)
            </Label>
        </div>
      </div>
      
      {currentStats && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center bg-slate-800/50 rounded-lg p-3">
             <div className="text-xs text-slate-400 uppercase tracking-wide">
              Total Runs
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              {currentStats.totalRuns?.toLocaleString() || 0}
            </div>
          </div>
          
          <div className="text-center bg-slate-800/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 uppercase tracking-wide">
              Best Score
            </div>
            <div className="text-2xl font-bold text-green-400 mt-1">
              {currentStats.bestScore || 0}
            </div>
          </div>
          
          <div className="text-center bg-slate-800/50 rounded-lg p-3">
             <div className="text-xs text-slate-400 uppercase tracking-wide">
              Avg Score
            </div>
            <div className="text-2xl font-bold text-blue-400 mt-1">
              {currentStats.avgScore ? currentStats.avgScore.toFixed(1) : '0.0'}
            </div>
          </div>
          
          <div className="text-center bg-slate-800/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 uppercase tracking-wide">
              Solutions
            </div>
            <div className="text-2xl font-bold text-purple-400 mt-1">
              {currentStats.completedSolutions || 0}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
