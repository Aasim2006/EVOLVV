import "./globals.css";
import SiteChrome from "@/components/SiteChrome";

export const metadata = {
  title: "Evolvv | Wear the Change",
  description: "Premium black-and-white streetwear for a different breed.",
  applicationName: "Evolvv Admin",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Evolvv Admin"
  },
  icons: {
    icon: [
      { url: "/admin-icon.svg", type: "image/svg+xml" },
      { url: "/admin-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/admin-icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: "/admin-icon-192.png"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
