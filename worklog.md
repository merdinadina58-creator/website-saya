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
