export type FieldType = 'text' | 'number';

export interface AISuggestionField {
  label: string;
  type: FieldType;         // 'text' | 'number'
  required?: boolean;      // default false in your schema
  placeholder?: string | null;
}

export interface AISuggestionSection {
  title: string;
  description?: string | null;
  fields: AISuggestionField[];   // ≤ 3 enforced by validator
}

export interface AISuggestionPayload {
  title: string;                  // form title
  description?: string | null;
  sections: AISuggestionSection[]; // ≤ 2 enforced by validator
}
