'use client';

import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface QuizQuestionProps {
  question: {
    id: number;
    text: string;
    subtext?: string;
    options: Array<{
      value: string;
      label: string;
      narrative?: string;
    }>;
  };
  value: string;
  onChange: (value: string) => void;
}

export function QuizQuestion({ question, value, onChange }: QuizQuestionProps) {
  return (
    <Card className="border-zinc-200">
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold text-zinc-900">
          {question.text}
        </h3>
        {question.subtext && (
          <p className="mt-2 text-sm text-zinc-600">{question.subtext}</p>
        )}
        <RadioGroup value={value} onValueChange={onChange}>
          <div className="space-y-3">
            {question.options.map((option) => {
              const optionId = `${question.id}-${option.value}`;
              return (
              <div
                key={optionId}
                className="flex items-center space-x-3 p-3 rounded-lg border border-zinc-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors cursor-pointer"
                onClick={() => onChange(option.value)}
              >
                <RadioGroupItem value={option.value} id={optionId} />
                <Label
                  htmlFor={optionId}
                  className="flex-1 cursor-pointer text-zinc-700 font-normal"
                >
                  <div className="text-sm font-medium text-zinc-800">
                    {option.label}
                  </div>
                  {option.narrative && (
                    <div className="text-xs text-zinc-500 mt-1">
                      {option.narrative}
                    </div>
                  )}
                </Label>
              </div>
            );
            })}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
