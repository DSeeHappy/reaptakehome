"use client"

import { useState } from 'react'
import { useAISuggestions } from '@/hooks/useAISuggestions'
import type { AISuggestionPayload } from '@/types/ai'
import LoadingSpinner from '@/components/LoadingSpinner'

interface AIGenerationModalProps {
  isOpen: boolean
  onClose: () => void
  onFormCreated: () => void
}

export default function AIGenerationModal({ isOpen, onClose, onFormCreated }: AIGenerationModalProps) {
  const [prompt, setPrompt] = useState('')
  const [suggestion, setSuggestion] = useState<AISuggestionPayload | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const { generateSuggestion, isLoading, error } = useAISuggestions()

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    try {
      const result = await generateSuggestion(prompt)
      setSuggestion(result)
    } catch (err) {
      console.error('Failed to generate suggestion:', err)
    }
  }

  const handleSaveForm = async () => {
    if (!suggestion) return

    setIsSaving(true)
    try {
      await fetch('/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: suggestion.title,
          description: suggestion.description,
          sections: suggestion.sections.map(section => ({
            title: section.title,
            description: section.description,
            fields: section.fields.map(field => ({
              label: field.label,
              type: field.type,
              required: field.required || false,
              placeholder: field.placeholder
            }))
          }))
        })
      })

      onFormCreated()
      onClose()
      setSuggestion(null)
      setPrompt('')
    } catch (err) {
      console.error('Failed to save form:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    setSuggestion(null)
    setPrompt('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl shadow-2xl rounded-xl bg-white">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-black">
            Generate Form with AI
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {!suggestion ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                  Describe the form you want to create
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., A job application form with personal info and work experience"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-500"
                  rows={3}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-black bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-md transition-colors flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" text="" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    'Generate Form'
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <p className="text-sm text-green-600">AI generated form structure:</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-black mb-2">{suggestion.title}</h4>
                {suggestion.description && (
                  <p className="text-sm text-gray-600 mb-4">{suggestion.description}</p>
                )}

                <div className="space-y-4">
                  {suggestion.sections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="border-l-2 border-blue-200 pl-4">
                      <h5 className="font-medium text-black mb-2">{section.title}</h5>
                      {section.description && (
                        <p className="text-sm text-gray-600 mb-2">{section.description}</p>
                      )}
                      <div className="space-y-1">
                        {section.fields.map((field, fieldIndex) => (
                          <div key={fieldIndex} className="flex items-center space-x-2 text-sm">
                            <span className="font-medium text-black">{field.label}</span>
                            <span className="text-gray-500">({field.type})</span>
                            {field.required && (
                              <span className="text-red-500 text-xs">required</span>
                            )}
                            {field.placeholder && (
                              <span className="text-gray-400 text-xs">&quot;{field.placeholder}&quot;</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSuggestion(null)}
                  className="px-4 py-2 text-sm font-medium text-black bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Generate Another
                </button>
                <button
                  onClick={handleSaveForm}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 rounded-md transition-colors flex items-center space-x-2"
                >
                  {isSaving ? (
                    <>
                      <LoadingSpinner size="sm" text="" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    'Use This Form'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
