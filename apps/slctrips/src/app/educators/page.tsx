import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EducatorSubmissionForm from '@/components/EducatorSubmissionForm';

export const metadata = {
  title: 'Educator Resources | TK-000: Meet the Mt. Olympians',
  description: '10 ways to use TK-000 in your classroom. Free forever, designed for 4th grade Utah studies.',
};

export default function EducatorsPage() {
  const implementationIdeas = [
    // The 6 Existing Curriculum Frameworks
    {
      id: 'guardians-blueprint',
      category: 'Full Curriculum Framework',
      title: "The Guardian's Blueprint",
      duration: '8-10 weeks',
      description: 'Data-driven comparative project-based learning where students analyze all 29 counties using data to compare geography, resources, culture, and civics. Culminates in an Olympic Guardian Policy Brief.',
      icon: '📊',
      hasFullFramework: true,
      bestFor: 'Teachers who want comprehensive data analysis and civic advocacy skills',
      keyActivities: ['Elevation mapping', 'Resource inventory', 'Guardian biography research', 'Policy brief writing', 'Olympian Congress debate']
    },
    {
      id: 'olympian-congress',
      category: 'Full Curriculum Framework',
      title: 'The Olympian Congress',
      duration: '6-8 weeks',
      description: 'Students form 5 regional guardian coalitions, create multimedia stories, and debate solutions to Utah challenges. Features villain personification of problems like air quality and drought.',
      icon: '🏛️',
      hasFullFramework: true,
      bestFor: 'Teachers who love collaborative storytelling and debate',
      keyActivities: ['Coalition research', 'Guardian origin stories', 'Villain creation', 'Digital storytelling', 'Congress debate simulation']
    },
    {
      id: 'guardians-beehive',
      category: 'Full Curriculum Framework',
      title: 'Guardians of the Beehive',
      duration: '8-10 weeks',
      description: 'Students become Junior Regional Planners, balancing county needs through guardian councils. Includes hands-on cultural activities like folk songs, pottery, and oral history projects.',
      icon: '🐝',
      hasFullFramework: true,
      bestFor: 'Teachers who prefer hands-on cultural heritage activities',
      keyActivities: ['County adoption ceremony', 'Budget allocation challenge', 'Folk songs and music', 'Native pottery crafts', 'Oral history interviews']
    },
    {
      id: 'guardians-reckoning',
      category: 'Full Curriculum Framework',
      title: "The Guardians' Reckoning",
      duration: '6-8 weeks',
      description: 'Students tackle real Utah environmental and social crises through guardian stakeholder perspectives. Includes drought simulation, air quality modeling, and growth planning.',
      icon: '⚡',
      hasFullFramework: true,
      bestFor: 'Teachers focused on real-world problem solving and STEM integration',
      keyActivities: ['Drought impact simulation', 'Inversion science experiment', 'Air quality data analysis', 'Population projections', 'Land use mapping']
    },
    {
      id: 'county-reckoning-2034',
      category: 'Full Curriculum Framework',
      title: 'The 2034 County Reckoning',
      duration: '8-10 weeks',
      description: 'Students become digital historians documenting current county conditions and advocating for 2034 future needs. Guardians serve as data repositories and advocates.',
      icon: '🔮',
      hasFullFramework: true,
      bestFor: 'Teachers emphasizing digital literacy and historical thinking',
      keyActivities: ['Digital source evaluation', 'County snapshot creation', 'Trend graphing', 'Resource forecasting', 'Multimedia advocacy campaign']
    },
    {
      id: 'comparative-regional',
      category: 'Full Curriculum Framework',
      title: 'Comparative Regional Studies',
      duration: '10-12 weeks',
      description: 'Students conduct deep comparative analysis across regions, identifying patterns in geography, economy, culture, and governance. Culminates in research symposium.',
      icon: '🔬',
      hasFullFramework: true,
      bestFor: 'Teachers who want academic research and presentation skills',
      keyActivities: ['Research question development', 'Multi-county data collection', 'Pattern mapping', 'Analysis synthesis', 'Symposium presentation']
    },

    // 4 Simple Implementation Ideas
    {
      id: 'county-of-week',
      category: 'Quick Implementation',
      title: 'County of the Week',
      duration: '15-20 minutes per week',
      description: 'Start each week by exploring one county and its guardian. Students learn basic facts, view destination photos, and discuss the guardian\'s role. Complete all 29 counties over the school year.',
      icon: '📅',
      hasFullFramework: false,
      bestFor: 'Teachers who want a simple weekly routine',
      keyActivities: ['Monday county introduction', 'Guardian character discussion', 'Destination photo exploration', 'Quick geography quiz', 'Weekly reflection journal']
    },
    {
      id: 'guardian-research',
      category: 'Quick Implementation',
      title: 'Choose Your Guardian Research Project',
      duration: '2-3 weeks',
      description: 'Students select one county guardian to research deeply. They create a presentation covering the county\'s geography, history, economy, and culture through their guardian\'s perspective.',
      icon: '📝',
      hasFullFramework: false,
      bestFor: 'Teachers who want student choice and independent research',
      keyActivities: ['Guardian selection', 'County research', 'Presentation creation', 'Class sharing', 'Guardian character analysis']
    },
    {
      id: 'field-trip-prep',
      category: 'Quick Implementation',
      title: 'Field Trip Preparation Tool',
      duration: 'As needed',
      description: 'Use TK-000 to prepare for field trips around Utah. Preview destinations with students, meet the guardian of that county, and create pre/post trip activities using guardian narratives.',
      icon: '🚌',
      hasFullFramework: false,
      bestFor: 'Teachers planning field trips or virtual tours',
      keyActivities: ['Pre-trip destination preview', 'Guardian introduction', 'Location scavenger hunt design', 'Post-trip reflection', 'Guardian thank you letters']
    },
    {
      id: 'choice-board',
      category: 'Quick Implementation',
      title: 'Guardian Choice Board',
      duration: '1-4 weeks (flexible)',
      description: 'Create a choice board with 9 guardian-themed activities. Students choose 3-5 to complete independently or in small groups, exploring counties at their own pace.',
      icon: '⭐',
      hasFullFramework: false,
      bestFor: 'Teachers using differentiated instruction or station rotations',
      keyActivities: ['Map a guardian\'s territory', 'Write guardian dialogue', 'Create county fact cards', 'Design guardian trading cards', 'County comparison charts']
    }
  ];

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 rounded-2xl shadow-2xl overflow-hidden text-white p-8 md:p-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
              <span className="font-mono text-sm">TK-000</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-white">
              Educator Resources
            </h1>

            <p className="text-xl md:text-2xl text-blue-100 mb-6">
              10 Ways to Use TK-000: Meet the Mt. Olympians in Your Classroom
            </p>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <p className="text-lg leading-relaxed mb-4">
                TK-000 is a <strong>free forever</strong> educational resource featuring all 29 Utah counties,
                each with a guardian character and real destinations. Whether you want a full 10-week curriculum
                or a simple weekly routine, we have ideas for you.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mt-4">
                <div>
                  <div className="text-3xl font-bold text-yellow-300">FREE</div>
                  <div className="text-sm">Forever</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-300">29</div>
                  <div className="text-sm">County Guardians</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-300">88</div>
                  <div className="text-sm">Destinations</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Standards Alignment Callout */}
        <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
          <div className="flex items-start gap-4">
            <div className="text-4xl">✅</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Utah 4th Grade Standards Aligned</h2>
              <p className="text-gray-700">
                All frameworks and activities align to <strong>Utah Core Standards for 4th Grade Social Studies</strong>,
                with connections to Science SEEd, ELA, Math, and Fine Arts standards. Built on 300+ verified sources
                about Utah counties.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Access CTA */}
        <div className="mb-12 text-center">
          <Link
            href="/tripkits/tk-000"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg hover:shadow-xl"
          >
            Get Free Access to TK-000
          </Link>
          <p className="text-gray-600 mt-2 text-sm">
            No payment required. Email only for lifetime access.
          </p>
        </div>

        {/* Implementation Ideas Grid */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">
            Choose Your Implementation Style
          </h2>

          {/* Full Curriculum Frameworks */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-3xl">📚</div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900">Full Curriculum Frameworks</h3>
                <p className="text-gray-600">Complete 6-12 week units with modules, activities, and assessments</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {implementationIdeas.filter(idea => idea.category === 'Full Curriculum Framework').map((idea) => (
                <div
                  key={idea.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 hover:shadow-2xl transition-all"
                >
                  <div className="bg-gradient-to-br from-blue-500 to-purple-500 text-white p-6 text-center">
                    <div className="text-5xl mb-3">{idea.icon}</div>
                    <h4 className="text-2xl font-bold text-white">{idea.title}</h4>
                    <p className="text-sm opacity-90 mt-2">{idea.duration}</p>
                  </div>

                  <div className="p-6">
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {idea.description}
                    </p>

                    <div className="bg-blue-50 rounded-lg p-3 mb-4">
                      <p className="text-sm font-semibold text-blue-900 mb-1">Best For:</p>
                      <p className="text-sm text-gray-700">{idea.bestFor}</p>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Key Activities:</p>
                      <div className="space-y-1">
                        {idea.keyActivities.slice(0, 3).map((activity, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="text-blue-500 text-xs mt-0.5">•</span>
                            <span className="text-sm text-gray-700">{activity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-6 border-2 border-amber-200">
              <p className="text-lg text-gray-800 mb-4">
                <strong>Want the full framework details?</strong> Access TK-000 and select "Choose Your Learning Path"
                to see complete modules, activities, materials lists, and assessment rubrics.
              </p>
              <Link
                href="/tripkits/tk-000"
                className="inline-block bg-amber-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-amber-700 transition-colors"
              >
                View Full Frameworks
              </Link>
            </div>
          </div>

          {/* Quick Implementation Ideas */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="text-3xl">⚡</div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900">Quick Implementation Ideas</h3>
                <p className="text-gray-600">Simple ways to integrate TK-000 without a full unit</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {implementationIdeas.filter(idea => idea.category === 'Quick Implementation').map((idea) => (
                <div
                  key={idea.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-200 hover:border-green-400 hover:shadow-2xl transition-all"
                >
                  <div className="bg-gradient-to-br from-green-500 to-teal-500 text-white p-6 flex items-center gap-4">
                    <div className="text-5xl">{idea.icon}</div>
                    <div>
                      <h4 className="text-2xl font-bold text-white">{idea.title}</h4>
                      <p className="text-sm opacity-90 mt-1">{idea.duration}</p>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {idea.description}
                    </p>

                    <div className="bg-green-50 rounded-lg p-3 mb-4">
                      <p className="text-sm font-semibold text-green-900 mb-1">Best For:</p>
                      <p className="text-sm text-gray-700">{idea.bestFor}</p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Implementation Steps:</p>
                      <div className="space-y-1">
                        {idea.keyActivities.map((activity, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="text-green-500 font-bold text-sm">{idx + 1}.</span>
                            <span className="text-sm text-gray-700">{activity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Teacher Tips Section */}
        <div className="mb-12 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-200">
          <div className="flex items-start gap-4 mb-6">
            <div className="text-4xl">💡</div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Tips for Success</h3>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-start gap-3">
                  <span className="text-purple-600 font-bold">1.</span>
                  <div>
                    <strong>Start Simple:</strong> Try "County of the Week" first to familiarize yourself and students
                    with the guardians and interface before committing to a full framework.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-purple-600 font-bold">2.</span>
                  <div>
                    <strong>Mix and Match:</strong> You don't have to use a full framework as-is. Pull activities
                    you like from different frameworks to create your own hybrid approach.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-purple-600 font-bold">3.</span>
                  <div>
                    <strong>Use Guardians as Hooks:</strong> The guardian characters make dry facts memorable.
                    Encourage students to think "What would [Guardian Name] say about this?"
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-purple-600 font-bold">4.</span>
                  <div>
                    <strong>No Student PII Required:</strong> Students explore anonymously. Only teachers need an
                    access code. Perfect for FERPA compliance.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-purple-600 font-bold">5.</span>
                  <div>
                    <strong>Print-Friendly:</strong> County pages can be printed for students without devices or
                    for tactile learners who prefer paper.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Submission Form */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-purple-900 rounded-2xl shadow-2xl overflow-hidden text-white p-8 mb-8">
            <div className="max-w-3xl mx-auto text-center">
              <div className="text-5xl mb-4">🎓</div>
              <h2 className="text-4xl font-bold mb-4 text-white">Share Your Implementation</h2>
              <p className="text-xl text-blue-100 mb-2">
                Using TK-000 in a creative way? We'd love to hear about it!
              </p>
              <p className="text-blue-200">
                Submit your implementation idea and help fellow educators discover new approaches.
              </p>
            </div>
          </div>

          <EducatorSubmissionForm />
        </div>

        {/* CTA Footer */}
        <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h3>
          <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
            Get free lifetime access to TK-000 and start exploring Utah's 29 counties with your students today.
          </p>
          <Link
            href="/tripkits/tk-000"
            className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-green-400 hover:to-emerald-500 transition-all shadow-lg hover:shadow-xl"
          >
            Get Free Access Now
          </Link>
          <div className="mt-6 flex justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>No payment required</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>No expiration</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>Privacy-first</span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
