// src/app/registro-exitoso/page.tsx
'use client'
import Link from 'next/link'

const Exito = () => {
 return (
   <main className="min-h-screen bg-gray-900 py-12">
     <div className="max-w-2xl mx-auto px-4">
       <div className="bg-gray-800 rounded-lg shadow-xl p-8 text-center">
         <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
           <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
           </svg>
         </div>
         
         <h1 className="text-2xl font-bold text-white mb-4">
           ¡Registro de Proveedor Contratista Exitoso!
         </h1>
         
         <p className="text-gray-300 mb-8">
           Tu información como proveedor contratista ha sido registrada correctamente. Te contactaremos pronto para confirmar tus datos.
         </p>

         <Link 
           href="/registro"
           className="inline-block bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors"
         >
           Volver al Inicio
         </Link>
       </div>
     </div>
   </main>
 )
}
export default Exito