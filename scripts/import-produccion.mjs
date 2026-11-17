/**
 * Importa la hoja "Datos" del Excel de producción a Supabase local
 * Uso: node scripts/import-produccion.mjs
 */

import XLSX from 'xlsx';
import pg from 'pg';

const { Client } = pg;

const client = new Client({
	connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
});

// Parse Excel date serial number
function parseExcelDate(serial) {
	if (typeof serial === 'number') {
		// Excel serial date (days since 1900-01-01, with the 1900 leap year bug)
		const date = new Date((serial - 25569) * 86400 * 1000);
		return date.toISOString().split('T')[0];
	}
	return null;
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

	// Create system profile for imports
	await client.query(`
    insert into auth.users (id, email)
    values ('00000000-0000-0000-0000-000000000000', 'system@matrifer.local')
    on conflict (id) do nothing
  `);
	await client.query(`alter table app.profiles disable trigger z_audit`);
	await client.query(`
    insert into app.profiles (id, full_name, role, active)
    values ('00000000-0000-0000-0000-000000000000', 'Sistema', 'ADMIN', true)
    on conflict (id) do nothing
  `);
	await client.query(`alter table app.profiles enable trigger z_audit`);

	// Read Excel - hoja "Datos"
	const wb = XLSX.readFile('Producción MATRIFER .xlsx');
	const ws = wb.Sheets['Datos'];
	const raw = XLSX.utils.sheet_to_json(ws);

	// Filter valid rows (must have FECHA and Maquina)
	const data = raw.filter((r) => r.FECHA && r.Maquina && r['C. Tot']);
	console.log(`Parseados ${data.length} registros de la hoja "Datos"\n`);

	// Collect unique values for catalogs
	const machines = new Set();
	const molds = new Set();
	const shifts = new Set();

	data.forEach((r) => {
		if (r.Maquina) machines.add(r.Maquina.toString().trim());
		if (r.MOLDE) molds.add(r.MOLDE.toString().trim());
		if (r.TURNO) shifts.add(r.TURNO.toString().trim());
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

	// Group by date+shift+operator to create production reports
	const reportGroups = new Map();

	for (const r of data) {
		const fecha = parseExcelDate(r.FECHA);
		if (!fecha) continue;

		const turno = r.TURNO?.toString().trim() || 'SIN TURNO';
		const operario = r.OPERARIO?.toString().trim() || '';
		const key = `${fecha}|${turno}|${operario}`;

		if (!reportGroups.has(key)) {
			reportGroups.set(key, {
				fecha,
				turno,
				operario,
				lines: []
			});
		}

		const cantidad = parseInt(r['C. Tot']) || 0;
		if (cantidad <= 0) continue;

		reportGroups.get(key).lines.push({
			maquina: r.Maquina.toString().trim(),
			molde: r.MOLDE?.toString().trim(),
			cantidad,
			cantidadHora: parseInt(r.CxH) || null,
			parada: r['Parada de maq. / Motivo'] || null
		});
	}

	console.log(`\n${reportGroups.size} grupos de partes encontrados`);

	// Insert production reports and lines
	let reportCount = 0;
	let lineCount = 0;

	// Ensure default shift exists
	await client.query(`
    insert into app.shifts (name) values ('SIN TURNO')
    on conflict (name) do nothing
  `);
	const defaultShiftRes = await client.query(
		`select id from app.shifts where name = 'SIN TURNO'`
	);
	shiftMap['SIN TURNO'] = defaultShiftRes.rows[0].id;

	for (const [, group] of reportGroups) {
		if (group.lines.length === 0) continue;

		const shiftId = shiftMap[group.turno] || shiftMap['SIN TURNO'];

		// Insert report
		const reportRes = await client.query(
			`insert into app.production_reports (report_date, shift_id, operator_names, submitted_at)
       values ($1, $2, $3, $4)
       returning id`,
			[group.fecha, shiftId, group.operario, group.fecha]
		);
		const reportId = reportRes.rows[0].id;
		reportCount++;

		// Insert lines
		for (const line of group.lines) {
			const machineId = machineMap[line.maquina];
			const moldId = moldMap[line.molde];

			if (!machineId || !moldId) {
				continue;
			}

			await client.query(
				`insert into app.production_lines (report_id, machine_id, mold_id, quantity, quantity_hour)
         values ($1, $2, $3, $4, $5)`,
				[reportId, machineId, moldId, line.cantidad, line.cantidadHora]
			);
			lineCount++;

			// Insert downtime if present
			if (line.parada && line.parada.toString().trim()) {
				await client.query(
					`insert into app.production_downtimes (line_id, reason_text)
           values (currval('app.production_lines_id_seq'), $1)`,
					[line.parada.toString().trim()]
				);
			}
		}
	}

	console.log(`✓ ${reportCount} partes de producción`);
	console.log(`✓ ${lineCount} líneas de producción`);

	// Verify with queries
	const stats = await client.query(`
    select
      count(distinct r.id) as partes,
      sum(l.quantity) as piezas,
      count(distinct l.machine_id) as maquinas,
      count(distinct l.mold_id) as moldes,
      min(r.report_date) as desde,
      max(r.report_date) as hasta
    from app.production_reports r
    join app.production_lines l on l.report_id = r.id
  `);

	console.log('\n=== Verificación ===');
	console.log(`Partes: ${stats.rows[0].partes}`);
	console.log(`Piezas: ${parseInt(stats.rows[0].piezas).toLocaleString('es-AR')}`);
	console.log(`Máquinas: ${stats.rows[0].maquinas}`);
	console.log(`Moldes: ${stats.rows[0].moldes}`);
	console.log(`Período: ${stats.rows[0].desde} → ${stats.rows[0].hasta}`);

	// Monthly breakdown
	const monthly = await client.query(`
    select
      to_char(date_trunc('month', r.report_date), 'YYYY-MM') as mes,
      count(distinct r.id) as partes,
      sum(l.quantity) as piezas
    from app.production_reports r
    join app.production_lines l on l.report_id = r.id
    group by 1
    order by 1
  `);

	console.log('\n=== Por mes ===');
	for (const row of monthly.rows) {
		console.log(`${row.mes}: ${row.partes} partes, ${parseInt(row.piezas).toLocaleString('es-AR')} pzas`);
	}

	await client.query('COMMIT');
	await client.end();
	console.log('\n✓ Importación completada');
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
