import { useEffect, useState } from 'react';
import turnService from '../services/turnService';

export default function useTurns() {
	const [nextTurn, setNextTurn] = useState(null);
	const [lastTurns, setLastTurns] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setLoading(true);
		Promise.all([
			turnService.getNextTurn(),
			turnService.getLastTurns(6)
		]).then(([next, last]) => {
			setNextTurn(next);
			setLastTurns(last);
			setLoading(false);
		}).catch((error) => {
			console.error('Error cargando turnos:', error);
			setLoading(false);
		});
	}, []);

	return { nextTurn, lastTurns, loading };
}
