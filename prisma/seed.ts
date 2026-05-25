import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const contentData: Record<string, object> = {
  hero: {
    name: "Alex Morgan",
    title: "Developer Kreatif & Desainer",
    tagline:
      "Menciptakan pengalaman digital yang elegan di mana desain bertemu teknologi. Saya membangun aplikasi web yang indah, cepat, dan aksesibel yang meninggalkan kesan mendalam.",
    available: "Tersedia untuk proyek freelance",
    cta1: "Lihat Karya Saya",
    cta2: "Hubungi Saya",
  },
  about: {
    heading:
      "Seorang developer dengan mata desainer dan passion untuk kode bersih.",
    paragraphs: [
      "Saya Alex Morgan, seorang developer kreatif dan desainer yang berbasis di Jakarta. Dengan pengalaman lebih dari lima tahun, saya spesialisasi dalam membangun aplikasi web yang indah dan berkinerja tinggi yang menjembatani kesenjangan antara estetika dan fungsionalitas.",
      "Perjalanan saya dimulai dari desain grafis, yang memberikan saya perspektif unik tentang pengalaman pengguna. Saya percaya bahwa perangkat lunak yang hebat tidak hanya harus berfungsi — tetapi juga harus memberikan kegembiraan. Setiap proyek yang saya ambil adalah kesempatan untuk menciptakan sesuatu yang bermakna dan berkesan.",
      "Saat tidak coding, Anda akan menemukan saya menjelajahi tipografi, bereksperimen dengan seni generatif, atau mendaki jalur pegunungan di Indonesia.",
    ],
    stats: [
      { value: "5+", label: "Tahun Pengalaman" },
      { value: "50+", label: "Proyek Selesai" },
      { value: "30+", label: "Klien Puas" },
      { value: "12", label: "Penghargaan" },
    ],
  },
  skills: {
    subtitle: "Keahlian & Spesialisasi",
    title: "Yang Saya Bisa Berikan",
    description:
      "Kemampuan serba bisa yang mencakup pengembangan frontend, rekayasa backend, dan desain UI/UX — memungkinkan saya memberikan solusi digital yang lengkap.",
    categories: [
      {
        id: "frontend",
        title: "Frontend",
        icon: "Code2",
        skills: [
          { name: "React / Next.js", level: 95 },
          { name: "TypeScript", level: 90 },
          { name: "Tailwind CSS", level: 92 },
          { name: "Framer Motion", level: 85 },
        ],
        tags: [
          "React",
          "Next.js",
          "TypeScript",
          "Vue",
          "Tailwind",
          "Framer Motion",
        ],
      },
      {
        id: "backend",
        title: "Backend",
        icon: "Server",
        skills: [
          { name: "Node.js", level: 88 },
          { name: "PostgreSQL", level: 82 },
          { name: "REST / GraphQL", level: 86 },
          { name: "Docker / CI/CD", level: 78 },
        ],
        tags: [
          "Node.js",
          "Python",
          "PostgreSQL",
          "GraphQL",
          "Docker",
          "AWS",
        ],
      },
      {
        id: "design",
        title: "Desain",
        icon: "Palette",
        skills: [
          { name: "Desain UI/UX", level: 90 },
          { name: "Figma", level: 92 },
          { name: "Sistem Desain", level: 87 },
          { name: "Prototipe", level: 84 },
        ],
        tags: [
          "Figma",
          "UI/UX",
          "Sistem Desain",
          "Prototipe",
          "Tipografi",
          "Ilustrasi",
        ],
      },
    ],
  },
  portfolio: {
    subtitle: "Portofolio",
    title: "Proyek Pilihan",
    description:
      "Pilihan kurasi proyek yang menampilkan kemampuan saya dalam desain, pengembangan, dan pemecahan masalah.",
    projects: [
      {
        id: "p1",
        title: "Lumina Dashboard",
        description:
          "Dashboard analitik real-time dengan visualisasi data interaktif dan dukungan mode gelap.",
        tags: ["React", "D3.js", "TypeScript"],
        gradient: "from-amber-400/80 to-orange-500/80",
        darkGradient: "dark:from-amber-600/40 dark:to-orange-700/40",
      },
      {
        id: "p2",
        title: "Verdant Store",
        description:
          "Platform e-commerce dengan alur checkout yang mulus dan katalog produk responsif.",
        tags: ["Next.js", "Stripe", "Prisma"],
        gradient: "from-emerald-400/80 to-teal-500/80",
        darkGradient: "dark:from-emerald-600/40 dark:to-teal-700/40",
      },
      {
        id: "p3",
        title: "Synthwave Player",
        description:
          "UI streaming musik dengan visualisasi gelombang suara dan manajemen playlist.",
        tags: ["Vue.js", "Web Audio", "Tailwind"],
        gradient: "from-rose-400/80 to-pink-500/80",
        darkGradient: "dark:from-rose-600/40 dark:to-pink-700/40",
      },
      {
        id: "p4",
        title: "Atlas Maps",
        description:
          "Aplikasi pemetaan interaktif dengan penanda kustom dan optimasi rute.",
        tags: ["React", "Mapbox", "Node.js"],
        gradient: "from-sky-400/80 to-cyan-500/80",
        darkGradient: "dark:from-sky-600/40 dark:to-cyan-700/40",
      },
      {
        id: "p5",
        title: "Noctis Blog",
        description:
          "Platform blog minimalis dengan pengeditan markdown dan optimasi SEO.",
        tags: ["Next.js", "MDX", "Vercel"],
        gradient: "from-violet-400/80 to-purple-500/80",
        darkGradient: "dark:from-violet-600/40 dark:to-purple-700/40",
      },
      {
        id: "p6",
        title: "Forge CMS",
        description:
          "Sistem manajemen konten headless dengan pembangun halaman seret dan lepas.",
        tags: ["TypeScript", "GraphQL", "React"],
        gradient: "from-yellow-400/80 to-amber-500/80",
        darkGradient: "dark:from-yellow-600/40 dark:to-amber-700/40",
      },
    ],
  },
  contact: {
    subtitle: "Kontak",
    title: "Mari Berkolaborasi",
    description:
      "Punya proyek di pikiran atau sekadar ingin menyapa? Saya akan senang mendengar dari Anda. Mari ciptakan sesuatu yang luar biasa.",
    heading: "Hubungi Saya",
    infoText:
      "Baik Anda punya pertanyaan, ide kolaborasi, atau sekadar ingin terhubung — kotak masuk saya selalu terbuka. Saya berusaha merespons dalam 24 jam.",
    followLabel: "Ikuti Saya",
    items: [
      {
        icon: "Mail",
        label: "Email",
        value: "alex@morgan.dev",
        href: "mailto:alex@morgan.dev",
      },
      { icon: "MapPin", label: "Lokasi", value: "Jakarta, Indonesia", href: null },
    ],
    socials: [
      { icon: "Github", label: "GitHub", url: "#" },
      { icon: "Linkedin", label: "LinkedIn", url: "#" },
      { icon: "Twitter", label: "Twitter", url: "#" },
    ],
  },
  footer: {
    brandName: "Alex",
    brandAccent: "Morgan",
    subtitle: "Developer Kreatif & Desainer",
    copyright: "Semua hak dilindungi.",
    madeWith: "Dibuat dengan ❤ dan banyak kopi",
    socials: [
      { icon: "Github", label: "GitHub", url: "#" },
      { icon: "Linkedin", label: "LinkedIn", url: "#" },
      { icon: "Twitter", label: "Twitter", url: "#" },
    ],
  },
  apps: [
    { name: "Dashboard", url: "https://dashboard.example.com" },
    { name: "Analytics", url: "https://analytics.example.com" },
    { name: "Email", url: "https://mail.example.com" },
    { name: "Cloud Storage", url: "https://drive.example.com" },
  ],
};

async function main() {
  console.log("Seeding database...");

  for (const [key, value] of Object.entries(contentData)) {
    await prisma.siteContent.upsert({
      where: { key },
      update: { value: JSON.stringify(value) },
      create: { key, value: JSON.stringify(value) },
    });
    console.log(`  ✓ Seeded: ${key}`);
  }

  console.log("\nSeeding complete!");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
