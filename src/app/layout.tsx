import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import { AppConfig } from "@/config/app.config";
import { Inter, Inder, Nunito_Sans } from "next/font/google";
import { ReduxProvider } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: AppConfig().app.meta.title,
  description: AppConfig().app.slogan,
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const inder = Inder({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-inder",
  display: "swap",
});

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito-sans",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const awinAdvertiserId = process.env.NEXT_PUBLIC_AWIN_ADVERTISER_ID;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${inder.variable} ${nunitoSans.variable}`}
    >
      <head>
        <Script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_TAG_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-tag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_TAG_ID}');
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <ReduxProvider>
          <Toaster richColors position="top-right" />
          {children}
        </ReduxProvider>
        {awinAdvertiserId ? (
          <Script
            src={`https://www.dwin1.com/${awinAdvertiserId}.js`}
            strategy="afterInteractive"
          />
        ) : null}
      </body>
    </html>
  );
}
