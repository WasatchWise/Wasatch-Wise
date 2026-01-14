'use client';

/**
 * "Labor Illusion" Loading Component
 * 
 * TDD Requirement: Sequential loading messages that make waiting feel valuable
 * Shows: "Analyzing Policy..." → "Checking FERPA Compliance..." → "Generating Report..."
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const LOADING_STAGES = [
  { message: 'Analyzing Policy Compliance...', duration: 2000 },
  { message: 'Checking FERPA Compliance...', duration: 2000 },
  { message: 'Evaluating Safety Protocols...', duration: 2000 },
  { message: 'Assessing Stakeholder Trust...', duration: 2000 },
  { message: 'Generating Risk Assessment...', duration: 2000 },
  { message: 'Preparing Your Report...', duration: 1500 },
];

export function AnalysisLoader() {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentStage >= LOADING_STAGES.length) {
      return;
    }

    const stage = LOADING_STAGES[currentStage];
    const interval = setInterval(() => {
      setProgress((prev) => {
        const increment = 100 / (stage.duration / 50);
        const newProgress = prev + increment;
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 50);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setProgress(0);
      setCurrentStage((prev) => prev + 1);
    }, stage.duration);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [currentStage]);

  const overallProgress = ((currentStage + progress / 100) / LOADING_STAGES.length) * 100;
  const currentMessage = LOADING_STAGES[Math.min(currentStage, LOADING_STAGES.length - 1)]?.message || 'Almost done...';

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Analyzing Your Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-center h-32">
                <div className="relative">
                  {/* Animated spinner */}
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-blue-600 rounded-full opacity-20 animate-pulse" />
                  </div>
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-lg font-medium text-zinc-900">{currentMessage}</p>
                <p className="text-sm text-zinc-500">
                  This usually takes 10-15 seconds
                </p>
              </div>

              <Progress value={overallProgress} className="h-2" />

              <div className="space-y-2 pt-4">
                {LOADING_STAGES.map((stage, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 text-sm transition-opacity ${
                      index < currentStage
                        ? 'opacity-50 text-zinc-400'
                        : index === currentStage
                        ? 'opacity-100 text-blue-600 font-medium'
                        : 'opacity-30 text-zinc-300'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        index < currentStage
                          ? 'bg-green-500'
                          : index === currentStage
                          ? 'bg-blue-600 animate-pulse'
                          : 'bg-zinc-300'
                      }`}
                    />
                    <span>{stage.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
