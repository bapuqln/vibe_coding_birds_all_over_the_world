export interface MapLabel {
  id: string;
  lat: number;
  lng: number;
  nameZh: string;
  nameEn: string;
}

export const continentLabels: MapLabel[] = [
  { id: "asia", lat: 34, lng: 100, nameZh: "亚洲", nameEn: "Asia" },
  { id: "europe", lat: 54, lng: 15, nameZh: "欧洲", nameEn: "Europe" },
  { id: "africa", lat: 2, lng: 20, nameZh: "非洲", nameEn: "Africa" },
  {
    id: "north-america",
    lat: 45,
    lng: -100,
    nameZh: "北美洲",
    nameEn: "North America",
  },
  {
    id: "south-america",
    lat: -15,
    lng: -60,
    nameZh: "南美洲",
    nameEn: "South America",
  },
  { id: "oceania", lat: -25, lng: 135, nameZh: "大洋洲", nameEn: "Oceania" },
  {
    id: "antarctica",
    lat: -82,
    lng: 0,
    nameZh: "南极洲",
    nameEn: "Antarctica",
  },
];

export const oceanLabels: MapLabel[] = [
  {
    id: "pacific",
    lat: 0,
    lng: -160,
    nameZh: "太平洋",
    nameEn: "Pacific Ocean",
  },
  {
    id: "atlantic",
    lat: 0,
    lng: -30,
    nameZh: "大西洋",
    nameEn: "Atlantic Ocean",
  },
  {
    id: "indian",
    lat: -20,
    lng: 75,
    nameZh: "印度洋",
    nameEn: "Indian Ocean",
  },
  {
    id: "arctic",
    lat: 80,
    lng: 0,
    nameZh: "北冰洋",
    nameEn: "Arctic Ocean",
  },
  {
    id: "southern",
    lat: -65,
    lng: 0,
    nameZh: "南冰洋",
    nameEn: "Southern Ocean",
  },
];
