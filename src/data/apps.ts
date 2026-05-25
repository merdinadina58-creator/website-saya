/**
 * Konfigurasi daftar aplikasi yang akan ditampilkan di navbar.
 *
 * Cara menambahkan aplikasi baru:
 * 1. Tambahkan objek baru ke array `apps` di bawah
 * 2. Isi field: name (nama aplikasi) dan url (URL aplikasi)
 *
 * Anda juga bisa menambahkan aplikasi langsung dari website
 * melalui tombol "+ Tambah" di menu Aplikasi.
 */

export interface AppItem {
  name: string;
  url: string;
}

export const defaultApps: AppItem[] = [
  {
    name: "Dashboard",
    url: "https://dashboard.example.com",
  },
  {
    name: "Analytics",
    url: "https://analytics.example.com",
  },
  {
    name: "Email",
    url: "https://mail.example.com",
  },
  {
    name: "Cloud Storage",
    url: "https://drive.example.com",
  },
];
