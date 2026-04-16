// src/components/Dashboard/CuentasCobroFilters.tsx
'use client'
import { useState, useCallback } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

export interface FilterValues {
  estado: string;
  fechaInicio: string;
  fechaFin: string;
  montoMin: string;
  montoMax: string;
  busqueda: string;
}

interface CuentasCobroFiltersProps {
  onFilterChange: (filters: FilterValues) => void;
  resultadosFiltrados: number;
  isLoading?: boolean;
}

const ESTADOS = [
  { value: 'todas', label: 'Todas' },
  { value: 'Pendiente', label: 'Pendiente' },
  { value: 'Aprobada', label: 'Aprobada' },
  { value: 'Rechazada', label: 'Rechazada' },
  { value: 'En Revisión', label: 'En Revisión' },
];

const initialFilters: FilterValues = {
  estado: 'todas',
  fechaInicio: '',
  fechaFin: '',
  montoMin: '',
  montoMax: '',
  busqueda: '',
};

export function CuentasCobroFilters({ 
  onFilterChange, 
  resultadosFiltrados,
  isLoading = false 
}: CuentasCobroFiltersProps) {
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = useCallback((key: keyof FilterValues, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleApplyFilters = useCallback(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleClearFilters = useCallback(() => {
    setFilters(initialFilters);
    onFilterChange(initialFilters);
  }, [onFilterChange]);

  const hasActiveFilters = 
    filters.estado !== 'todas' || 
    filters.fechaInicio || 
    filters.fechaFin || 
    filters.montoMin || 
    filters.montoMax || 
    filters.busqueda;

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-6">
      {/* Header con búsqueda y toggle */}
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
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2 items-center">
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
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Buscando...' : 'Aplicar'}
          </button>
        </div>
      </div>

      {/* Panel expandible de filtros */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Filtro por Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Estado
              </label>
              <select
                value={filters.estado}
                onChange={(e) => handleFilterChange('estado', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {ESTADOS.map((estado) => (
                  <option key={estado.value} value={estado.value}>
                    {estado.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Fecha Inicio */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Fecha desde
              </label>
              <input
                type="date"
                value={filters.fechaInicio}
                onChange={(e) => handleFilterChange('fechaInicio', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Filtro por Fecha Fin */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Fecha hasta
              </label>
              <input
                type="date"
                value={filters.fechaFin}
                onChange={(e) => handleFilterChange('fechaFin', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Filtro por Monto Mínimo */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Monto mínimo (COP)
              </label>
              <input
                type="number"
                placeholder="0"
                value={filters.montoMin}
                onChange={(e) => handleFilterChange('montoMin', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="0"
              />
            </div>

            {/* Filtro por Monto Máximo */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Monto máximo (COP)
              </label>
              <input
                type="number"
                placeholder="Sin límite"
                value={filters.montoMax}
                onChange={(e) => handleFilterChange('montoMax', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
