export interface Student {
  id: string;
  nis: string;
  nisn: string;
  name: string;
  gender: 'L' | 'P';
  class: string;
  status: 'Kritis' | 'Perlu Perhatian' | 'Dalam Pantauan' | 'Prestasi' | 'Normal';
  guruWali: string;
  parentName: string;
  phone: string;
  notes: string;
  attendance: string;
  alpa: number;
  sakit: number;
  izin: number;
  birthPlaceDate?: string;
  religion?: string;
  address?: string;
  parentJob?: string;
}

export interface Teacher {
  id: string;
  nip: string;
  name: string;
  role: 'Guru Wali' | 'Guru BK' | 'Kepala Sekolah' | 'Administrator';
  classBinaan: string;
  totalStudents: number;
  phone: string;
  email: string;
  status: 'Aktif' | 'Cuti';
}

export interface Meeting {
  id: string;
  date: string;
  time: string;
  type: 'Individu' | 'Kelompok';
  studentIds: string[];
  studentNames: string[];
  topic: string;
  notes: string;
  followUp: string;
  status: 'Selesai' | 'Menunggu Tindak Lanjut' | 'Terjadwal';
  guruWali: string;
  location?: string;
}

export interface Incident {
  id: string;
  date: string;
  studentId: string;
  studentName: string;
  class: string;
  category: 'Kehadiran' | 'Akademik' | 'Kedisiplinan' | 'Prestasi' | 'Sosial Emosional';
  description: string;
  impactLevel: 'Rendah' | 'Sedang' | 'Tinggi' | 'Positif';
  followUp: string;
  status: 'Dalam Proses' | 'Selesai' | 'Verifikasi Pimpinan';
  recordedBy: string;
}

export interface KopConfig {
  instansi1: string;
  instansi2: string;
  sekolah: string;
  alamat: string;
  kontak: string;
  nomorSurat: string;
  logoType: 'kemdikbud' | 'pinrang' | 'sekolah';
  garisKop: 'double' | 'single' | 'none';
}

export interface SignatureConfig {
  showOrtu: boolean;
  namaOrtu: string;
  statusOrtu: string;
  showGuruWali: boolean;
  namaGuruWali: string;
  nipGuruWali: string;
  showKepsek: boolean;
  namaKepsek: string;
  nipKepsek: string;
  tempatTanggal: string;
}

export type ReportType = 'terpadu' | 'identitas' | 'pertemuan' | 'perkembangan' | 'presensi';

export interface ClassRoom {
  id: string;
  name: string;
  tingkat: 'Kelas VII' | 'Kelas VIII' | 'Kelas IX';
  waliKelas: string;
  nipWalas: string;
  guruWaliUtama?: string;
  ruang: string;
  kapasitas: number;
  tahunAjaran: string;
  status: 'Aktif' | 'Nonaktif';
  keterangan?: string;
}

export interface AcademicYear {
  id: string;
  tahun: string;
  semester: 'Ganjil' | 'Genap';
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  status: 'Aktif' | 'Arsip' | 'Rencana';
  keterangan: string;
  totalHariEfektif: number;
}
