// src/components/Perfil.tsx

import { useEffect, useState } from 'react';

type ProveedorData = {
  id: string;
  tipoPersona: string;
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  departamento: string;
  correoElectronico: string;
  servicioDescripcion: string;
  banco: string;
  numeroCuenta: string;
  tipoCuenta: string;
  rutUrl: string;
  estado: string;
  cuentaCobro: string[];
  certificadoBancarioUrl: string;
  documentoUrl: string;
  comentarios: string;
  archivosCorregidos: string;
  fechaRegistro: string;
  identificacion: string;
};

export default function Perfil() {
  const [proveedor, setProveedor] = useState<ProveedorData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Cambia la URL por la ruta de tu API
    fetch('/api/actualizar-perfil/uploapPerfil')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error al obtener los datos');
        }
        return response.json();
      })
      .then((data) => {
        setProveedor(data.proveedorData); // Asegúrate de que la propiedad coincida
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Cargando...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <h2>Perfil del Proveedor Contratista</h2>
      {proveedor && (
        <div>
          <p><strong>Nombre Completo:</strong> {proveedor.nombres} {proveedor.apellidos}</p>
          <p><strong>Tipo Documento:</strong> {proveedor.tipoDocumento}</p>
          <p><strong>Número Documento:</strong> {proveedor.numeroDocumento}</p>
          <p><strong>Teléfono:</strong> {proveedor.telefono}</p>
          <p><strong>Dirección:</strong> {proveedor.direccion}</p>
          <p><strong>Ciudad:</strong> {proveedor.ciudad}</p>
          <p><strong>Departamento:</strong> {proveedor.departamento}</p>
          <p><strong>Correo Electrónico:</strong> {proveedor.correoElectronico}</p>
          <p><strong>Servicio Descripción:</strong> {proveedor.servicioDescripcion}</p>
          <p><strong>Banco:</strong> {proveedor.banco}</p>
          <p><strong>Número Cuenta:</strong> {proveedor.numeroCuenta}</p>
          <p><strong>Tipo Cuenta:</strong> {proveedor.tipoCuenta}</p>
          {/* Aquí omites los campos relacionados con los enlaces */}
        </div>
      )}
    </div>
  );
}
