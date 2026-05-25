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
