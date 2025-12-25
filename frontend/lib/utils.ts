
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
