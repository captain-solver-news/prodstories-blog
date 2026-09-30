import type { Metadata } from 'next';
import type { WebPage, WithContext } from 'schema-dts';
import { OPEN_GRAPH_DEFAULTS, TWITTER_DEFAULTS } from './social';

function createStaticPageSchema(name: string, description: string, path: string): WithContext<WebPage> {
  const siteUrl = process.env.PUBLIC_SITE_URL ?? 'http://localhost:3000';

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url: `${siteUrl}${path}`,
  };
}

export const homeMetadata: Metadata = {
  title: 'Home',
  description: 'Explore the latest articles, categories, and guides.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    ...OPEN_GRAPH_DEFAULTS,
    title: 'Home',
    description: 'Explore the latest articles, categories, and guides.',
    url: '/',
  },
  twitter: {
    ...TWITTER_DEFAULTS,
    card: 'summary',
    title: 'Home',
    description: 'Explore the latest articles, categories, and guides.',
  },
};

export const homeSchema = createStaticPageSchema('Home', 'Explore the latest articles, categories, and guides.', '/');

export const aboutMetadata: Metadata = {
  title: 'About',
  description: 'Learn more about our blog, mission, and editorial approach.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    ...OPEN_GRAPH_DEFAULTS,
    title: 'About',
    description: 'Learn more about our blog, mission, and editorial approach.',
    url: '/about',
  },
  twitter: {
    ...TWITTER_DEFAULTS,
    card: 'summary',
    title: 'About',
    description: 'Learn more about our blog, mission, and editorial approach.',
  },
};

export const aboutSchema = createStaticPageSchema(
  'About',
  'Learn more about our blog, mission, and editorial approach.',
  '/about'
);

export const blogMetadata: Metadata = {
  title: 'Blog',
  description: 'Browse all blog categories and discover published content.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    ...OPEN_GRAPH_DEFAULTS,
    title: 'Blog',
    description: 'Browse all blog categories and discover published content.',
    url: '/blog',
  },
  twitter: {
    ...TWITTER_DEFAULTS,
    card: 'summary',
    title: 'Blog',
    description: 'Browse all blog categories and discover published content.',
  },
};

export const blogSchema = createStaticPageSchema(
  'Blog',
  'Browse all blog categories and discover published content.',
  '/blog'
);

export const contactMetadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with our team for feedback, questions, or partnerships.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    ...OPEN_GRAPH_DEFAULTS,
    title: 'Contact',
    description: 'Get in touch with our team for feedback, questions, or partnerships.',
    url: '/contact',
  },
  twitter: {
    ...TWITTER_DEFAULTS,
    card: 'summary',
    title: 'Contact',
    description: 'Get in touch with our team for feedback, questions, or partnerships.',
  },
};

export const contactSchema = createStaticPageSchema(
  'Contact',
  'Get in touch with our team for feedback, questions, or partnerships.',
  '/contact'
);

export const privacyPolicyMetadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Read how we collect, use, and protect your personal data.',
  alternates: {
    canonical: '/privacy-policy',
  },
  openGraph: {
    ...OPEN_GRAPH_DEFAULTS,
    title: 'Privacy Policy',
    description: 'Read how we collect, use, and protect your personal data.',
    url: '/privacy-policy',
  },
  twitter: {
    ...TWITTER_DEFAULTS,
    card: 'summary',
    title: 'Privacy Policy',
    description: 'Read how we collect, use, and protect your personal data.',
  },
};

export const privacyPolicySchema = createStaticPageSchema(
  'Privacy Policy',
  'Read how we collect, use, and protect your personal data.',
  '/privacy-policy'
);

export const termsAndConditionsMetadata: Metadata = {
  title: 'Terms and Conditions',
  description: 'Review the terms and conditions for using our website and content.',
  alternates: {
    canonical: '/terms',
  },
  openGraph: {
    ...OPEN_GRAPH_DEFAULTS,
    title: 'Terms and Conditions',
    description: 'Review the terms and conditions for using our website and content.',
    url: '/terms',
  },
  twitter: {
    ...TWITTER_DEFAULTS,
    card: 'summary',
    title: 'Terms and Conditions',
    description: 'Review the terms and conditions for using our website and content.',
  },
};

export const termsAndConditionsSchema = createStaticPageSchema(
  'Terms and Conditions',
  'Review the terms and conditions for using our website and content.',
  '/terms'
);
