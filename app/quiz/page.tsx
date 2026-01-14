'use client';

/**
 * Cognitive Audit Quiz - "Mario 1-1" Lead Magnet
 * 
 * TDD Requirement: Multi-step form with URL-based state (Nuqs)
 * "Labor Illusion" loading states
 */

import { useState, useTransition } from 'react';
import { useQueryState, parseAsInteger, parseAsString } from 'nuqs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { submitAudit } from '@/app/actions/submit-audit';
import { AnalysisLoader } from '@/components/quiz/AnalysisLoader';
import { QuizQuestion } from '@/components/quiz/QuizQuestion';

const QUIZ_QUESTIONS = [
  {
    id: 1,
    text: 'Does your district have a board-approved AI use policy?',
    options: ['Yes', 'In Progress', 'No'],
  },
  {
    id: 2,
    text: 'What percentage of teachers use AI tools weekly?',
    options: ['0%', '<25%', '25-50%', '>50%'],
  },
  {
    id: 3,
    text: 'Have you conducted FERPA compliance training for staff using AI?',
    options: ['Yes', 'Planned', 'No'],
  },
  {
    id: 4,
    text: 'Do you have a process for evaluating AI tools before adoption?',
    options: ['Yes, formal process', 'Informal review', 'No process'],
  },
  {
    id: 5,
    text: 'How would you rate parent trust in your district regarding data privacy?',
    options: ['High', 'Moderate', 'Low', 'Unsure'],
  },
  {
    id: 6,
    text: 'Have you experienced any AI-related incidents (data leaks, misuse, etc.)?',
    options: ['No incidents', 'Minor incidents', 'Major incidents'],
  },
  {
    id: 7,
    text: 'Do you have dedicated staff for AI governance?',
    options: ['Yes, full-time', 'Yes, part-time', 'No'],
  },
  {
    id: 8,
    text: 'How confident are teachers in using AI tools responsibly?',
    options: ['Very confident', 'Somewhat confident', 'Not confident'],
  },
  {
    id: 9,
    text: 'Do you track AI tool usage across the district?',
    options: ['Yes, comprehensive tracking', 'Partial tracking', 'No tracking'],
  },
  {
    id: 10,
    text: 'Have you communicated AI policies to parents?',
    options: ['Yes, clearly communicated', 'Somewhat communicated', 'Not communicated'],
  },
];

export default function QuizPage() {
  const [step, setStep] = useQueryState('step', parseAsInteger.withDefault(1));
  const [answers, setAnswers] = useQueryState('answers', {
    defaultValue: '{}',
    parse: (value) => {
      try {
        return JSON.parse(decodeURIComponent(value));
      } catch {
        return {};
      }
    },
    serialize: (value) => encodeURIComponent(JSON.stringify(value)),
  });
  const [email, setEmail] = useQueryState('email', parseAsString.withDefault(''));
  const [organizationName, setOrganizationName] = useQueryState('org', parseAsString.withDefault(''));
  const [role, setRole] = useQueryState('role', parseAsString.withDefault(''));
  
  const [isSubmitting, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentStep = step || 1;
  const totalSteps = QUIZ_QUESTIONS.length + 1; // +1 for info step
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  const currentQuestion = QUIZ_QUESTIONS[currentStep - 1];
  const currentAnswer = answers[currentQuestion?.id.toString()] || '';

  const handleAnswer = (value: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id.toString()]: value,
    });
  };

  const handleNext = () => {
    if (currentStep < QUIZ_QUESTIONS.length) {
      setStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (!email || !organizationName) {
      setError('Please provide your email and organization name');
      return;
    }

    if (Object.keys(answers).length !== QUIZ_QUESTIONS.length) {
      setError('Please answer all questions');
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await submitAudit({
        email,
        organizationName,
        role: role || undefined,
        answers,
      });

      if (result.success) {
        setSubmitted(true);
        // Redirect to results page
        window.location.href = `/quiz/results?auditId=${result.auditId}`;
      } else {
        setError(result.error || 'Failed to submit quiz. Please try again.');
      }
    });
  };

  // Info step (step 0)
  if (currentStep === 1 && !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">AI Readiness Audit</CardTitle>
              <CardDescription className="text-lg">
                Assess your district's AI governance in 3 minutes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <p className="text-zinc-700">
                  This audit evaluates your district's readiness across three critical dimensions:
                </p>
                <ul className="list-disc list-inside space-y-2 text-zinc-600">
                  <li><strong>Compliance:</strong> Policy & governance frameworks</li>
                  <li><strong>Safety:</strong> Usage monitoring & incident response</li>
                  <li><strong>Fluency:</strong> Communication & stakeholder trust</li>
                </ul>
              </div>

              <div className="space-y-4 pt-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-900 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="you@district.org"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-900 mb-2">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Alpine School District"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-900 mb-2">
                    Your Role (Optional)
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="IT Director, Superintendent, etc."
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                  {error}
                </div>
              )}

              <Button
                onClick={() => setStep(2)}
                disabled={!email || !organizationName}
                className="w-full"
              >
                Start Audit
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Submitting state
  if (isSubmitting || submitted) {
    return <AnalysisLoader />;
  }

  // Quiz questions
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-2xl">
                Question {currentStep} of {QUIZ_QUESTIONS.length}
              </CardTitle>
              <span className="text-sm text-zinc-500">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <QuizQuestion
              question={currentQuestion}
              value={currentAnswer}
              onChange={handleAnswer}
            />

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              {currentStep > 1 && (
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  Back
                </Button>
              )}
              {currentStep < QUIZ_QUESTIONS.length ? (
                <Button
                  onClick={handleNext}
                  disabled={!currentAnswer}
                  className="flex-1"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!currentAnswer || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Submitting...' : 'Complete Audit'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
