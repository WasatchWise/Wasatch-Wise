/**
 * NDPA Certification — Quiz questions per module.
 * Passing: 80% (e.g. 4/5 or 4/4 correct). Users can retake.
 */

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
}

export interface ModuleQuiz {
  moduleId: number
  moduleTitle: string
  questions: QuizQuestion[]
}

export const PASSING_PERCENT = 80

export function getRequiredCorrect(questionCount: number): number {
  return Math.ceil(questionCount * (PASSING_PERCENT / 100))
}

const MODULE_0_QUESTIONS: QuizQuestion[] = [
  { id: '0.1', question: 'What was a major consequence of the Illuminate Education breach (2022)?', options: ['Schools stopped using technology', '3.1 million students\' data was exposed nationwide', 'The NDPA was created', 'Vendors left the K-12 market'], correctIndex: 1 },
  { id: '0.2', question: 'What is student PII (Personally Identifiable Information)?', options: ['Only social security numbers', 'Data that can identify a student, alone or with other information', 'Only names and photos', 'Data that schools are not allowed to collect'], correctIndex: 1 },
  { id: '0.3', question: 'Why did inBloom collapse in 2014?', options: ['Funding ran out', 'Parent revolt over data collection and lack of transparency', 'States passed laws against it', 'Vendors withdrew support'], correctIndex: 1 },
  { id: '0.4', question: 'What does the NDPA (National Data Privacy Agreement) standardize?', options: ['School budgets', 'Vendor agreements so districts can approve tools faster with legal protection', 'Student testing', 'Teacher training'], correctIndex: 1 },
  { id: '0.5', question: 'Who is "the last line of defense" when EdTech companies update terms to train AI on student work?', options: ['The vendor', 'Parents', 'Educators and administrators in the school', 'The state board'], correctIndex: 2 },
]

const MODULE_1_QUESTIONS: QuizQuestion[] = [
  { id: '1.1', question: 'In the Traffic Light system, what does Green mean?', options: ['Use with caution', 'Vetted and approved for use', 'Do not use', 'Under review'], correctIndex: 1 },
  { id: '1.2', question: 'How many checkpoints are in the Document Anatomy traffic light system?', options: ['4', '5', '6', '7'], correctIndex: 2 },
  { id: '1.3', question: 'What should you do with a Yellow classification?', options: ['Use immediately', 'Use with caution or after review', 'Never use', 'Ignore'], correctIndex: 1 },
  { id: '1.4', question: 'What is the main purpose of the 6-checkpoint review?', options: ['To delay adoption', 'To quickly classify a tool as Green, Yellow, or Red for decision-making', 'To replace legal review', 'To audit past usage only'], correctIndex: 1 },
  { id: '1.5', question: 'Who decides the final Green/Yellow/Red status for a tool in your context?', options: ['The vendor', 'Your district or school, using the criteria and your policy', 'The state', 'The SDPC Registry'], correctIndex: 1 },
]

const MODULE_2_QUESTIONS: QuizQuestion[] = [
  { id: '2.1', question: 'What is a DPA in the context of student data?', options: ['A district policy agreement', 'A Data Privacy Agreement between a district and a vendor', 'A federal law', 'A type of assessment'], correctIndex: 1 },
  { id: '2.2', question: 'What is the typical benefit of using a standardized DPA process?', options: ['Longer negotiations', 'Faster approvals (e.g. 10 minutes vs 3 hours) with legal protection', 'Fewer vendors', 'More paperwork'], correctIndex: 1 },
  { id: '2.3', question: 'In the DPA workflow, what usually happens after a vendor signs?', options: ['The district pays immediately', 'The agreement is uploaded to the registry and the tool can be approved for use', 'The state reviews it', 'Nothing else is needed'], correctIndex: 1 },
  { id: '2.4', question: 'Who is typically the primary contact for DPAs in a district?', options: ['The teacher', 'The data manager or designated privacy lead', 'The vendor', 'The state board'], correctIndex: 1 },
]

const MODULE_3_QUESTIONS: QuizQuestion[] = [
  { id: '3.1', question: 'What is the SDPC Registry used for?', options: ['Storing student data', 'Finding which vendors have signed standard agreements and which states use them', 'Replacing DPAs', 'Training only'], correctIndex: 1 },
  { id: '3.2', question: 'Advanced registry search can include:', options: ['Only exact app names', 'Wildcards and boolean logic to find agreements and vendors', 'Only current year', 'Only your state'], correctIndex: 1 },
  { id: '3.3', question: 'Where can you search for existing vendor agreements across states?', options: ['Only in your district portal', 'SDPC Registry (e.g. privacy.a4l.org / sdpc.a4l.org)', 'Vendor websites only', 'State board only'], correctIndex: 1 },
  { id: '3.4', question: 'Why is registry search useful before starting a new DPA?', options: ['To avoid signing anything', 'To see if the vendor already has agreements elsewhere and speed up your process', 'To report vendors', 'To replace your district process'], correctIndex: 1 },
]

const MODULE_4_QUESTIONS: QuizQuestion[] = [
  { id: '4.1', question: 'What is "shadow IT" in schools?', options: ['Hardware in storage', 'Technology or apps used without going through the district approval process', 'Cloud storage', 'Old devices'], correctIndex: 1 },
  { id: '4.2', question: 'When a data breach is discovered, what should happen quickly?', options: ['Ignore it', 'Assess impact, notify appropriate parties (e.g. USBE, affected individuals), and document', 'Delete all data', 'Only tell the vendor'], correctIndex: 1 },
  { id: '4.3', question: 'How can you reduce vendor pressure to skip privacy review?', options: ['By having a clear policy and DPA process so you can say "we use the standard process"', 'By refusing all vendors', 'By signing quickly', 'By not using any new tools'], correctIndex: 0 },
  { id: '4.4', question: 'Crisis Mastery in this course refers to:', options: ['Only breaches', 'Handling shadow IT, breaches, and vendor pressure with clear procedures', 'Avoiding all technology', 'State law only'], correctIndex: 1 },
]

export const QUIZ_BY_MODULE: ModuleQuiz[] = [
  { moduleId: 0, moduleTitle: 'Foundations', questions: MODULE_0_QUESTIONS },
  { moduleId: 1, moduleTitle: 'Document Anatomy', questions: MODULE_1_QUESTIONS },
  { moduleId: 2, moduleTitle: 'DPA Workflow', questions: MODULE_2_QUESTIONS },
  { moduleId: 3, moduleTitle: 'Registry Ninja', questions: MODULE_3_QUESTIONS },
  { moduleId: 4, moduleTitle: 'Crisis Mastery', questions: MODULE_4_QUESTIONS },
]

export function getQuizForModule(moduleId: number): ModuleQuiz | undefined {
  return QUIZ_BY_MODULE.find((q) => q.moduleId === moduleId)
}

export const CERT_STORAGE_KEY_PREFIX = 'abya_cert_quiz_passed_'

export function getQuizPassedKeys(): string[] {
  return QUIZ_BY_MODULE.map((m) => `${CERT_STORAGE_KEY_PREFIX}${m.moduleId}`)
}

export function isCertificationComplete(): boolean {
  if (typeof window === 'undefined') return false
  return getQuizPassedKeys().every((key) => localStorage.getItem(key) === 'true')
}
