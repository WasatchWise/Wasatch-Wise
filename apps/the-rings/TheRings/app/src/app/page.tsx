import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FeedbackForm } from '@/components/ui/feedback-form'
import { AnnouncementPopup } from '@/components/ui/announcement-popup'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--boxing-cream)' }}>
      {/* Announcement Popup */}
      <AnnouncementPopup />

      {/* Demo Mode Banner */}
      <div className="fixed top-0 w-full z-[60] py-3 px-4" style={{ backgroundColor: 'var(--boxing-black)' }}>
        <div className="max-w-6xl mx-auto">
          <p className="text-center font-[family-name:var(--font-oswald)] text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--boxing-gold)' }}>
            Demo Mode: See The Rings Through Different Eyes
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {/* Organized like rings: inner (youth) to outer (board/events) */}
            <Link href="/demo/youth" className="px-3 py-1 text-xs font-[family-name:var(--font-oswald)] uppercase tracking-wider transition-colors" style={{ backgroundColor: 'var(--boxing-red)', color: 'var(--boxing-cream)' }}>
              Youth
            </Link>
            <Link href="/demo/parent" className="px-3 py-1 text-xs font-[family-name:var(--font-oswald)] uppercase tracking-wider transition-colors" style={{ backgroundColor: '#4a7c59', color: 'var(--boxing-cream)' }}>
              Parent
            </Link>
            <Link href="/demo/staff" className="px-3 py-1 text-xs font-[family-name:var(--font-oswald)] uppercase tracking-wider transition-colors" style={{ backgroundColor: '#3d6b8c', color: 'var(--boxing-cream)' }}>
              Staff
            </Link>
            <Link href="/demo/adult" className="px-3 py-1 text-xs font-[family-name:var(--font-oswald)] uppercase tracking-wider transition-colors" style={{ backgroundColor: '#6b4c7a', color: 'var(--boxing-cream)' }}>
              Adult
            </Link>
            <Link href="/demo/senior" className="px-3 py-1 text-xs font-[family-name:var(--font-oswald)] uppercase tracking-wider transition-colors" style={{ backgroundColor: 'var(--boxing-brown)', color: 'var(--boxing-cream)' }}>
              Senior
            </Link>
            <Link href="/demo/partner" className="px-3 py-1 text-xs font-[family-name:var(--font-oswald)] uppercase tracking-wider transition-colors" style={{ backgroundColor: '#6366f1', color: 'white' }}>
              Partner
            </Link>
            <Link href="/demo/incubator" className="px-3 py-1 text-xs font-[family-name:var(--font-oswald)] uppercase tracking-wider border transition-colors" style={{ borderColor: 'var(--boxing-gold)', color: 'var(--boxing-gold)' }}>
              Incubator
            </Link>
            <Link href="/demo/board" className="px-3 py-1 text-xs font-[family-name:var(--font-oswald)] uppercase tracking-wider transition-colors" style={{ backgroundColor: 'var(--boxing-gold)', color: 'var(--boxing-black)' }}>
              Board
            </Link>
            <Link href="/demo/events" className="px-3 py-1 text-xs font-[family-name:var(--font-oswald)] uppercase tracking-wider transition-colors" style={{ backgroundColor: '#8b2635', color: 'var(--boxing-cream)' }}>
              Events
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-[72px] w-full z-50 border-b-2" style={{
        backgroundColor: 'var(--boxing-cream)',
        borderColor: 'var(--boxing-brown)'
      }}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="font-[family-name:var(--font-oswald)] text-xl font-bold tracking-widest uppercase" style={{ color: 'var(--boxing-brown)' }}>
            The Rings
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-[family-name:var(--font-oswald)] uppercase tracking-wider">
            <a href="#legacy" className="hover:opacity-70 transition-opacity" style={{ color: 'var(--boxing-brown)' }}>Legacy</a>
            <a href="#programs" className="hover:opacity-70 transition-opacity" style={{ color: 'var(--boxing-brown)' }}>Programs</a>
            <a href="#rings" className="hover:opacity-70 transition-opacity" style={{ color: 'var(--boxing-brown)' }}>The Rings</a>
            <a href="#join" className="hover:opacity-70 transition-opacity" style={{ color: 'var(--boxing-brown)' }}>Join</a>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="font-[family-name:var(--font-oswald)] text-sm px-5 py-2 uppercase tracking-wider transition-colors"
                style={{ backgroundColor: 'var(--boxing-brown)', color: 'var(--boxing-cream)' }}
              >
                Enter
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-[family-name:var(--font-oswald)] uppercase tracking-wider hover:opacity-70 transition-opacity" style={{ color: 'var(--boxing-brown)' }}>
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="font-[family-name:var(--font-oswald)] text-sm px-5 py-2 uppercase tracking-wider transition-colors"
                  style={{ backgroundColor: 'var(--boxing-brown)', color: 'var(--boxing-cream)' }}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero - Fight Poster Style */}
      <section className="pt-40 pb-16 px-4 relative overflow-hidden">
        {/* Decorative corners */}
        <div className="absolute top-20 left-4 w-16 h-16 border-l-4 border-t-4" style={{ borderColor: 'var(--boxing-gold)' }} />
        <div className="absolute top-20 right-4 w-16 h-16 border-r-4 border-t-4" style={{ borderColor: 'var(--boxing-gold)' }} />

        {/* Animated Rings Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-[0.07] pointer-events-none">
          <svg viewBox="0 0 400 400" className="w-full h-full">
            <style>
              {`
                @keyframes ring-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes ring-spin-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
                @keyframes ring-pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
              `}
            </style>
            {[180, 160, 140, 120, 100, 80, 60, 40, 20].map((r, i) => (
              <circle
                key={i}
                cx="200"
                cy="200"
                r={r}
                fill="none"
                stroke="var(--boxing-brown)"
                strokeWidth="2"
                style={{
                  transformOrigin: 'center',
                  animation: `${i % 2 === 0 ? 'ring-spin' : 'ring-spin-reverse'} ${30 + i * 5}s linear infinite, ring-pulse ${3 + i * 0.5}s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </svg>
        </div>

        <div className="max-w-4xl mx-auto text-center py-16 relative z-10">
          <p className="font-[family-name:var(--font-oswald)] text-sm tracking-[0.4em] uppercase mb-6" style={{ color: 'var(--boxing-gold)' }}>
            South Jordan, Utah • Est. 2025
          </p>

          <h1 className="font-[family-name:var(--font-playfair)] text-6xl md:text-7xl lg:text-8xl font-black mb-4 leading-[0.9]" style={{ color: 'var(--boxing-brown)' }}>
            THE RINGS
          </h1>

          <p className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl lg:text-4xl italic mb-6 leading-relaxed" style={{ color: 'var(--boxing-brown)' }}>
            The <span className="font-black text-3xl md:text-4xl lg:text-5xl" style={{ color: 'var(--boxing-gold)' }}>R</span>elationships that{' '}
            <span className="font-black text-3xl md:text-4xl lg:text-5xl" style={{ color: 'var(--boxing-gold)' }}>I</span>nspire,{' '}
            <span className="font-black text-3xl md:text-4xl lg:text-5xl" style={{ color: 'var(--boxing-gold)' }}>N</span>urture, and{' '}
            <span className="font-black text-3xl md:text-4xl lg:text-5xl" style={{ color: 'var(--boxing-gold)' }}>G</span>uide your{' '}
            <span className="font-black text-3xl md:text-4xl lg:text-5xl" style={{ color: 'var(--boxing-gold)' }}>S</span>tory
          </p>

          <p className="font-[family-name:var(--font-oswald)] text-lg md:text-xl tracking-[0.3em] uppercase mb-2" style={{ color: 'var(--boxing-brown)' }}>
            at
          </p>

          <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl lg:text-5xl font-bold italic mb-8" style={{ color: 'var(--boxing-red)' }}>
            Fullmer Legacy Center Campus
          </h2>

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-24 h-0.5" style={{ backgroundColor: 'var(--boxing-gold)' }} />
            <div className="w-3 h-3 rotate-45" style={{ backgroundColor: 'var(--boxing-gold)' }} />
            <div className="w-24 h-0.5" style={{ backgroundColor: 'var(--boxing-gold)' }} />
          </div>

          <p className="font-[family-name:var(--font-playfair)] text-xl md:text-2xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: 'var(--boxing-brown)' }}>
            A community center for the whole family—from early childhood (ages 0–7) through adulthood—where Champions build real skills, create portfolios of artifacts, and discover the champion within.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="font-[family-name:var(--font-oswald)] px-8 py-4 text-lg uppercase tracking-widest transition-transform hover:scale-105"
              style={{ backgroundColor: 'var(--boxing-red)', color: 'var(--boxing-cream)' }}
            >
              Enroll Your Child
            </Link>
            <Link
              href="#legacy"
              className="font-[family-name:var(--font-oswald)] px-8 py-4 text-lg uppercase tracking-widest border-2 transition-colors hover:opacity-80"
              style={{ borderColor: 'var(--boxing-brown)', color: 'var(--boxing-brown)' }}
            >
              Our Story
            </Link>
          </div>
        </div>

        {/* Bottom corners */}
        <div className="absolute bottom-0 left-4 w-16 h-16 border-l-4 border-b-4" style={{ borderColor: 'var(--boxing-gold)' }} />
        <div className="absolute bottom-0 right-4 w-16 h-16 border-r-4 border-b-4" style={{ borderColor: 'var(--boxing-gold)' }} />
      </section>

      {/* Legacy Section */}
      <section id="legacy" className="py-20 px-4" style={{ backgroundColor: 'var(--boxing-brown)' }}>
        <div className="max-w-4xl mx-auto">
          <p className="font-[family-name:var(--font-oswald)] text-sm tracking-[0.4em] uppercase mb-4 text-center" style={{ color: 'var(--boxing-gold)' }}>
            The Legacy
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold text-center mb-12" style={{ color: 'var(--boxing-cream)' }}>
            Built on the Spirit of a Champion
          </h2>

          <div className="space-y-6 text-lg leading-relaxed" style={{ color: 'var(--boxing-sepia)' }}>
            <p className="font-[family-name:var(--font-playfair)]">
              <span className="text-5xl font-bold float-left mr-3 leading-none" style={{ color: 'var(--boxing-gold)' }}>G</span>
              ene Fullmer was a world middleweight boxing champion from West Jordan, Utah.
              He wasn't flashy—he was relentless, disciplined, and tough. He outworked everyone
              in the ring and became one of the most respected fighters of his era.
            </p>
            <p className="font-[family-name:var(--font-playfair)]">
              The Fullmer Legacy Center carries that spirit forward. This isn't a place where
              Champions come to be entertained. It's a place where they come to <strong style={{ color: 'var(--boxing-cream)' }}>build something real</strong>—skills,
              confidence, portfolios of artifacts they're proud of, badges earned through quests that matter.
            </p>
            <p className="font-[family-name:var(--font-playfair)]">
              The Center building sits at the heart of our campus—and that campus is the <strong style={{ color: 'var(--boxing-gold)' }}>center of the Rings</strong>. 
              Surrounding the Center is a network of partner facilities that bring the nine rings to life: the skate park and outdoor 
              recreation (Body), the library and high school (Brain), the senior center and animal shelter (Bubble), the fire department 
              and civic buildings (Neighborhood & Community). Champions build outward through all nine rings—starting with Self at the core, 
              expanding through Body, Brain, Bubble, Scene, Neighborhood, Community, and World, reaching Ether where existential questions 
              bring them full circle back to who they are. The campus is where it all begins—where the inner champion meets the outer world, 
              all within walking distance.
            </p>
            <p className="font-[family-name:var(--font-playfair)]">
              We believe every young person has a champion inside them. Our job is to help them
              find it and develop it, one ring at a time.
            </p>
          </div>
        </div>
      </section>

      {/* The Science Section */}
      <section className="py-20 px-4" style={{ backgroundColor: 'var(--boxing-cream)' }}>
        <div className="max-w-5xl mx-auto">
          <p className="font-[family-name:var(--font-oswald)] text-sm tracking-[0.4em] uppercase mb-4 text-center" style={{ color: 'var(--boxing-gold)' }}>
            The Science
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold text-center mb-4" style={{ color: 'var(--boxing-brown)' }}>
            Built on How Young People Actually Learn
          </h2>
          <p className="text-center max-w-2xl mx-auto mb-12 font-[family-name:var(--font-playfair)] text-lg" style={{ color: 'var(--boxing-brown)', opacity: 0.8 }}>
            Our approach isn't invented—it's grounded in brain science and proven learning models.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* HOMAGO */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: 'var(--boxing-gold)', color: 'var(--boxing-brown)' }}>
                →
              </div>
              <h3 className="font-[family-name:var(--font-oswald)] text-xl font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--boxing-brown)' }}>
                HOMAGO
              </h3>
              <p className="font-[family-name:var(--font-playfair)] text-sm mb-4" style={{ color: 'var(--boxing-brown)', opacity: 0.9 }}>
                <strong>H</strong>anging <strong>O</strong>ut → <strong>M</strong>essing <strong>A</strong>round → <strong>G</strong>eeking <strong>O</strong>ut
              </p>
              <p className="font-[family-name:var(--font-playfair)] text-sm" style={{ color: 'var(--boxing-brown)', opacity: 0.8 }}>
                Youth start by exploring casually, then experiment with what interests them, then go deep on what they love. We don't force—we facilitate.
              </p>
            </div>

            {/* Brain Science */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: 'var(--boxing-red)', color: 'var(--boxing-cream)' }}>
                🧠
              </div>
              <h3 className="font-[family-name:var(--font-oswald)] text-xl font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--boxing-brown)' }}>
                Brain Science
              </h3>
              <p className="font-[family-name:var(--font-playfair)] text-sm mb-4" style={{ color: 'var(--boxing-brown)', opacity: 0.9 }}>
                Adolescent brains need risk, novelty, and peers
              </p>
              <p className="font-[family-name:var(--font-playfair)] text-sm" style={{ color: 'var(--boxing-brown)', opacity: 0.8 }}>
                We channel it—real challenges, real stakes, real crews. The teenage brain isn't broken; it's built for exactly this.
              </p>
            </div>

            {/* Developmental Stages */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: '#3d6b8c', color: 'var(--boxing-cream)' }}>
                📈
              </div>
              <h3 className="font-[family-name:var(--font-oswald)] text-xl font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--boxing-brown)' }}>
                Dev Stages
              </h3>
              <p className="font-[family-name:var(--font-playfair)] text-sm mb-4" style={{ color: 'var(--boxing-brown)', opacity: 0.9 }}>
                0-7 Flyweight • 7-14 Featherweight • 14-17 Welterweight • 17-21 Cruiserweight
              </p>
              <p className="font-[family-name:var(--font-playfair)] text-sm" style={{ color: 'var(--boxing-brown)', opacity: 0.8 }}>
                Flyweight (0–7) builds foundations. Featherweight (7–14) develops structure and skills. Welterweight (14–17) builds leadership through volunteering. Cruiserweight (17–21) offers paid positions and career pathways. Heavyweight staff at 21+.
              </p>
            </div>

            {/* SOLE */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: '#4a7c59', color: 'var(--boxing-cream)' }}>
                🔄
              </div>
              <h3 className="font-[family-name:var(--font-oswald)] text-xl font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--boxing-brown)' }}>
                SOLE
              </h3>
              <p className="font-[family-name:var(--font-playfair)] text-sm mb-4" style={{ color: 'var(--boxing-brown)', opacity: 0.9 }}>
                Self-Organized Learning Environment
              </p>
              <p className="font-[family-name:var(--font-playfair)] text-sm" style={{ color: 'var(--boxing-brown)', opacity: 0.8 }}>
                Youth choose quests, form crews, drive their learning. Staff facilitate, not lecture. Agency creates engagement.
              </p>
            </div>
          </div>

          <p className="text-center mt-12 font-[family-name:var(--font-playfair)] italic" style={{ color: 'var(--boxing-brown)', opacity: 0.7 }}>
            This isn't babysitting. This is intentional youth development backed by research.
          </p>
        </div>
      </section>

      {/* All Day, All Ages */}
      <section className="py-20 px-4" style={{ backgroundColor: 'var(--boxing-black)' }}>
        <div className="max-w-5xl mx-auto">
          <p className="font-[family-name:var(--font-oswald)] text-sm tracking-[0.4em] uppercase mb-4 text-center" style={{ color: 'var(--boxing-gold)' }}>
            Open All Day
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold text-center mb-4" style={{ color: 'var(--boxing-cream)' }}>
            Serving the Whole Community
          </h2>
          <p className="text-center max-w-2xl mx-auto mb-12 font-[family-name:var(--font-playfair)] text-lg" style={{ color: 'var(--boxing-sepia)' }}>
            From morning childcare to evening adult classes—we keep the building alive and serving families all day long.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Flyweight',
                age: 'Ages 0–7',
                time: '6am–3pm',
                items: ['Full-day & half-day childcare', 'Mommy & Me classes', 'Pre-K readiness programs', 'Sliding scale fees available'],
                color: 'var(--boxing-gold)'
              },
              {
                title: 'Featherweight',
                age: 'Ages 7–14',
                time: 'Out of School Time',
                items: ['Four pillars of growth', 'Quest-based learning', 'Portfolio building', 'Mentorship'],
                color: 'var(--boxing-red)'
              },
              {
                title: 'Welterweight & Cruiserweight',
                age: 'Ages 14–21',
                time: 'Flexible Schedule',
                items: ['Leadership training (14–17)', 'Paid roles at 17+', 'Pathway planning', 'College & career prep'],
                color: '#6366f1'
              },
              {
                title: 'Heavyweight',
                age: '18+',
                time: 'Evenings & Weekends',
                items: ['AI & technology classes', 'English language learning', 'Tax preparation (VITA)', 'Community events & workshops'],
                color: '#3d6b8c'
              }
            ].map((program) => (
              <div
                key={program.title}
                className="p-6 border-t-4 text-center"
                style={{ borderColor: program.color, backgroundColor: 'rgba(255,255,255,0.05)' }}
              >
                <p className="font-[family-name:var(--font-oswald)] text-xs font-medium uppercase tracking-wider mb-1" style={{ color: program.color }}>
                  {program.time}
                </p>
                <h3 className="font-[family-name:var(--font-oswald)] text-xl font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--boxing-cream)' }}>
                  {program.title}
                </h3>
                <p className="font-[family-name:var(--font-playfair)] text-sm mb-3" style={{ color: 'var(--boxing-sepia)' }}>
                  {program.age}
                </p>
                <ul className="text-sm space-y-1" style={{ color: 'var(--boxing-sepia)' }}>
                  {program.items.map((item) => (
                    <li key={item} className="font-[family-name:var(--font-playfair)] font-medium">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 border-t-4 text-center" style={{ borderColor: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
            <h3 className="font-[family-name:var(--font-oswald)] text-xl font-bold uppercase tracking-wider mb-3" style={{ color: '#6366f1' }}>
              Welterweight & Cruiserweight (Ages 14–21)
            </h3>
            <p className="font-[family-name:var(--font-playfair)] text-base mb-4" style={{ color: 'var(--boxing-cream)' }}>
              Our leadership pipeline. Welterweights (14–17) mentor younger Champions and lead quest crews. Cruiserweights (17–21) take on paid roles
              and prepare for independence. Perfect for those exploring pathways to college, career, or military service.
            </p>
            <ul className="text-sm space-y-2 font-[family-name:var(--font-playfair)] mb-4" style={{ color: 'var(--boxing-sepia)' }}>
              <li>• Paid leadership positions ($12–$18/hour)</li>
              <li>• Pathway planning & career exploration</li>
              <li>• Mentorship training & certification</li>
              <li>• Resume building from portfolio artifacts</li>
              <li>• College & career prep workshops</li>
            </ul>
            <p className="font-[family-name:var(--font-playfair)] text-xs italic mt-4" style={{ color: 'var(--boxing-sepia)' }}>
              Staff positions requiring driving (ages 21+) available. All staff must pass background checks and complete training.
            </p>
          </div>

          <p className="text-center mt-8 font-[family-name:var(--font-playfair)] italic" style={{ color: 'var(--boxing-sepia)' }}>
            Adults HOMAGO too—Hanging Out at events, Messing Around with new skills, Geeking Out on what matters.
          </p>
        </div>
      </section>

      {/* Campus Events Teaser */}
      <section className="py-16 px-4" style={{ backgroundColor: 'var(--boxing-cream)' }}>
        <div className="max-w-4xl mx-auto">
          <p className="font-[family-name:var(--font-oswald)] text-sm tracking-[0.4em] uppercase mb-4 text-center" style={{ color: 'var(--boxing-red)' }}>
            Mark Your Calendar
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold text-center mb-8" style={{ color: 'var(--boxing-brown)' }}>
            Campus Events
          </h2>

          {/* Featured Event */}
          <div
            className="p-6 border-l-4 mb-6"
            style={{
              borderColor: 'var(--boxing-gold)',
              backgroundColor: 'rgba(212, 175, 55, 0.1)'
            }}
          >
            <div className="flex items-start gap-4">
              <div className="text-center flex-shrink-0">
                <p className="font-[family-name:var(--font-oswald)] text-3xl font-bold" style={{ color: 'var(--boxing-red)' }}>31</p>
                <p className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider" style={{ color: 'var(--boxing-brown)' }}>Dec</p>
              </div>
              <div>
                <span className="inline-block px-2 py-1 text-xs font-[family-name:var(--font-oswald)] uppercase tracking-wider mb-2" style={{ backgroundColor: 'var(--boxing-gold)', color: 'var(--boxing-black)' }}>
                  Featured
                </span>
                <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-2" style={{ color: 'var(--boxing-brown)' }}>
                  New Year's Eve Sleepover Extravaganza
                </h3>
                <p className="font-[family-name:var(--font-playfair)] text-sm mb-3" style={{ color: 'var(--boxing-brown)', opacity: 0.8 }}>
                  Ring in 2026 at the Center! More details to come.
                </p>
              </div>
            </div>
          </div>

          {/* Quick upcoming list */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
              <p className="font-[family-name:var(--font-oswald)] text-lg font-bold" style={{ color: 'var(--boxing-red)' }}>Nov 22</p>
              <p className="font-[family-name:var(--font-playfair)] text-sm" style={{ color: 'var(--boxing-brown)' }}>Family Wellness Day</p>
            </div>
            <div className="text-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
              <p className="font-[family-name:var(--font-oswald)] text-lg font-bold" style={{ color: '#3d6b8c' }}>Nov 27</p>
              <p className="font-[family-name:var(--font-playfair)] text-sm" style={{ color: 'var(--boxing-brown)' }}>Thanksgiving Potluck</p>
            </div>
            <div className="text-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
              <p className="font-[family-name:var(--font-oswald)] text-lg font-bold" style={{ color: '#c9a227' }}>Nov 29</p>
              <p className="font-[family-name:var(--font-playfair)] text-sm" style={{ color: 'var(--boxing-brown)' }}>Winter Quest Showcase</p>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/demo/events"
              className="inline-block px-6 py-3 font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider transition-all hover:scale-105"
              style={{ backgroundColor: 'var(--boxing-red)', color: 'var(--boxing-cream)' }}
            >
              View Full Calendar →
            </Link>
          </div>
        </div>
      </section>

      {/* The Nine Rings */}
      <section id="rings" className="py-20 px-4" style={{ backgroundColor: 'var(--boxing-black)' }}>
        <div className="max-w-5xl mx-auto">
          <p className="font-[family-name:var(--font-oswald)] text-sm tracking-[0.4em] uppercase mb-4 text-center" style={{ color: 'var(--boxing-gold)' }}>
            The Framework
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold text-center mb-4" style={{ color: 'var(--boxing-cream)' }}>
            Nine Rings of Development
          </h2>
          <p className="text-center max-w-2xl mx-auto mb-12 font-[family-name:var(--font-playfair)] text-lg" style={{ color: 'var(--boxing-sepia)' }}>
            Growth isn't one-dimensional. We track development across nine expanding rings—from
            the inner Self outward through Body, Brain, Bubble, Scene, Neighborhood, Community, and World, 
            reaching Ether where existential questions bring us full circle back to Self. For youth and adults alike.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: 'Self', desc: 'Identity, values, emotional regulation. Champions choose their champion name, build mission statements, and create portfolios that reflect who they are. This is where agency begins—youth control their own story, not data points.' },
              { name: 'Brain', desc: 'Learning, problem-solving, creativity. Quest-based learning across four pillars—Wellness, TechNest, Creative Studio, Civic Lab. HOMAGO flow: Hanging Out, Messing Around, Geeking Out. Real skills that transfer to careers and life.' },
              { name: 'Body', desc: 'Physical fitness, nutrition, movement. Boxing fundamentals where youth earn their way into the ring—nothing is given. Strength training, yoga, nutrition workshops. The discipline of the body builds discipline of mind.' },
              { name: 'Bubble', desc: 'Family, close relationships, home. Parent portals for attendance and progress. Family events, parent co-ops, home connections. The Bubble ring recognizes that growth happens in context—family engagement strengthens everything else.' },
              { name: 'Scene', desc: 'Friends, peers, social dynamics. Crew-based quests where youth form teams, collaborate, and build belonging. Peer mentorship, social learning, and the power of "who you roll with" shapes who you become.' },
              { name: 'Neighborhood', desc: 'Local community, surroundings. Partnerships with fire stations, senior centers, local businesses. Neighborhood service projects, block parties, understanding your immediate world. The Rings connects Champions to what\'s right outside the door.' },
              { name: 'Community', desc: 'Civic engagement, service. Civic Lab pillar—youth council, environmental initiatives, intergenerational programs. Service hours tracked, leadership developed. Learning to be contributors, not just consumers.' },
              { name: 'World', desc: 'Global awareness, cultures. Cultural exchange programs, world events discussions, language learning. Understanding that your neighborhood connects to neighborhoods everywhere. Global citizenship starts local.' },
              { name: 'Ether', desc: 'Digital spaces, existential questions, spiritual growth. The outer ring that circles back to Self—where meaning, purpose, and identity are explored beyond the material world. Esports, streaming, digital creation, but also the big questions: Who am I? Why am I here? What matters?' },
            ].map((ring) => (
              <div
                key={ring.name}
                className="p-4 border-2 text-center"
                style={{ borderColor: 'var(--boxing-gold)', backgroundColor: 'rgba(201, 162, 39, 0.1)' }}
              >
                <h4 className="font-[family-name:var(--font-oswald)] text-lg font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--boxing-gold)' }}>
                  {ring.name}
                </h4>
                <p className="text-sm font-[family-name:var(--font-playfair)]" style={{ color: 'var(--boxing-sepia)' }}>
                  {ring.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Four Pillars */}
      <section id="programs" className="py-20 px-4" style={{ backgroundColor: 'var(--boxing-black)' }}>
        <div className="max-w-5xl mx-auto">
          <p className="font-[family-name:var(--font-oswald)] text-sm tracking-[0.4em] uppercase mb-4 text-center" style={{ color: 'var(--boxing-gold)' }}>
            Programs
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold text-center mb-4" style={{ color: 'var(--boxing-cream)' }}>
            Four Pillars of Growth
          </h2>
          <p className="text-center max-w-2xl mx-auto mb-8 font-[family-name:var(--font-playfair)] text-lg" style={{ color: 'var(--boxing-sepia)' }}>
            Youth ages 7–14 choose their path and go deep—building portfolios of artifacts, earning badges, and
            completing quests that mean something. At 14, youth move up to Welterweight for leadership development, with paid Cruiserweight positions at 17+.
          </p>
          <div className="text-center mb-12">
            <p className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider mb-2" style={{ color: 'var(--boxing-gold)' }}>
              Youth Programs Schedule
            </p>
            <p className="font-[family-name:var(--font-playfair)] text-base" style={{ color: 'var(--boxing-sepia)' }}>
              Monday–Friday: 3:00pm–8:00pm (School days) • 10:00am–6:00pm (School breaks)<br />
              Saturday: 10:00am–4:00pm
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                name: 'Wellness',
                color: '#4a7c59',
                desc: 'Boxing, fitness, mindfulness, nutrition. Youth earn their way into the ring—nothing is given.',
                items: ['Boxing fundamentals', 'Strength & conditioning', 'Yoga & meditation', 'Nutrition workshops']
              },
              {
                name: 'TechNest',
                color: '#3d6b8c',
                desc: 'Esports, coding, robotics, digital media. Real technical skills that transfer to careers.',
                items: ['Competitive esports', 'Game development', 'Robotics & engineering', 'Content creation']
              },
              {
                name: 'Creative Studio',
                color: '#6b4c7a',
                desc: 'Music, visual arts, design, performance. Youth create real work—albums, portfolios, shows.',
                items: ['Music production', 'Visual arts & design', 'Photography & video', 'Theater & performance']
              },
              {
                name: 'Civic Lab',
                color: '#8c5a3d',
                desc: 'Service projects, leadership, civic engagement. Youth learn to be contributors, not just consumers.',
                items: ['Community service', 'Youth council', 'Environmental initiatives', 'Intergenerational programs']
              }
            ].map((pillar) => (
              <div
                key={pillar.name}
                className="p-8 text-center border-t-4"
                style={{ borderColor: pillar.color, backgroundColor: 'rgba(255,255,255,0.03)' }}
              >
                <h3 className="font-[family-name:var(--font-oswald)] text-2xl font-bold uppercase tracking-wider mb-3" style={{ color: pillar.color }}>
                  {pillar.name}
                </h3>
                <p className="font-[family-name:var(--font-playfair)] font-medium mb-4 text-base" style={{ color: 'var(--boxing-sepia)' }}>
                  {pillar.desc}
                </p>
                <ul className="text-sm space-y-1" style={{ color: 'var(--boxing-cream)', opacity: 0.8 }}>
                  {pillar.items.map((item) => (
                    <li key={item} className="font-[family-name:var(--font-playfair)] font-medium">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Parents */}
      <section className="py-20 px-4" style={{ backgroundColor: 'var(--boxing-cream)' }}>
        <div className="max-w-4xl mx-auto">
          <p className="font-[family-name:var(--font-oswald)] text-sm tracking-[0.4em] uppercase mb-4 text-center" style={{ color: 'var(--boxing-gold)' }}>
            For Parents
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold text-center mb-12" style={{ color: 'var(--boxing-brown)' }}>
            A Safe Place for Real Growth
          </h2>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="font-[family-name:var(--font-oswald)] text-xl font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--boxing-brown)' }}>
                What Your Champion Gets
              </h3>
              <ul className="space-y-3" style={{ color: 'var(--boxing-brown)' }}>
                {[
                  "Real skills in areas they're passionate about",
                  'A portfolio of artifacts they created',
                  'Mentorship from trained staff',
                  'A peer community that builds them up',
                  'Quest-based learning across four pillars',
                  'Badge recognition for achievements',
                  'Leadership: Welterweight (14–17), Cruiserweight (17–21)'
                ].map((item) => (
                  <li key={item} className="flex gap-3 font-[family-name:var(--font-playfair)]">
                    <span style={{ color: 'var(--boxing-gold)' }}>→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-[family-name:var(--font-oswald)] text-xl font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--boxing-brown)' }}>
                Safety & Communication
              </h3>
              <ul className="space-y-3" style={{ color: 'var(--boxing-brown)' }}>
                {[
                  'All staff background checked & trained',
                  'Parent portal to track attendance & progress',
                  'You control communication permissions',
                  "Regular updates on your child's growth",
                  'Real-time check-in notifications',
                  'Privacy-first data collection'
                ].map((item) => (
                  <li key={item} className="flex gap-3 font-[family-name:var(--font-playfair)]">
                    <span style={{ color: 'var(--boxing-gold)' }}>→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing & Fees */}
      <section className="py-20 px-4" style={{ backgroundColor: 'var(--boxing-cream)' }}>
        <div className="max-w-5xl mx-auto">
          <p className="font-[family-name:var(--font-oswald)] text-sm tracking-[0.4em] uppercase mb-4 text-center" style={{ color: 'var(--boxing-gold)' }}>
            Affordable Access
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold text-center mb-4" style={{ color: 'var(--boxing-brown)' }}>
            Sliding Scale Membership
          </h2>
          <p className="text-center max-w-2xl mx-auto mb-12 font-[family-name:var(--font-playfair)] text-lg" style={{ color: 'var(--boxing-brown)', opacity: 0.8 }}>
            Our fees are based on family size and household income to ensure every family can participate. No one is turned away for inability to pay.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                tier: 'Tier 1',
                income: 'Up to 185% of Federal Poverty Level',
                single: '$25/month',
                family: '$40/month',
                description: 'Full access to all programs, reduced fees for adult classes',
                color: '#4a7c59'
              },
              {
                tier: 'Tier 2',
                income: '186–300% of Federal Poverty Level',
                single: '$50/month',
                family: '$80/month',
                description: 'Full access to all programs, standard adult class fees',
                color: 'var(--boxing-gold)'
              },
              {
                tier: 'Tier 3',
                income: 'Above 300% of Federal Poverty Level',
                single: '$75/month',
                family: '$120/month',
                description: 'Full access + supports scholarships for other families',
                color: 'var(--boxing-red)'
              }
            ].map((tier) => (
              <div
                key={tier.tier}
                className="p-6 border-t-4 text-center"
                style={{ borderColor: tier.color, backgroundColor: 'rgba(255,255,255,0.5)' }}
              >
                <h3 className="font-[family-name:var(--font-oswald)] text-lg font-bold uppercase tracking-wider mb-2" style={{ color: tier.color }}>
                  {tier.tier}
                </h3>
                <p className="font-[family-name:var(--font-playfair)] text-xs mb-4" style={{ color: 'var(--boxing-brown)', opacity: 0.7 }}>
                  {tier.income}
                </p>
                <div className="mb-4">
                  <p className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider mb-1" style={{ color: 'var(--boxing-brown)' }}>
                    Single Child
                  </p>
                  <p className="font-[family-name:var(--font-playfair)] text-2xl font-bold" style={{ color: tier.color }}>
                    {tier.single}
                  </p>
                </div>
                <div className="mb-4">
                  <p className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider mb-1" style={{ color: 'var(--boxing-brown)' }}>
                    Family (2+ Children)
                  </p>
                  <p className="font-[family-name:var(--font-playfair)] text-2xl font-bold" style={{ color: tier.color }}>
                    {tier.family}
                  </p>
                </div>
                <p className="font-[family-name:var(--font-playfair)] text-xs italic mt-4" style={{ color: 'var(--boxing-brown)', opacity: 0.7 }}>
                  {tier.description}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-white p-8 rounded-lg border-2" style={{ borderColor: 'var(--boxing-gold)' }}>
            <h3 className="font-[family-name:var(--font-oswald)] text-xl font-bold uppercase tracking-wider mb-4 text-center" style={{ color: 'var(--boxing-brown)' }}>
              What's Included
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-[family-name:var(--font-oswald)] text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--boxing-red)' }}>
                  Featherweight (Ages 7–14)
                </h4>
                <ul className="space-y-2 font-[family-name:var(--font-playfair)] text-sm" style={{ color: 'var(--boxing-brown)' }}>
                  <li>• Unlimited quest participation</li>
                  <li>• Access to all four pillars</li>
                  <li>• Portfolio building & artifacts</li>
                  <li>• Badge system & recognition</li>
                  <li>• Crew-based learning</li>
                  <li>• Mentorship programs</li>
                </ul>
              </div>
              <div>
                <h4 className="font-[family-name:var(--font-oswald)] text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--boxing-red)' }}>
                  Additional Services
                </h4>
                <ul className="space-y-2 font-[family-name:var(--font-playfair)] text-sm" style={{ color: 'var(--boxing-brown)' }}>
                  <li>• Early childhood childcare (separate fees apply)</li>
                  <li>• Welterweight & Cruiserweight (ages 14–21, paid at 17+)</li>
                  <li>• Adult classes (per-class or package pricing)</li>
                  <li>• Community events (free or low-cost)</li>
                  <li>• Family membership portal</li>
                  <li>• Parent/guardian communication tools</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t-2 text-center" style={{ borderColor: 'var(--boxing-gold)' }}>
              <p className="font-[family-name:var(--font-playfair)] text-sm italic" style={{ color: 'var(--boxing-brown)' }}>
                Financial assistance available for families facing hardship. Contact us to discuss payment plans or scholarship opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Architect */}
      <section className="py-20 px-4" style={{ backgroundColor: 'var(--boxing-cream)' }}>
        <div className="max-w-4xl mx-auto">
          <p className="font-[family-name:var(--font-oswald)] text-sm tracking-[0.4em] uppercase mb-4 text-center" style={{ color: 'var(--boxing-gold)' }}>
            The Architect
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold text-center mb-12" style={{ color: 'var(--boxing-brown)' }}>
            John Lyman, M.Ed.
          </h2>

          <div className="grid md:grid-cols-3 gap-8 items-start">
            {/* Photo placeholder */}
            <div className="md:col-span-1">
              <div className="aspect-square rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--boxing-brown)' }}>
                <div className="text-center p-6">
                  <div className="text-6xl mb-4">🎯</div>
                  <div className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider" style={{ color: 'var(--boxing-gold)' }}>
                    Ring Leader
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="font-[family-name:var(--font-playfair)] text-sm italic" style={{ color: 'var(--boxing-brown)', opacity: 0.7 }}>
                  "The Interface Between<br />Systems and Stories"
                </p>
              </div>
            </div>

            {/* Bio */}
            <div className="md:col-span-2 space-y-4">
              <p className="font-[family-name:var(--font-playfair)] text-lg leading-relaxed" style={{ color: 'var(--boxing-brown)' }}>
                After 16 years running youth programs at YouthCity—serving 5,000+ young people annually with 200+
                technology-integrated learning experiences—I kept seeing the same gap: programs that either
                treated kids like data points or ignored accountability entirely.
              </p>
              <p className="font-[family-name:var(--font-playfair)] text-lg leading-relaxed" style={{ color: 'var(--boxing-brown)' }}>
                Then I spent six years as Utah's Student Data Privacy Specialist, training 50,000+ educators
                and building the state's privacy infrastructure from scratch. I chaired the committee that wrote
                Utah's K-12 AI professional development framework. I learned what it takes to protect people while still building powerful systems.
              </p>
              <p className="font-[family-name:var(--font-playfair)] text-lg leading-relaxed" style={{ color: 'var(--boxing-brown)' }}>
                The Rings is where it all comes together: <strong>youth development that respects agency</strong>,
                <strong>technology that serves humans</strong>, and <strong>systems that keep data private</strong>.
                Every tap-in, every quest, every badge—designed so the young person controls their own story.
              </p>

              {/* Credentials */}
              <div className="pt-6 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--boxing-brown)', opacity: 0.9 }}>
                  <div className="font-[family-name:var(--font-oswald)] text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--boxing-gold)' }}>
                    Background
                  </div>
                  <ul className="text-sm space-y-1 font-[family-name:var(--font-playfair)]" style={{ color: 'var(--boxing-sepia)' }}>
                    <li>• M.Ed. Educational Psychology</li>
                    <li>• 25+ years in education</li>
                    <li>• VR/AR pioneer in youth programs</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--boxing-brown)', opacity: 0.9 }}>
                  <div className="font-[family-name:var(--font-oswald)] text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--boxing-gold)' }}>
                    Philosophy
                  </div>
                  <ul className="text-sm space-y-1 font-[family-name:var(--font-playfair)]" style={{ color: 'var(--boxing-sepia)' }}>
                    <li>• Agency over surveillance</li>
                    <li>• Humans in the loop</li>
                    <li>• Privacy by design</li>
                  </ul>
                </div>
              </div>

              {/* The musician angle */}
              <p className="font-[family-name:var(--font-playfair)] text-sm italic pt-4" style={{ color: 'var(--boxing-brown)', opacity: 0.7 }}>
                Also: 24 years as bassist/songwriter for Starmy (Lollapalooza 2004, 6 albums).
                The discipline of building songs taught me how to build systems.
              </p>

              {/* Links */}
              <div className="flex gap-4 pt-4">
                <a
                  href="https://www.linkedin.com/in/john-lyman-m-ed-4871b5a2/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-sm font-[family-name:var(--font-oswald)] uppercase tracking-wider transition-all hover:scale-105"
                  style={{ backgroundColor: 'var(--boxing-brown)', color: 'var(--boxing-cream)' }}
                >
                  LinkedIn
                </a>
                <a
                  href="https://www.johnlyman.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-sm font-[family-name:var(--font-oswald)] uppercase tracking-wider transition-all hover:scale-105"
                  style={{ backgroundColor: 'var(--boxing-gold)', color: 'var(--boxing-black)' }}
                >
                  johnlyman.net
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Get Involved */}
      <section id="join" className="py-20 px-4" style={{ backgroundColor: 'var(--boxing-red)' }}>
        <div className="max-w-5xl mx-auto text-center">
          <p className="font-[family-name:var(--font-oswald)] text-sm tracking-[0.4em] uppercase mb-4" style={{ color: 'var(--boxing-gold)' }}>
            Get Involved
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold mb-12" style={{ color: 'var(--boxing-cream)' }}>
            Step Into the Ring
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Enroll', desc: 'Register your child', link: '/signup', cta: 'Get Started' },
              { title: 'Donate', desc: 'Support local youth', link: '#feedback', cta: 'Give Now' },
              { title: 'Partner', desc: 'Collaborate with us', link: '#feedback', cta: 'Contact Us' },
              { title: 'Work Here', desc: 'Join our team', link: '#feedback', cta: 'View Jobs' }
            ].map((item) => (
              <div key={item.title} className="p-6 text-center" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
                <h3 className="font-[family-name:var(--font-oswald)] text-xl font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--boxing-cream)' }}>
                  {item.title}
                </h3>
                <p className="text-sm font-[family-name:var(--font-playfair)] font-medium mb-3" style={{ color: 'var(--boxing-sepia)' }}>
                  {item.desc}
                </p>
                <Link
                  href={item.link}
                  className="text-sm font-[family-name:var(--font-oswald)] font-medium uppercase tracking-wider hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--boxing-gold)' }}
                >
                  {item.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="py-20 px-4" style={{ backgroundColor: 'var(--boxing-cream)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-[family-name:var(--font-oswald)] text-sm tracking-[0.4em] uppercase mb-4" style={{ color: 'var(--boxing-gold)' }}>
            Visit Us
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--boxing-brown)' }}>
            Fullmer Legacy Center Campus
          </h2>
          <p className="font-[family-name:var(--font-playfair)] text-xl mb-2" style={{ color: 'var(--boxing-brown)' }}>
            South Jordan, Utah
          </p>
          <div className="mb-8 space-y-2">
            <p className="font-[family-name:var(--font-playfair)]" style={{ color: 'var(--boxing-brown)', opacity: 0.8 }}>
              <strong>Flyweight (Ages 0–7):</strong> Monday–Friday, 6am–3pm
            </p>
            <p className="font-[family-name:var(--font-playfair)]" style={{ color: 'var(--boxing-brown)', opacity: 0.8 }}>
              <strong>Featherweight (Ages 7–14):</strong> Monday–Friday, 3pm–8pm • Saturday 10am–4pm
            </p>
            <p className="font-[family-name:var(--font-playfair)]" style={{ color: 'var(--boxing-brown)', opacity: 0.8 }}>
              <strong>Welterweight & Cruiserweight (Ages 14–21):</strong> Flexible schedule • Paid at 17+
            </p>
            <p className="font-[family-name:var(--font-playfair)]" style={{ color: 'var(--boxing-brown)', opacity: 0.8 }}>
              <strong>Heavyweight:</strong> Evenings & weekends (schedule varies)
            </p>
          </div>
          <a
            href="https://maps.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block font-[family-name:var(--font-oswald)] px-8 py-3 uppercase tracking-widest border-2 transition-colors hover:opacity-80"
            style={{ borderColor: 'var(--boxing-brown)', color: 'var(--boxing-brown)' }}
          >
            Get Directions
          </a>
        </div>
      </section>

      {/* Feedback Section */}
      <section id="feedback" className="py-20 px-4" style={{ backgroundColor: 'var(--boxing-red)' }}>
        <div className="max-w-4xl mx-auto">
          <p className="font-[family-name:var(--font-oswald)] text-sm tracking-[0.4em] uppercase mb-4 text-center" style={{ color: 'var(--boxing-gold)' }}>
            Share Your Thoughts
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold text-center mb-4" style={{ color: 'var(--boxing-cream)' }}>
            Questions, Comments & Suggestions
          </h2>
          <p className="text-center max-w-2xl mx-auto mb-12 font-[family-name:var(--font-playfair)] text-lg" style={{ color: 'var(--boxing-sepia)' }}>
            We'd love to hear from you. Share your feedback, ask questions, or suggest ideas to help us improve The Rings.
          </p>
          <div className="max-w-2xl mx-auto">
            <FeedbackForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t-2" style={{ backgroundColor: 'var(--boxing-brown)', borderColor: 'var(--boxing-gold)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="font-[family-name:var(--font-oswald)] font-bold text-lg tracking-widest uppercase mb-4" style={{ color: 'var(--boxing-gold)' }}>
                The Rings
              </div>
              <p className="text-sm font-[family-name:var(--font-playfair)]" style={{ color: 'var(--boxing-sepia)' }}>
                Youth development reimagined at the Fullmer Legacy Center Campus.
              </p>
            </div>
            <div>
              <h4 className="font-[family-name:var(--font-oswald)] font-bold text-sm uppercase tracking-wider mb-3" style={{ color: 'var(--boxing-cream)' }}>
                Programs
              </h4>
              <ul className="text-sm space-y-2 font-[family-name:var(--font-playfair)]" style={{ color: 'var(--boxing-sepia)' }}>
                <li><a href="#programs" className="hover:opacity-70 transition-opacity">Wellness</a></li>
                <li><a href="#programs" className="hover:opacity-70 transition-opacity">TechNest</a></li>
                <li><a href="#programs" className="hover:opacity-70 transition-opacity">Creative Studio</a></li>
                <li><a href="#programs" className="hover:opacity-70 transition-opacity">Civic Lab</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-[family-name:var(--font-oswald)] font-bold text-sm uppercase tracking-wider mb-3" style={{ color: 'var(--boxing-cream)' }}>
                Get Involved
              </h4>
              <ul className="text-sm space-y-2 font-[family-name:var(--font-playfair)]" style={{ color: 'var(--boxing-sepia)' }}>
                <li><Link href="/signup" className="hover:opacity-70 transition-opacity">Enroll</Link></li>
                <li><a href="#" className="hover:opacity-70 transition-opacity">Donate</a></li>
                <li><a href="#" className="hover:opacity-70 transition-opacity">Partner</a></li>
                <li><a href="#" className="hover:opacity-70 transition-opacity">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-[family-name:var(--font-oswald)] font-bold text-sm uppercase tracking-wider mb-3" style={{ color: 'var(--boxing-cream)' }}>
                Connect
              </h4>
              <ul className="text-sm space-y-2 font-[family-name:var(--font-playfair)]" style={{ color: 'var(--boxing-sepia)' }}>
                <li><a href="#" className="hover:opacity-70 transition-opacity">Instagram</a></li>
                <li><a href="#" className="hover:opacity-70 transition-opacity">Facebook</a></li>
                <li><a href="#feedback" className="hover:opacity-70 transition-opacity">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderColor: 'rgba(201, 162, 39, 0.3)' }}>
            <p className="text-xs font-[family-name:var(--font-playfair)]" style={{ color: 'var(--boxing-sepia)' }}>
              © 2025 Fullmer Legacy Center. All rights reserved.
            </p>
            <div className="flex gap-6 text-xs font-[family-name:var(--font-playfair)]" style={{ color: 'var(--boxing-sepia)' }}>
              <a href="#" className="hover:opacity-70 transition-opacity">Privacy Policy</a>
              <a href="#" className="hover:opacity-70 transition-opacity">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
