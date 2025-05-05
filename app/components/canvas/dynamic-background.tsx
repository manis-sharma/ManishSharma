'use client'

import dynamic from 'next/dynamic';

const DynamicBackground = dynamic(
  () => import('./background'),
  { 
    ssr: false,
    loading: () => <div className="fixed inset-0 -z-10 bg-neutral-950" />
  }
);

export default DynamicBackground;
