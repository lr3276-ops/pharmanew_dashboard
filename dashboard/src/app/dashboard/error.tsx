'use client'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="p-8 flex items-start justify-center min-h-[60vh]">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-sm text-red-700 max-w-lg w-full mt-16">
        <p className="font-semibold mb-1">Something went wrong loading this page</p>
        {error.digest && (
          <p className="font-mono text-xs text-red-500 mt-1">Digest: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 font-semibold rounded-lg text-xs transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
