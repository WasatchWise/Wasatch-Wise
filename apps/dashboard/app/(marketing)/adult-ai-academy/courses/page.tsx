import Link from 'next/link';
import { getAllCourses } from '@/lib/aaa-courses';
import { generateMetadata as genMeta } from '@/lib/utils/seo';
import { BookOpen } from 'lucide-react';

export const metadata = genMeta({
  title: 'Courses — Adult AI Academy',
  description:
    'Practical AI literacy courses for adults: foundations, safety, and responsible use. Start with AI Literacy Foundations—free.',
});

export default function AAACoursesCatalogPage() {
  const courses = getAllCourses();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Courses</h1>
        <p className="text-lg text-slate-600 mb-12">
          Build AI literacy at your own pace. Start with our free foundation course.
        </p>

        {courses.length === 0 ? (
          <p className="text-slate-500">No courses yet. Check back soon.</p>
        ) : (
          <div className="space-y-8">
            {courses.map((course) => (
              <Link
                key={course.slug}
                href={`/adult-ai-academy/courses/${course.slug}`}
                className="block bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 hover:border-slate-300 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="rounded-xl bg-slate-100 p-4 flex-shrink-0">
                    <BookOpen className="w-8 h-8 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h2 className="text-2xl font-bold text-gray-900 group-hover:text-slate-700">
                        {course.title}
                      </h2>
                      {course.badge && (
                        <span className="text-xs font-semibold bg-slate-200 text-slate-700 px-2 py-1 rounded-full">
                          {course.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 leading-relaxed mb-3">
                      {course.description}
                    </p>
                    <p className="text-sm text-slate-500">
                      {course.totalLessons} lessons
                      {course.modules.length > 0 &&
                        ` · ${course.modules.length} modules`}
                    </p>
                  </div>
                  <span className="text-slate-500 group-hover:text-slate-700 sm:self-center">
                    View course →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <p className="mt-12 text-sm text-slate-500">
          <Link
            href="/adult-ai-academy"
            className="text-slate-600 hover:text-slate-700 underline"
          >
            &larr; Back to Adult AI Academy
          </Link>
        </p>
      </div>
    </div>
  );
}
