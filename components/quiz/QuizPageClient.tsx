"use client";

/**
 * Cognitive Audit Quiz - "Mario 1-1" Lead Magnet
 *
 * TDD Requirement: Multi-step form with URL-based state (Nuqs)
 * "Labor Illusion" loading states
 */

import { useState, useTransition } from "react";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { submitAudit } from "@/app/actions/submit-audit";
import { AnalysisLoader } from "@/components/quiz/AnalysisLoader";
import { QuizQuestion } from "@/components/quiz/QuizQuestion";

const QUIZ_QUESTIONS = [
  {
    id: 1,
    text: "Does your district have a board-approved AI use policy?",
    subtext: "AI tools are already in classrooms—policy is the safe harbor.",
    options: [
      {
        value: "No",
        label: "No policy exists",
        narrative: "Most districts are here; shadow AI tends to thrive in this gap.",
      },
      {
        value: "In Progress",
        label: "Draft exists, not approved",
        narrative: "Great start—approval is the moment policy becomes protection.",
      },
      {
        value: "Yes",
        label: "Approved policy in place",
        narrative: "Strong foundation. You can now align training and tool vetting.",
      },
    ],
  },
  {
    id: 2,
    text: "What percentage of teachers use AI tools weekly?",
    subtext: "Adoption is rising quickly—visibility matters more than perfection.",
    options: [
      { value: "0%", label: "0%", narrative: "Low adoption now, but growth is inevitable." },
      { value: "<25%", label: "<25%", narrative: "Early adoption often happens below the radar." },
      { value: "25-50%", label: "25-50%", narrative: "Shadow AI is likely already operational." },
      { value: ">50%", label: ">50%", narrative: "You need a formal governance + training track now." },
    ],
  },
  {
    id: 3,
    text: "Have you conducted FERPA compliance training for staff using AI?",
    subtext: "Teachers want to move fast, but they need guardrails.",
    options: [
      { value: "No", label: "No", narrative: "This is the #1 driver of hidden risk." },
      { value: "Planned", label: "Planned", narrative: "Good intent—formalize it and track completion." },
      { value: "Yes", label: "Yes", narrative: "Excellent. Now reinforce with tool-specific guidance." },
    ],
  },
  {
    id: 4,
    text: "Do you have a process for evaluating AI tools before adoption?",
    subtext: "Tool vetting is where policy meets real classroom use.",
    options: [
      {
        value: "No process",
        label: "No process",
        narrative: "Shadow AI fills the vacuum when process is missing.",
      },
      {
        value: "Informal review",
        label: "Informal review",
        narrative: "Informal reviews lead to inconsistency across schools.",
      },
      {
        value: "Yes, formal process",
        label: "Yes, formal process",
        narrative: "Strong. Now standardize across departments.",
      },
    ],
  },
  {
    id: 5,
    text: "How would you rate parent trust in your district regarding data privacy?",
    subtext: "Trust rises when families understand what’s being used and why.",
    options: [
      { value: "Low", label: "Low", narrative: "This is where transparency becomes essential." },
      { value: "Unsure", label: "Unsure", narrative: "Uncertainty is a signal—communication can reset trust." },
      { value: "Moderate", label: "Moderate", narrative: "You’re close. A clear AI story goes far." },
      { value: "High", label: "High", narrative: "Strong asset. Keep it with ongoing disclosure." },
    ],
  },
  {
    id: 6,
    text: "Have you experienced any AI-related incidents (data leaks, misuse, etc.)?",
    subtext: "Incidents are often unreported; readiness is the differentiator.",
    options: [
      { value: "Major incidents", label: "Major incidents", narrative: "You need immediate containment and a reset plan." },
      { value: "Minor incidents", label: "Minor incidents", narrative: "Early warning. Formalize policy and response now." },
      { value: "No incidents", label: "No incidents", narrative: "Great—protect that with training and monitoring." },
    ],
  },
  {
    id: 7,
    text: "Do you have dedicated staff for AI governance?",
    subtext: "Ownership determines whether policy sticks or stalls.",
    options: [
      { value: "No", label: "No", narrative: "This often creates a leadership/teacher mismatch." },
      { value: "Yes, part-time", label: "Yes, part-time", narrative: "A good start, but authority and time matter." },
      { value: "Yes, full-time", label: "Yes, full-time", narrative: "Strong signal to your district and staff." },
    ],
  },
  {
    id: 8,
    text: "How confident are teachers in using AI tools responsibly?",
    subtext: "Confidence grows with training beyond prompts—evaluation and bias.",
    options: [
      { value: "Not confident", label: "Not confident", narrative: "Expect shadow AI and hesitancy without training." },
      { value: "Somewhat confident", label: "Somewhat confident", narrative: "This is the optimism divide in practice." },
      { value: "Very confident", label: "Very confident", narrative: "Great—now standardize expectations and tools." },
    ],
  },
  {
    id: 9,
    text: "Do you track AI tool usage across the district?",
    subtext: "Inventory is the first step to governing shadow AI.",
    options: [
      { value: "No tracking", label: "No tracking", narrative: "Visibility gaps create exposure." },
      { value: "Partial tracking", label: "Partial tracking", narrative: "You’re close—finish the inventory." },
      { value: "Yes, comprehensive tracking", label: "Yes, comprehensive tracking", narrative: "Excellent—use it to guide training." },
    ],
  },
  {
    id: 10,
    text: "Have you communicated AI policies to parents?",
    subtext: "Transparency is the fastest path to trust.",
    options: [
      { value: "Not communicated", label: "Not communicated", narrative: "Parents fill silence with headlines." },
      { value: "Somewhat communicated", label: "Somewhat communicated", narrative: "Clarify what’s allowed and why." },
      { value: "Yes, clearly communicated", label: "Yes, clearly communicated", narrative: "Strong. Keep cadence and updates." },
    ],
  },
];

export function QuizPageClient() {
  const [step, setStep] = useQueryState("step", parseAsInteger.withDefault(1));
  const [answers, setAnswers] = useQueryState("answers", {
    defaultValue: "{}",
    parse: (value) => {
      try {
        return JSON.parse(decodeURIComponent(value));
      } catch {
        return {};
      }
    },
    serialize: (value) => encodeURIComponent(JSON.stringify(value)),
  });
  const [email, setEmail] = useQueryState("email", parseAsString.withDefault(""));
  const [organizationName, setOrganizationName] = useQueryState(
    "org",
    parseAsString.withDefault("")
  );
  const [role, setRole] = useQueryState("role", parseAsString.withDefault(""));

  const [isSubmitting, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentStep = step || 1;
  const totalSteps = QUIZ_QUESTIONS.length + 1; // +1 for info step
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  const currentQuestion = QUIZ_QUESTIONS[currentStep - 1];
  const currentAnswer = answers[currentQuestion?.id.toString()] || "";

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
      setError("Please provide your email and organization name");
      return;
    }

    if (Object.keys(answers).length !== QUIZ_QUESTIONS.length) {
      setError("Please answer all questions");
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
        setError(result.error || "Failed to submit quiz. Please try again.");
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
                Map your policy gaps, shadow AI exposure, and training depth in 3 minutes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <p className="text-zinc-700">
                  This audit evaluates your district's readiness across three critical dimensions:
                </p>
                <ul className="list-disc list-inside space-y-2 text-zinc-600">
                  <li>
                    <strong>Compliance:</strong> Policy & governance frameworks
                  </li>
                  <li>
                    <strong>Safety:</strong> Usage monitoring & incident response
                  </li>
                  <li>
                    <strong>Fluency:</strong> Training depth, communication, and trust
                  </li>
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
              <span className="text-sm text-zinc-500">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <QuizQuestion question={currentQuestion} value={currentAnswer} onChange={handleAnswer} />

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
                <Button onClick={handleNext} disabled={!currentAnswer} className="flex-1">
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!currentAnswer || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Submitting..." : "Complete Audit"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
