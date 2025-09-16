import { useEffect, useState, useCallback } from 'react';
import turnService from '../services/turnService';

export default function useTurns(options = {}) {
  const {
    autoRefresh = true,
    refreshInterval = 5000,
    includeInactive = false
  } = options;

  const [nextTurn, setNextTurn] = useState(null);
  const [activeTurns, setActiveTurns] = useState([]);
  const [allTurns, setAllTurns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchTurns = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      const [next, active, all] = await Promise.all([
        turnService.getNextTurn().catch(err => {
          console.warn('Error cargando próximo turno:', err);
          return null;
        }),
        turnService.getActiveTurns().catch(err => {
          console.warn('Error cargando turnos activos:', err);
          return [];
        }),
        includeInactive ? turnService.getAllTurns().catch(err => {
          console.warn('Error cargando todos los turnos:', err);
          return [];
        }) : Promise.resolve([])
      ]);

      setNextTurn(next);
      setActiveTurns(active || []);
      setAllTurns(all || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error cargando turnos:', error);
      setError('Error al cargar los turnos');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [includeInactive]);

  const refreshTurns = useCallback(() => {
    fetchTurns(false);
  }, [fetchTurns]);

  const getTurnsByDate = useCallback(async (date) => {
    try {
      setLoading(true);
      const turns = await turnService.getTurnsByDate(date);
      return turns;
    } catch (error) {
      console.error('Error cargando turnos por fecha:', error);
      setError('Error al cargar turnos por fecha');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getTurnsByStatus = useCallback(async (status) => {
    try {
      setLoading(true);
      const turns = await turnService.getTurnsByStatus(status);
      return turns;
    } catch (error) {
      console.error('Error cargando turnos por estado:', error);
      setError('Error al cargar turnos por estado');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getTurnsByDateRange = useCallback(async (fechaInicio, fechaFin) => {
    try {
      setLoading(true);
      const turns = await turnService.getTurnsByDateRange(fechaInicio, fechaFin);
      return turns;
    } catch (error) {
      console.error('Error cargando turnos por rango de fechas:', error);
      setError('Error al cargar turnos por rango de fechas');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createTurn = useCallback(async (turnData) => {
    try {
      setLoading(true);
      const newTurn = await turnService.createTurn(turnData);
      await fetchTurns(false); // Refrescar lista
      return newTurn;
    } catch (error) {
      console.error('Error creando turno:', error);
      setError('Error al crear el turno');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchTurns]);

  const updateTurnStatus = useCallback(async (ukTurno, newStatus) => {
    try {
      setLoading(true);
      const updatedTurn = await turnService.updateTurnStatus(ukTurno, newStatus);
      await fetchTurns(false); // Refrescar lista
      return updatedTurn;
    } catch (error) {
      console.error('Error actualizando estado del turno:', error);
      setError('Error al actualizar el estado del turno');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchTurns]);

  const deleteTurn = useCallback(async (ukTurno) => {
    try {
      setLoading(true);
      await turnService.deleteTurn(ukTurno);
      await fetchTurns(false); // Refrescar lista
    } catch (error) {
      console.error('Error eliminando turno:', error);
      setError('Error al eliminar el turno');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchTurns]);

  const getTurnStatistics = useCallback(async () => {
    try {
      const stats = await turnService.getTurnStatistics();
      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      setError('Error al obtener estadísticas');
      return null;
    }
  }, []);

  useEffect(() => {
    // Carga inicial
    fetchTurns();

    // Configurar actualización automática si está habilitada
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchTurns(false);
      }, refreshInterval);
    }

    // Limpiar interval al desmontar
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchTurns, autoRefresh, refreshInterval]);

  // Función para limpiar errores
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Función para forzar actualización
  const forceRefresh = useCallback(() => {
    fetchTurns(true);
  }, [fetchTurns]);

  return {
    // Estado
    nextTurn,
    activeTurns,
    allTurns,
    loading,
    error,
    lastUpdate,
    
    // Acciones
    refreshTurns,
    forceRefresh,
    clearError,
    
    // Funciones de consulta
    getTurnsByDate,
    getTurnsByStatus,
    getTurnsByDateRange,
    getTurnStatistics,
    
    // Funciones de modificación
    createTurn,
    updateTurnStatus,
    deleteTurn,
    
    // Utilidades
    hasError: !!error,
    isEmpty: !loading && activeTurns.length === 0,
    hasNextTurn: !!nextTurn
  };
}