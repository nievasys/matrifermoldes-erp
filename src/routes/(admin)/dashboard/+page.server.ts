import { sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { db } = locals;

	// Current period (November 2026)
	const año = 2026;
	const mes = 11;
	const startDate = `${año}-${String(mes).padStart(2, '0')}-01`;
	const endDate = `${año}-${String(mes + 1).padStart(2, '0')}-01`;

	// Get monthly stats
	const monthlyStats = await db.execute(sql`
    select
      count(distinct r.id)::int as partes,
      coalesce(sum(l.quantity), 0)::bigint as piezas
    from app.production_reports r
    join app.production_lines l on l.report_id = r.id
    where r.status = 'active' and l.status = 'active'
      and r.report_date >= ${startDate}::date
      and r.report_date < ${endDate}::date
  `);

	const statsRow = (monthlyStats as unknown as Array<{ partes: number; piezas: string }>)[0];
	const stats = {
		partes: statsRow?.partes ?? 0,
		piezas: parseInt(statsRow?.piezas ?? '0', 10)
	};

	// Get previous month for comparison
	const prevStartDate = `${año}-${String(mes - 1).padStart(2, '0')}-01`;
	const prevStats = await db.execute(sql`
    select coalesce(sum(l.quantity), 0)::bigint as piezas
    from app.production_reports r
    join app.production_lines l on l.report_id = r.id
    where r.status = 'active' and l.status = 'active'
      and r.report_date >= ${prevStartDate}::date
      and r.report_date < ${startDate}::date
  `);
	const prevRow = (prevStats as unknown as Array<{ piezas: string }>)[0];
	const prevPiezas = parseInt(prevRow?.piezas ?? '1', 10) || 1;
	const deltaPiezas = ((stats.piezas - prevPiezas) / prevPiezas) * 100;

	// Production by machine
	const byMachine = await db.execute(sql`
    select m.name, sum(l.quantity)::int as piezas
    from app.production_reports r
    join app.production_lines l on l.report_id = r.id
    join app.machines m on m.id = l.machine_id
    where r.status = 'active' and l.status = 'active'
      and r.report_date >= ${startDate}::date
      and r.report_date < ${endDate}::date
    group by m.id, m.name
    order by piezas desc
  `);

	// Production by mold (top 5)
	const byMold = await db.execute(sql`
    select mo.name, sum(l.quantity)::int as piezas
    from app.production_reports r
    join app.production_lines l on l.report_id = r.id
    join app.molds mo on mo.id = l.mold_id
    where r.status = 'active' and l.status = 'active'
      and r.report_date >= ${startDate}::date
      and r.report_date < ${endDate}::date
    group by mo.id, mo.name
    order by piezas desc
    limit 5
  `);

	// Monthly totals for sparkline (last 12 months)
	const monthlyTotals = await db.execute(sql`
    select
      to_char(date_trunc('month', r.report_date), 'YYYY-MM') as period,
      sum(l.quantity)::int as piezas
    from app.production_reports r
    join app.production_lines l on l.report_id = r.id
    where r.status = 'active' and l.status = 'active'
      and r.report_date >= '2026-01-01'::date
      and r.report_date < '2027-01-01'::date
    group by 1
    order by 1
  `);

	// Build sparkline data (12 months)
	const monthlyRows = monthlyTotals as unknown as Array<{ period: string; piezas: number }>;
	const sparklineData = Array.from({ length: 12 }, (_, i) => {
		const period = `2026-${String(i + 1).padStart(2, '0')}`;
		const found = monthlyRows.find((r) => r.period === period);
		return found?.piezas || 0;
	});

	// Placeholder values (until we have pricing and expenses tables)
	const precioPromedio = 638;
	const facturacion = stats.piezas * precioPromedio;
	const gastos = 6204110.5;
	const ganancia = facturacion - gastos;

	// Cast machine/mold results
	const machineRows = byMachine as unknown as Array<{ name: string; piezas: number }>;
	const moldRows = byMold as unknown as Array<{ name: string; piezas: number }>;

	return {
		periodo: { mes: 'Noviembre', año: 2026, estado: 'Abierto' as const },
		kpis: {
			facturacion: {
				value: facturacion,
				delta: '+8,4 %', // placeholder
				sparkline: sparklineData.map((p) => p * precioPromedio)
			},
			piezas: {
				value: stats.piezas,
				delta: `${deltaPiezas >= 0 ? '+' : ''}${deltaPiezas.toFixed(1)} % frente a octubre`,
				sparkline: sparklineData
			},
			gastos: {
				value: gastos,
				delta: '+12,6 %', // placeholder
				sparkline: sparklineData.map(() => gastos * (0.8 + Math.random() * 0.4))
			},
			ganancia: {
				value: ganancia,
				delta: `Margen ${((ganancia / facturacion) * 100).toFixed(1)} %`,
				sparkline: sparklineData.map((p) => p * precioPromedio - gastos)
			}
		},
		resumen: {
			partes: stats.partes,
			piezas: stats.piezas,
			revisar: 0 // placeholder
		},
		porMaquina: machineRows.map((m) => ({
			name: m.name,
			value: m.piezas * precioPromedio,
			formattedValue: `$ ${(m.piezas * precioPromedio).toLocaleString('es-AR')}`,
			extra: `${m.piezas.toLocaleString('es-AR')} pzas`
		})),
		porMolde: moldRows.map((m) => ({
			name: m.name,
			value: m.piezas * precioPromedio,
			formattedValue: `$ ${(m.piezas * precioPromedio).toLocaleString('es-AR')}`,
			extra: `${m.piezas.toLocaleString('es-AR')} pzas`
		}))
	};
};
