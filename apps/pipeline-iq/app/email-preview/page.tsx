import { generateNEPQEmail } from '@/lib/workflows/warm-call/nepq-email-generator'
import { classifyPropertyVertical } from '@/lib/workflows/warm-call/vertical-classifier'

export const dynamic = 'force-dynamic'

const VERTICAL_TYPES: Record<string, string[]> = {
  hospitality: ['hotel'],
  senior_living: ['senior_living'],
  multifamily: ['multifamily'],
  student_commercial: ['student_housing'],
  general: ['mixed_use'],
}

export default async function EmailPreviewPage({
  searchParams,
}: {
  searchParams: {
    vertical?: string
    project?: string
    city?: string
    state?: string
    stage?: string
    value?: string
    units?: string
    first?: string
    last?: string
    title?: string
    email?: string
  }
}) {
  const verticalKey = searchParams.vertical || 'hospitality'
  const projectName = searchParams.project || 'Sheraton Miami Airport Hotel'
  const city = searchParams.city || 'Miami'
  const state = searchParams.state || 'FL'
  const projectStage = searchParams.stage || 'planning'
  const projectValue = Number(searchParams.value || 18000000)
  const unitsCount = Number(searchParams.units || 240)
  const firstName = searchParams.first || 'Taylor'
  const lastName = searchParams.last || ''
  const title = searchParams.title || 'Owner'
  const email = searchParams.email || 'taylor@example.com'

  const projectTypes = VERTICAL_TYPES[verticalKey] || VERTICAL_TYPES.general

  const classification = classifyPropertyVertical(
    projectTypes,
    projectStage,
    projectValue,
    unitsCount
  )

  const emailPayload = await generateNEPQEmail(
    {
      projectName,
      projectTypes,
      projectStage,
      projectValue,
      unitsCount,
      city,
      state,
    },
    {
      firstName,
      lastName,
      title,
      email,
      company: undefined,
    },
    classification,
    process.env.ORGANIZATION_ID
  )

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <p className="text-sm uppercase tracking-wider text-slate-500">Subject</p>
          <h1 className="text-2xl font-semibold text-slate-900">{emailPayload.subject}</h1>
          <p className="mt-2 text-sm text-slate-500">
            Preview your live NEPQ email HTML below. Use query params to test variants.
          </p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-md">
          <div
            className="overflow-hidden rounded-xl border border-slate-200 bg-white"
            dangerouslySetInnerHTML={{ __html: emailPayload.html }}
          />
        </div>
      </div>
    </div>
  )
}
