---
Task ID: 1
Agent: Main Agent
Task: Add Informasi/Pengumuman feature to the personal website

Work Log:
- Reviewed existing project structure (Prisma schema, API routes, components, AdminProvider, ContentProvider)
- Confirmed password show/hide toggle from previous session was already implemented
- Added `Announcement` model to Prisma schema (id, title, content, category, pinned, createdAt, updatedAt)
- Pushed schema to database and regenerated Prisma client
- Created API routes: GET /api/announcements (public), POST /api/announcements (admin), PUT /api/announcements/[id] (admin), DELETE /api/announcements/[id] (admin)
- Created InformasiSection component with: search bar, category filters, pinned/regular announcement display, admin controls (add, edit, delete, pin/unpin)
- Added "Informasi" link to navbar navigation
- Integrated InformasiSection into main page (between Portfolio and Contact)
- Restarted dev server, verified API returns 200, lint passes clean

Stage Summary:
- New Prisma model: Announcement (title, content, category, pinned)
- New API routes: /api/announcements (GET, POST), /api/announcements/[id] (PUT, DELETE)
- New component: src/components/InformasiSection.tsx (full CRUD for admin, public view for visitors)
- Categories: Umum, SPMB, Kelulusan, Penting (each with unique color badge)
- Features: search, filter by category, pin/unpin announcements, relative time display
- All admin actions require authentication via x-admin-username/x-admin-password headers

---
Task ID: 2
Agent: Main Agent
Task: Fix blank page (Z logo) and server errors

Work Log:
- Analyzed user screenshot showing "sandbox is inactive" and 429 error in console
- Discovered "Event handlers cannot be passed to Client Component props" error in server-side rendering
- Fixed not-found.tsx missing "use client" directive
- Removed unused DropdownMenu imports from InformasiSection.tsx
- Added ErrorBoundary component wrapping each section in page.tsx to prevent full page crash
- Created global error.tsx with user-friendly error page (retry/reload buttons)
- Created not-found.tsx with proper "use client" directive
- Fixed next.config.ts allowedDevOrigins (string instead of regex)
- Cleared .next cache to remove stale compiled artifacts
- Lint passes clean, server returns HTTP 200

Stage Summary:
- Root cause: Server-side rendering error + server process dying = blank Z logo page
- Fix 1: ErrorBoundary on every section - if one crashes, others stay visible
- Fix 2: Global error.tsx - never shows blank page, shows error UI instead
- Fix 3: Fixed not-found.tsx "use client" directive
- Fix 4: Removed unused imports that could cause serialization issues
- Fix 5: Cleared .next cache
- Note: Server process dying is a sandbox environment issue, not code issue
