export default function SuspendedBanner() {
  return (
    <div className="w-full bg-amber-50 border-b border-amber-200 px-4 py-3">
      <div className="max-w-6xl mx-auto flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
        <p className="shrink-0 text-sm font-medium text-amber-800">
          ⚠ Backend temporarily suspended
        </p>

        <p className="text-sm text-amber-700">
          The API is on Render&apos;s free tier and has reached its usage limit.
          Services and team shown below are sample data.{` `}
          <a
            href="https://luxe-hair-studio-api.onrender.com/health"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 transition-colors hover:text-amber-900"
          >
            Check API status
          </a>
        </p>
      </div>
    </div>
  )
}