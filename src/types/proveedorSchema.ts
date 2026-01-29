// src/types/schema.ts
import { z } from 'zod';
import { departamentosColombia, ciudadesColombia, bancosColombia } from '@/constants/colombiaData';

export const tipoPersonaEnum = z.enum(['Juridica', 'Natural']);
export const documentoEnum = z.enum(['CC', 'CE', 'NIT']);
export const tipoCuentaEnum = z.enum(['Ahorros', 'Corriente']);

// Creamos arrays literales a partir de las constantes
export const departamentosArray = departamentosColombia as const;
export const ciudadesArray = ciudadesColombia as const;
export const bancosArray = bancosColombia as const;

export const registroSchema = z.object({
  tipoPersona: tipoPersonaEnum,
  tipoDocumento: documentoEnum,
  numeroDocumento: z.string().min(5).max(20),
  nombres: z.string().max(50).optional().or(z.literal('')),
  apellidos: z.string().max(50).optional().or(z.literal('')),
  razonSocial: z.string().max(100).optional().or(z.literal('')),
  telefono: z.string().min(7).max(15),
  direccion: z.string().min(5).max(100),
  ciudad: z.enum(ciudadesArray),
  departamento: z.enum(departamentosArray),
  correoElectronico: z.string().email(),
  servicioDescripcion: z.string().min(10).max(500),
  banco: z.enum(bancosArray),
  numeroCuenta: z.string().min(10).max(20),
  tipoCuenta: tipoCuentaEnum,
}).refine(
  (data) => {
    if (data.tipoPersona === 'Natural') {
      return data.nombres && data.nombres.length >= 2 && data.apellidos && data.apellidos.length >= 2;
    }
    return data.razonSocial && data.razonSocial.length >= 2;
  },
  {
    message: "Para persona natural: nombres y apellidos son requeridos (mín. 2 caracteres). Para persona jurídica: razón social es requerida (mín. 2 caracteres)"
  }
);

export type Registro = z.infer<typeof registroSchema>;