const SITE_NAME = 'Ramdhan Hidayat';
const DEFAULT_TITLE = 'Ramdhan Hidayat — Data & AI Engineer';
const DEFAULT_DESCRIPTION =
  'Data analyst and AI engineer working on retail analytics, AI agents, computer vision, and algorithmic trading. Has briefed DPR RI on social program outcomes.';

// React 19 hoists <title> and <meta> rendered anywhere in the tree into <head>.
export default function Meta({ title, description, image, type = 'website' }) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : DEFAULT_TITLE;
  const desc = description || DEFAULT_DESCRIPTION;

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      {image && <meta name="twitter:image" content={image} />}
    </>
  );
}
