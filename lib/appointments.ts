import { promises as fs } from "fs";
import { randomUUID } from "crypto";
import path from "path";
import { neon } from "@neondatabase/serverless";

export type AppointmentInput = {
  facility: string;
  specialty: string;
  doctor: string;
  appointmentDate: string;
  appointmentTime: string;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  reason: string;
};

export type Appointment = AppointmentInput & {
  id: string;
  status: "new";
  createdAt: string;
};

const appointmentsFile = path.join(
  process.cwd(),
  "data",
  "appointments.json",
);
const lockFile = `${appointmentsFile}.lock`;
const lockTimeoutMs = 12_000;
const staleLockMs = 30_000;
let schemaReadyPromise: Promise<void> | null = null;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function acquireAppointmentsLock() {
  const startedAt = Date.now();

  while (Date.now() - startedAt < lockTimeoutMs) {
    try {
      await fs.mkdir(path.dirname(appointmentsFile), { recursive: true });
      const handle = await fs.open(lockFile, "wx");
      await handle.writeFile(
        JSON.stringify({
          pid: process.pid,
          createdAt: new Date().toISOString(),
        }),
        "utf8",
      );
      return handle;
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== "EEXIST") throw error;

      try {
        const stat = await fs.stat(lockFile);
        if (Date.now() - stat.mtimeMs > staleLockMs) {
          await fs.unlink(lockFile);
          continue;
        }
      } catch (statError) {
        if ((statError as NodeJS.ErrnoException).code !== "ENOENT") {
          throw statError;
        }
      }

      await wait(25 + Math.floor(Math.random() * 50));
    }
  }

  throw new Error("APPOINTMENT_STORE_BUSY");
}

async function withAppointmentsLock<T>(operation: () => Promise<T>) {
  const handle = await acquireAppointmentsLock();
  try {
    return await operation();
  } finally {
    await handle.close().catch(() => undefined);
    await fs.unlink(lockFile).catch(() => undefined);
  }
}

async function readAppointments() {
  try {
    const raw = await fs.readFile(appointmentsFile, "utf8");
    const parsed = JSON.parse(raw.replace(/^\uFEFF/, "")) as unknown;
    return Array.isArray(parsed) ? (parsed as Appointment[]) : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function writeAppointments(appointments: Appointment[]) {
  await fs.mkdir(path.dirname(appointmentsFile), { recursive: true });
  const tempFile = `${appointmentsFile}.${process.pid}.${randomUUID()}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(appointments, null, 2), "utf8");
  await fs.rename(tempFile, appointmentsFile);
}

function createBookingCode() {
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const suffix = randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase();
  return `VM-${date}-${suffix}`;
}

function getDatabaseUrl() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING ||
    ""
  ).trim();
}

function hasDatabaseUrl() {
  return Boolean(getDatabaseUrl());
}

function getDatabase() {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) throw new Error("DATABASE_URL_NOT_CONFIGURED");
  return neon(databaseUrl);
}

async function ensureAppointmentSchema() {
  if (!schemaReadyPromise) {
    const sql = getDatabase();
    schemaReadyPromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS appointments (
          id text PRIMARY KEY,
          facility text NOT NULL,
          specialty text NOT NULL,
          doctor text NOT NULL DEFAULT '',
          appointment_date date NOT NULL,
          appointment_time text NOT NULL,
          full_name text NOT NULL,
          gender text NOT NULL,
          date_of_birth date NOT NULL,
          phone text NOT NULL,
          email text NOT NULL DEFAULT '',
          reason text NOT NULL,
          status text NOT NULL DEFAULT 'new',
          created_at timestamptz NOT NULL DEFAULT now()
        )
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS appointments_created_at_idx
        ON appointments (created_at DESC)
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS appointments_phone_idx
        ON appointments (phone)
      `;
    })().catch((error) => {
      schemaReadyPromise = null;
      throw error;
    });
  }
  return schemaReadyPromise;
}

type AppointmentRow = {
  id: string;
  facility: string;
  specialty: string;
  doctor: string | null;
  appointment_date: string | Date;
  appointment_time: string;
  full_name: string;
  gender: string;
  date_of_birth: string | Date;
  phone: string;
  email: string | null;
  reason: string;
  status: "new";
  created_at: string | Date;
};

function formatDate(value: string | Date) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function mapAppointmentRow(row: AppointmentRow): Appointment {
  return {
    id: row.id,
    facility: row.facility,
    specialty: row.specialty,
    doctor: row.doctor ?? "",
    appointmentDate: formatDate(row.appointment_date),
    appointmentTime: row.appointment_time,
    fullName: row.full_name,
    gender: row.gender,
    dateOfBirth: formatDate(row.date_of_birth),
    phone: row.phone,
    email: row.email ?? "",
    reason: row.reason,
    status: row.status,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
  };
}

async function createAppointmentInDatabase(input: AppointmentInput) {
  await ensureAppointmentSchema();
  const sql = getDatabase();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const id = createBookingCode();
    const rows = (await sql`
      INSERT INTO appointments (
        id,
        facility,
        specialty,
        doctor,
        appointment_date,
        appointment_time,
        full_name,
        gender,
        date_of_birth,
        phone,
        email,
        reason
      )
      VALUES (
        ${id},
        ${input.facility},
        ${input.specialty},
        ${input.doctor || ""},
        ${input.appointmentDate},
        ${input.appointmentTime},
        ${input.fullName},
        ${input.gender},
        ${input.dateOfBirth},
        ${input.phone},
        ${input.email || ""},
        ${input.reason}
      )
      ON CONFLICT (id) DO NOTHING
      RETURNING
        id,
        facility,
        specialty,
        doctor,
        appointment_date,
        appointment_time,
        full_name,
        gender,
        date_of_birth,
        phone,
        email,
        reason,
        status,
        created_at
    `) as AppointmentRow[];

    if (rows[0]) return mapAppointmentRow(rows[0]);
  }

  throw new Error("APPOINTMENT_ID_COLLISION");
}

async function createAppointmentInFile(input: AppointmentInput) {
  return withAppointmentsLock(async () => {
    const appointments = await readAppointments();
    let id = createBookingCode();
    while (appointments.some((appointment) => appointment.id === id)) {
      id = createBookingCode();
    }

    const appointment: Appointment = {
      ...input,
      id,
      status: "new",
      createdAt: new Date().toISOString(),
    };
    appointments.unshift(appointment);
    await writeAppointments(appointments);
    return appointment;
  });
}

export async function createAppointment(input: AppointmentInput) {
  if (hasDatabaseUrl()) {
    return createAppointmentInDatabase(input);
  }
  return createAppointmentInFile(input);
}
