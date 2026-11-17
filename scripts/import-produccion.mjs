/**
 * Importa el Excel de producción a Supabase local
 * Uso: node scripts/import-produccion.mjs
 */

import XLSX from 'xlsx';
import pg from 'pg';

const { Client } = pg;

const client = new Client({
	connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
});

// Parse Excel date
function parseDate(d) {
	if (typeof d === 'number') {
		return new Date((d - 25569) * 86400 * 1000);
	}
	return new Date(d);
}

async function main() {
	await client.connect();
	console.log('Conectado a Supabase local\n');

	// Start transaction and set actor
	await client.query('BEGIN');
	await client.query(`
    set local app.user_id = '00000000-0000-0000-0000-000000000000';
    set local app.user_role = 'SYSTEM';
  `);

	// First, create a system profile for imports (bypass audit for this)
	await client.query(`
    insert into auth.users (id, email)
    values ('00000000-0000-0000-0000-000000000000', 'system@matrifer.local')
    on conflict (id) do nothing
  `);
	// Temporarily disable audit trigger for profiles insert
	await client.query(`alter table app.profiles disable trigger z_audit`);
	await client.query(`
    insert into app.profiles (id, full_name, role, active)
    values ('00000000-0000-0000-0000-000000000000', 'Sistema', 'ADMIN', true)
    on conflict (id) do nothing
  `);
	await client.query(`alter table app.profiles enable trigger z_audit`);

	// Read Excel
	const wb = XLSX.readFile('Producción MATRIFER .xlsx');
	const ws = wb.Sheets[wb.SheetNames[0]];
	const raw = XLSX.utils.sheet_to_json(ws);

	// Filter valid rows
	const data = raw.filter((r) => r.Fecha && r.Maquina);
	console.log(`Parseados ${data.length} registros del Excel\n`);

	// Collect unique values for catalogs
	const machines = new Set();
	const molds = new Set();
	const shifts = new Set();

	data.forEach((r) => {
		machines.add(r.Maquina.trim());
		if (r.Molde) molds.add(r.Molde.trim());
		if (r.Turno) shifts.add(r.Turno.trim());

		// Additional molds
		Object.keys(r).forEach((k) => {
			if (k.startsWith('Molde') && r[k] && typeof r[k] === 'string') {
				molds.add(r[k].trim());
			}
		});
	});

	console.log(`Máquinas: ${machines.size}`);
	console.log(`Moldes: ${molds.size}`);
	console.log(`Turnos: ${shifts.size}\n`);

	// Insert machines
	const machineMap = {};
	for (const name of machines) {
		const code = name.replace(/\s+/g, '_').toUpperCase();
		const res = await client.query(
			`insert into app.machines (code, name) values ($1, $2)
       on conflict (code) do update set name = excluded.name
       returning id`,
			[code, name]
		);
		machineMap[name] = res.rows[0].id;
	}
	console.log(`✓ ${machines.size} máquinas insertadas`);

	// Insert molds
	const moldMap = {};
	let moldIdx = 1;
	for (const name of molds) {
		const code = `MOL-${String(moldIdx++).padStart(4, '0')}`;
		const res = await client.query(
			`insert into app.molds (code, name) values ($1, $2)
       on conflict (code) do update set name = excluded.name
       returning id`,
			[code, name]
		);
		moldMap[name] = res.rows[0].id;
	}
	console.log(`✓ ${molds.size} moldes insertados`);

	// Insert shifts
	const shiftMap = {};
	for (const name of shifts) {
		const res = await client.query(
			`insert into app.shifts (name) values ($1)
       on conflict (name) do update set name = excluded.name
       returning id`,
			[name]
		);
		shiftMap[name] = res.rows[0].id;
	}
	console.log(`✓ ${shifts.size} turnos insertados`);

	// Insert production reports and lines
	let reportCount = 0;
	let lineCount = 0;

	for (const r of data) {
		const fecha = parseDate(r.Fecha);
		const submittedAt = r['Marca temporal'] ? parseDate(r['Marca temporal']) : fecha;

		// Insert report
		const reportRes = await client.query(
			`insert into app.production_reports (report_date, shift_id, operator_names, submitted_at)
       values ($1, $2, $3, $4)
       returning id`,
			[fecha.toISOString().split('T')[0], shiftMap[r.Turno.trim()], r.Operario || '', submittedAt]
		);
		const reportId = reportRes.rows[0].id;
		reportCount++;

		// Collect all lines from this report
		const lines = [];

		if (r.Molde && r['Cantidad Total']) {
			lines.push({
				molde: r.Molde.trim(),
				cantidad: parseInt(r['Cantidad Total']) || 0,
				cantidadHora: parseInt(r['Cantidad x Hora']) || null,
				parada: r['Parada de máquina/motivo'] || null
			});
		}

		// Additional molds (up to 5)
		const moldeKeys = Object.keys(r).filter(
			(k) => k.startsWith('Molde') && k !== 'Molde' && r[k] && typeof r[k] === 'string'
		);
		moldeKeys.forEach((key) => {
			const suffix = key.replace('Molde', '').replace('_', '');
			const cantKey = Object.keys(r).find(
				(k) => k.startsWith('Cantidad Total') && k.includes(suffix)
			);
			const horaKey = Object.keys(r).find(
				(k) => k.startsWith('Cantidad x Hora') && k.includes(suffix)
			);

			if (r[cantKey]) {
				lines.push({
					molde: r[key].trim(),
					cantidad: parseInt(r[cantKey]) || 0,
					cantidadHora: horaKey ? parseInt(r[horaKey]) || null : null,
					parada: null
				});
			}
		});

		// Insert lines
		for (const line of lines) {
			if (line.cantidad <= 0) continue;

			const moldId = moldMap[line.molde];
			if (!moldId) {
				console.warn(`  Molde no encontrado: ${line.molde}`);
				continue;
			}

			await client.query(
				`insert into app.production_lines (report_id, machine_id, mold_id, quantity, quantity_hour)
         values ($1, $2, $3, $4, $5)`,
				[reportId, machineMap[r.Maquina.trim()], moldId, line.cantidad, line.cantidadHora]
			);
			lineCount++;

			// Insert downtime if present
			if (line.parada) {
				await client.query(
					`insert into app.production_downtimes (line_id, reason_text)
           values (currval('app.production_lines_id_seq'), $1)`,
					[line.parada]
				);
			}
		}
	}

	console.log(`\n✓ ${reportCount} partes de producción`);
	console.log(`✓ ${lineCount} líneas de producción`);

	// Verify with a query
	const stats = await client.query(`
    select
      count(distinct r.id) as partes,
      sum(l.quantity) as piezas,
      count(distinct l.machine_id) as maquinas,
      count(distinct l.mold_id) as moldes
    from app.production_reports r
    join app.production_lines l on l.report_id = r.id
  `);
	console.log('\n=== Verificación ===');
	console.log(`Partes: ${stats.rows[0].partes}`);
	console.log(`Piezas: ${parseInt(stats.rows[0].piezas).toLocaleString('es-AR')}`);
	console.log(`Máquinas: ${stats.rows[0].maquinas}`);
	console.log(`Moldes: ${stats.rows[0].moldes}`);

	await client.query('COMMIT');
	await client.end();
	console.log('\n✓ Importación completada');
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
