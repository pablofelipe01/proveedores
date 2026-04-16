// src/components/CuentaCobroForm/SignaturePad.tsx
'use client'
import { useRef, useEffect, useState } from 'react';
import SignaturePadLib from 'signature_pad';
import toast from 'react-hot-toast';
import { uploadToCloudinary } from '@/utils/cloudinary';

interface SignaturePadProps {
  onSave: (signature: string) => void;
}

export function SignatureComponent({ onSave }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePadLib | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Función para ajustar el tamaño del canvas
    const resizeCanvas = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper || !canvas) return;

      // Obtener el tamaño del contenedor
      const rect = wrapper.getBoundingClientRect();
      
      // Establecer el tamaño del canvas con un factor de escala para mayor resolución
      const scale = window.devicePixelRatio || 1;
      canvas.width = rect.width * scale;
      canvas.height = rect.height * scale;
      
      // Escalar el contexto para mantener la relación de aspecto
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(scale, scale);
      }
      
      // Mantener el tamaño visual correcto
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      // Reiniciar SignaturePad si ya existía
      if (padRef.current) {
        padRef.current.clear();
      }

      // Crear nueva instancia con opciones optimizadas
      padRef.current = new SignaturePadLib(canvas, {
        minWidth: 0.5,
        maxWidth: 2.5,
        throttle: 16, // 60fps
        penColor: 'rgb(0, 0, 0)',
        backgroundColor: 'rgb(255, 255, 255)'
      });
    };

    // Ajustar tamaño inicial
    resizeCanvas();

    // Escuchar cambios de tamaño de ventana
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      padRef.current?.off();
    };
  }, []);

  const handleClear = () => {
    padRef.current?.clear();
    setIsSaved(false);
  };

  const handleSave = async () => {
    if (!padRef.current || padRef.current.isEmpty()) {
      toast.error('Por favor firme antes de guardar');
      return;
    }

    setIsSaving(true);
    
    try {
      const dataUrl = padRef.current.toDataURL('image/png');
      
      // Convertir base64 a File para subir a Cloudinary
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'firma.png', { type: 'image/png' });
      
      // Subir a Cloudinary
      const firmaUrl = await uploadToCloudinary(file, 'firmas');
      
      onSave(firmaUrl);
      setIsSaved(true);
      toast.success('Firma guardada correctamente');
    } catch (error) {
      console.error('Error al guardar firma:', error);
      toast.error('No se pudo guardar la firma. Intenta nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white">Firma Digital</h3>
      
      <div className="border rounded-lg p-4 bg-white">
        <div 
          ref={wrapperRef} 
          className="w-full h-48 relative"
        >
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 border border-gray-300 rounded touch-none cursor-crosshair"
          />
        </div>
        
        <div className="mt-4 flex space-x-4">
          <button
            type="button"
            onClick={handleClear}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Limpiar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isSaved}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors flex items-center gap-2
              ${isSaved 
                ? 'bg-green-600 cursor-default' 
                : isSaving 
                  ? 'bg-indigo-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </>
            ) : isSaved ? (
              <>
                <svg className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Firma Guardada
              </>
            ) : (
              'Guardar Firma'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}