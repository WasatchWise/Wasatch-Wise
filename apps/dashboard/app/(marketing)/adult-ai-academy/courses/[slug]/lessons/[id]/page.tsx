import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getLesson,
  getOrderedLessonIds,
  getCourseBySlug,
} from '@/lib/aaa-courses';
import { generateMetadata as genMeta } from '@/lib/utils/seo';
import { ChevronLeft, ChevronRight, PlayCircle } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string; id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug, id } = await params;
  const result = getLesson(slug, id);
  if (!result) return {};
  return genMeta({
    title: `${result.lesson.title} — ${result.course.title} | Adult AI Academy`,
    description: result.lesson.transcriptSummary ?? result.lesson.title,
  });
}

export default async function AAALessonPlayerPage({ params }: PageProps) {
  const { slug, id } = await params;
  const result = getLesson(slug, id);
  if (!result) notFound();

  const { course, module, lesson } = result;
  const orderedIds = getOrderedLessonIds(slug);
  const currentIndex = orderedIds.indexOf(lesson.id);
  const prevId = currentIndex > 0 ? orderedIds[currentIndex - 1] : null;
  const nextId =
    currentIndex >= 0 && currentIndex < orderedIds.length - 1
      ? orderedIds[currentIndex + 1]
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link
          href={`/adult-ai-academy/courses/${slug}`}
          className="text-sm text-slate-600 hover:text-slate-700 mb-6 inline-flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to {course.title}
        </Link>

        <header className="mb-6">
          <p className="text-sm text-slate-500 mb-1">{module.title}</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {lesson.title}
          </h1>
          {lesson.durationMinutes && (
            <p className="text-sm text-slate-500 mt-1">
              {lesson.durationMinutes} min
            </p>
          )}
        </header>

        {/* Video placeholder — wire videoUrl when available */}
        <div className="aspect-video bg-slate-200 rounded-xl flex items-center justify-center mb-8">
          {lesson.videoUrl ? (
            <video
              src={lesson.videoUrl}
              controls
              className="w-full h-full rounded-xl"
            />
          ) : (
            <div className="text-center text-slate-500 p-8">
              <PlayCircle className="w-16 h-16 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">Lesson video coming soon</p>
              <p className="text-xs mt-1">
                This lesson is part of <strong>{course.title}</strong>. Content
                will be available when the course launches.
              </p>
            </div>
          )}
        </div>

        {lesson.transcriptSummary && (
          <section className="prose prose-slate max-w-none mb-8">
            <h2 className="text-lg font-semibold text-gray-900">Summary</h2>
            <p className="text-slate-600">{lesson.transcriptSummary}</p>
          </section>
        )}

        {/* Prev/Next */}
        <nav className="flex flex-col sm:flex-row gap-4 justify-between pt-6 border-t border-slate-200">
          {prevId ? (
            <Link
              href={`/adult-ai-academy/courses/${slug}/lessons/${prevId}`}
              className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-800 font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous lesson
            </Link>
          ) : (
            <span />
          )}
          {nextId ? (
            <Link
              href={`/adult-ai-academy/courses/${slug}/lessons/${nextId}`}
              className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-800 font-medium sm:ml-auto"
            >
              Next lesson
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href={`/adult-ai-academy/courses/${slug}`}
              className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-800 font-medium sm:ml-auto"
            >
              Back to course
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
}
