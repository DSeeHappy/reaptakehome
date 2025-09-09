"use client"

import { useParams } from "next/navigation"
import { useEffect, useState, useCallback } from "react"

interface Field {
  id: string
  label: string
  type: "text" | "number"
  required: boolean
  placeholder: string | null
}

interface Section {
  id: string
  title: string
  description: string | null
  fields: Field[]
}

interface Form {
  id: string
  title: string
  description: string | null
  sections: Section[]
}

export default function PublicForm() {
  const params = useParams()
  const publicId = params.publicId as string
  const [form, setForm] = useState<Form | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({})

  const fetchForm = useCallback(async () => {
    try {
      const response = await fetch(`/api/forms/public/${publicId}`)
      if (response.ok) {
        const data = await response.json()
        setForm(data)
      } else {
        console.error("Form not found")
      }
    } catch (error) {
      console.error("Error fetching form:", error)
    } finally {
      setIsLoading(false)
    }
  }, [publicId])

  useEffect(() => {
    fetchForm()
  }, [fetchForm])

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/forms/public/${publicId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsSubmitted(true)
      } else {
        console.error("Error submitting form")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading form...</div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Form Not Found</h1>
          <p className="text-gray-600">The form you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        </div>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow rounded-lg p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Form Submitted Successfully!</h2>
          <p className="text-gray-600">Thank you for your submission.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{form.title}</h1>
            {form.description && (
              <p className="text-gray-600 mb-8">{form.description}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {form.sections.map((section) => (
                <div key={section.id} className="border-b border-gray-200 pb-8 last:border-b-0">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {section.title}
                  </h2>
                  {section.description && (
                    <p className="text-gray-600 mb-6">{section.description}</p>
                  )}

                  <div className="space-y-6">
                    {section.fields.map((field) => (
                      <div key={field.id}>
                        <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-2">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {field.type === "text" ? (
                          <input
                            type="text"
                            id={field.id}
                            required={field.required}
                            placeholder={field.placeholder || ""}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={formData[field.id] || ""}
                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                          />
                        ) : (
                          <input
                            type="number"
                            id={field.id}
                            required={field.required}
                            placeholder={field.placeholder || ""}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={formData[field.id] || ""}
                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-md text-sm"
                >
                  {isSubmitting ? "Submitting..." : "Submit Form"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
