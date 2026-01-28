'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Brain,
  MessageSquare,
  ChevronRight,
  ChevronDown,
  Lightbulb,
  Target,
  CheckCircle,
  Copy
} from 'lucide-react'
import { toast } from 'sonner'

interface NEPQCoachProps {
  projectName: string
  projectType: string[]
  projectStage: string
  servicesNeeded?: string[]
}

interface NEPQStage {
  id: string
  name: string
  description: string
  questions: {
    question: string
    purpose: string
    customized: string
  }[]
}

const generateNEPQQuestions = (props: NEPQCoachProps): NEPQStage[] => {
  const { projectName, projectType, projectStage, servicesNeeded } = props
  const typeStr = projectType.join(' & ')
  const servicesStr = servicesNeeded?.join(', ') || 'technology services'

  return [
    {
      id: 'connecting',
      name: 'Connecting',
      description: 'Build rapport and establish trust before diving into business',
      questions: [
        {
          question: `Would you be open to a quick conversation about ${projectName}?`,
          purpose: 'Permission-based opening reduces resistance',
          customized: `This frames you as respectful of their time and not pushy.`
        },
        {
          question: `I'm curious - what's your experience been with ${typeStr.toLowerCase()} projects of this scale?`,
          purpose: 'Shows genuine interest, builds rapport',
          customized: `Gets them talking about their expertise and challenges.`
        },
        {
          question: `Help me understand - what does your typical vendor selection process look like for ${servicesStr}?`,
          purpose: 'Uncover decision-making process early',
          customized: `Reveals who's involved and timeline expectations.`
        }
      ]
    },
    {
      id: 'engagement',
      name: 'Situation/Engagement',
      description: 'Understand their current reality and surface initial concerns',
      questions: [
        {
          question: `Tell me about ${projectName} - what stage are you at in the ${projectStage.replace(/-/g, ' ')} process?`,
          purpose: 'Establish baseline understanding',
          customized: `Shows you've done your homework on their project.`
        },
        {
          question: `What are the biggest challenges you're anticipating with the ${servicesStr} for this project?`,
          purpose: 'Surface problems and pain points',
          customized: `Opens door to discuss how Groove solves these challenges.`
        },
        {
          question: `How are you currently handling ${servicesNeeded?.[0] || 'technology infrastructure'} decisions for the project?`,
          purpose: 'Understand current approach',
          customized: `Reveals gaps and opportunities for Groove's solution.`
        }
      ]
    },
    {
      id: 'problem-awareness',
      name: 'Problem Awareness',
      description: 'Help them recognize and feel the weight of their challenges',
      questions: [
        {
          question: `What happens if the ${servicesStr} don't work perfectly from day one?`,
          purpose: 'Amplify consequences of problems',
          customized: `For ${typeStr}, poor connectivity = bad reviews, lost revenue.`
        },
        {
          question: `How much time are you currently spending coordinating multiple technology vendors?`,
          purpose: 'Quantify the pain',
          customized: `Single-provider solution (Groove) eliminates this.`
        },
        {
          question: `What's been your experience with technology infrastructure issues on past projects?`,
          purpose: 'Surface past pain to motivate change',
          customized: `Past problems create urgency to do it right this time.`
        }
      ]
    },
    {
      id: 'solution-awareness',
      name: 'Solution Awareness',
      description: 'Guide them to envision a better future',
      questions: [
        {
          question: `What would it mean for ${projectName} if all your technology needs were handled by a single, trusted partner?`,
          purpose: 'Future-pacing with positive outcome',
          customized: `Positions Groove as the unified solution.`
        },
        {
          question: `If you could wave a magic wand, what would the ideal ${servicesStr} setup look like for this project?`,
          purpose: 'Uncover ideal state and criteria',
          customized: `Lets you tailor your pitch to their vision.`
        },
        {
          question: `How important is it to have a partner who understands ${typeStr.toLowerCase()} specifically?`,
          purpose: 'Establish Groove\'s niche expertise value',
          customized: `Groove specializes in hotels, multifamily, senior living.`
        }
      ]
    },
    {
      id: 'consequence',
      name: 'Consequence/Commitment',
      description: 'Create urgency and guide toward action',
      questions: [
        {
          question: `Based on what we've discussed, where do you see the biggest opportunity for ${projectName}?`,
          purpose: 'Get commitment to value',
          customized: `Their answer reveals buying signals.`
        },
        {
          question: `What's your timeline for making decisions on ${servicesStr}?`,
          purpose: 'Establish urgency and next steps',
          customized: `Creates natural deadline for follow-up.`
        },
        {
          question: `What would need to happen for us to move forward together on this?`,
          purpose: 'Uncover objections and requirements',
          customized: `Identifies exactly what you need to close.`
        }
      ]
    }
  ]
}

export function NEPQCoach(props: NEPQCoachProps) {
  const [expandedStage, setExpandedStage] = useState<string | null>('connecting')
  const stages = generateNEPQQuestions(props)

  const copyQuestion = (question: string) => {
    navigator.clipboard.writeText(question)
    toast.success('Question copied to clipboard!')
  }

  const toggleStage = (stageId: string) => {
    setExpandedStage(expandedStage === stageId ? null : stageId)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          NEPQ Sales Coach
        </CardTitle>
        <CardDescription>
          Neuro-Emotional Persuasion Questions customized for this project
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stage Progress */}
        <div className="flex items-center gap-2 text-xs">
          {stages.map((stage, i) => (
            <div key={stage.id} className="flex items-center">
              <div className={`px-2 py-1 rounded ${
                expandedStage === stage.id
                  ? 'bg-purple-100 text-purple-700 font-medium'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {i + 1}. {stage.name}
              </div>
              {i < stages.length - 1 && <ChevronRight className="h-4 w-4 text-gray-400" />}
            </div>
          ))}
        </div>

        {/* Expandable Stages */}
        <div className="space-y-2">
          {stages.map((stage) => (
            <div key={stage.id} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleStage(stage.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-purple-500" />
                  <div className="text-left">
                    <div className="font-medium">{stage.name}</div>
                    <div className="text-xs text-muted-foreground">{stage.description}</div>
                  </div>
                </div>
                {expandedStage === stage.id ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
              </button>

              {expandedStage === stage.id && (
                <div className="border-t p-4 space-y-4 bg-gray-50">
                  {stage.questions.map((q, i) => (
                    <div key={i} className="bg-white rounded-lg p-4 border">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-2 mb-2">
                            <MessageSquare className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                            <p className="font-medium text-sm">{q.question}</p>
                          </div>
                          <div className="ml-6 space-y-2">
                            <div className="flex items-start gap-2">
                              <Target className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                              <p className="text-xs text-muted-foreground">
                                <span className="font-medium">Purpose:</span> {q.purpose}
                              </p>
                            </div>
                            <div className="flex items-start gap-2">
                              <Lightbulb className="h-3 w-3 text-yellow-500 mt-1 flex-shrink-0" />
                              <p className="text-xs text-muted-foreground">
                                <span className="font-medium">Tip:</span> {q.customized}
                              </p>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyQuestion(q.question)}
                          className="flex-shrink-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Tips */}
        <div className="rounded-lg bg-purple-50 p-4 border border-purple-100">
          <h4 className="font-medium text-purple-800 mb-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            NEPQ Best Practices
          </h4>
          <ul className="text-xs text-purple-700 space-y-1">
            <li>• Listen 80%, talk 20% - let them reveal their pain</li>
            <li>• Use tonality to soften questions (curious, not interrogating)</li>
            <li>• Pause after asking - silence creates space for truth</li>
            <li>• Follow their emotional cues, not your script</li>
            <li>• Never present solutions until they&apos;ve felt the problem</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
