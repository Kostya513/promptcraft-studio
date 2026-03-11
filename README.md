# Промт-Студия

## Project info

This repository contains the source code for the Промт-Студия web application.

**Local development:** run the development server on `http://localhost:5173` (default Vite port).

## How can I edit this code?

You can work locally using your preferred IDE. Clone the repository and make changes as needed.

### Prerequisites

- Node.js (LTS) and npm installed. You can use [nvm](https://github.com/nvm-sh/nvm) to manage versions.

### Getting started

```sh
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will automatically reload when you edit source files.

### Editing online

You can also edit files directly on GitHub by navigating to the file and clicking the pencil icon.

## Technologies used

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Database

The codebase does not include a local database; it expects a PostgreSQL (e.g. Supabase) backend.

### Clean the database

A SQL script is provided to remove all data while preserving table structure:

```sh
# run against your Postgres connection (replace DSN as needed)
PGPASSWORD=<password> psql "postgres://user:pass@host:port/dbname" -f scripts/clean-database.sql
```

**Warning:** the script deletes *all* rows and resets identity columns. Use with caution.

## First run

On a fresh setup or after cleaning the database:

1. Clone the repository and install dependencies (`npm install`).
2. Ensure your `.env` or environment variables point to an empty database.
3. Start the dev server (`npm run dev`).
4. Register a new user via the `/register` page. No demo content will be visible.

## Deployment

Build the production bundle with `npm run build` and deploy the output from the `dist` directory to your hosting provider.

## Custom domain

Configure a custom domain via your hosting service or deployment platform; specifics depend on where you host the built app.
