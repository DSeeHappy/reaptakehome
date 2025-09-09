# Multi-Form Builder

A full-stack web application for creating custom forms with AI assistance, built with Next.js, Prisma, and OpenAI.

## Features

- **Admin Authentication**: Simple login with hardcoded credentials (admin@example.com / password123)
- **Form Creation**: Create forms with up to 2 sections and 3 fields per section
- **Field Types**: Support for text and number input fields
- **AI Integration**: Generate form structure using OpenAI's GPT-3.5-turbo
- **Public Forms**: Each form gets a unique public URL for submissions
- **Form Submissions**: Users can fill out and submit forms
- **Responsive Design**: Built with Tailwind CSS for mobile-first design

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (development), PostgreSQL (production)
- **Authentication**: NextAuth.js
- **AI**: OpenAI GPT-3.5-turbo
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your values:
   ```
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   OPENAI_API_KEY="your-openai-api-key-here"
   ```

4. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Admin Features

1. **Login**: Use admin@example.com / password123
2. **Create Forms**: 
   - Add form title and description
   - Create up to 2 sections
   - Add up to 3 fields per section (text or number)
   - Use AI generation for quick form creation
3. **Manage Forms**: View all created forms with public links

### AI Form Generation

- Enter a description of the form you want to create
- Click "Generate with AI" to auto-generate sections and fields
- AI will create relevant form structure based on your prompt

### Public Form Access

- Each form gets a unique public URL: `/form/[publicId]`
- Public users can fill out and submit forms
- Form submissions are stored in the database

## API Endpoints

- `GET /api/forms` - Get all forms for authenticated user
- `POST /api/forms` - Create a new form
- `GET /api/forms/public/[publicId]` - Get public form data
- `POST /api/forms/public/[publicId]/submit` - Submit form data
- `POST /api/ai/generate-form` - Generate form with AI

## Database Schema

- **Users**: Admin users with authentication
- **Forms**: Form metadata and configuration
- **Sections**: Form sections with titles and descriptions
- **Fields**: Individual form fields with types and validation
- **FormSubmissions**: User submissions
- **FieldResponses**: Individual field responses

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_SECRET`: A random secret key
   - `NEXTAUTH_URL`: Your Vercel app URL
   - `OPENAI_API_KEY`: Your OpenAI API key

4. Deploy!

### Database Migration

For production, you'll need to migrate from SQLite to PostgreSQL:

1. Set up a PostgreSQL database (e.g., Vercel Postgres, Supabase)
2. Update `DATABASE_URL` in your environment variables
3. Run `npx prisma db push` to create tables

## Project Structure

```
├── app/
│   ├── admin/                 # Admin dashboard
│   ├── auth/                  # Authentication pages
│   ├── form/[publicId]/       # Public form pages
│   ├── api/                   # API routes
│   └── globals.css            # Global styles
├── components/                # React components
├── lib/                       # Utility functions
├── prisma/                    # Database schema
└── public/                    # Static assets
```

## Future Enhancements

- Form editing and deletion
- Form analytics and submission viewing
- Additional field types (email, date, dropdown)
- Form templates
- User management
- Form validation improvements
- Export submissions to CSV/PDF

## License

MIT License - feel free to use this project for your own purposes.