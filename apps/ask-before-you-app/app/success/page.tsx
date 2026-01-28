import Link from 'next/link';
import { Button } from '@/components/shared/Button';
import { CheckCircle, BookOpen, Search, FileCheck, ArrowRight } from 'lucide-react';

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12 sm:py-16 md:py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-8 sm:p-10">
          <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Welcome to Ask Before You App!
          </h1>
          
          <p className="text-base sm:text-lg text-gray-700 mb-8 leading-relaxed">
            We're here to help you protect student data privacy. All of our resources are free—
            built on the SDPC framework trusted by 30+ state alliances.
          </p>

          <div className="space-y-4 text-left mb-8">
            <Link 
              href="/certification" 
              className="flex items-center gap-4 p-4 rounded-xl border border-orange-100 hover:border-orange-300 hover:bg-orange-50 transition-all group"
            >
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors flex-shrink-0">
                <BookOpen className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                  Free Certification Course
                </h3>
                <p className="text-sm text-gray-600">
                  Master student data privacy in 50 minutes
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
            </Link>

            <a 
              href="https://sdpc.a4l.org/search.php" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-xl border border-orange-100 hover:border-orange-300 hover:bg-orange-50 transition-all group"
            >
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors flex-shrink-0">
                <Search className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                  SDPC Registry
                </h3>
                <p className="text-sm text-gray-600">
                  Search existing DPA agreements nationwide
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
            </a>

            <Link 
              href="/ecosystem" 
              className="flex items-center gap-4 p-4 rounded-xl border border-orange-100 hover:border-orange-300 hover:bg-orange-50 transition-all group"
            >
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors flex-shrink-0">
                <FileCheck className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                  State Resources
                </h3>
                <p className="text-sm text-gray-600">
                  Find your state alliance and local guidance
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/certification" variant="primary" size="lg">
              Start Free Certification
            </Button>
            <Button href="/" variant="outline" size="lg">
              Explore Resources
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
