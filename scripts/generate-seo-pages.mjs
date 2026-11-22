import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const siteUrl = 'https://assounenfantunsourire.com';
const distDirectory = 'dist';
const htmlTemplate = await readFile(join(distDirectory, 'index.html'), 'utf8');

const pages = [
  {
    path: '/',
    title: 'Un Enfant, un Sourire | Santé des enfants à Bamako',
    description: 'À Bamako, Un Enfant, un Sourire agit pour la santé des enfants grâce à la prévention, la sensibilisation scolaire et l’orientation vers les soins.',
  },
  {
    path: '/mission/',
    title: 'Notre mission | Santé et protection des enfants au Mali',
    description: 'Découvrez la mission de l’association Un Enfant, un Sourire : informer, prévenir et accompagner les enfants et les familles au Mali.',
  },
  {
    path: '/actions/',
    title: 'Nos actions de prévention pour les jeunes à Bamako',
    description: 'Prévention des stupéfiants, sensibilisation aux IST et santé bucco-dentaire : découvrez les actions de terrain de notre association à Bamako.',
  },
  {
    path: '/terrain/',
    title: 'Sensibilisation scolaire au lycée SIKA | Bamako',
    description: 'Photos, affiches et vidéo des actions de sensibilisation menées au lycée SIKA à Bamako par Un Enfant, un Sourire.',
  },
  {
    path: '/association/',
    title: 'L’association | Un Enfant, un Sourire au Mali',
    description: 'Rencontrez l’association Un Enfant, un Sourire, sa fondatrice Mme SISSOKO FANTA KEITA et son ancrage à Banakabougou, Bamako.',
  },
  {
    path: '/contact/',
    title: 'Contacter notre association à Bamako | Un Enfant, un Sourire',
    description: 'Contactez Un Enfant, un Sourire à Bamako pour une action de prévention, un partenariat ou un projet en faveur des enfants.',
  },
  {
    path: '/don/',
    title: 'Soutenir la santé des enfants au Mali | Faire un don',
    description: 'Soutenez les actions de prévention et de sensibilisation pour les enfants au Mali avec Un Enfant, un Sourire.',
  },
];

const organization = {
  '@context': 'https://schema.org',
  '@type': 'NGO',
  name: 'Un Enfant, un Sourire',
  url: siteUrl,
  logo: `${siteUrl}/media/logo-un-enfant-un-sourire.jpeg`,
  description: 'Association malienne engagée dans la prévention et la sensibilisation pour la santé et la protection des enfants.',
  email: 'contact@assounenfantunsourire.org',
  telephone: '+22393289376',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Bamako',
    addressRegion: 'Banakabougou',
    addressCountry: 'ML',
  },
  areaServed: {
    '@type': 'Country',
    name: 'Mali',
  },
  founder: {
    '@type': 'Person',
    name: 'SISSOKO FANTA KEITA',
  },
};

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

for (const page of pages) {
  const canonicalUrl = `${siteUrl}${page.path}`;
  const structuredData = {
    ...organization,
    mainEntityOfPage: canonicalUrl,
  };
  const metadata = [
    `<title>${escapeHtml(page.title)}</title>`,
    `<meta name="description" content="${escapeHtml(page.description)}" />`,
    `<link rel="canonical" href="${canonicalUrl}" />`,
    '<meta property="og:type" content="website" />',
    '<meta property="og:locale" content="fr_ML" />',
    `<meta property="og:site_name" content="${organization.name}" />`,
    `<meta property="og:title" content="${escapeHtml(page.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(page.description)}" />`,
    `<meta property="og:url" content="${canonicalUrl}" />`,
    `<meta property="og:image" content="${organization.logo}" />`,
    `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`,
  ].join('\n    ');
  const html = htmlTemplate
    .replace(/<title>[\s\S]*?<\/title>/, '<!-- SEO_METADATA -->')
    .replace(/<meta name="description"[^>]*\/>/, '')
    .replace('<!-- SEO_METADATA -->', metadata);
  const outputPath = page.path === '/'
    ? join(distDirectory, 'index.html')
    : join(distDirectory, page.path.slice(1), 'index.html');
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, html);
}

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...pages.map((page) => `  <url><loc>${siteUrl}${page.path}</loc></url>`),
  '</urlset>',
].join('\n');
await writeFile(join(distDirectory, 'sitemap.xml'), sitemap);
await writeFile(
  join(distDirectory, 'robots.txt'),
  `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`,
);

console.log(`Generated SEO metadata for ${pages.length} pages, sitemap.xml, and robots.txt.`);
