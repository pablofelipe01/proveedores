// src/app/login/page.tsx
'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
 const router = useRouter();
 const [documento, setDocumento] = useState('');
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState('');

 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
   setError('');
   setIsLoading(true);

   try {
     const response = await fetch('/api/auth/login', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ documento }),
     });

     const data = await response.json();

     if (!response.ok) {
       throw new Error(data.error || 'Error al iniciar sesión');
     }

     router.push('/dashboard');
   } catch (error) {
     setError(error instanceof Error ? error.message : 'Error al iniciar sesión');
   } finally {
     setIsLoading(false);
   }
 };

 return (
   <main className="min-h-screen relative py-12 px-4">
     {/* Background Image */}
     <div 
       className="absolute inset-0 bg-cover bg-center bg-no-repeat"
       style={{
         backgroundImage: 'url(https://res.cloudinary.com/dvnuttrox/image/upload/v1752167375/IMG_0497_1_jcvtji.jpg)'
       }}
     />
     {/* Dark overlay for better text readability */}
     <div className="absolute inset-0 bg-black bg-opacity-60" />
     
     <div className="max-w-md mx-auto relative z-10">
       {/* Botón de regreso */}
       <Link
         href="/"
         className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-8"
       >
         <svg 
           xmlns="http://www.w3.org/2000/svg" 
           className="h-5 w-5 mr-2" 
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
         Volver al Inicio
       </Link>

       <div className="text-center mb-8">
         <h1 className="text-2xl font-bold text-white">
           Acceso de Proveedores
         </h1>
         <p className="mt-2 text-gray-400">
           Ingrese su número de documento para acceder
         </p>
       </div>

       <div className="bg-gray-800 rounded-lg shadow-xl p-6">
         <form onSubmit={handleSubmit} className="space-y-6">
           <div>
             <label className="block text-sm font-medium text-gray-200">
               Número de Documento
             </label>
             <input
               type="text"
               value={documento}
               onChange={(e) => setDocumento(e.target.value)}
               className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 
                 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
               placeholder="Ingrese su documento"
               required
             />
           </div>

           {error && (
             <div className="bg-red-900/50 text-red-200 p-3 rounded-md text-sm">
               {error}
             </div>
           )}

           <button
             type="submit"
             disabled={isLoading || !documento}
             className={`
               w-full py-2 px-4 rounded-md text-white font-medium
               ${isLoading || !documento 
                 ? 'bg-gray-600 cursor-not-allowed'
                 : 'bg-indigo-600 hover:bg-indigo-700'
               }
             `}
           >
             {isLoading ? 'Verificando...' : 'Ingresar'}
           </button>
         </form>
       </div>
     </div>
   </main>
 );
}