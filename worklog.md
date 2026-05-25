---
Task ID: 1
Agent: Main Agent
Task: Add admin authentication system to protect edit features on the personal website

Work Log:
- Explored current project structure and read all component files
- Created `src/lib/auth.ts` with password verification and admin header checking utilities
- Created `src/components/AdminProvider.tsx` with useSyncExternalStore-based admin state (hydration-safe)
- Created `src/app/api/auth/login/route.ts` - POST endpoint for login
- Created `src/app/api/auth/password/route.ts` - PUT endpoint for changing password
- Updated `src/app/api/content/route.ts` - Added auth check for POST (skips internal keys starting with _)
- Updated `src/app/api/content/[key]/route.ts` - Added auth check for PUT and DELETE
- Updated `src/components/ContentProvider.tsx` - Sends x-admin-password header with mutating requests, handles 401 by auto-logout
- Updated `src/app/page.tsx` - Wrapped with AdminProvider outside ContentProvider
- Updated `src/components/Navbar.tsx` - Added Lock icon (login) / ShieldCheck icon (admin menu) with login dialog, password change dialog, admin badge in brand, gated apps add/delete behind admin state
- Updated all 6 section components (Hero, About, Skills, Portfolio, Contact, Footer) - Edit buttons only visible when admin is logged in

Stage Summary:
- Default admin password: "admin123" (can be changed via UI)
- API routes are protected: POST, PUT, DELETE require x-admin-password header
- GET content endpoint skips internal keys (starting with _)
- Admin state persisted in localStorage (isAdmin + adminPassword)
- Hydration-safe using useSyncExternalStore with server/client snapshots
- No lint errors, all API routes tested and working
