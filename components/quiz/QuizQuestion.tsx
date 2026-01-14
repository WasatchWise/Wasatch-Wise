'use client';

import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface QuizQuestionProps {
  question: {
    id: number;
    text: string;
    options: string[];
  };
  value: string;
  onChange: (value: string) => void;
}

export function QuizQuestion({ question, value, onChange }: QuizQuestionProps) {
  return (
    <Card className="border-zinc-200">
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold text-zinc-900 mb-6">
          {question.text}
        </h3>
        <RadioGroup value={value} onValueChange={onChange}>
          <div className="space-y-3">
            {question.options.map((option) => (
              <div
                key={option}
                className="flex items-center space-x-3 p-3 rounded-lg border border-zinc-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors cursor-pointer"
                onClick={() => onChange(option)}
              >
                <RadioGroupItem value={option} id={option} />
                <Label
                  htmlFor={option}
                  className="flex-1 cursor-pointer text-zinc-700 font-normal"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
