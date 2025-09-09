# Form Builder

A full-stack web application for creating custom forms with AI assistance, built with Next.js, Prisma, and OpenAI.

## Features

- **Admin Authentication**: Simple login with hardcoded credentials (admin@example.com / password123)
- **Form Creation**: Create forms with up to 2 sections and 3 fields per section
- **Field Types**: Support for text and number input fields
- **AI Integration**: Generate form structure using OpenAI's GPT-5
- **Public Forms**: Each form gets a unique public URL for submissions
- **Form Submissions**: Users can fill out and submit forms
- **Responsive Design**: Built with Tailwind CSS for mobile-first design

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (development)
- **Authentication**: Simple hardcoded admin login
- **AI**: OpenAI GPT-5
- **Deployment**: Vercel

## Setup

This project requires Node.js 18+, npm, and an OpenAI API key. The application uses SQLite for data storage and includes a Prisma schema for database management.

### Quick Start - WITHOUT THIS YOU WILL NOT HAVE THE ADMIN@EXAMPLE.COM user this is REQUIRED!

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run setup script:**
   ```bash
   npm run setup
   ```

3. **Add your OpenAI API key:**
   - Edit `.env.local` and add your OpenAI API key
   - Get your key from: https://platform.openai.com/api-keys

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Login with:**
   - Email: `admin@example.com`
   - Password: `password123`

## Features

### Admin Dashboard
- Login with hardcoded credentials (admin@example.com / password123)
- Create forms with up to 2 sections and 3 fields per section
- AI-powered form generation using natural language prompts
- View all created forms with public submission links
- Monitor form submissions and responses

### AI Form Generation
- Describe desired form structure in natural language
- AI generates relevant sections and fields automatically
- Enforces project constraints (2 sections max, 3 fields per section)
- Supports text and number field types only

### Public Form Interface
- Each form has a unique public URL: `/form/[publicId]`
- Public users can fill out and submit forms
- All submissions are stored in the database

## API Endpoints

- `GET /api/forms` - Get all forms for admin user
- `POST /api/forms` - Create a new form
- `GET /api/forms/public/[publicId]` - Get public form data
- `POST /api/forms/public/[publicId]/submit` - Submit form data
- `GET /api/forms/[formId]/submissions` - Get form submissions
- `POST /api/ai/generate-form` - Generate form with AI

## Database Schema

- **Users**: Simple admin user (hardcoded)
- **Forms**: Form metadata and configuration
- **Sections**: Form sections with titles and descriptions
- **Fields**: Individual form fields with types and validation
- **FormSubmissions**: User submissions
- **FieldResponses**: Individual field responses

## Deployment

The application is designed for Vercel deployment with SQLite for data storage. Environment variables include the OpenAI API key for AI functionality.

## Project Structure

```
├── app/
│   ├── admin/                 # Admin dashboard
│   ├── login/                 # Login page
│   ├── form/[publicId]/       # Public form pages
│   ├── api/                   # API routes
│   │   ├── ai/               # AI generation endpoints
│   │   ├── auth/             # Authentication endpoints
│   │   └── forms/            # Form management endpoints
│   └── globals.css            # Global styles
├── components/                # React components
│   ├── AuthProvider.tsx      # Authentication context
│   └── AIGenerationModal.tsx # AI form generation modal
├── hooks/                     # Custom React hooks
│   └── useAISuggestions.ts   # AI generation hook
├── lib/                       # Utility functions
│   ├── aiPrompt.ts           # AI prompt templates
│   ├── aiSchema.ts           # Zod validation schemas
│   ├── formFromAI.ts         # AI form persistence
│   ├── auth-server.ts        # Server-side auth
│   └── prisma.ts             # Prisma client
├── prisma/                    # Database schema
├── types/                     # TypeScript type definitions
│   └── ai.ts                 # AI-related types
└── public/                    # Static assets
```

## AI Integration Details

The AI integration uses OpenAI's GPT-5 model to generate form structures based on natural language prompts. Key features:

- **Smart Form Generation**: Describe what you want and AI creates the form structure
- **Constraint Enforcement**: AI respects the 2-section, 3-field limits
- **Type Safety**: Only generates 'text' and 'number' field types
- **Cost Effective**: Uses the most economical OpenAI model
- **Validation**: Zod schemas ensure data integrity

