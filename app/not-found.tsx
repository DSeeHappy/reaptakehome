import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-black mb-4">404</h1>
        <p className="text-gray-600 mb-8">Page not found</p>
        <Link
          href="/"
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
