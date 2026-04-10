export function formatDatetime(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

export function parseDatetime(str: string): Date | null {
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/);
  if (!match) return null;
  const [, yyyy, mm, dd, hh, min] = match;
  return new Date(
    Number(yyyy),
    Number(mm) - 1,
    Number(dd),
    Number(hh),
    Number(min)
  );
}

export function todayDate(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export interface TurnoConfig {
  nombre: string;
  entradaHour: number;
  entradaMin: number;
  salidaHour: number;
  salidaMin: number;
}

export const TURNOS: TurnoConfig[] = [
  {
    nombre: "1er Turno (08:00 - 20:00)",
    entradaHour: 8,
    entradaMin: 0,
    salidaHour: 20,
    salidaMin: 0,
  },
  {
    nombre: "2do Turno (20:00 - 08:00)",
    entradaHour: 20,
    entradaMin: 0,
    salidaHour: 8,
    salidaMin: 0,
  },
];

export function getTurnoDatetimes(
  turnoIndex: number,
  baseDate: Date
): { entrada: string; salida: string } {
  const turno = TURNOS[turnoIndex];
  const entradaDate = new Date(baseDate);
  entradaDate.setHours(turno.entradaHour, turno.entradaMin, 0, 0);

  const salidaDate = new Date(baseDate);
  salidaDate.setHours(turno.salidaHour, turno.salidaMin, 0, 0);

  if (turnoIndex === 1 && (turno.salidaHour < turno.entradaHour)) {
    salidaDate.setDate(salidaDate.getDate() + 1);
  }

  return {
    entrada: formatDatetime(entradaDate),
    salida: formatDatetime(salidaDate),
  };
}
