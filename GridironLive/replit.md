# Overview

This is a full-stack football scoreboard application built with a React frontend and Express.js backend. The application displays real-time football game scores by fetching data from an external Google Sheets API. It features a modern, responsive design using shadcn/ui components and provides automatic data refreshing to keep scores current.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management with automatic caching, background refetching, and error handling
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming and design tokens

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **API Design**: RESTful API with a single endpoint (`/api/games`) that proxies external data
- **Data Source**: External Google Sheets API via Google Apps Script for real-time game data
- **Error Handling**: Centralized error middleware with proper HTTP status codes
- **Development Tools**: Custom logging middleware for API request monitoring

## Data Management
- **Database**: Drizzle ORM configured for PostgreSQL with schema definitions in shared directory
- **Schema**: User authentication schema defined but not actively used (placeholder for future features)
- **Validation**: Zod schemas for runtime type validation of API responses and data structures
- **Storage**: In-memory storage implementation as fallback/development option

## Development Workflow
- **Build System**: Vite for frontend bundling with hot module replacement
- **TypeScript**: Strict type checking across frontend, backend, and shared code
- **Code Organization**: Monorepo structure with shared types and schemas between client and server
- **Path Aliases**: TypeScript path mapping for clean imports (`@/`, `@shared/`)

## External Dependencies

- **Data Source**: Google Sheets API via Google Apps Script for football game data
- **Database**: PostgreSQL with Neon Database serverless connection
- **UI Library**: Radix UI primitives for accessible, unstyled components
- **Styling**: Tailwind CSS for utility-first styling approach
- **Fonts**: Google Fonts integration (Inter, DM Sans, Fira Code, Geist Mono, Architects Daughter)
- **Development**: Replit-specific tooling for development environment integration