'use client';

import dynamic from 'next/dynamic';

const SimulationView = dynamic(() => import('@/components/SimulationView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-blue-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Ładowanie sceny 3D...</p>
      </div>
    </div>
  ),
});

export default function HomePage() {
  return <SimulationView />;
}