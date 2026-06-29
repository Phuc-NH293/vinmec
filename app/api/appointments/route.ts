import { NextResponse } from "next/server";
import {
  createAppointment,
  type AppointmentInput,
} from "@/lib/appointments";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const input = (await request.json()) as AppointmentInput & {
    accepted?: boolean;
  };
  const required: (keyof AppointmentInput)[] = [
    "facility",
    "specialty",
    "appointmentDate",
    "appointmentTime",
    "fullName",
    "gender",
    "dateOfBirth",
    "phone",
    "reason",
  ];

  if (
    !input.accepted ||
    required.some((field) => !String(input[field] ?? "").trim())
  ) {
    return NextResponse.json(
      { error: "Vui lòng nhập đầy đủ các thông tin bắt buộc." },
      { status: 400 },
    );
  }

  const { accepted: _accepted, ...appointmentInput } = input;
  void _accepted;
  try {
    const appointment = await createAppointment(appointmentInput);
    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    if ((error as Error).message === "APPOINTMENT_STORE_BUSY") {
      return NextResponse.json(
        {
          error:
            "Há»‡ thá»‘ng Ä‘ang tiáº¿p nháº­n nhiá»u lá»‹ch khĂ¡m. Vui lĂ²ng gá»­i láº¡i sau vĂ i giĂ¢y.",
        },
        { status: 503 },
      );
    }
    throw error;
  }
}
