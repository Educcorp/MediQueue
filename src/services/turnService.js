// Servicios para operaciones de turnos

// Simulación de datos de turnos
const mockTurns = [
	{ id: 'A76', consultorio: 'Consultorio 1', status: 'next' },
	{ id: 'A75', consultorio: 'Consultorio 1', status: 'past' },
	{ id: 'A74', consultorio: 'Consultorio 1', status: 'past' },
	{ id: 'A73', consultorio: 'Consultorio 1', status: 'past' },
	{ id: 'U83', consultorio: 'Consultorio 2', status: 'past' },
	{ id: 'A72', consultorio: 'Consultorio 1', status: 'past' },
	{ id: 'U82', consultorio: 'Consultorio 2', status: 'past' },
	{ id: 'U81', consultorio: 'Consultorio 2', status: 'past' },
];

export function getNextTurn() {
	// Devuelve el primer turno con status 'next'
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(mockTurns.find(t => t.status === 'next'));
		}, 300);
	});
}

export function getLastTurns(limit = 5) {
	// Devuelve los últimos turnos con status 'past', ordenados del más reciente al menos reciente
	return new Promise((resolve) => {
		setTimeout(() => {
			const pastTurns = mockTurns.filter(t => t.status === 'past').slice(0, limit);
			resolve(pastTurns);
		}, 300);
	});
}
