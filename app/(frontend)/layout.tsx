import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { DM_Sans, JetBrains_Mono, Source_Serif_4, Syne } from 'next/font/google';
import './globals.css';
import '@/styles/base.scss';
import '@/styles/typography.scss';
import { Header } from '@/components/blocks/header/header';
import { Footer } from '@/components/blocks/footer/footer';
import { THEME_COOKIE_NAME } from '@/config';
import { isProduction } from '@/lib/env';
import { OPEN_GRAPH_DEFAULTS, TWITTER_DEFAULTS } from '@/lib/seo/social';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

const dmSans = DM_Sans({
  variable: '--ff-ui',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--ff-code',
  subsets: ['latin'],
  weight: ['400'],
});

const sourceSerif4 = Source_Serif_4({
  variable: '--ff-body',
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
});

const syne = Syne({
  variable: '--ff-display',
  subsets: ['latin'],
  weight: ['600', '700', '800'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  openGraph: OPEN_GRAPH_DEFAULTS,
  twitter: TWITTER_DEFAULTS,
  ...(isProduction() ? {} : { robots: { index: false, follow: false } }),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = (await cookies()).get(THEME_COOKIE_NAME)?.value;

  return (
    <html lang="en" data-theme={theme === 'light' ? 'light' : undefined}>
      <body
        className={`${dmSans.variable} ${jetbrainsMono.variable} ${sourceSerif4.variable} ${syne.variable} antialiased`}
      >
        <Header />
        <main>{children}</main>
        <Footer />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
