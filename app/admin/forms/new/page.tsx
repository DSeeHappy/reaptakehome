"use client"

import { useAuth } from "@/components/AuthProvider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { v4 as uuidv4 } from "uuid"

interface Field {
  id: string
  label: string
  type: "text" | "number"
  required: boolean
  placeholder: string
}

interface Section {
  id: string
  title: string
  description: string
  fields: Field[]
}

export default function NewForm() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    sections: [] as Section[]
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  const addSection = () => {
    if (formData.sections.length >= 2) return
    
    const newSection: Section = {
      id: uuidv4(),
      title: "",
      description: "",
      fields: []
    }
    
    setFormData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }))
  }

  const updateSection = (sectionId: string, field: keyof Section, value: string) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, [field]: value } : section
      )
    }))
  }

  const addField = (sectionId: string) => {
    const section = formData.sections.find(s => s.id === sectionId)
    if (!section || section.fields.length >= 3) return

    const newField: Field = {
      id: uuidv4(),
      label: "",
      type: "text",
      required: false,
      placeholder: ""
    }

    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, fields: [...section.fields, newField] }
          : section
      )
    }))
  }

  const updateField = (sectionId: string, fieldId: string, field: keyof Field, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              fields: section.fields.map(f =>
                f.id === fieldId ? { ...f, [field]: value } : f
              )
            }
          : section
      )
    }))
  }

  const removeField = (sectionId: string, fieldId: string) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              fields: section.fields.filter(f => f.id !== fieldId)
            }
          : section
      )
    }))
  }

  const removeSection = (sectionId: string) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId)
    }))
  }

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) return
    
    setIsGenerating(true)
    try {
      console.log("Sending AI request with prompt:", aiPrompt)
      const response = await fetch("/api/ai/generate-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: aiPrompt }),
      })
      
      console.log("AI response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        
        // Convert AI response to our form structure
        const generatedSections: Section[] = data.sections.map((section: { title: string; description: string; fields: Array<{ label: string; type: string; required: boolean; placeholder: string }> }) => ({
          id: uuidv4(),
          title: section.title,
          description: section.description,
          fields: section.fields.map((field: { label: string; type: string; required: boolean; placeholder: string }) => ({
            id: uuidv4(),
            label: field.label,
            type: field.type,
            required: field.required || false,
            placeholder: field.placeholder || ""
          }))
        }))

        setFormData(prev => ({
          ...prev,
          sections: generatedSections
        }))
        
        // Clear the prompt
        setAiPrompt("")
      } else {
        const errorData = await response.json()
        console.error("Error generating form with AI:", errorData)
        alert(`Error: ${errorData.error || 'Failed to generate form'}`)
      }
    } catch (error) {
      console.error("Error generating form with AI:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/admin")
      } else {
        console.error("Error creating form")
      }
    } catch (error) {
      console.error("Error creating form:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
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
                Create New Form
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/admin")}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Form Details</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Form Title *
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">AI Form Generation</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="ai-prompt" className="block text-sm font-medium text-gray-700">
                  Describe the form you want to create
                </label>
                <div className="mt-1 flex space-x-2">
                  <input
                    type="text"
                    id="ai-prompt"
                    placeholder="e.g., A job application form"
                    className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && generateWithAI()}
                  />
                  <button
                    type="button"
                    onClick={generateWithAI}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    {isGenerating ? "Generating..." : "Generate with AI"}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  AI will generate up to 2 sections with 3 fields each
                </p>
              </div>
            </div>
          </div>

          {formData.sections.map((section, sectionIndex) => (
            <div key={section.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Section {sectionIndex + 1}
                </h2>
                <button
                  type="button"
                  onClick={() => removeSection(section.id)}
                  className="text-red-600 hover:text-red-500 text-sm font-medium"
                >
                  Remove Section
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Section Title *
                  </label>
                  <input
                    type="text"
                    required
                    aria-label="Section Title"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={section.title}
                    onChange={(e) => updateSection(section.id, "title", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Section Description
                  </label>
                  <textarea
                    rows={2}
                    aria-label="Section Description"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={section.description}
                    onChange={(e) => updateSection(section.id, "description", e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-md font-medium text-gray-900">Fields</h3>
                  <button
                    type="button"
                    onClick={() => addField(section.id)}
                    disabled={section.fields.length >= 3}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm font-medium"
                  >
                    Add Field ({section.fields.length}/3)
                  </button>
                </div>

                {section.fields.map((field, fieldIndex) => (
                  <div key={field.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-medium text-gray-700">
                        Field {fieldIndex + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeField(section.id, field.id)}
                        className="text-red-600 hover:text-red-500 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Field Label *
                        </label>
                        <input
                          type="text"
                          required
                          aria-label="Field Label"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={field.label}
                          onChange={(e) => updateField(section.id, field.id, "label", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Field Type
                        </label>
                        <select
                          aria-label="Field Type"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={field.type}
                          onChange={(e) => updateField(section.id, field.id, "type", e.target.value as "text" | "number")}
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Placeholder
                        </label>
                        <input
                          type="text"
                          aria-label="Field Placeholder"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={field.placeholder}
                          onChange={(e) => updateField(section.id, field.id, "placeholder", e.target.value)}
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`required-${field.id}`}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          checked={field.required}
                          onChange={(e) => updateField(section.id, field.id, "required", e.target.checked)}
                        />
                        <label htmlFor={`required-${field.id}`} className="ml-2 block text-sm text-gray-900">
                          Required field
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={addSection}
              disabled={formData.sections.length >= 2}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Add Section ({formData.sections.length}/2)
            </button>
            
            <button
              type="submit"
              disabled={isLoading || formData.sections.length === 0}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              {isLoading ? "Creating..." : "Create Form"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
