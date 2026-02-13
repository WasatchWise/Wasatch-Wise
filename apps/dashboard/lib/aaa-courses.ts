/**
 * AAA course and lesson data for the instructional portal.
 * Aligns with "AI Literacy Foundations" — 4 modules, 12 video lessons (plan: Phase 4).
 * Lesson content/video URLs can be wired later; structure is in place.
 */

export interface Lesson {
  id: string;
  title: string;
  durationMinutes?: number;
  /** Optional: video URL or storage path when available */
  videoUrl?: string;
  /** Optional: transcript or summary for accessibility */
  transcriptSummary?: string;
}

export interface Module {
  id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
}

export interface Course {
  slug: string;
  title: string;
  description: string;
  /** e.g. "Free" | "Coming soon" */
  badge?: string;
  modules: Module[];
  /** Total lesson count */
  totalLessons: number;
}

const AI_LITERACY_FOUNDATIONS: Course = {
  slug: 'ai-literacy-foundations',
  title: 'AI Literacy Foundations',
  description:
    'Core AI concepts, safety principles, and clear guidance for adult learners who are new to AI or have been reluctant to dive in. Four modules, 12 lessons.',
  badge: 'Free',
  totalLessons: 12,
  modules: [
    {
      id: 'm1',
      title: 'What AI Is (And Isn’t)',
      description: 'Plain-English foundations so you can talk about and judge AI with confidence.',
      lessons: [
        { id: 'm1-l1', title: 'What we mean when we say "AI"', durationMinutes: 6 },
        { id: 'm1-l2', title: 'How tools like ChatGPT actually work', durationMinutes: 8 },
        { id: 'm1-l3', title: 'When to trust—and when to verify', durationMinutes: 7 },
      ],
    },
    {
      id: 'm2',
      title: 'Privacy and Safety in Everyday Use',
      description: 'Protecting your data and your organization when using AI.',
      lessons: [
        { id: 'm2-l1', title: 'Where your data goes with free vs paid tools', durationMinutes: 6 },
        { id: 'm2-l2', title: 'Prompts and PII: what not to put in', durationMinutes: 7 },
        { id: 'm2-l3', title: 'Simple safety habits that stick', durationMinutes: 5 },
      ],
    },
    {
      id: 'm3',
      title: 'Using AI Responsibly at Work',
      description: 'Practical do’s and don’ts for writing, research, and productivity.',
      lessons: [
        { id: 'm3-l1', title: 'One prompt structure that changes the game', durationMinutes: 8 },
        { id: 'm3-l2', title: 'Evaluating outputs: bias and accuracy', durationMinutes: 7 },
        { id: 'm3-l3', title: 'Staying in control when the tool gets it wrong', durationMinutes: 6 },
      ],
    },
    {
      id: 'm4',
      title: 'Next Steps: Tools and Governance',
      description: 'Choosing tools, vetting vendors, and simple governance without a compliance department.',
      lessons: [
        { id: 'm4-l1', title: 'How to vet an AI tool in 10 minutes', durationMinutes: 8 },
        { id: 'm4-l2', title: 'FERPA/COPPA in plain English (for educators)', durationMinutes: 7 },
        { id: 'm4-l3', title: 'Building a minimal use policy', durationMinutes: 6 },
      ],
    },
  ],
};

const COURSES: Course[] = [AI_LITERACY_FOUNDATIONS];

export function getAllCourses(): Course[] {
  return COURSES;
}

export function getCourseBySlug(slug: string): Course | undefined {
  return COURSES.find((c) => c.slug === slug);
}

export function getLesson(
  courseSlug: string,
  lessonId: string
): { course: Course; module: Module; lesson: Lesson } | undefined {
  const course = getCourseBySlug(courseSlug);
  if (!course) return undefined;

  for (const module of course.modules) {
    const lesson = module.lessons.find((l) => l.id === lessonId);
    if (lesson) return { course, module, lesson };
  }
  return undefined;
}

/** All lesson IDs in order (for prev/next navigation). */
export function getOrderedLessonIds(courseSlug: string): string[] {
  const course = getCourseBySlug(courseSlug);
  if (!course) return [];
  return course.modules.flatMap((m) => m.lessons.map((l) => l.id));
}
