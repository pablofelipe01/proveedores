// src/app/dashboard/page.tsx
'use client'
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { DocumentUpload } from '@/components/CargarArchivos/DocumentUpload';
import {
 CuentasCobroFilters,
 FilterValues,
 OrdenValue,
 initialFilters,
} from '@/components/Dashboard/CuentasCobroFilters';
import { Menu, X, ArrowUp, ArrowDown } from 'lucide-react';


interface DashboardData {
 totalCuentas: number;
 pendientes: number;
 aprobadas: number;
 comentariosProveedor: string;
 resultadosFiltrados: number;
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

// Interpreta una fecha 'YYYY-MM-DD' de Airtable como fecha local (evita el
// corrimiento de un día que provoca el parseo como UTC)
const parseFecha = (fecha: string): Date | null => {
 if (!fecha) return null;
 const soloFecha = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha);
 const date = soloFecha
   ? new Date(Number(soloFecha[1]), Number(soloFecha[2]) - 1, Number(soloFecha[3]))
   : new Date(fecha);
 return Number.isNaN(date.getTime()) ? null : date;
};

// Fecha corta y consistente: "26 ago 2026"
const formatFecha = (fecha: string): string => {
 const date = parseFecha(fecha);
 if (!date) return 'Sin fecha';
 return new Intl.DateTimeFormat('es-CO', {
   day: '2-digit',
   month: 'short',
   year: 'numeric'
 }).format(date);
};

// Fecha completa para el tooltip: "martes, 26 de agosto de 2026"
const formatFechaLarga = (fecha: string): string => {
 const date = parseFecha(fecha);
 if (!date) return 'Sin fecha registrada';
 return new Intl.DateTimeFormat('es-CO', { dateStyle: 'full' }).format(date);
};

export default function DashboardPage() {
 const [data, setData] = useState<DashboardData | null>(null);
 const [isLoading, setIsLoading] = useState(true);
 const [isFiltering, setIsFiltering] = useState(false);
 const [error, setError] = useState('');
 const [menuOpen, setMenuOpen] = useState(false);
 const [currentFilters, setCurrentFilters] = useState<FilterValues>(initialFilters);

 const fetchDashboardData = useCallback(async (filters?: FilterValues) => {
   try {
     const isInitialLoad = !filters;
     if (isInitialLoad) {
       setIsLoading(true);
     } else {
       setIsFiltering(true);
     }

     // Construir query params
     const params = new URLSearchParams();
     const activeFilters = filters || currentFilters;
     
     if (activeFilters.estado && activeFilters.estado !== 'todas') {
       params.append('estado', activeFilters.estado);
     }
     if (activeFilters.fechaInicio) {
       params.append('fecha_inicio', activeFilters.fechaInicio);
     }
     if (activeFilters.fechaFin) {
       params.append('fecha_fin', activeFilters.fechaFin);
     }
     if (activeFilters.montoMin) {
       params.append('monto_min', activeFilters.montoMin);
     }
     if (activeFilters.montoMax) {
       params.append('monto_max', activeFilters.montoMax);
     }
     if (activeFilters.busqueda) {
       params.append('q', activeFilters.busqueda);
     }
     if (activeFilters.orden) {
       params.append('orden', activeFilters.orden);
     }

     const queryString = params.toString();
     const url = `/api/dashboard${queryString ? `?${queryString}` : ''}`;
     
     console.log('Fetching dashboard data with URL:', url);
     const response = await fetch(url);
     
     if (!response.ok) {
       throw new Error('Error al cargar los datos');
     }

     const responseData = await response.json();
     console.log('Datos recibidos:', responseData);

     if (responseData.success) {
       setData(responseData);
     } else {
       throw new Error(responseData.error || 'Error desconocido');
     }
   } catch (error) {
     setError('Error al cargar los datos');
     console.error(error);
   } finally {
     setIsLoading(false);
     setIsFiltering(false);
   }
 }, [currentFilters]);

 useEffect(() => {
   fetchDashboardData();
 }, []);

 const handleFilterChange = useCallback((filters: FilterValues) => {
   setCurrentFilters(filters);
   fetchDashboardData(filters);
 }, [fetchDashboardData]);

 // Ordenar haciendo clic en el encabezado de la columna
 const handleSort = useCallback((campo: 'fecha' | 'monto') => {
   const asc: OrdenValue = campo === 'fecha' ? 'fecha_asc' : 'monto_asc';
   const desc: OrdenValue = campo === 'fecha' ? 'fecha_desc' : 'monto_desc';
   const orden: OrdenValue = currentFilters.orden === desc ? asc : desc;
   handleFilterChange({ ...currentFilters, orden });
 }, [currentFilters, handleFilterChange]);

 const sortIcon = (campo: 'fecha' | 'monto') => {
   const asc = currentFilters.orden === (campo === 'fecha' ? 'fecha_asc' : 'monto_asc');
   const desc = currentFilters.orden === (campo === 'fecha' ? 'fecha_desc' : 'monto_desc');
   if (!asc && !desc) return null;
   return asc
     ? <ArrowUp className="inline h-3 w-3 ml-1" />
     : <ArrowDown className="inline h-3 w-3 ml-1" />;
 };

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
             Mis Cuentas de Cobro
           </h2>
           
           {/* Filtros */}
           <CuentasCobroFilters 
             filters={currentFilters}
             onFilterChange={handleFilterChange}
             resultadosFiltrados={data?.resultadosFiltrados ?? data?.cuentasRecientes?.length ?? 0}
             isLoading={isFiltering}
           />
           
           {isLoading ? (
             <div className="text-center py-4">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
             </div>
           ) : error ? (
             <div className="text-red-500 text-center py-4">{error}</div>
           ) : !data?.cuentasRecientes?.length ? (
             <div className="text-gray-400 text-center py-8">
               <svg 
                 xmlns="http://www.w3.org/2000/svg" 
                 className="h-12 w-12 mx-auto mb-4 text-gray-500" 
                 fill="none" 
                 viewBox="0 0 24 24" 
                 stroke="currentColor"
               >
                 <path 
                   strokeLinecap="round" 
                   strokeLinejoin="round" 
                   strokeWidth={1.5} 
                   d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                 />
               </svg>
               {data?.totalCuentas && data.totalCuentas > 0 
                 ? 'No se encontraron cuentas con los filtros aplicados'
                 : 'No hay cuentas de cobro registradas'
               }
             </div>
           ) : (
             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-700">
                 <thead>
                   <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                       <button
                         onClick={() => handleSort('fecha')}
                         className="uppercase tracking-wider hover:text-white transition-colors"
                         title="Ordenar por fecha"
                       >
                         Fecha
                         {sortIcon('fecha')}
                       </button>
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                       Descripción
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                       <button
                         onClick={() => handleSort('monto')}
                         className="uppercase tracking-wider hover:text-white transition-colors"
                         title="Ordenar por valor total"
                       >
                         Valor Total
                         {sortIcon('monto')}
                       </button>
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
                       <td
                         className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 tabular-nums"
                         title={formatFechaLarga(cuenta.fecha)}
                       >
                         {formatFecha(cuenta.fecha)}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                         {cuenta.descripcion}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 tabular-nums">
                         {formatCurrency(cuenta.valorTotal)}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                           ${cuenta.estado === 'Pendiente' ? 'bg-yellow-800 text-yellow-100' : 
                             cuenta.estado === 'Aprobada' ? 'bg-green-800 text-green-100' :
                             cuenta.estado === 'Rechazada' ? 'bg-red-800 text-red-100' :
                             cuenta.estado === 'En Revisión' ? 'bg-blue-800 text-blue-100' :
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