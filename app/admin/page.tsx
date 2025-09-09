"use client"

import { useAuth } from "@/components/AuthProvider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"

interface Form {
  id: string
  title: string
  description: string | null
  publicId: string
  createdAt: string
  sections: {
    id: string
    title: string
    fields: {
      id: string
      label: string
      type: string
    }[]
  }[]
}

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [forms, setForms] = useState<Form[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    } else if (user) {
      fetchForms()
    }
  }, [user, loading, router])

  const fetchForms = async () => {
    try {
      const response = await fetch("/api/forms")
      if (response.ok) {
        const data = await response.json()
        setForms(data)
      }
    } catch (error) {
      console.error("Error fetching forms:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Form Builder Admin
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user.name}
              </span>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Forms</h2>
            <Link
              href="/admin/forms/new"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Create New Form
            </Link>
          </div>

          {forms.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No forms created yet.</p>
              <Link
                href="/admin/forms/new"
                className="mt-4 inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Create your first form
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {forms.map((form) => (
                <div key={form.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {form.title}
                    </h3>
                    {form.description && (
                      <p className="text-sm text-gray-500 mb-4">
                        {form.description}
                      </p>
                    )}
                    <div className="text-xs text-gray-400 mb-4">
                      {form.sections.length} sections,{" "}
                      {form.sections.reduce((acc, section) => acc + section.fields.length, 0)} fields
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        href={`/form/${form.publicId}`}
                        target="_blank"
                        className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                      >
                        View Form
                      </Link>
                      <span className="text-gray-300">|</span>
                      <Link
                        href={`/admin/forms/${form.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
