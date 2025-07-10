// src/app/cuentas-cobro/nueva/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import CuentaCobroForm from '@/components/CuentaCobroForm'
import { Spinner } from '@/components/ui/Spinner'
import Link from 'next/link'

interface Proveedor {
  id: string
  nombreCompleto: string
  estado: 'Activo' | 'Inactivo' | 'Pendiente'
}

interface ApiError {
  message: string
  code?: number
}

export default function NuevaCuentaCobroPage() {
  const router = useRouter()
  const [proveedor, setProveedor] = useState<Proveedor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    
    const verifyAuth = async () => {
      try {
        const response = await fetch('/api/auth/verify', {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          const errorData: ApiError = await response.json()
          throw new Error(errorData.message || 'Error de autenticación')
        }

        const data = await response.json()
        
        if (data.proveedor.estado !== 'Activo') {
          router.replace('/acceso-denegado')
          return
        }

        setProveedor(data.proveedor)
        setError(null)
      } catch (error: unknown) {
        if (error.name === 'AbortError') return
        
        console.error('Error de verificación:', error)
        setError(error.message || 'Error desconocido')
        router.replace('/login')
      } finally {
        setIsLoading(false)
      }
    }

    verifyAuth()

    return () => controller.abort()
  }, [router])

      if (isLoading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://res.cloudinary.com/dvnuttrox/image/upload/v1752167682/20032025-DSC_3429_1_1_kudfki.jpg)'
          }}
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-60" />
        <div className="relative z-10">
          <Spinner className="h-12 w-12 text-white" />
          <span className="sr-only">Cargando...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://res.cloudinary.com/dvnuttrox/image/upload/v1752167682/20032025-DSC_3429_1_1_kudfki.jpg)'
          }}
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-60" />
        <div className="text-red-500 text-center relative z-10">
          <h2 className="text-xl font-bold mb-4">Error de verificación</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!proveedor) {
    return null
  }

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
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <Link
         href="/dashboard"
         className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-6"
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
         Volver al Dashboard
       </Link>

        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          <div className="p-6">
            <header className="mb-8">
              <h1 className="text-2xl font-bold text-white">
                Nueva Cuenta de Cobro
              </h1>
              <p className="mt-2 text-gray-400">
                Proveedor: {proveedor.nombreCompleto}
              </p>
              <p className="text-sm text-green-500 mt-1">
                Estado: {proveedor.estado}
              </p>
            </header>

            <CuentaCobroForm proveedorId={proveedor.id} />
          </div>
        </div>
      </div>
    </main>
  )
}