/**
 * Konfigurasi daftar aplikasi yang akan ditampilkan di navbar.
 *
 * Cara menambahkan aplikasi baru:
 * 1. Tambahkan objek baru ke array `apps` di bawah
 * 2. Isi field: name, url, description, icon (nama ikon Lucide), dan color (warna aksen)
 *
 * Daftar ikon tersedia: https://lucide.dev/icons/
 */

export interface AppItem {
  name: string;
  url: string;
  description: string;
  icon: string; // Nama ikon dari Lucide
  color: string; // Warna aksen untuk ikon (format Tailwind)
}

export const apps: AppItem[] = [
  {
    name: "Dashboard",
    url: "https://dashboard.example.com",
    description: "Panel kontrol utama",
    icon: "LayoutDashboard",
    color: "text-amber-500",
  },
  {
    name: "Analytics",
    url: "https://analytics.example.com",
    description: "Analitik & laporan data",
    icon: "BarChart3",
    color: "text-emerald-500",
  },
  {
    name: "Email",
    url: "https://mail.example.com",
    description: "Klien email bisnis",
    icon: "Mail",
    color: "text-rose-500",
  },
  {
    name: "Cloud Storage",
    url: "https://drive.example.com",
    description: "Penyimpanan file awan",
    icon: "Cloud",
    color: "text-sky-500",
  },
  {
    name: "Chat",
    url: "https://chat.example.com",
    description: "Pesan & komunikasi tim",
    icon: "MessageCircle",
    color: "text-violet-500",
  },
  {
    name: "Project Manager",
    url: "https://projects.example.com",
    description: "Manajemen proyek & tugas",
    icon: "Kanban",
    color: "text-orange-500",
  },
];
