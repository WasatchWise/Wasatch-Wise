'use client';

import { useState, useEffect } from 'react';
import { submitQuiz } from '@/app/actions/quiz';
import { Button } from '@/components/shared/Button';
import { Form, FormField, Input } from '@/components/shared/Form';

// Set page title for accessibility
if (typeof document !== 'undefined') {
  document.title = 'AI Readiness Quiz | Ask Before You App';
}

const QUESTIONS = [
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
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [email, setEmail] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');

  // Persist quiz state to localStorage for interruption recovery
  useEffect(() => {
    const savedState = localStorage.getItem('quiz-state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setStep(parsed.step || 0);
        setAnswers(parsed.answers || {});
      } catch (e) {
        // Invalid saved state, ignore
      }
    }
  }, []);

  useEffect(() => {
    // Save state on every change
    localStorage.setItem('quiz-state', JSON.stringify({ step, answers }));
  }, [step, answers]);

  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));

    // Advance to the next step (including showing the email form after Q10)
    const currentIndex = QUESTIONS.findIndex((q) => q.id === questionId);
    setStep((prev) => {
      const nextStep = currentIndex >= 0 ? currentIndex + 1 : prev + 1;
      return Math.min(nextStep, QUESTIONS.length);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await submitQuiz({
        email,
        organizationName,
        role,
        answers,
      });

      if (result.success) {
        setResults(result);
        // Clear saved state on successful submission
        localStorage.removeItem('quiz-state');
      } else {
        setError(result.error || 'Failed to submit quiz');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (results) {
    const tierColors = {
      red: 'text-red-600 bg-red-50',
      yellow: 'text-yellow-600 bg-yellow-50',
      green: 'text-green-600 bg-green-50',
    };

    return (
      <main className="min-h-screen bg-gray-50 py-12" role="main">
        <div className="max-w-3xl mx-auto px-6">
          <article className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-4xl font-bold mb-4">Your AI Readiness Snapshot</h1>
            <div
              className={`text-6xl font-bold mb-6 p-8 rounded-lg text-center ${tierColors[results.tier as keyof typeof tierColors]}`}
            >
              {results.overall_score}/100
            </div>
            <div className="prose max-w-none mb-8">
              <p className="text-lg text-gray-700 whitespace-pre-wrap">
                {results.message}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              {results.tier === 'red' ? (
                <Button href="/contact" variant="primary" size="lg">
                  Book Your Cognitive Audit
                </Button>
              ) : (
                <Button href="/resources/downloads" variant="primary" size="lg">
                  Download Full Report
                </Button>
              )}
              <Button href="/tools/ai-readiness-quiz" variant="outline" size="lg">
                Retake Quiz
              </Button>
            </div>
          </article>
        </div>
      </main>
    );
  }

  if (step === QUESTIONS.length) {
    return (
      <main className="min-h-screen bg-gray-50 py-12" role="main">
        <div className="max-w-2xl mx-auto px-6">
          <article className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-2">Get Your Results</h1>
            <p className="text-gray-600 mb-6">
              We’ll send a snapshot of your policy gaps, shadow AI exposure, and training
              depth.
            </p>
            <Form onSubmit={handleSubmit}>
              <FormField label="Email Address" error={error}>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                />
              </FormField>
              <FormField label="Organization Name (Optional)">
                <Input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="Your School District"
                />
              </FormField>
              <FormField label="Your Role (Optional)">
                <Input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Superintendent, IT Director, etc."
                />
              </FormField>
              <Button type="submit" variant="primary" size="lg" disabled={loading}>
                {loading ? 'Calculating...' : 'Get My Results'}
              </Button>
            </Form>
          </article>
        </div>
      </main>
    );
  }

  const currentQuestion = QUESTIONS[step];
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  return (
    <main className="min-h-screen bg-gray-50 py-12" role="main">
      <div className="max-w-3xl mx-auto px-6">
        <article className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <p className="text-sm uppercase tracking-wider text-orange-500 font-semibold mb-2">
              AI Readiness Quiz
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Map your policy and training gaps in minutes
            </h1>
            <p className="text-gray-600 mb-6">
              Designed for district leaders navigating shadow AI, teacher skepticism, and
              parent trust.
            </p>
          </div>
          <div className="mb-6" data-testid="quiz-progress">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Question {step + 1} of {QUESTIONS.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div 
              className="w-full bg-gray-200 rounded-full h-2"
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Quiz progress: ${Math.round(progress)}%`}
            >
              <div
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
                data-progress={Math.round(progress)}
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-8">{currentQuestion.text}</h1>
          <div className="space-y-4">
            {currentQuestion.options.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(currentQuestion.id, option)}
                className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all"
              >
                {option}
              </button>
            ))}
          </div>
        </article>
      </div>
    </main>
  );
}

