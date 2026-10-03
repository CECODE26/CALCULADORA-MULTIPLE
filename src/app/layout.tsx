import type { Metadata, Viewport } from "next";
import "./globals.css";
import { siteConfig, absoluteUrl } from "@/config/site";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PreferencesProvider } from "@/components/PreferencesProvider";
import { ThirdPartyScripts } from "@/components/analytics/ThirdPartyScripts";
import { ConsentBanner } from "@/components/analytics/ConsentBanner";

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl("/")),
  title: {
    default: `${siteConfig.name}: calculadoras gratuitas de finanzas y negocios`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  alternates: { canonical: absoluteUrl("/") },
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.defaultLocale.replace("-", "_"),
    url: absoluteUrl("/"),
  },
  twitter: { card: "summary_large_image" },
  ...(siteConfig.googleSiteVerification ? { verification: { google: siteConfig.googleSiteVerification } } : {}),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7f4" },
    { media: "(prefers-color-scheme: dark)", color: "#111312" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={siteConfig.language}>
      <body>
        <a href="#contenido" className="skip-link">
          Saltar al contenido
        </a>
        <PreferencesProvider>
          <Header />
          <main id="contenido" tabIndex={-1}>
            {children}
          </main>
          <Footer />
          <ConsentBanner />
        </PreferencesProvider>
        <ThirdPartyScripts />
      </body>
    </html>
  );
}
