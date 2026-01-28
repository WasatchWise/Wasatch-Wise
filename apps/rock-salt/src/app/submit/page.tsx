import Container from '@/components/Container'
import MusicSubmissionForm from '@/components/MusicSubmissionForm'

export const metadata = {
  title: 'Submission Intake | The Rock Salt',
  description: 'Submit master audio and band metadata for indexing and broadcast.',
}

export default function SubmitPage() {
  return (
    <div className="bg-zinc-950">
      <Container className="py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-semibold text-zinc-100 mb-3">Submission Intake</h1>
            <p className="text-zinc-400">
              Submit master audio and metadata for indexing and broadcast review.
            </p>
          </div>

          <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-zinc-800 rounded-md p-5">
              <div className="text-xs text-zinc-500 mb-2">Step 1</div>
              <h3 className="font-semibold text-zinc-100 mb-2">Upload master</h3>
              <p className="text-sm text-zinc-400">WAV, FLAC, or MP3. Include credits and source.</p>
            </div>
            <div className="border border-zinc-800 rounded-md p-5">
              <div className="text-xs text-zinc-500 mb-2">Step 2</div>
              <h3 className="font-semibold text-zinc-100 mb-2">Review</h3>
              <p className="text-sm text-zinc-400">We verify location and metadata before publish.</p>
            </div>
            <div className="border border-zinc-800 rounded-md p-5">
              <div className="text-xs text-zinc-500 mb-2">Step 3</div>
              <h3 className="font-semibold text-zinc-100 mb-2">Claim profile</h3>
              <p className="text-sm text-zinc-400">Manage your page and booking details.</p>
            </div>
          </div>

          <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-zinc-800 rounded-md p-5">
              <h3 className="font-semibold text-zinc-100 mb-2">Selection criteria</h3>
              <ul className="text-sm text-zinc-400 space-y-2">
                <li>Bands with documented activity (shows, releases, or recorded output).</li>
                <li>Complete metadata: location, years active, genre, and contact.</li>
                <li>No promotional language or unsupported claims.</li>
                <li>Incomplete submissions are rejected.</li>
              </ul>
            </div>
            <div className="border border-zinc-800 rounded-md p-5">
              <h3 className="font-semibold text-zinc-100 mb-2">Review timeline</h3>
              <p className="text-sm text-zinc-400">
                Initial review typically completes within 5-10 business days. Revisions are requested by email.
              </p>
            </div>
          </div>

          <div className="border border-zinc-800 rounded-md p-8">
            <MusicSubmissionForm />
          </div>

          <div className="mt-10 text-center text-zinc-500 text-sm">
            <p>
              Questions:{" "}
              <a href="mailto:music@therocksalt.com" className="text-amber-200 font-semibold hover:underline">
                music@therocksalt.com
              </a>
            </p>
          </div>
        </div>
      </Container>
    </div>
  )
}
