import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID!);

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const proveedorId = cookieStore.get('proveedorId')?.value;

    if (!proveedorId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Obtener query params para filtros
    const searchParams = request.nextUrl.searchParams;
    const estado = searchParams.get('estado');
    const fechaInicio = searchParams.get('fecha_inicio');
    const fechaFin = searchParams.get('fecha_fin');
    const montoMin = searchParams.get('monto_min');
    const montoMax = searchParams.get('monto_max');
    const busqueda = searchParams.get('q');

    console.log('Buscando proveedor:', proveedorId);
    console.log('Filtros aplicados:', { estado, fechaInicio, fechaFin, montoMin, montoMax, busqueda });

    // Obtener los datos del proveedor
    const proveedor = await base('Proveedores').find(proveedorId);
    const identificacion = proveedor.fields['IDENTIFICACIÓN'];
    const comentarios = proveedor.fields['Comentarios'] || '';

    console.log('IDENTIFICACIÓN del proveedor:', identificacion);
    console.log('Comentarios del proveedor:', comentarios);

    // Construir fórmula de filtro dinámica para Airtable
    const filterConditions: string[] = [];
    
    // Filtro base por proveedor
    filterConditions.push(`{Proveedor} = '${identificacion}'`);
    
    // Filtro por estado
    if (estado && estado !== 'todas') {
      filterConditions.push(`{Estado} = '${estado}'`);
    }
    
    // Filtro por fecha de inicio
    if (fechaInicio) {
      filterConditions.push(`IS_AFTER({Fecha}, '${fechaInicio}')`);
    }
    
    // Filtro por fecha de fin
    if (fechaFin) {
      filterConditions.push(`IS_BEFORE({Fecha}, DATEADD('${fechaFin}', 1, 'days'))`);
    }
    
    // Filtro por monto mínimo
    if (montoMin) {
      filterConditions.push(`{ValorTotal} >= ${parseFloat(montoMin)}`);
    }
    
    // Filtro por monto máximo
    if (montoMax) {
      filterConditions.push(`{ValorTotal} <= ${parseFloat(montoMax)}`);
    }
    
    // Filtro por búsqueda de texto (en descripción)
    if (busqueda) {
      const searchTerm = busqueda.replace(/'/g, "\\'");
      filterConditions.push(
        `OR(SEARCH(LOWER('${searchTerm}'), LOWER({Item1_Descripcion})) > 0, SEARCH(LOWER('${searchTerm}'), LOWER({Item2_Descripcion})) > 0, SEARCH(LOWER('${searchTerm}'), LOWER({Item3_Descripcion})) > 0)`
      );
    }

    // Combinar todas las condiciones con AND
    const filterFormula = filterConditions.length > 1 
      ? `AND(${filterConditions.join(', ')})`
      : filterConditions[0];

    console.log('Fórmula de filtro:', filterFormula);

    // Buscar las cuentas de cobro con los filtros aplicados
    const records = await base('CuentasCobro')
      .select({
        filterByFormula: filterFormula,
        sort: [{ field: 'Fecha', direction: 'desc' }]
      })
      .all();

    console.log('Registros encontrados:', records.length);

    // También obtener totales sin filtros para el resumen
    const allRecords = await base('CuentasCobro')
      .select({
        filterByFormula: `{Proveedor} = '${identificacion}'`
      })
      .all();

    const dashboardData = {
      // Totales generales (sin filtros)
      totalCuentas: allRecords.length,
      pendientes: allRecords.filter(r => r.fields.Estado === 'Pendiente').length,
      aprobadas: allRecords.filter(r => r.fields.Estado === 'Aprobada').length,
      comentariosProveedor: comentarios,
      // Resultados filtrados
      resultadosFiltrados: records.length,
      cuentasRecientes: records.map(record => ({
        id: record.id,
        fecha: record.fields.Fecha,
        estado: record.fields.Estado,
        valorTotal: record.fields.ValorTotal || 0,
        descripcion: record.fields.Item1_Descripcion || ''
      })),
      // Filtros aplicados (para debugging/UI)
      filtrosAplicados: {
        estado: estado || 'todas',
        fechaInicio,
        fechaFin,
        montoMin,
        montoMax,
        busqueda
      }
    };

    console.log('Datos procesados:', dashboardData);

    return NextResponse.json({
      success: true,
      ...dashboardData
    });

  } catch (error) {
    console.error('Error completo en dashboard:', error);
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Error al obtener datos del dashboard' },
      { status: 500 }
    );
  }
}
