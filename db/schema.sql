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
);

CREATE INDEX IF NOT EXISTS appointments_created_at_idx
ON appointments (created_at DESC);

CREATE INDEX IF NOT EXISTS appointments_phone_idx
ON appointments (phone);
