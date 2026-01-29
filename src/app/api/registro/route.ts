// src/app/api/registro/route.ts
import { NextResponse } from 'next/server';
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID!);

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Log para depuración
    console.log('=== DATOS RECIBIDOS EN API REGISTRO ===');
    console.log('Datos:', JSON.stringify(data, null, 2));

    // Validación básica de URLs
    if (!data.rutUrl || !data.documentoUrl || !data.certificadoBancarioUrl) {
      console.error('Faltan URLs de documentos:', {
        rutUrl: data.rutUrl ? 'OK' : 'FALTA',
        documentoUrl: data.documentoUrl ? 'OK' : 'FALTA',
        certificadoBancarioUrl: data.certificadoBancarioUrl ? 'OK' : 'FALTA'
      });
      return NextResponse.json(
        { message: 'Todos los documentos son requeridos' },
        { status: 400 }
      );
    }

    // Preparar campos según el tipo de persona
    const fields: Record<string, string> = {
      TipoPersona: data.tipoPersona,
      TipoDocumento: data.tipoDocumento,
      NumeroDocumento: data.numeroDocumento,
      Telefono: data.telefono,
      Direccion: data.direccion,
      Ciudad: data.ciudad,
      Departamento: data.departamento,
      CorreoElectronico: data.correoElectronico,
      ServicioDescripcion: data.servicioDescripcion,
      Banco: data.banco,
      NumeroCuenta: data.numeroCuenta,
      TipoCuenta: data.tipoCuenta,
      RutUrl: data.rutUrl,
      DocumentoUrl: data.documentoUrl,
      CertificadoBancarioUrl: data.certificadoBancarioUrl,
    };

    // Agregar campos según tipo de persona
    if (data.tipoPersona === 'Natural') {
      fields.Nombres = data.nombres || '';
      fields.Apellidos = data.apellidos || '';
    } else {
      fields.RazonSocial = data.razonSocial || '';
    }

    console.log('Campos a enviar a Airtable:', JSON.stringify(fields, null, 2));
    
    // Crear registro en Airtable
    const record = await base('Proveedores').create([
      { fields },
    ]);

    // Log de éxito
    console.log('=== REGISTRO CREADO EXITOSAMENTE ===');
    console.log('Record ID:', record[0].id);

    return NextResponse.json({ success: true, recordId: record[0].id });
  } catch (error) {
    console.error('=== ERROR EN API REGISTRO ===');
    console.error('Error:', error);
    console.error('Mensaje:', error instanceof Error ? error.message : 'Error desconocido');
    
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error al procesar el registro' },
      { status: 500 }
    );
  }
}