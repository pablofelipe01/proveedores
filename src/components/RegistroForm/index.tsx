// src/components/RegistroForm/index.tsx
import React, { forwardRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registroSchema } from '@/types/proveedorSchema';
import { SubmitButton } from './components/SubmitButton';
import { PersonalInfo } from './components/PersonalInfo';
import { DocumentUpload } from './components/DocumentUpload';
import { RegistroFormHandle, RegistroFormProps } from './types';
import { createHandlers } from './handlers';
import { createSubmitHandler } from './submitHandler';
import { useImperativeHandle, useState } from 'react';
import { ciudadesColombia } from '@/constants/colombiaData';

const RegistroForm = forwardRef<RegistroFormHandle, RegistroFormProps>((props, ref) => {
 const [documentos, setDocumentos] = useState({
   rut: { file: null, uploading: false, error: null, progress: 0 },
   documento: { file: null, uploading: false, error: null, progress: 0 },
   certificadoBancario: { file: null, uploading: false, error: null, progress: 0 }
 });

 const [isSubmitting, setIsSubmitting] = useState(false);

 const {
   register,
   handleSubmit,
   formState: { errors },
   watch,
   setValue,
 } = useForm({
   resolver: zodResolver(registroSchema),
   defaultValues: {
     tipoPersona: 'Natural',
     tipoDocumento: 'CC',
     tipoCuenta: 'Ahorros',
   }
 });

 const tipoPersona = watch('tipoPersona');
 const tipoDocumento = watch('tipoDocumento');

 // Debug: mostrar errores en consola
 React.useEffect(() => {
   if (Object.keys(errors).length > 0) {
     console.log('=== ERRORES DE VALIDACIÓN ===', errors);
   }
 }, [errors]);

 const handlers = createHandlers(setValue, setDocumentos, ciudadesColombia);
 const onSubmit = createSubmitHandler(setIsSubmitting, documentos, tipoPersona);

 useImperativeHandle(ref, () => ({
   setFormData: (data) => {
     Object.entries(data).forEach(([key, value]) => {
       setValue(key, value);
     });
   },
   setDocuments: (docs) => {
     setDocumentos(prev => ({
       ...prev,
       ...Object.entries(docs).reduce((acc, [key, file]) => ({
         ...acc,
         [key]: { file, uploading: false, error: null, progress: 0 }
       }), {})
     }));
   }
 }));

 return (
   <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-gray-800 p-6 rounded-lg">
     <PersonalInfo 
       register={register}
       errors={errors}
       tipoPersona={tipoPersona}
       tipoDocumento={tipoDocumento}
     />
     
     <DocumentUpload 
       documentos={documentos}
       handleFileChange={handlers.handleFileChange}
     />

     <SubmitButton isSubmitting={isSubmitting} />

     {Object.keys(errors).length > 0 && (
       <div className="mt-4 p-4 rounded-md bg-red-900/50 border border-red-500">
         <div className="flex">
           <div className="ml-3">
             <h3 className="text-sm font-medium text-red-200">
               Hay errores en el formulario
             </h3>
             <div className="mt-2 text-sm text-red-300">
               <p>Por favor, revise los campos marcados en rojo.</p>
               <ul className="list-disc list-inside mt-2">
                 {Object.entries(errors).map(([field, error]) => (
                   <li key={field}>
                     <strong>{field}:</strong> {error?.message || 'Campo inválido'}
                   </li>
                 ))}
               </ul>
             </div>
           </div>
         </div>
       </div>
     )}
   </form>
 );
});

RegistroForm.displayName = 'RegistroForm';

export default RegistroForm;