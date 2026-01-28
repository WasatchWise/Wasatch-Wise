import React from 'react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

interface LegalDocumentProps {
  title: string;
  content: string;
  lastUpdated?: string;
}

export default function LegalDocument({ title, content, lastUpdated }: LegalDocumentProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium mb-4 inline-block"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h1>
          {lastUpdated && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Last Updated: {lastUpdated}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-gray-900 dark:text-gray-100">
          <div className="prose prose-slate dark:prose-invert max-w-none
            prose-headings:text-gray-900 dark:prose-headings:text-white
            prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4
            prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3
            prose-h4:text-lg prose-h4:font-medium prose-h4:mt-4 prose-h4:mb-2
            prose-p:text-gray-900 dark:prose-p:text-gray-100 prose-p:leading-relaxed
            prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-semibold
            prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4
            prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-4
            prose-li:text-gray-900 dark:prose-li:text-gray-100 prose-li:my-2
            prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-700 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic
          ">
            <ReactMarkdown
              components={{
                a: ({ node, ...props }) => (
                  <Link
                    href={props.href || '#'}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {props.children}
                  </Link>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link href="/faq" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
              FAQ
            </Link>
            <span className="text-gray-400 dark:text-gray-500">•</span>
            <Link href="/legal/terms" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
              Terms of Service
            </Link>
            <span className="text-gray-400 dark:text-gray-500">•</span>
            <Link href="/legal/privacy" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
              Privacy Policy
            </Link>
            <span className="text-gray-400 dark:text-gray-500">•</span>
            <Link href="/legal/refund" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
              Refund Policy
            </Link>
            <span className="text-gray-400 dark:text-gray-500">•</span>
            <Link href="/legal/contact" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
              Contact & Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
