import { useEffect, useState } from 'react';
import turnService from '../services/turnService';

export default function useTurns() {
	const [nextTurn, setNextTurn] = useState(null);
	const [activeTurns, setActiveTurns] = useState([]);
	const [loading, setLoading] = useState(true);

	const fetchTurns = async () => {
		try {
			const [next, active] = await Promise.all([
				turnService.getNextTurn(),
				turnService.getActiveTurns()
			]);
			setNextTurn(next);
			setActiveTurns(active);
			setLoading(false);
		} catch (error) {
			console.error('Error cargando turnos:', error);
			setLoading(false);
		}
	};

	useEffect(() => {
		// Carga inicial
		fetchTurns();

		// Actualización automática cada 5 segundos
		const interval = setInterval(fetchTurns, 5000);

		// Limpiar interval al desmontar
		return () => clearInterval(interval);
	}, []);

	return { nextTurn, activeTurns, loading };
}
