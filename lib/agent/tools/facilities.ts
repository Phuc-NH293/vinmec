import type {
  AgentFacility,
  AgentLocation,
  AgentNearestFacility,
} from "@/lib/agent/types";

export const vinmecFacilities: AgentFacility[] = [
  {
    name: "Times City",
    facility: "Bệnh viện ĐKQT Vinmec Times City",
    label: "Vinmec Times City (Hà Nội)",
    address: "458 Minh Khai, Hai Bà Trưng, Hà Nội",
    lat: 20.9964,
    lon: 105.8669,
  },
  {
    name: "Central Park",
    facility: "Bệnh viện ĐKQT Vinmec Central Park",
    label: "Vinmec Central Park (TP. HCM)",
    address: "208 Nguyễn Hữu Cảnh, Bình Thạnh, TP. HCM",
    lat: 10.7948,
    lon: 106.7203,
  },
  {
    name: "Smart City",
    facility: "Bệnh viện ĐKQT Vinmec Smart City",
    label: "Vinmec Smart City (Hà Nội)",
    address: "Vinhomes Smart City, Nam Từ Liêm, Hà Nội",
    lat: 21.0077,
    lon: 105.7473,
  },
  {
    name: "Da Nang",
    facility: "Bệnh viện ĐKQT Vinmec Đà Nẵng",
    label: "Vinmec Đà Nẵng",
    address: "30 Tháng 4, Hải Châu, Đà Nẵng",
    lat: 16.0391,
    lon: 108.2112,
  },
  {
    name: "Nha Trang",
    facility: "Bệnh viện ĐKQT Vinmec Nha Trang",
    label: "Vinmec Nha Trang",
    address: "42A Trần Phú, Nha Trang, Khánh Hòa",
    lat: 12.2129,
    lon: 109.2107,
  },
  {
    name: "Hai Phong",
    facility: "Bệnh viện ĐKQT Vinmec Hải Phòng",
    label: "Vinmec Hải Phòng",
    address: "Vinhomes Imperia, Hồng Bàng, Hải Phòng",
    lat: 20.8234,
    lon: 106.6879,
  },
  {
    name: "Royal City",
    facility: "Phòng khám ĐKQT Vinmec Royal City",
    label: "Vinmec Royal City (Hà Nội)",
    address: "72A Nguyễn Trãi, Thanh Xuân, Hà Nội",
    lat: 21.0029,
    lon: 105.8156,
  },
];

function distanceInKm(first: AgentLocation, second: AgentLocation) {
  const radius = 6371;
  const toRadians = (degree: number) => (degree * Math.PI) / 180;
  const dLat = toRadians(second.lat - first.lat);
  const dLon = toRadians(second.lon - first.lon);
  const lat1 = toRadians(first.lat);
  const lat2 = toRadians(second.lat);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function findNearestFacility(
  location: AgentLocation,
): AgentNearestFacility | null {
  return vinmecFacilities.reduce<AgentNearestFacility | null>(
    (nearest, facility) => {
      const distanceKm = distanceInKm(location, facility);
      if (!nearest || distanceKm < nearest.distanceKm) {
        return { ...facility, distanceKm };
      }
      return nearest;
    },
    null,
  );
}
