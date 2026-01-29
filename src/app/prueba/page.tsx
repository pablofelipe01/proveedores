// src/app/prueba/page.tsx
'use client'

import { useRef } from 'react';
import RegistroForm from '@/components/RegistroForm';
import { proveedorPrueba } from '@/mocks/testData';
import { documentosPrueba } from '@/utils/testHelpers';
import type { RegistroFormHandle } from '@/components/RegistroForm/types';

export default function PruebaRegistroPage() {
  const formRef = useRef<RegistroFormHandle>(null);
  const showTestControls = process.env.NODE_ENV === 'development';

  const handleTestDataClick = () => {
    if (formRef.current) {
      formRef.current.setFormData(proveedorPrueba);
      formRef.current.setDocuments(documentosPrueba);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 py-6 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Registro de Proveedor Contratista
          </h1>
          <p className="text-gray-400">
            Complete el formulario con sus datos y documentos requeridos
          </p>
          
          {showTestControls && (
            <button
              onClick={handleTestDataClick}
              className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 
                rounded-md text-sm transition-colors duration-200"
            >
              Auto-completar con datos de prueba
            </button>
          )}
        </div>

        <div className="max-w-4xl mx-auto bg-gray-800 shadow-xl rounded-lg border border-gray-700">
          <RegistroForm ref={formRef} />
        </div>

        <div className="mt-8 text-center text-sm text-gray-400">
          <p>Si tiene problemas con el registro, por favor contacte al soporte técnico</p>
        </div>
      </div>
    </main>
  );
}