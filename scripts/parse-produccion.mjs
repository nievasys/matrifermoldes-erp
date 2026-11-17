/**
 * Parsea el Excel de producción y genera JSON para el dashboard
 * Uso: node scripts/parse-produccion.mjs
 */

import XLSX from 'xlsx';
import { writeFileSync } from 'fs';

const wb = XLSX.readFile('Producción MATRIFER .xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const raw = XLSX.utils.sheet_to_json(ws);

// Parse Excel date
function parseDate(d) {
	if (typeof d === 'number') {
		return new Date((d - 25569) * 86400 * 1000);
	}
	return new Date(d);
}

// Filter valid rows
const data = raw
	.filter((r) => r.Fecha && r.Maquina)
	.map((r) => {
		const fecha = parseDate(r.Fecha);
		// Collect all mold lines from this report
		const lineas = [];

		if (r.Molde && r['Cantidad Total']) {
			lineas.push({
				molde: r.Molde.trim(),
				cantidad: parseInt(r['Cantidad Total']) || 0,
				cantidadHora: parseInt(r['Cantidad x Hora']) || 0
			});
		}

		// Additional molds (columns repeat)
		const moldeKeys = Object.keys(r).filter((k) => k.startsWith('Molde'));
		moldeKeys.slice(1).forEach((key, i) => {
			const idx = key.replace('Molde', '') || `_${i + 1}`;
			const cantKey = `Cantidad Total${idx}`;
			const horaKey = `Cantidad x Hora${idx}`;
			if (r[key] && r[cantKey]) {
				lineas.push({
					molde: String(r[key]).trim(),
					cantidad: parseInt(r[cantKey]) || 0,
					cantidadHora: parseInt(r[horaKey]) || 0
				});
			}
		});

		return {
			timestamp: r['Marca temporal'],
			fecha,
			mes: fecha.getMonth() + 1,
			año: fecha.getFullYear(),
			turno: r.Turno,
			operario: r.Operario,
			maquina: r.Maquina,
			parada: r['Parada de máquina/motivo'] || null,
			lineas
		};
	});

console.log(`Parseados ${data.length} partes de producción\n`);

// --- Estadísticas por mes ---
function getMonthStats(año, mes) {
	const partes = data.filter((d) => d.año === año && d.mes === mes);
	const piezas = partes.reduce((s, p) => s + p.lineas.reduce((ls, l) => ls + l.cantidad, 0), 0);

	// Por máquina
	const porMaquina = {};
	partes.forEach((p) => {
		const cant = p.lineas.reduce((s, l) => s + l.cantidad, 0);
		porMaquina[p.maquina] = (porMaquina[p.maquina] || 0) + cant;
	});

	// Por molde
	const porMolde = {};
	partes.forEach((p) => {
		p.lineas.forEach((l) => {
			porMolde[l.molde] = (porMolde[l.molde] || 0) + l.cantidad;
		});
	});

	// Por turno
	const porTurno = {};
	partes.forEach((p) => {
		porTurno[p.turno] = (porTurno[p.turno] || 0) + 1;
	});

	// Por operario
	const porOperario = {};
	partes.forEach((p) => {
		porOperario[p.operario] = (porOperario[p.operario] || 0) + 1;
	});

	return {
		año,
		mes,
		partes: partes.length,
		piezas,
		porMaquina: Object.entries(porMaquina)
			.sort((a, b) => b[1] - a[1])
			.map(([name, value]) => ({ name, value })),
		porMolde: Object.entries(porMolde)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 10)
			.map(([name, value]) => ({ name, value })),
		porTurno,
		porOperario: Object.entries(porOperario)
			.sort((a, b) => b[1] - a[1])
			.map(([name, value]) => ({ name, value }))
	};
}

// Noviembre 2026 (el mes actual en el dashboard)
const nov2026 = getMonthStats(2026, 11);
console.log('=== Noviembre 2026 ===');
console.log(`Partes: ${nov2026.partes}`);
console.log(`Piezas: ${nov2026.piezas.toLocaleString('es-AR')}`);
console.log('\nPor máquina:');
nov2026.porMaquina.forEach((m) => console.log(`  ${m.name}: ${m.value.toLocaleString('es-AR')}`));
console.log('\nTop 5 moldes:');
nov2026.porMolde
	.slice(0, 5)
	.forEach((m) => console.log(`  ${m.name}: ${m.value.toLocaleString('es-AR')}`));

// --- Serie anual (para el gráfico) ---
const meses2026 = [];
for (let m = 1; m <= 12; m++) {
	const stats = getMonthStats(2026, m);
	meses2026.push({
		mes: m,
		partes: stats.partes,
		piezas: stats.piezas
	});
}

console.log('\n=== Piezas mensuales 2026 ===');
const nombres = [
	'Ene',
	'Feb',
	'Mar',
	'Abr',
	'May',
	'Jun',
	'Jul',
	'Ago',
	'Sep',
	'Oct',
	'Nov',
	'Dic'
];
meses2026.forEach((m, i) => console.log(`${nombres[i]}: ${m.piezas.toLocaleString('es-AR')}`));

// --- Guardar JSON ---
const output = {
	generado: new Date().toISOString(),
	noviembre2026: nov2026,
	meses2026,
	maquinas: [...new Set(data.map((d) => d.maquina))].sort(),
	moldes: [...new Set(data.flatMap((d) => d.lineas.map((l) => l.molde)))].sort(),
	operarios: [...new Set(data.map((d) => d.operario))].sort()
};

writeFileSync('src/lib/data/produccion.json', JSON.stringify(output, null, 2));
console.log('\n✓ Guardado en src/lib/data/produccion.json');
