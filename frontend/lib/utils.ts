
export const resolveMediaUrl = (path: string | null) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;

  // Get backend base from env or default
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  const base = apiBase.replace('/api', '');

  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return `${base}${cleanPath}`;
};

export const stripHtml = (html: string | null) => {
  if (!html) return '';
  
  // Remove HTML tags
  const clean = html.replace(/<[^>]+>/g, '');
  
  // Decode common HTML entities
  return clean
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—');
};
