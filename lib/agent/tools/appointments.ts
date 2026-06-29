import {
  createAppointment,
  type Appointment,
  type AppointmentInput,
} from "@/lib/appointments";

export async function createAppointmentTool(
  input: AppointmentInput,
): Promise<Appointment> {
  return createAppointment(input);
}
