import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCourseBySlug } from '@/lib/aaa-courses';
import { generateMetadata as genMeta } from '@/lib/utils/seo';
import { BookOpen, PlayCircle } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) return {};
  return genMeta({
    title: `${course.title} — Adult AI Academy`,
    description: course.description,
  });
}

export default async function AAACourseOverviewPage({ params }: PageProps) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) notFound();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16">
      <div className="max-w-4xl mx-auto px-6">
        <Link
          href="/adult-ai-academy/courses"
          className="text-sm text-slate-600 hover:text-slate-700 mb-8 inline-block"
        >
          &larr; All courses
        </Link>

        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h1 className="text-4xl font-bold text-gray-900">{course.title}</h1>
            {course.badge && (
              <span className="text-sm font-semibold bg-slate-200 text-slate-700 px-3 py-1 rounded-full">
                {course.badge}
              </span>
            )}
          </div>
          <p className="text-lg text-slate-600 leading-relaxed">
            {course.description}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {course.totalLessons} lessons · {course.modules.length} modules
          </p>
        </header>

        <div className="space-y-8">
          {course.modules.map((mod, modIndex) => (
            <section
              key={mod.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <h2 className="text-xl font-bold text-gray-900">
                  Module {modIndex + 1}: {mod.title}
                </h2>
                {mod.description && (
                  <p className="text-sm text-slate-600 mt-1">{mod.description}</p>
                )}
              </div>
              <ul className="divide-y divide-slate-100">
                {mod.lessons.map((lesson, lessonIndex) => (
                  <li key={lesson.id}>
                    <Link
                      href={`/adult-ai-academy/courses/${course.slug}/lessons/${lesson.id}`}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 group-hover:bg-slate-200">
                        <PlayCircle className="w-5 h-5" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-slate-500">
                          Lesson {lessonIndex + 1}
                        </span>
                        <p className="font-medium text-gray-900 group-hover:text-slate-700">
                          {lesson.title}
                        </p>
                        {lesson.durationMinutes && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            {lesson.durationMinutes} min
                          </p>
                        )}
                      </div>
                      <span className="text-slate-400 group-hover:text-slate-600">
                        Watch →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            href={`/adult-ai-academy/courses/${course.slug}/lessons/${course.modules[0]?.lessons[0]?.id ?? ''}`}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-700 text-white px-6 py-3 font-semibold hover:bg-slate-800 transition-colors"
          >
            <PlayCircle className="w-5 h-5" />
            Start first lesson
          </Link>
          <Link
            href="/adult-ai-academy/courses"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 text-slate-700 px-6 py-3 font-medium hover:bg-slate-50 transition-colors"
          >
            Back to catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
