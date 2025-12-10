# Copilot Instructions - Bro Reserve

## Project Overview

This is a Next.js 16 reservation system application built with TypeScript, TailwindCSS v4, and React 19. The project is currently in development with a focus on creating a Japanese reservation system ("bro-reserve").

## Development Environment

- **Framework**: Next.js 16.0.8 with App Router
- **Styling**: TailwindCSS v4 with inline theme configuration
- **Fonts**: Geist Sans and Geist Mono from next/font/google
- **Language**: TypeScript with strict mode enabled
- **Linting**: ESLint with Next.js configuration

## Project Structure and Conventions

### File Organization
- Main application routes in `app/` directory following Next.js App Router conventions
- Components exported as default functions with descriptive names (e.g., `ReservePage`)
- TypeScript path mapping configured with `@/*` pointing to root directory

### Styling Patterns
- Dark theme primary: black background (`bg-black`) with white text (`text-white`)
- CSS custom properties defined in `app/globals.css` with theme-aware dark/light mode support
- Responsive design using Tailwind's responsive prefixes (e.g., `sm:items-start`)
- Font variables: `--font-geist-sans` and `--font-geist-mono` configured in layout

### Code Conventions
- React functional components with explicit return types
- Use of `className` with Tailwind utility classes
- Japanese text content for UI (e.g., "予約ページ", "ここから予約を進めていきます")
- Semantic HTML structure with proper `main` elements

## Development Workflow

### Commands
- `npm run dev` - Start development server on localhost:3000
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - ESLint checking

### Current Implementation
- Root level `page.tsx` contains a basic reservation page component
- `app/page.tsx` contains the default Next.js template (likely to be customized)
- Layout configured with Geist font loading and CSS variable setup

## Key Technical Decisions

- **TailwindCSS v4**: Using the latest version with inline theme configuration
- **React 19**: Leveraging the latest React features
- **TypeScript Strict Mode**: All type checking enabled for code quality
- **App Router**: Using Next.js 13+ App Router pattern instead of Pages Router

## Current State

The project appears to be in early development with a custom reservation page component at the root level, while maintaining the default Next.js starter template in the app directory. The Japanese language content suggests this is for a Japanese market reservation system.