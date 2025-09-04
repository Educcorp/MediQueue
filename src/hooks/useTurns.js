import { useEffect, useState } from 'react';
import turnService from '../services/turnService';

export default function useTurns() {
	const [nextTurn, setNextTurn] = useState(null);
	const [activeTurns, setActiveTurns] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setLoading(true);
		Promise.all([
			turnService.getNextTurn(),
			turnService.getActiveTurns()
		]).then(([next, active]) => {
			setNextTurn(next);
			setActiveTurns(active);
			setLoading(false);
		}).catch((error) => {
			console.error('Error cargando turnos:', error);
			setLoading(false);
		});
	}, []);

	return { nextTurn, activeTurns, loading };
}
