import produccion from '#lib/data/produccion.json';

export function load() {
	const { noviembre2026, meses2026 } = produccion;

	// Format money (placeholder prices until real pricing data)
	const precioPromedio = 638; // placeholder
	const facturacion = noviembre2026.piezas * precioPromedio;

	// Mock expenses for now (will come from expenses table)
	const gastos = 6204110.5;
	const ganancia = facturacion - gastos;

	// Get previous month for comparison
	const oct = meses2026.find((m) => m.mes === 10);
	const deltaPiezas = oct ? ((noviembre2026.piezas - oct.piezas) / oct.piezas) * 100 : 0;

	return {
		periodo: { mes: 'Noviembre', año: 2026, estado: 'Abierto' as const },
		kpis: {
			facturacion: {
				value: facturacion,
				delta: '+8,4 %', // placeholder until real pricing
				sparkline: meses2026.map((m) => m.piezas * precioPromedio)
			},
			piezas: {
				value: noviembre2026.piezas,
				delta: `${deltaPiezas >= 0 ? '+' : ''}${deltaPiezas.toFixed(1)} % frente a octubre`,
				sparkline: meses2026.map((m) => m.piezas)
			},
			gastos: {
				value: gastos,
				delta: '+12,6 %', // placeholder
				sparkline: meses2026.map(() => gastos * (0.8 + Math.random() * 0.4))
			},
			ganancia: {
				value: ganancia,
				delta: `Margen ${((ganancia / facturacion) * 100).toFixed(1)} %`,
				sparkline: meses2026.map((m) => m.piezas * precioPromedio - gastos)
			}
		},
		resumen: {
			partes: noviembre2026.partes,
			piezas: noviembre2026.piezas,
			revisar: 0 // placeholder
		},
		porMaquina: noviembre2026.porMaquina.map((m) => ({
			name: m.name,
			value: m.value * precioPromedio,
			formattedValue: `$ ${(m.value * precioPromedio).toLocaleString('es-AR')}`,
			extra: `${m.value.toLocaleString('es-AR')} pzas`
		})),
		porMolde: noviembre2026.porMolde.slice(0, 5).map((m) => ({
			name: m.name,
			value: m.value * precioPromedio,
			formattedValue: `$ ${(m.value * precioPromedio).toLocaleString('es-AR')}`,
			extra: `${m.value.toLocaleString('es-AR')} pzas`
		})),
		chartData: meses2026.map((m, i) => ({
			mes: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][i],
			facturacion: m.piezas * precioPromedio,
			gastos: gastos * (0.8 + Math.random() * 0.4)
		}))
	};
}
