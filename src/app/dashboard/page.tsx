// src/app/dashboard/page.tsx
'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DocumentUpload } from '@/components/CargarArchivos/DocumentUpload';
import { Menu, X } from 'lucide-react';


interface DashboardData {
 totalCuentas: number;
 pendientes: number;
 aprobadas: number;
 comentariosProveedor: string;
 cuentasRecientes: {
   id: string;
   fecha: string;
   estado: string;
   valorTotal: number;
   descripcion: string;
 }[];
}

// Función auxiliar para formatear moneda
const formatCurrency = (value: number): string => {
 return new Intl.NumberFormat('es-CO', {
   style: 'currency',
   currency: 'COP'
 }).format(value);
};

export default function DashboardPage() {
 const [data, setData] = useState<DashboardData | null>(null);
 const [isLoading, setIsLoading] = useState(true);
 const [error, setError] = useState('');
 const [menuOpen, setMenuOpen] = useState(false);

 useEffect(() => {
   const fetchDashboardData = async () => {
     try {
       console.log('Iniciando fetch de datos del dashboard');
       const response = await fetch('/api/dashboard');
       
       if (!response.ok) {
         throw new Error('Error al cargar los datos');
       }

       const data = await response.json();
       console.log('Datos recibidos:', data);

       if (data.success) {
         setData(data);
       } else {
         throw new Error(data.error || 'Error desconocido');
       }
     } catch (error) {
       setError('Error al cargar los datos');
       console.error(error);
     } finally {
       setIsLoading(false);
     }
   };

   fetchDashboardData();
 }, []);

 const requiereSubida = (comentario: string): boolean => {
  const keywords = [
    'Subir nuevamente el RUT',
    'Subir nuevamente el certificado bancario',
    'Subir nuevamente el documento de identidad'
  ];
  return keywords.some(keyword => comentario.includes(keyword));
};
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
       {/* Header */}
       <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-gray-400 hover:text-white transition-colors"
              title="Ir al inicio"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-white">Dashboard de Proveedor Contratista</h1>
          </div>

          {/* Menú hamburguesa para móviles */}
         <div className="md:hidden">
           <button onClick={() => setMenuOpen(!menuOpen)} className="text-white focus:outline-none">
             {menuOpen ? <X size={28} /> : <Menu size={28} />}
           </button>
         </div>

          {/* Botones visibles en pantallas grandes */}
          <div className="hidden md:flex gap-4">
           <Link href="/actualizar/" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
             Actualizar mi información
           </Link>
           <Link href="/cuentas-cobro/nueva" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
             Nueva Cuenta de Cobro
           </Link>
          </div>
        </div>
          {/* Menú desplegable en móviles */}
          {menuOpen && (
            <div className="md:hidden absolute right-4 top-20 bg-gray-800 rounded-lg shadow-lg p-4">
              <Link href="/actualizar/" className="block px-4 py-2 text-white hover:bg-gray-700">
                Actualizar mi información
              </Link>
              <Link href="/cuentas-cobro/nueva" className="block px-4 py-2 text-white hover:bg-gray-700">
                Nueva Cuenta de Cobro
              </Link>
            </div>
          )}

        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400">Comentarios</h3>
          <p className="mt-2 text-base text-white">
            {data?.comentariosProveedor || 'Sin Comentarios'}
          </p>
          {data?.comentariosProveedor && requiereSubida(data.comentariosProveedor) && (
            <div className="mt-4">
              <DocumentUpload onUploadSuccess={(url) => console.log('Archivo subido:', url)} />
            </div>
          )}
        </div>
         <br />

       {/* Resumen */}
       <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
         <div className="bg-gray-800 p-6 rounded-lg">
           <h3 className="text-sm font-medium text-gray-400">Total Cuentas</h3>
           <p className="mt-2 text-3xl font-bold text-white">
             {data?.totalCuentas || 0}
           </p>
         </div>
         <div className="bg-gray-800 p-6 rounded-lg">
           <h3 className="text-sm font-medium text-gray-400">Pendientes</h3>
           <p className="mt-2 text-3xl font-bold text-yellow-500">
             {data?.pendientes || 0}
           </p>
         </div>
         <div className="bg-gray-800 p-6 rounded-lg">
           <h3 className="text-sm font-medium text-gray-400">Aprobadas</h3>
           <p className="mt-2 text-3xl font-bold text-green-500">
             {data?.aprobadas || 0}
           </p>
         </div>
       </div>

       {/* Lista de Cuentas de Cobro */}
       <div className="bg-gray-800 rounded-lg shadow">
         <div className="px-4 py-5 sm:p-6">
           <h2 className="text-xl font-semibold text-white mb-4">
             Cuentas de Cobro Recientes
           </h2>
           
           {isLoading ? (
             <div className="text-center py-4">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
             </div>
           ) : error ? (
             <div className="text-red-500 text-center py-4">{error}</div>
           ) : !data?.cuentasRecientes?.length ? (
             <div className="text-gray-400 text-center py-4">
               No hay cuentas de cobro registradas
             </div>
           ) : (
             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-700">
                 <thead>
                   <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                       Fecha
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                       Descripción
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                       Valor Total
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                       Estado
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                       Acciones
                     </th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-700">
                   {data.cuentasRecientes.map((cuenta) => (
                     <tr key={cuenta.id} className="hover:bg-gray-700/50">
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                         {new Date(cuenta.fecha).toLocaleDateString('es-CO')}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                         {cuenta.descripcion}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                         {formatCurrency(cuenta.valorTotal)}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                           ${cuenta.estado === 'Pendiente' ? 'bg-yellow-800 text-yellow-100' : 
                             cuenta.estado === 'Aprobada' ? 'bg-green-800 text-green-100' :
                             cuenta.estado === 'Rechazada' ? 'bg-red-800 text-red-100' :
                             'bg-gray-800 text-gray-100'}`}>
                           {cuenta.estado}
                         </span>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                         <Link
                           href={`/cuentas-cobro/${cuenta.id}`}
                           className="text-indigo-400 hover:text-indigo-300 transition-colors"
                         >
                           Ver Detalles
                         </Link>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           )}
         </div>
       </div>
     </div>
   </main>
 );
}