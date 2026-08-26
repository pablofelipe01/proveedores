// src/components/Dashboard/CuentasCobroFilters.tsx
'use client'
import { useState, useCallback, useMemo } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp, Calendar, ArrowUpDown } from 'lucide-react';

export type OrdenValue =
  | 'fecha_desc'
  | 'fecha_asc'
  | 'monto_desc'
  | 'monto_asc'
  | 'estado_asc';

export interface FilterValues {
  estado: string;
  fechaInicio: string;
  fechaFin: string;
  montoMin: string;
  montoMax: string;
  busqueda: string;
  orden: OrdenValue;
}

interface CuentasCobroFiltersProps {
  onFilterChange: (filters: FilterValues) => void;
  resultadosFiltrados: number;
  isLoading?: boolean;
  filters: FilterValues;
}

const ESTADOS = [
  { value: 'todas', label: 'Todas' },
  { value: 'Pendiente', label: 'Pendiente' },
  { value: 'Aprobada', label: 'Aprobada' },
  { value: 'Rechazada', label: 'Rechazada' },
  { value: 'En Revisión', label: 'En Revisión' },
];

export const ORDENES: { value: OrdenValue; label: string }[] = [
  { value: 'fecha_desc', label: 'Fecha: más recientes primero' },
  { value: 'fecha_asc', label: 'Fecha: más antiguas primero' },
  { value: 'monto_desc', label: 'Valor: mayor a menor' },
  { value: 'monto_asc', label: 'Valor: menor a mayor' },
  { value: 'estado_asc', label: 'Estado (A-Z)' },
];

export const initialFilters: FilterValues = {
  estado: 'todas',
  fechaInicio: '',
  fechaFin: '',
  montoMin: '',
  montoMax: '',
  busqueda: '',
  orden: 'fecha_desc',
};

// Formatea una fecha a YYYY-MM-DD en horario local (sin desfase por UTC)
const toInputDate = (date: Date): string => {
  const mes = `${date.getMonth() + 1}`.padStart(2, '0');
  const dia = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${mes}-${dia}`;
};

type Preset = { key: string; label: string; rango: () => { inicio: string; fin: string } };

const PRESETS: Preset[] = [
  {
    key: 'mes_actual',
    label: 'Este mes',
    rango: () => {
      const hoy = new Date();
      return {
        inicio: toInputDate(new Date(hoy.getFullYear(), hoy.getMonth(), 1)),
        fin: toInputDate(hoy),
      };
    },
  },
  {
    key: 'mes_anterior',
    label: 'Mes anterior',
    rango: () => {
      const hoy = new Date();
      return {
        inicio: toInputDate(new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1)),
        fin: toInputDate(new Date(hoy.getFullYear(), hoy.getMonth(), 0)),
      };
    },
  },
  {
    key: 'ultimos_3_meses',
    label: 'Últimos 3 meses',
    rango: () => {
      const hoy = new Date();
      return {
        inicio: toInputDate(new Date(hoy.getFullYear(), hoy.getMonth() - 2, 1)),
        fin: toInputDate(hoy),
      };
    },
  },
  {
    key: 'anio_actual',
    label: 'Este año',
    rango: () => {
      const hoy = new Date();
      return {
        inicio: toInputDate(new Date(hoy.getFullYear(), 0, 1)),
        fin: toInputDate(hoy),
      };
    },
  },
];

export function CuentasCobroFilters({
  onFilterChange,
  resultadosFiltrados,
  isLoading = false,
  filters: appliedFilters,
}: CuentasCobroFiltersProps) {
  const [pendingFilters, setPendingFilters] = useState<FilterValues>(appliedFilters);
  const [isExpanded, setIsExpanded] = useState(false);

  // El orden siempre lo manda el padre (también se puede cambiar desde los
  // encabezados de la tabla); el resto de campos queda pendiente hasta "Aplicar".
  const filters = useMemo<FilterValues>(
    () => ({ ...pendingFilters, orden: appliedFilters.orden }),
    [pendingFilters, appliedFilters.orden]
  );

  const handleFilterChange = useCallback((key: keyof FilterValues, value: string) => {
    setPendingFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleApplyFilters = useCallback(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleClearFilters = useCallback(() => {
    setPendingFilters(initialFilters);
    onFilterChange(initialFilters);
  }, [onFilterChange]);

  // El orden se aplica de inmediato: no requiere pulsar "Aplicar"
  const handleOrdenChange = useCallback((orden: OrdenValue) => {
    onFilterChange({ ...filters, orden });
  }, [filters, onFilterChange]);

  const handlePreset = useCallback((preset: Preset) => {
    const { inicio, fin } = preset.rango();
    const next = { ...filters, fechaInicio: inicio, fechaFin: fin };
    setPendingFilters(next);
    onFilterChange(next);
  }, [filters, onFilterChange]);

  const handleQuitarFechas = useCallback(() => {
    const next = { ...filters, fechaInicio: '', fechaFin: '' };
    setPendingFilters(next);
    onFilterChange(next);
  }, [filters, onFilterChange]);

  const presetActivo = useMemo(() => {
    if (!filters.fechaInicio || !filters.fechaFin) return null;
    return PRESETS.find(p => {
      const { inicio, fin } = p.rango();
      return inicio === filters.fechaInicio && fin === filters.fechaFin;
    })?.key ?? null;
  }, [filters.fechaInicio, filters.fechaFin]);

  const rangoInvertido = Boolean(
    filters.fechaInicio && filters.fechaFin && filters.fechaInicio > filters.fechaFin
  );

  const hasActiveFilters =
    filters.estado !== 'todas' ||
    Boolean(filters.fechaInicio) ||
    Boolean(filters.fechaFin) ||
    Boolean(filters.montoMin) ||
    Boolean(filters.montoMax) ||
    Boolean(filters.busqueda);

  const inputClass =
    'w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent';

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-6">
      {/* Header con búsqueda, orden y toggle */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* Búsqueda rápida */}
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por concepto o descripción..."
            value={filters.busqueda}
            onChange={(e) => handleFilterChange('busqueda', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
            className={`${inputClass} pl-10 pr-4`}
          />
        </div>

        {/* Orden + acciones */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-gray-400" />
            <label htmlFor="orden-cuentas" className="sr-only">Ordenar por</label>
            <select
              id="orden-cuentas"
              value={filters.orden}
              onChange={(e) => handleOrdenChange(e.target.value as OrdenValue)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {ORDENES.map((orden) => (
                <option key={orden.value} value={orden.value}>
                  {orden.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filtros</span>
            {hasActiveFilters && (
              <span className="bg-indigo-500 text-white text-xs rounded-full px-2 py-0.5">
                Activos
              </span>
            )}
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          <button
            onClick={handleApplyFilters}
            disabled={isLoading || rangoInvertido}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Buscando...' : 'Aplicar'}
          </button>
        </div>
      </div>

      {/* Rango de fechas: siempre visible */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-300">Rango de fechas</span>
        </div>

        {/* Atajos rápidos */}
        <div className="flex flex-wrap gap-2 mb-3">
          {PRESETS.map((preset) => (
            <button
              key={preset.key}
              onClick={() => handlePreset(preset)}
              className={`px-3 py-1.5 rounded-full text-xs transition-colors border ${
                presetActivo === preset.key
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {preset.label}
            </button>
          ))}
          {(filters.fechaInicio || filters.fechaFin) && (
            <button
              onClick={handleQuitarFechas}
              className="px-3 py-1.5 rounded-full text-xs bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600 transition-colors flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Quitar fechas
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fecha-desde" className="block text-sm font-medium text-gray-300 mb-1">
              Desde
            </label>
            <input
              id="fecha-desde"
              type="date"
              value={filters.fechaInicio}
              max={filters.fechaFin || undefined}
              onChange={(e) => handleFilterChange('fechaInicio', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="fecha-hasta" className="block text-sm font-medium text-gray-300 mb-1">
              Hasta
            </label>
            <input
              id="fecha-hasta"
              type="date"
              value={filters.fechaFin}
              min={filters.fechaInicio || undefined}
              onChange={(e) => handleFilterChange('fechaFin', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {rangoInvertido && (
          <p className="mt-2 text-xs text-red-400">
            La fecha inicial no puede ser posterior a la fecha final.
          </p>
        )}
      </div>

      {/* Panel expandible: resto de filtros */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Filtro por Estado */}
            <div>
              <label htmlFor="filtro-estado" className="block text-sm font-medium text-gray-300 mb-1">
                Estado
              </label>
              <select
                id="filtro-estado"
                value={filters.estado}
                onChange={(e) => handleFilterChange('estado', e.target.value)}
                className={inputClass}
              >
                {ESTADOS.map((estado) => (
                  <option key={estado.value} value={estado.value}>
                    {estado.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Monto Mínimo */}
            <div>
              <label htmlFor="monto-min" className="block text-sm font-medium text-gray-300 mb-1">
                Monto mínimo (COP)
              </label>
              <input
                id="monto-min"
                type="number"
                placeholder="0"
                value={filters.montoMin}
                onChange={(e) => handleFilterChange('montoMin', e.target.value)}
                className={inputClass}
                min="0"
              />
            </div>

            {/* Filtro por Monto Máximo */}
            <div>
              <label htmlFor="monto-max" className="block text-sm font-medium text-gray-300 mb-1">
                Monto máximo (COP)
              </label>
              <input
                id="monto-max"
                type="number"
                placeholder="Sin límite"
                value={filters.montoMax}
                onChange={(e) => handleFilterChange('montoMax', e.target.value)}
                className={inputClass}
                min="0"
              />
            </div>

            {/* Botón Limpiar */}
            <div className="flex items-end">
              <button
                onClick={handleClearFilters}
                disabled={!hasActiveFilters}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="h-4 w-4" />
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contador de resultados */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-gray-400">
          Mostrando <span className="font-semibold text-white">{resultadosFiltrados}</span> cuenta{resultadosFiltrados !== 1 ? 's' : ''}
        </span>
        {hasActiveFilters && (
          <span className="text-indigo-400 text-xs">
            Filtros activos
          </span>
        )}
      </div>
    </div>
  );
}
