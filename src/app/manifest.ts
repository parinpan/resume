import type { MetadataRoute } from 'next';
import resumeData from '../../resume-data.json';
import type { ResumeData } from '@/types/resume';

const DATA = resumeData as ResumeData;

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${DATA.name} — ${DATA.title} — Resume`,
    short_name: DATA.name,
    description: `Resume of ${DATA.name}, ${DATA.title} based in ${DATA.contact.location}.`,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2d2d2d',
    icons: [
      { src: '/favicon.svg', type: 'image/svg+xml', sizes: 'any' },
      { src: '/images/fachrin-cartoon.png', type: 'image/png', sizes: '512x512' },
    ],
  };
}
