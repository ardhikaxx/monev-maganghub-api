export interface RegencyCity {
  name: string;
  province: string;
  lat: number;
  lng: number;
}

export const POPULAR_CITIES: RegencyCity[] = [
  // Tapal Kuda & Sekitarnya
  { name: 'Kabupaten Bondowoso', province: 'Jawa Timur', lat: -7.9135, lng: 113.8214 },
  { name: 'Kabupaten Jember', province: 'Jawa Timur', lat: -8.1724, lng: 113.7007 },
  { name: 'Kabupaten Situbondo', province: 'Jawa Timur', lat: -7.7065, lng: 114.0094 },
  { name: 'Kabupaten Banyuwangi', province: 'Jawa Timur', lat: -8.2192, lng: 114.3692 },
  { name: 'Kabupaten Lumajang', province: 'Jawa Timur', lat: -8.1332, lng: 113.2248 },
  { name: 'Kabupaten Probolinggo', province: 'Jawa Timur', lat: -7.7547, lng: 113.2159 },
  { name: 'Kota Probolinggo', province: 'Jawa Timur', lat: -7.7569, lng: 113.2115 },

  // Surabaya & Gerbangkertosusila
  { name: 'Kota Surabaya', province: 'Jawa Timur', lat: -7.2575, lng: 112.7521 },
  { name: 'Kabupaten Sidoarjo', province: 'Jawa Timur', lat: -7.4478, lng: 112.7183 },
  { name: 'Kabupaten Gresik', province: 'Jawa Timur', lat: -7.1566, lng: 112.6555 },
  { name: 'Kabupaten Mojokerto', province: 'Jawa Timur', lat: -7.4726, lng: 112.4381 },
  { name: 'Kota Mojokerto', province: 'Jawa Timur', lat: -7.4664, lng: 112.4338 },
  { name: 'Kabupaten Pasuruan', province: 'Jawa Timur', lat: -7.6453, lng: 112.9075 },
  { name: 'Kota Pasuruan', province: 'Jawa Timur', lat: -7.6449, lng: 112.9033 },

  // Malang Raya
  { name: 'Kota Malang', province: 'Jawa Timur', lat: -7.9666, lng: 112.6326 },
  { name: 'Kabupaten Malang', province: 'Jawa Timur', lat: -8.1654, lng: 112.6288 },
  { name: 'Kota Batu', province: 'Jawa Timur', lat: -7.8671, lng: 112.5239 },

  // Mataraman & Jawa Timur Lainnya
  { name: 'Kota Kediri', province: 'Jawa Timur', lat: -7.8480, lng: 112.0178 },
  { name: 'Kabupaten Kediri', province: 'Jawa Timur', lat: -7.8228, lng: 112.1527 },
  { name: 'Kota Madiun', province: 'Jawa Timur', lat: -7.6298, lng: 111.5239 },
  { name: 'Kabupaten Madiun', province: 'Jawa Timur', lat: -7.6167, lng: 111.6500 },
  { name: 'Kota Blitar', province: 'Jawa Timur', lat: -8.0983, lng: 112.1681 },
  { name: 'Kabupaten Blitar', province: 'Jawa Timur', lat: -8.1333, lng: 112.2500 },
  { name: 'Kabupaten Tulungagung', province: 'Jawa Timur', lat: -8.0667, lng: 111.9000 },
  { name: 'Kabupaten Trenggalek', province: 'Jawa Timur', lat: -8.0500, lng: 111.7167 },
  { name: 'Kabupaten Ponorogo', province: 'Jawa Timur', lat: -7.8687, lng: 111.4623 },
  { name: 'Kabupaten Pacitan', province: 'Jawa Timur', lat: -8.2000, lng: 111.1000 },
  { name: 'Kabupaten Nganjuk', province: 'Jawa Timur', lat: -7.6000, lng: 111.9000 },
  { name: 'Kabupaten Bojonegoro', province: 'Jawa Timur', lat: -7.1500, lng: 111.8818 },
  { name: 'Kabupaten Tuban', province: 'Jawa Timur', lat: -6.8972, lng: 112.0644 },
  { name: 'Kabupaten Lamongan', province: 'Jawa Timur', lat: -7.1282, lng: 112.4132 },
  { name: 'Kabupaten Ngawi', province: 'Jawa Timur', lat: -7.4037, lng: 111.4454 },
  { name: 'Kabupaten Magetan', province: 'Jawa Timur', lat: -7.6493, lng: 111.3263 },

  // Madura
  { name: 'Kabupaten Bangkalan', province: 'Jawa Timur', lat: -7.0306, lng: 112.7483 },
  { name: 'Kabupaten Sampang', province: 'Jawa Timur', lat: -7.1892, lng: 113.2394 },
  { name: 'Kabupaten Pamekasan', province: 'Jawa Timur', lat: -7.1583, lng: 113.4739 },
  { name: 'Kabupaten Sumenep', province: 'Jawa Timur', lat: -7.0167, lng: 113.8667 },

  // Kota Besar Lainnya
  { name: 'DKI Jakarta', province: 'DKI Jakarta', lat: -6.2088, lng: 106.8456 },
  { name: 'Kota Bandung', province: 'Jawa Barat', lat: -6.9175, lng: 107.6191 },
  { name: 'Kota Semarang', province: 'Jawa Tengah', lat: -6.9667, lng: 110.4167 },
  { name: 'Kota Yogyakarta', province: 'DI Yogyakarta', lat: -7.7956, lng: 110.3695 },
  { name: 'Kota Surakarta (Solo)', province: 'Jawa Tengah', lat: -7.5755, lng: 110.8243 },
  { name: 'Kota Denpasar', province: 'Bali', lat: -8.6705, lng: 115.2126 },
];
