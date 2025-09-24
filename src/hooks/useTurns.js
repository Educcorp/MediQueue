import { useEffect, useState } from 'react';
import { getNextTurn, getLastTurns } from '../services/turnService';

export default function useTurns() {
	const [nextTurn, setNextTurn] = useState(null);
	const [lastTurns, setLastTurns] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setLoading(true);
		Promise.all([
			getNextTurn(),
			getLastTurns(6)
		]).then(([next, last]) => {
			setNextTurn(next);
			setLastTurns(last);
			setLoading(false);
		});
	}, []);

	return { nextTurn, lastTurns, loading };
}
