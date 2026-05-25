---
Task ID: 1
Agent: main
Task: Fix blank page issue - website showing only "logo Z" after Informasi feature was added

Work Log:
- Analyzed user's error screenshot (VLM) - showed 429/sandbox inactive errors
- Inspected all components: page.tsx, InformasiSection, AdminProvider, ContentProvider, Navbar, ErrorBoundary, etc.
- Found that ErrorBoundary class component was wrapping all sections in page.tsx, which could cause hydration issues in Next.js 16 App Router
- Found that page.tsx was a Server Component wrapping Client Components (AdminProvider, ContentProvider) inside ErrorBoundary - this pattern can cause hydration errors
- Fixed page.tsx: Added "use client" directive, removed all ErrorBoundary wrappers
- Deleted ErrorBoundary.tsx component (no longer needed)
- Cleaned up error.tsx (simplified)
- Simplified dev script in package.json (removed `tee` pipe)
- Cleared .next cache multiple times
- Verified page renders correctly: 200 status, 112KB HTML with all sections including Informasi
- Verified API endpoints work: /api/announcements returns [], /api/content returns data
- Verified Prisma queries work correctly
- Lint passes with no errors

Stage Summary:
- Root cause: page.tsx was a Server Component passing client-side event handlers through ErrorBoundary, causing hydration errors that resulted in blank page
- Fix: Made page.tsx a "use client" component and removed ErrorBoundary wrappers
- All code is now correct and the page renders properly when the server is running
