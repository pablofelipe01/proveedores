'use client'
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ItemsList } from './ItemsList';
import { DocumentUpload } from './DocumentUpload';
import { SignatureComponent } from './SignaturePad';
import { uploadToCloudinary } from '@/utils/cloudinary';

interface CuentaCobroFormProps {
  proveedorId: string;
}

const cuentaCobroSchema = z.object({
  proveedorId: z.string(),
  fecha: z.string(),
  estado: z.string(),
  item1_descripcion: z.string().min(1, 'Se requiere al menos un item'),
  item1_valor: z.number({
    required_error: "El valor es requerido",
    invalid_type_error: "Debe ser un número",
  }).min(1, 'El valor debe ser mayor a 0'),
  item2_descripcion: z.string().optional(),
  item2_valor: z.preprocess((val) => (val === '' || isNaN(Number(val)) ? undefined : Number(val)), z.number().optional()),
  item3_descripcion: z.string().optional(),
  item3_valor: z.preprocess((val) => (val === '' || isNaN(Number(val)) ? undefined : Number(val)), z.number().optional()),
  item4_descripcion: z.string().optional(),
  item4_valor: z.preprocess((val) => (val === '' || isNaN(Number(val)) ? undefined : Number(val)), z.number().optional()),
  item5_descripcion: z.string().optional(),
  item5_valor: z.preprocess((val) => (val === '' || isNaN(Number(val)) ? undefined : Number(val)), z.number().optional()),
  parafiscalesUrl: z.string().optional(),
  firmaUrl: z.string().optional(),
}).refine((data) => {
  for (let i = 2; i <= 5; i++) {
    const desc = data[`item${i}_descripcion` as keyof typeof data];
    const valor = data[`item${i}_valor` as keyof typeof data];
    if ((desc && !valor) || (!desc && valor)) {
      return false;
    }
  }
  return true;
}, {
  message: "Si se incluye descripción, debe incluirse el valor y viceversa"
});

type CuentaCobro = z.infer<typeof cuentaCobroSchema>;

export default function CuentaCobroForm({ proveedorId }: CuentaCobroFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CuentaCobro>({
    resolver: zodResolver(cuentaCobroSchema),
    mode: 'onChange',
    defaultValues: {
      proveedorId,
      fecha: new Date().toISOString().split('T')[0],
      estado: 'Pendiente'
    }
  });

  const [parafiscales, setParafiscales] = useState<File | null>(null);
  const [firma, setFirma] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const onSubmit = async (data: CuentaCobro) => {
    setShowConfirmModal(true);
  };

  const confirmSubmit = async (data: CuentaCobro) => {
    setShowConfirmModal(false);
    setIsSubmitting(true);

    try {
      let parafiscalesUrl = '';
      if (parafiscales) {
        parafiscalesUrl = await uploadToCloudinary(parafiscales, 'parafiscales');
      }

      let firmaUrl = '';
      if (firma) {
        // Si la firma ya es una URL de Cloudinary, usarla directamente
        if (firma.startsWith('http')) {
          firmaUrl = firma;
        } else {
          const firmaFile = await fetch(firma)
            .then(res => res.blob())
            .then(blob => new File([blob], 'firma.png', { type: 'image/png' }));
          firmaUrl = await uploadToCloudinary(firmaFile, 'firmas');
        }
      }

      const valorTotal = Object.entries(data)
        .filter(([key, value]) => key.endsWith('_valor') && typeof value === 'number')
        .reduce((sum, [_, value]) => sum + (value as number), 0);

      const formData = { ...data, valorTotal, parafiscalesUrl, firmaUrl };

      const response = await fetch('/api/cuentas-cobro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Error al crear la cuenta de cobro');
      }

      window.location.href = '/dashboard';
    } catch (error: any) {
      alert(error.message || 'Error al crear la cuenta de cobro');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Fecha</label>
          <input
            type="date"
            {...register('fecha')}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
          />
          {errors.fecha && <p className="mt-1 text-sm text-red-500">{errors.fecha.message}</p>}
        </div>

        <ItemsList register={register} errors={errors} />
        
        <DocumentUpload onFileSelected={setParafiscales} error={errors.parafiscalesUrl?.message} selectedFile={parafiscales} />
        
        <SignatureComponent onSave={setFirma} />
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-4 rounded-md text-white font-medium
            ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
          {isSubmitting ? 'Enviando...' : 'Crear Cuenta de Cobro'}
        </button>
      </form>

      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold text-gray-900">¡Espera un momento!</h2>
            <p className="text-gray-700 mt-2">¿Ya validaste tu información antes de crear esta cuenta de cobro?</p>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit(confirmSubmit)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md"
              >
                Sí, continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
