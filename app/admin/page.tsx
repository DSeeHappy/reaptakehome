"use client"

import { useAuth } from "@/components/AuthProvider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import AIGenerationModal from "@/components/AIGenerationModal"

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
  submissions?: FormSubmission[]
}

interface FormSubmission {
  id: string
  submittedAt: string
  responses: {
    id: string
    value: string
    field: {
      id: string
      label: string
      type: string
    }
  }[]
}

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [forms, setForms] = useState<Form[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedForm, setSelectedForm] = useState<Form | null>(null)
  const [submissions, setSubmissions] = useState<FormSubmission[]>([])
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false)
  const [showAIModal, setShowAIModal] = useState(false)

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

  const fetchSubmissions = async (formId: string) => {
    setIsLoadingSubmissions(true)
    try {
      const response = await fetch(`/api/forms/${formId}/submissions`)
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data)
      }
    } catch (error) {
      console.error("Error fetching submissions:", error)
    } finally {
      setIsLoadingSubmissions(false)
    }
  }

  const handleViewSubmissions = (form: Form) => {
    setSelectedForm(form)
    fetchSubmissions(form.id)
  }

  const handleFormCreated = () => {
    fetchForms() // Refresh the forms list
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-black">Loading...</div>
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
            <h1 className="text-xl font-semibold text-black">
              Form Builder Admin
            </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-black">
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
            <h2 className="text-2xl font-bold text-black">Your Forms</h2>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAIModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>Generate with AI</span>
              </button>
              <Link
                href="/admin/forms/new"
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Create New Form
              </Link>
            </div>
          </div>

          {forms.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-black text-lg">No forms created yet.</p>
              <div className="mt-4 flex justify-center space-x-3">
                <button
                  onClick={() => setShowAIModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Generate with AI</span>
                </button>
                <Link
                  href="/admin/forms/new"
                  className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Create your first form
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {forms.map((form) => (
                <div key={form.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                  <div className="p-6 h-full flex flex-col">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-black mb-3 line-clamp-2">
                        {form.title}
                      </h3>
                      {form.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {form.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {form.sections.length} sections
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          {form.sections.reduce((acc, section) => acc + section.fields.length, 0)} fields
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium text-primary">
                            {Array.isArray(form.submissions) ? form.submissions.length : 0}
                          </span>
                          <span>responses</span>
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(form.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                      <Link
                        href={`/form/${form.publicId}`}
                        target="_blank"
                        className="flex-1 bg-primary hover:bg-primary-dark text-white text-center py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                      >
                        View Form
                      </Link>
                      <button
                        onClick={() => handleViewSubmissions(form)}
                        className="flex-1 bg-secondary hover:bg-secondary-dark text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                      >
                        View Responses
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Submissions Modal */}
      {selectedForm && (
        <div className="fixed inset-0 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl shadow-2xl rounded-xl bg-white">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-black">
                Responses for &quot;{selectedForm.title}&quot;
              </h3>
              <button
                onClick={() => setSelectedForm(null)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {isLoadingSubmissions ? (
                <div className="text-center py-8">
                  <div className="text-lg text-black">Loading responses...</div>
                </div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-black text-lg">No responses yet.</div>
                  <p className="text-gray-600 mt-2">Share the form link to start collecting responses.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {submissions.map((submission, index) => (
                    <div key={submission.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-black">Response #{index + 1}</h4>
                        <span className="text-sm text-gray-600">
                          {new Date(submission.submittedAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {submission.responses.map((response) => (
                          <div key={response.id} className="flex">
                            <div className="w-1/3 font-medium text-black pr-4">
                              {response.field.label}:
                            </div>
                            <div className="w-2/3 text-black">
                              {response.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Generation Modal */}
      <AIGenerationModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onFormCreated={handleFormCreated}
      />
    </div>
  )
}
