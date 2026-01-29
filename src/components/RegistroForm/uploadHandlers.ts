// src/components/RegistroForm/uploadHandlers.ts
import { DocumentosState } from './types';

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  version: number;
  resource_type: string;
  format: string;
  bytes: number;
}

export const uploadHandlers = {
  uploadToCloudinary: async (file: File, folder: string): Promise<string> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    
    // Log inicial con información del archivo y configuración
    console.log('=== INICIO UPLOAD CLOUDINARY ===');
    console.log('Archivo:', {
      nombre: file.name,
      tipo: file.type,
      tamaño: `${(file.size / 1024).toFixed(2)} KB`,
      folder: folder
    });
    console.log('Cloud Name:', cloudName || 'NO DEFINIDO');
    
    if (!cloudName) {
      console.error('ERROR: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME no está definido');
      throw new Error('Configuración de Cloudinary incompleta: Cloud Name no definido');
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'proveedores_app');
      formData.append('folder', folder);
      formData.append('public_id', `${Date.now()}`);
      formData.append('resource_type', 'auto');

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
      console.log('URL de upload:', uploadUrl);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('=== ERROR DE CLOUDINARY ===');
        console.error('Status:', response.status);
        console.error('Status Text:', response.statusText);
        console.error('Error completo:', JSON.stringify(responseData, null, 2));
        console.error('Mensaje de error:', responseData?.error?.message || 'Sin mensaje');
        throw new Error(`Error Cloudinary (${response.status}): ${responseData?.error?.message || 'Error desconocido'}`);
      }

      const data = responseData as CloudinaryResponse;
      console.log('=== UPLOAD EXITOSO ===');
      console.log('URL generada:', data.secure_url);
      console.log('Public ID:', data.public_id);
      return data.secure_url;
    } catch (error) {
      console.error('=== ERROR EN uploadToCloudinary ===');
      console.error('Tipo de error:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('Mensaje:', error instanceof Error ? error.message : String(error));
      console.error('Stack:', error instanceof Error ? error.stack : 'No disponible');
      
      // Re-lanzar el error con más contexto
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error desconocido al subir el archivo a Cloudinary');
    }
  },

  uploadAllDocuments: async (documentos: DocumentosState) => {
    console.log('=== INICIO UPLOAD ALL DOCUMENTS ===');
    console.log('Documentos recibidos:', {
      rut: documentos.rut.file ? `${documentos.rut.file.name} (${(documentos.rut.file.size / 1024).toFixed(2)} KB)` : 'NO PRESENTE',
      documento: documentos.documento.file ? `${documentos.documento.file.name} (${(documentos.documento.file.size / 1024).toFixed(2)} KB)` : 'NO PRESENTE',
      certificadoBancario: documentos.certificadoBancario.file ? `${documentos.certificadoBancario.file.name} (${(documentos.certificadoBancario.file.size / 1024).toFixed(2)} KB)` : 'NO PRESENTE'
    });

    try {
      if (!documentos.rut.file || !documentos.documento.file || !documentos.certificadoBancario.file) {
        const missing = [];
        if (!documentos.rut.file) missing.push('RUT');
        if (!documentos.documento.file) missing.push('Documento');
        if (!documentos.certificadoBancario.file) missing.push('Certificado Bancario');
        console.error('Documentos faltantes:', missing.join(', '));
        throw new Error(`Documentos faltantes: ${missing.join(', ')}`);
      }

      // Uploads secuenciales para evitar rate limiting de Cloudinary
      console.log('Iniciando uploads secuenciales...');
      
      console.log('1/3 Subiendo RUT...');
      const rutUrl = await uploadHandlers.uploadToCloudinary(documentos.rut.file, 'rut');
      console.log('✅ RUT subido:', rutUrl);
      
      console.log('2/3 Subiendo Documento...');
      const documentoUrl = await uploadHandlers.uploadToCloudinary(documentos.documento.file, 'documento');
      console.log('✅ Documento subido:', documentoUrl);
      
      console.log('3/3 Subiendo Certificado Bancario...');
      const certificadoBancarioUrl = await uploadHandlers.uploadToCloudinary(documentos.certificadoBancario.file, 'certificado');
      console.log('✅ Certificado Bancario subido:', certificadoBancarioUrl);

      console.log('=== UPLOAD ALL DOCUMENTS EXITOSO ===');
      return {
        rutUrl,
        documentoUrl,
        certificadoBancarioUrl
      };
    } catch (error) {
      console.error('=== ERROR EN uploadAllDocuments ===');
      console.error('Error:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
};