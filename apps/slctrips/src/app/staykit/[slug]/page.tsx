'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  getStayKitBySlug,
  getStayKitFullContent,
  getUserProgress,
  getUserCompletedTasks,
  checkStayKitAccess,
  completeTask,
  uncompleteTask,
  upsertUserProgress,
} from '@/lib/staykit';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import _SafeImage from '@/components/SafeImage';
import type {
  StayKit,
  StayKitDayWithTasks,
  UserStayKitProgress,
  UserTaskCompletion,
} from '@/types/database.types';

export const dynamic = 'force-dynamic';

export default function StayKitViewerPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [staykit, setStaykit] = useState<StayKit | null>(null);
  const [days, setDays] = useState<StayKitDayWithTasks[]>([]);
  const [progress, setProgress] = useState<UserStayKitProgress | null>(null);
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTips, setExpandedTips] = useState<Set<string>>(new Set());
  const [updatingTask, setUpdatingTask] = useState<string | null>(null);

  const slug = params.slug as string;

  const loadStayKitData = useCallback(async () => {
    if (!user || !slug) return;

    setLoading(true);
    setError(null);

    try {
      // Get StayKit details
      const staykitData = await getStayKitBySlug(slug);
      if (!staykitData) {
        setError('StayKit not found');
        setLoading(false);
        return;
      }

      // Check access
      const hasAccess = await checkStayKitAccess(user.id, staykitData.id);
      if (!hasAccess) {
        setError('You do not have access to this StayKit');
        setLoading(false);
        return;
      }

      setStaykit(staykitData);

      // Load full content
      const fullContent = await getStayKitFullContent(staykitData.id);
      setDays(fullContent);

      // Load user progress
      const userProgress = await getUserProgress(user.id, staykitData.id);
      setProgress(userProgress);

      // Load completed tasks
      const completedTasks = await getUserCompletedTasks(user.id, staykitData.id);
      const completedIds = new Set(completedTasks.map((t) => t.task_id));
      setCompletedTaskIds(completedIds);

      // Initialize progress if not started
      if (!userProgress) {
        const newProgress = await upsertUserProgress(user.id, staykitData.id, {
          started_at: new Date().toISOString(),
          current_day_number: fullContent[0]?.day_number || 1,
          progress_percentage: 0,
          tasks_completed: 0,
          total_tasks: fullContent.reduce((sum, day) => sum + day.tasks.length, 0),
        });
        setProgress(newProgress);
      }
    } catch (err) {
      console.error('Error loading StayKit:', err);
      setError('Failed to load StayKit data');
    } finally {
      setLoading(false);
    }
  }, [user, slug]);

  useEffect(() => {
    if (user) {
      loadStayKitData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading, loadStayKitData]);

  const handleToggleTask = async (taskId: string) => {
    if (!user || !staykit || updatingTask) return;

    setUpdatingTask(taskId);
    const isCompleted = completedTaskIds.has(taskId);

    try {
      if (isCompleted) {
        await uncompleteTask(user.id, taskId);
        setCompletedTaskIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(taskId);
          return newSet;
        });
      } else {
        await completeTask(user.id, taskId);
        setCompletedTaskIds((prev) => {
          const newSet = new Set(prev);
          newSet.add(taskId);
          return newSet;
        });
      }

      // Update progress
      const totalTasks = days.reduce((sum, day) => sum + day.tasks.length, 0);
      const tasksCompleted = completedTaskIds.size + (isCompleted ? -1 : 1);
      const percentage = Math.round((tasksCompleted / totalTasks) * 100);

      const updatedProgress = await upsertUserProgress(user.id, staykit.id, {
        tasks_completed: tasksCompleted,
        progress_percentage: percentage,
        current_day_number: days[selectedDayIndex]?.day_number,
      });
      setProgress(updatedProgress);
    } catch (err) {
      console.error('Error updating task:', err);
    } finally {
      setUpdatingTask(null);
    }
  };

  const toggleTipsExpanded = (taskId: string) => {
    setExpandedTips((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const getTaskTypeIcon = (taskType: string) => {
    switch (taskType) {
      case 'visit':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
        );
      case 'experience':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'learn':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0z" />
          </svg>
        );
      case 'photo':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        );
      case 'connect':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  if (authLoading || loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading your StayKit...</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Sign In Required</h2>
              <p className="text-gray-600 mb-6">Please sign in to view this StayKit.</p>
              <Link
                href="/auth/signin"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Error</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Link
                href="/my-staykit"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Back to My StayKits
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!staykit) return null;

  const selectedDay = days[selectedDayIndex];
  const totalTasks = days.reduce((sum, day) => sum + day.tasks.length, 0);
  const progressPercentage = progress?.progress_percentage || 0;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-2 text-blue-200 text-sm mb-4">
              <Link href="/my-staykit" className="hover:text-white transition-colors">
                My StayKits
              </Link>
              <span>/</span>
              <span>{staykit.name}</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="text-sm font-mono text-blue-200 mb-2">{staykit.code}</div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">{staykit.name}</h1>
                {staykit.tagline && (
                  <p className="text-blue-100 text-lg">{staykit.tagline}</p>
                )}
              </div>

              <div className="bg-white/10 backdrop-blur rounded-lg p-6 min-w-[280px]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-blue-100">Your Progress</span>
                  <span className="text-2xl font-bold">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-blue-200 mt-2">
                  <span>{completedTaskIds.size} of {totalTasks} tasks</span>
                  <span>{staykit.day_count} days</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Day Navigation Sidebar */}
            <div className="lg:w-72 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-md p-4 sticky top-24">
                <h3 className="font-semibold text-gray-900 mb-4">Milestone Days</h3>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {days.map((day, index) => {
                    const dayTasks = day.tasks;
                    const completedInDay = dayTasks.filter((t) =>
                      completedTaskIds.has(t.id)
                    ).length;
                    const dayProgress =
                      dayTasks.length > 0
                        ? Math.round((completedInDay / dayTasks.length) * 100)
                        : 0;

                    return (
                      <button
                        key={day.id}
                        onClick={() => setSelectedDayIndex(index)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedDayIndex === index
                            ? 'bg-blue-50 border-2 border-blue-500'
                            : 'hover:bg-gray-50 border-2 border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm">Day {day.day_number}</span>
                          {dayProgress === 100 && (
                            <svg
                              className="w-4 h-4 text-green-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="text-xs text-gray-600 truncate mb-2">{day.title}</div>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div
                            className={`h-full rounded-full ${
                              dayProgress === 100 ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${dayProgress}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {completedInDay}/{dayTasks.length} tasks
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {selectedDay && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Day Header */}
                  <div className="bg-gray-50 p-6 border-b">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-blue-600">
                        Day {selectedDay.day_number}
                      </span>
                      {selectedDay.estimated_duration_hours && (
                        <span className="text-sm text-gray-500">
                          ~{selectedDay.estimated_duration_hours}h estimated
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedDay.title}
                    </h2>
                    {selectedDay.description && (
                      <p className="text-gray-600">{selectedDay.description}</p>
                    )}
                  </div>

                  {/* Tasks List */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks</h3>
                    <div className="space-y-4">
                      {selectedDay.tasks.map((task) => {
                        const isCompleted = completedTaskIds.has(task.id);
                        const isExpanded = expandedTips.has(task.id);
                        const isUpdating = updatingTask === task.id;

                        return (
                          <div
                            key={task.id}
                            className={`border rounded-lg transition-all ${
                              isCompleted
                                ? 'bg-green-50 border-green-200'
                                : 'bg-white border-gray-200'
                            }`}
                          >
                            <div className="p-4">
                              <div className="flex items-start gap-3">
                                {/* Checkbox */}
                                <button
                                  onClick={() => handleToggleTask(task.id)}
                                  disabled={isUpdating}
                                  className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                                    isCompleted
                                      ? 'bg-green-500 border-green-500 text-white'
                                      : 'border-gray-300 hover:border-blue-500'
                                  } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  {isUpdating ? (
                                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                  ) : isCompleted ? (
                                    <svg
                                      className="w-4 h-4"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  ) : null}
                                </button>

                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span
                                      className={`${
                                        task.task_type === 'visit'
                                          ? 'text-blue-600'
                                          : task.task_type === 'experience'
                                          ? 'text-purple-600'
                                          : task.task_type === 'learn'
                                          ? 'text-orange-600'
                                          : task.task_type === 'photo'
                                          ? 'text-pink-600'
                                          : task.task_type === 'connect'
                                          ? 'text-green-600'
                                          : 'text-gray-600'
                                      }`}
                                    >
                                      {getTaskTypeIcon(task.task_type)}
                                    </span>
                                    <h4
                                      className={`font-semibold ${
                                        isCompleted
                                          ? 'text-green-800 line-through'
                                          : 'text-gray-900'
                                      }`}
                                    >
                                      {task.title}
                                    </h4>
                                    {task.is_optional && (
                                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                        Optional
                                      </span>
                                    )}
                                  </div>

                                  {task.description && (
                                    <p className="text-gray-600 text-sm mb-2">
                                      {task.description}
                                    </p>
                                  )}

                                  {/* Task Metadata */}
                                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                    {task.duration_minutes && (
                                      <span className="flex items-center gap-1">
                                        <svg
                                          className="w-3 h-3"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                        {task.duration_minutes} min
                                      </span>
                                    )}
                                    {task.destination && (
                                      <Link
                                        href={`/destinations/${task.destination.slug}`}
                                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                                      >
                                        <svg
                                          className="w-3 h-3"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                        {task.destination.name}
                                      </Link>
                                    )}
                                    {task.address && !task.destination && (
                                      <span className="flex items-center gap-1">
                                        <svg
                                          className="w-3 h-3"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                        {task.address}
                                      </span>
                                    )}
                                  </div>

                                  {/* Tips */}
                                  {task.tips.length > 0 && (
                                    <div className="mt-3">
                                      <button
                                        onClick={() => toggleTipsExpanded(task.id)}
                                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                                      >
                                        <svg
                                          className={`w-4 h-4 transition-transform ${
                                            isExpanded ? 'rotate-90' : ''
                                          }`}
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                        {task.tips.length} tip{task.tips.length !== 1 ? 's' : ''}
                                      </button>

                                      {isExpanded && (
                                        <div className="mt-2 space-y-2">
                                          {task.tips.map((tip) => (
                                            <div
                                              key={tip.id}
                                              className="bg-yellow-50 border border-yellow-100 rounded p-3 text-sm"
                                            >
                                              <div className="flex items-start gap-2">
                                                <svg
                                                  className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5"
                                                  fill="currentColor"
                                                  viewBox="0 0 20 20"
                                                >
                                                  <path
                                                    fillRule="evenodd"
                                                    d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                                                    clipRule="evenodd"
                                                  />
                                                </svg>
                                                <div>
                                                  {tip.category && (
                                                    <span className="text-xs font-semibold text-yellow-700 uppercase mb-1 block">
                                                      {tip.category}
                                                    </span>
                                                  )}
                                                  <p className="text-gray-700">{tip.tip_text}</p>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Day Navigation */}
                  <div className="bg-gray-50 p-4 border-t flex items-center justify-between">
                    <button
                      onClick={() => setSelectedDayIndex(Math.max(0, selectedDayIndex - 1))}
                      disabled={selectedDayIndex === 0}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Previous Day
                    </button>

                    <span className="text-sm text-gray-500">
                      Day {selectedDayIndex + 1} of {days.length}
                    </span>

                    <button
                      onClick={() =>
                        setSelectedDayIndex(Math.min(days.length - 1, selectedDayIndex + 1))
                      }
                      disabled={selectedDayIndex === days.length - 1}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next Day
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
