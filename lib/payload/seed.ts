import 'dotenv/config';
import { sql } from 'drizzle-orm';
import {
  authors,
  categories,
  configs,
  media,
  posts,
  posts_rels,
  static_contents,
} from '@/lib/payload/generated-schema';
import { Status, Type } from '@/lib/payload/taxonomy';
import { getPayload } from 'payload';
import config from '@payload-config';
import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical';

type NewPost = Omit<typeof posts.$inferInsert, 'body'> & { body: string };

async function main() {
  const payload = await getPayload({ config });
  const db = payload.db.drizzle;
  const editorConfig = await editorConfigFactory.default({ config: payload.config });
  const md = (markdown: string) => convertMarkdownToLexical({ editorConfig, markdown });

  await db.execute(sql`TRUNCATE TABLE "posts" RESTART IDENTITY CASCADE`);
  await db.execute(sql`TRUNCATE TABLE "categories" RESTART IDENTITY CASCADE`);
  await db.execute(sql`TRUNCATE TABLE "authors" RESTART IDENTITY CASCADE`);
  await db.execute(sql`TRUNCATE TABLE "static_contents" RESTART IDENTITY CASCADE`);
  await db.execute(sql`TRUNCATE TABLE "configs" RESTART IDENTITY CASCADE`);
  await db.execute(sql`TRUNCATE TABLE "media" RESTART IDENTITY CASCADE`);

  const [avatar1, avatar2, avatar3] = await db
    .insert(media)
    .values([
      { alt: 'Alex Chen', url: '/authors/image-1.jpg', filename: 'image-1.jpg', mimeType: 'image/jpeg' },
      { alt: 'Dr. Elena Rodriguez', url: '/authors/image-2.jpg', filename: 'image-2.jpg', mimeType: 'image/jpeg' },
      { alt: 'Jordan Vane', url: '/authors/image-3.jpg', filename: 'image-3.jpg', mimeType: 'image/jpeg' },
    ])
    .returning();

  const [tech] = await db.insert(categories).values({ title: 'Technology', slug: 'technology', weight: 1 }).returning();
  const [lifestyle] = await db
    .insert(categories)
    .values({ title: 'Lifestyle', slug: 'lifestyle', type: Type.DisplayedSubcategories, weight: 2 })
    .returning();
  const [business] = await db
    .insert(categories)
    .values({ title: 'Business', slug: 'business', type: Type.DisplayedAll, weight: 3 })
    .returning();

  const [frontend] = await db
    .insert(categories)
    .values({
      title: 'Frontend',
      slug: 'frontend',
      parent: tech.id,
      weight: 1,
    })
    .returning();
  const [backend] = await db
    .insert(categories)
    .values({
      title: 'Backend',
      slug: 'backend',
      parent: tech.id,
      weight: 2,
    })
    .returning();
  const [devops] = await db
    .insert(categories)
    .values({
      title: 'DevOps',
      slug: 'devops',
      parent: tech.id,
      weight: 3,
    })
    .returning();
  const [travel] = await db
    .insert(categories)
    .values({
      title: 'Travel',
      slug: 'travel',
      parent: lifestyle.id,
      type: Type.DisplayedPosts,
      weight: 1,
    })
    .returning();
  const [health] = await db
    .insert(categories)
    .values({
      title: 'Health',
      slug: 'health',
      parent: lifestyle.id,
      weight: 2,
    })
    .returning();
  const [startups] = await db
    .insert(categories)
    .values({
      title: 'Startups',
      slug: 'startups',
      parent: business.id,
      weight: 1,
    })
    .returning();

  const [alice] = await db
    .insert(authors)
    .values({
      name: 'Alex Chen',
      slug: 'alex-chen',
      bio: md(
        'Specializes in kernel-level networking and high-performance packet processing. With over fifteen years of experience contributing to the Linux networking stack, he has pioneered several eBPF-based observability tools now standard in hyperscale environments. His research focuses on reducing tail latency in distributed state machines and optimizing hardware-assisted isolation for multi-tenant cloud architectures.'
      ),
      jobTitle: 'Lead Systems Architect',
      avatarDark: avatar1.id,
      avatarDarkHovered: avatar2.id,
      githubUrl: 'https://github.com/alexchen',
      linkedinUrl: 'https://linkedin.com/in/alexchen',
    })
    .returning();
  const [bob] = await db
    .insert(authors)
    .values({
      name: 'Dr. Elena Rodriguez',
      slug: 'dr-elena-rodriguez',
      bio: md(
        'An expert in consensus algorithms and formal verification of distributed systems. Her work on Paxos-variant optimizations and TLA+ modeling has been instrumental in the development of next-generation globally distributed databases. She holds a PhD in Distributed Computing and spent a decade leading core infrastructure teams at several FAANG organizations.'
      ),
      jobTitle: 'Head of Cloud-Native Research',
      avatarDark: avatar2.id,
      avatarDarkHovered: avatar3.id,
      githubUrl: 'https://github.com/elenarodriguez',
      linkedinUrl: 'https://linkedin.com/in/elenarodriguez',
    })
    .returning();
  const [carol] = await db
    .insert(authors)
    .values({
      name: 'Jordan Vane',
      slug: 'jordan-vane',
      bio: md(
        'Bridges the gap between silicon and software, focusing on hardware-assisted isolation and TEE (Trusted Execution Environments). His expertise in Enclave technologies and side-channel attack mitigation makes him a leading voice in secure systems design. Before joining the Signal, Jordan worked on firmware-level security for high-frequency trading platforms.'
      ),
      jobTitle: 'Hardware-Software Interop Lead',
      avatarDark: avatar3.id,
      avatarDarkHovered: avatar1.id,
      githubUrl: 'https://github.com/jordanvane',
      linkedinUrl: 'https://linkedin.com/in/jordanvane',
    })
    .returning();

  const seededPosts: NewPost[] = [
    {
      title: 'Hello Drizzle',
      teaser: 'Your first seeded post with Drizzle ORM.',
      slug: 'hello-drizzle',
      body: 'Your first seeded post using Drizzle ORM.',
      category: tech.id,
      status: Status.Draft,
    },
    {
      title: 'React in 2025',
      teaser: 'A quick look at the React ecosystem in 2025.',
      slug: 'react-in-2025',
      body: 'State of React and the ecosystem.',
      category: frontend.id,
      isFeatured: true,
    },
    {
      title: 'Server Components',
      teaser: 'What React Server Components change in app architecture.',
      slug: 'server-components',
      body: 'How RSC changes the way we build.',
      category: frontend.id,
      isFeatured: true,
    },
    {
      title: 'Node.js Best Practices',
      teaser: 'Practical patterns for robust Node.js services.',
      slug: 'node-best-practices',
      body: 'Structuring and scaling Node backends.',
      category: backend.id,
      isFeatured: true,
    },
    {
      title: 'PostgreSQL Tips',
      teaser: 'Small PostgreSQL optimizations with a big impact.',
      slug: 'postgresql-tips',
      body: 'Indexes, queries, and performance.',
      category: backend.id,
    },
    {
      title: 'Docker for Devs',
      teaser: 'Using Docker to keep local development predictable.',
      slug: 'docker-for-devs',
      body: 'Local development with containers.',
      category: devops.id,
    },
    {
      title: 'CI/CD Basics',
      teaser: 'A concise intro to continuous integration and delivery.',
      slug: 'cicd-basics',
      body: 'Automating deploy pipelines.',
      category: devops.id,
    },
    {
      title: 'Work & Life',
      teaser: 'Ideas for healthier boundaries between work and rest.',
      slug: 'work-and-life',
      body: 'Thoughts on balancing work and life.',
      category: lifestyle.id,
    },
    {
      title: 'Weekend in Lisbon',
      teaser: 'Short Lisbon itinerary for a fun weekend trip.',
      slug: 'weekend-lisbon',
      body: 'A short travel guide to Lisbon.',
      category: travel.id,
    },
    {
      title: 'Morning Routine',
      teaser: 'Simple habits to start your day with more focus.',
      slug: 'morning-routine',
      body: 'Starting the day right.',
      category: health.id,
    },
    {
      title: 'Bootstrapping 101',
      teaser: 'How to launch and grow without outside funding.',
      slug: 'bootstrapping-101',
      body: 'Building a business without VC.',
      category: startups.id,
    },
    {
      title: 'Pricing Your Product',
      teaser: 'Core pricing strategies for early-stage products.',
      slug: 'pricing-your-product',
      body: 'How to think about pricing.',
      category: business.id,
    },
  ];

  for (let i = 1; i <= 100; i++) {
    const n = String(i).padStart(3, '0');
    seededPosts.push({
      title: `Travel Post ${n}`,
      teaser: `Travel teaser for seeded post #${i}.`,
      slug: `travel-post-${n}`,
      body: `Seeded travel post #${i} for pagination testing.`,
      category: travel.id,
      createdAt: new Date(i).toISOString(),
    });
  }

  const insertedPosts = await db
    .insert(posts)
    .values(seededPosts.map((post) => ({ ...post, body: md(post.body) })))
    .returning();

  const authorPool = [alice, bob, carol];

  const postsRelsValues = insertedPosts.flatMap((post, i) => {
    const selected =
      i < 12
        ? [...authorPool].sort(() => ((i * 7 + (i % 3 === 0 ? 2 : 1)) % 3) - 1.5).slice(0, i % 3 === 0 ? 2 : 1)
        : [authorPool[i % 3]];

    return selected.map((author, index) => ({
      parent: post.id,
      path: 'authors',
      order: index + 1,
      authorsID: author.id,
    }));
  });

  await db.insert(posts_rels).values(postsRelsValues);

  const seededStaticContents = [
    {
      id: 'about',
      title: "About The Developer's Signal",
      body: `The Developer's Signal is a developer-first publication focused on deep technical investigations. We write for engineers who already know the basics and want clear, precise analysis of complex systems — without hype or filler.

Our coverage spans distributed systems, cloud-native infrastructure, kernel-level networking, security, and the practical trade-offs that show up in production. Every article is written to respect your time and your expertise.

**What you'll find here**

- Long-form technical investigations with working context, not surface-level summaries
- Practical insights drawn from real-world systems design and operations
- Editorial clarity: complex topics explained with precision, not noise

**Who we write for**

Senior engineers, architects, and technical leads who need signal, not noise — people building and operating systems at scale and looking for thoughtful analysis they can trust.`,
    },
    {
      id: 'privacy-policy',
      title: 'Privacy Policy',
      body: `*Last updated: July 9, 2026*

This Privacy Policy describes how The Developer's Signal ("we", "us", or "our") collects, uses, and protects information when you visit our website.

## Information We Collect

**Information you provide.** If you contact us by email or through a form, we may collect your name, email address, and the content of your message.

**Automatically collected information.** When you visit the site, we may collect standard log data such as your IP address, browser type, referring pages, and general usage information through cookies or similar technologies.

## How We Use Information

We use collected information to:

- Operate, maintain, and improve the website
- Respond to inquiries and support requests
- Analyze traffic and understand how readers use our content
- Protect the site against abuse, fraud, or security incidents

## Cookies

We may use cookies and similar technologies for essential site functionality, analytics, and preference storage (such as theme selection). You can control cookies through your browser settings, though disabling them may affect some features.

## Third-Party Services

We may use third-party services for hosting, analytics, or content delivery. Those providers process data according to their own privacy policies. We do not sell your personal information.

## Data Retention

We retain information only as long as necessary for the purposes described in this policy, unless a longer retention period is required by law.

## Your Rights

Depending on your location, you may have rights to access, correct, delete, or restrict processing of your personal data. To make a request, contact us using the details on our Contact page.

## Changes to This Policy

We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date.

## Contact

Questions about this Privacy Policy can be sent to the contact address listed on our Contact page.`,
    },
    {
      id: 'terms',
      title: 'Terms of Use',
      body: `*Last updated: July 9, 2026*

These Terms and Conditions ("Terms") govern your access to and use of The Developer's Signal website. By using the site, you agree to these Terms.

## Use of the Site

You may use this website for personal, non-commercial reading and reference. You agree not to:

- Attempt to disrupt, damage, or gain unauthorized access to the site or its infrastructure
- Scrape, copy, or redistribute content at scale without prior written permission
- Use the site in any way that violates applicable laws or third-party rights

## Intellectual Property

All articles, branding, design elements, and other content on this site are owned by The Developer's Signal or its licensors unless otherwise stated. You may share links to our pages and quote brief excerpts with proper attribution. Reproduction of full articles or commercial reuse requires explicit permission.

## Content Accuracy

We publish technical content in good faith and aim for accuracy, but articles may become outdated as technologies evolve. The site is provided for informational purposes only and does not constitute professional, legal, or security advice.

## Disclaimer

The site and its content are provided "as is" without warranties of any kind, express or implied. We do not guarantee uninterrupted or error-free operation.

## Limitation of Liability

To the fullest extent permitted by law, The Developer's Signal and its contributors are not liable for any indirect, incidental, special, or consequential damages arising from your use of the site or reliance on its content.

## External Links

The site may link to third-party websites. We are not responsible for the content, policies, or practices of external sites.

## Changes to These Terms

We may revise these Terms at any time. Continued use of the site after changes are posted constitutes acceptance of the updated Terms.

## Contact

For questions about these Terms, please reach out via the contact information on our Contact page.`,
    },
    {
      id: 'contact',
      title: 'Contact',
      body: `We welcome thoughtful correspondence from readers, contributors, and fellow engineers.

Whether you have a correction, a technical question, a collaboration idea, or feedback on our coverage, we'd like to hear from you. We read every message and do our best to respond within a few business days.

**Ways to reach us**

Use the email address below for direct inquiries, editorial feedback, or partnership discussions. You can also follow us on LinkedIn and X for announcements and new articles.

For corrections to published articles, please include the article URL and a clear description of the issue. We appreciate precise, good-faith feedback from the community.`,
    },
  ];

  await db
    .insert(static_contents)
    .values(seededStaticContents.map((content) => ({ ...content, body: md(content.body) })));

  await db.insert(configs).values([
    {
      id: 'social-link-github',
      label: 'Github Social Link',
      value: 'https://github.com/',
    },
    {
      id: 'social-link-linkedin',
      label: 'Linkedin Social Link',
      value: 'https://linkedin.com/',
    },
    {
      id: 'social-link-x',
      label: 'X Social Link',
      value: 'https://x.com/',
    },
    {
      id: 'contact-email',
      label: 'Contact Email',
      value: 'hello@nextjs-blog',
    },
  ]);
}

main()
  .then(() => {
    console.log('Seed completed');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
