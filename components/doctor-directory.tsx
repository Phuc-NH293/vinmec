"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CalendarDays,
  Languages,
  MapPin,
  Search,
  Stethoscope,
} from "lucide-react";
import {
  doctorFacilities,
  doctors,
  doctorSpecialties,
} from "@/lib/doctors";

export function DoctorDirectory() {
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [facility, setFacility] = useState("");

  const filteredDoctors = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("vi");
    return doctors.filter(
      (doctor) =>
        (!normalizedQuery ||
          doctor.name.toLocaleLowerCase("vi").includes(normalizedQuery) ||
          doctor.title.toLocaleLowerCase("vi").includes(normalizedQuery)) &&
        (!specialty || doctor.specialty === specialty) &&
        (!facility || doctor.facility === facility),
    );
  }, [facility, query, specialty]);

  return (
    <>
      <div className="doctor-filter-card">
        <label className="doctor-search">
          <Search size={19} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nhập tên bác sĩ..."
          />
        </label>
        <select
          value={specialty}
          onChange={(event) => setSpecialty(event.target.value)}
          aria-label="Lọc chuyên khoa"
        >
          <option value="">Tất cả chuyên khoa</option>
          {doctorSpecialties.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select
          value={facility}
          onChange={(event) => setFacility(event.target.value)}
          aria-label="Lọc cơ sở"
        >
          <option value="">Tất cả cơ sở Vinmec</option>
          {doctorFacilities.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <button
          type="button"
          className="button button-soft"
          onClick={() => {
            setQuery("");
            setSpecialty("");
            setFacility("");
          }}
        >
          Xóa bộ lọc
        </button>
      </div>

      <div className="doctor-result-heading">
        <div>
          <span className="section-kicker">Đội ngũ chuyên gia</span>
          <h2>{filteredDoctors.length} bác sĩ phù hợp</h2>
        </div>
        <p>
          Lựa chọn bác sĩ theo chuyên khoa và cơ sở để đặt lịch thăm khám.
        </p>
      </div>

      {filteredDoctors.length ? (
        <div className="doctor-grid">
          {filteredDoctors.map((doctor) => (
            <article className="doctor-card" key={doctor.id}>
              <div className="doctor-photo">
                <Image
                  src={doctor.image}
                  alt={`${doctor.title} ${doctor.name}`}
                  fill
                  sizes="(max-width: 700px) 100vw, 300px"
                />
                <span>{doctor.specialty}</span>
              </div>
              <div className="doctor-card-body">
                <span className="doctor-title">{doctor.title}</span>
                <h3>{doctor.name}</h3>
                <p>{doctor.description}</p>
                <ul>
                  <li>
                    <Stethoscope size={15} /> {doctor.experience}
                  </li>
                  <li>
                    <MapPin size={15} /> {doctor.facility}
                  </li>
                  <li>
                    <Languages size={15} /> {doctor.languages}
                  </li>
                </ul>
                <Link
                  href={`/dang-ky-kham?doctor=${doctor.id}&specialty=${encodeURIComponent(doctor.specialty)}`}
                  className="button button-primary"
                >
                  <CalendarDays size={17} /> Đặt lịch với bác sĩ
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state doctor-empty">
          <Search size={34} />
          <h3>Không tìm thấy bác sĩ phù hợp</h3>
          <p>Hãy thử tên, chuyên khoa hoặc cơ sở khác.</p>
        </div>
      )}
    </>
  );
}
