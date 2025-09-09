import { useState } from 'react';
import type { AISuggestionPayload } from '@/types/ai';

interface UseAISuggestionsReturn {
  generateSuggestion: (prompt: string) => Promise<AISuggestionPayload>;
  isLoading: boolean;
  error: string | null;
}

export function useAISuggestions(): UseAISuggestionsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSuggestion = async (prompt: string): Promise<AISuggestionPayload> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to generate suggestion');
      }

      const data = await response.json();
      return data.suggestion as AISuggestionPayload;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateSuggestion,
    isLoading,
    error,
  };
}
