export type Doctor = {
  id: string;
  name: string;
  title: string;
  specialty: string;
  facility: string;
  experience: string;
  languages: string;
  image: string;
  description: string;
};

export const doctors: Doctor[] = [
  {
    id: "nguyen-gia-binh",
    name: "Nguyễn Gia Bình",
    title: "GS.TS.BS",
    specialty: "Hồi sức cấp cứu",
    facility: "Bệnh viện ĐKQT Vinmec Times City",
    experience: "40 năm kinh nghiệm",
    languages: "Tiếng Việt, Tiếng Anh",
    image: "/assets/images/why_us_doctor.jpg",
    description:
      "Chuyên gia giàu kinh nghiệm trong hồi sức tích cực, cấp cứu và điều trị người bệnh nặng.",
  },
  {
    id: "tran-thi-minh",
    name: "Trần Thị Minh",
    title: "BSCKII",
    specialty: "Sản phụ khoa",
    facility: "Bệnh viện ĐKQT Vinmec Times City",
    experience: "25 năm kinh nghiệm",
    languages: "Tiếng Việt, Tiếng Anh",
    image: "/assets/images/banners/banner_maternity.jpg",
    description:
      "Chuyên khám và điều trị bệnh lý sản phụ khoa, quản lý thai kỳ nguy cơ cao.",
  },
  {
    id: "le-nhat-huy",
    name: "Lê Nhất Huy",
    title: "ThS.BS",
    specialty: "Tim mạch",
    facility: "Bệnh viện ĐKQT Vinmec Central Park",
    experience: "18 năm kinh nghiệm",
    languages: "Tiếng Việt, Tiếng Anh",
    image: "/assets/images/banners/banner_cardiology.jpg",
    description:
      "Chuyên sâu tim mạch can thiệp, tăng huyết áp và quản lý nguy cơ tim mạch.",
  },
  {
    id: "nguyen-thi-lam",
    name: "Nguyễn Thị Lâm",
    title: "PGS.TS.BS",
    specialty: "Dinh dưỡng",
    facility: "Phòng khám ĐKQT Vinmec Royal City",
    experience: "35 năm kinh nghiệm",
    languages: "Tiếng Việt, Tiếng Anh",
    image: "/assets/images/why_us_doctor.jpg",
    description:
      "Tư vấn dinh dưỡng lâm sàng cho trẻ em, người trưởng thành và người mắc bệnh mạn tính.",
  },
  {
    id: "pham-lan-huong",
    name: "Phạm Lan Hương",
    title: "BSCKII",
    specialty: "Nhi khoa",
    facility: "Bệnh viện ĐKQT Vinmec Smart City",
    experience: "22 năm kinh nghiệm",
    languages: "Tiếng Việt",
    image: "/assets/images/banners/banner_maternity.jpg",
    description:
      "Khám, điều trị bệnh lý nhi khoa tổng quát và tư vấn phát triển toàn diện cho trẻ.",
  },
  {
    id: "do-quang-huy",
    name: "Đỗ Quang Huy",
    title: "TS.BS",
    specialty: "Cơ xương khớp",
    facility: "Bệnh viện ĐKQT Vinmec Times City",
    experience: "20 năm kinh nghiệm",
    languages: "Tiếng Việt, Tiếng Pháp",
    image: "/assets/images/clinics/clinic_times_city.jpg",
    description:
      "Điều trị bệnh lý cơ xương khớp, chấn thương thể thao và phục hồi vận động.",
  },
];

export const doctorSpecialties = Array.from(
  new Set(doctors.map((doctor) => doctor.specialty)),
);

export const doctorFacilities = Array.from(
  new Set(doctors.map((doctor) => doctor.facility)),
);
