'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getAllTests, runHCI_Test, getTestsByCategory, type HCITest } from '@/lib/hci/tests'
import { getHCITracker } from '@/lib/hci/metrics'
import { Play, CheckCircle2, XCircle, Clock, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'

export default function HCITestsPage() {
  const [tests, setTests] = useState<HCITest[]>([])
  const [runningTest, setRunningTest] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, any>>({})
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    setTests(getAllTests())
  }, [])

  const handleRunTest = async (testId: string) => {
    setRunningTest(testId)
    try {
      const result = await runHCI_Test(testId)
      setResults((prev) => ({ ...prev, [testId]: result }))
      toast.success(`Test completed: ${result.success ? 'PASSED' : 'FAILED'}`)
    } catch (error) {
      toast.error(`Test failed: ${error}`)
    } finally {
      setRunningTest(null)
    }
  }

  const filteredTests = selectedCategory === 'all' 
    ? tests 
    : getTestsByCategory(selectedCategory as any)

  const categories = ['all', 'email', 'navigation', 'search', 'bulk_action', 'call', 'mobile']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">HCI Tests</h1>
        <p className="text-muted-foreground">
          Run usability tests and track metrics
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </Button>
        ))}
      </div>

      {/* Test List */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredTests.map((test) => {
          const result = results[test.id]
          const isRunning = runningTest === test.id

          return (
            <Card key={test.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{test.name}</span>
                  {result && (
                    result.success ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )
                  )}
                </CardTitle>
                <CardDescription>{test.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Tasks:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {test.tasks.map((task) => (
                      <li key={task.id} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>{task.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {result && (
                  <div className="space-y-2 p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span>Duration:</span>
                      <span className="font-medium">
                        {(result.duration / 1000).toFixed(1)}s
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Steps:</span>
                      <span className="font-medium">{result.steps}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Errors:</span>
                      <span className="font-medium">{result.errors}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Status:</span>
                      <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                        {result.success ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => handleRunTest(test.id)}
                  disabled={isRunning}
                  className="w-full"
                >
                  {isRunning ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Run Test
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Metrics Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Session Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Interactions</p>
              <p className="text-2xl font-bold">
                {getHCITracker().getMetrics().filter(m => m.type === 'interaction').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Errors</p>
              <p className="text-2xl font-bold text-red-600">
                {getHCITracker().getMetrics().filter(m => m.type === 'error').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tasks Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {getHCITracker().getTaskMetrics().filter(t => t.completed).length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Session ID</p>
              <p className="text-xs font-mono break-all">
                {getHCITracker().getMetrics()[0]?.sessionId || 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

