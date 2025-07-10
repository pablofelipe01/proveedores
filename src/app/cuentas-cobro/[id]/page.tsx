'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CuentaCobroDetailPage() {
  const router = useRouter();
  const [observaciones, setObservacion] = useState('Sin observaciones');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCuentaCobro = async () => {
      try {
        const id = window.location.pathname.split('/').pop(); // Obtiene el ID de la URL
        if (!id) return;

        const response = await fetch(`/api/actualizar-perfil/uploapPerfil`);
        if (!response.ok) throw new Error('Error al obtener los datos');

        const data = await response.json();
        
        // Buscar la cuenta de cobro específica
        const cuenta = data.cuentasRecientes.find(c => c.id === id);

        setObservacion(cuenta?.observaciones || 'Sin observaciones');
      } catch (err) {
        setError('No se pudo cargar la cuenta de cobro');
      } finally {
        setLoading(false);
      }
    };

    fetchCuentaCobro();
  }, []);

  return (
    <main className="min-h-screen relative py-12">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://res.cloudinary.com/dvnuttrox/image/upload/v1752167682/20032025-DSC_3429_1_1_kudfki.jpg)'
        }}
      />
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-60" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header con botón de regreso */}
        <div className="flex items-center mb-8">
          <Link
            href="/dashboard"
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 mr-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 19l-7-7m0 0l7-7m-7 7h18" 
              />
            </svg>
            Volver al Dashboard
          </Link>
        </div>

        {/* Contenido */}
        <div className="bg-gray-800 rounded-lg shadow">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-xl font-semibold text-white mb-4">
              Detalles de Cuenta de Cobro
            </h1>

            {loading ? (
              <p className="text-gray-400">Cargando...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <p className="text-gray-300">Observación de la cuenta de cobro: {observaciones}</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
