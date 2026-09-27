import * as XLSX from 'xlsx';
import { Student, Teacher } from '../types';

export function downloadStudentTemplate() {
  const templateRows = [
    {
      'NIS': '23808',
      'NISN': '0098451890',
      'Nama Siswa': 'Ahmad Fauzan',
      'Jenis Kelamin (L/P)': 'L',
      'Kelas': 'Kelas VIII-B',
      'Status Pembinaan': 'Normal',
      'Guru Wali': 'Drs. H. Ahmad Dahlan, M.Pd',
      'Nama Orang Tua/Wali': 'Drs. H. Amirullah',
      'Nomor WhatsApp': '0812-3344-5566',
      'Catatan Kasus / Perilaku': 'Aktif di kelas dan bersemangat dalam pembelajaran.',
      'Presensi Kehadiran (%)': '98.0%',
      'Sakit': 1,
      'Izin': 0,
      'Alpa': 0
    },
    {
      'NIS': '23809',
      'NISN': '0098451912',
      'Nama Siswa': 'Nur Fadilah',
      'Jenis Kelamin (L/P)': 'P',
      'Kelas': 'Kelas VIII-A',
      'Status Pembinaan': 'Perlu Perhatian',
      'Guru Wali': 'Drs. H. Ahmad Dahlan, M.Pd',
      'Nama Orang Tua/Wali': 'Sitti Maryam',
      'Nomor WhatsApp': '0852-7788-9900',
      'Catatan Kasus / Perilaku': 'Perlu bimbingan remedial Bahasa Inggris.',
      'Presensi Kehadiran (%)': '92.5%',
      'Sakit': 2,
      'Izin': 1,
      'Alpa': 1
    }
  ];

  const ws = XLSX.utils.json_to_sheet(templateRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template_Siswa');
  XLSX.writeFile(wb, 'Template_Data_Siswa_SMPN1Suppa.xlsx');
}

export function downloadTeacherTemplate() {
  const templateRows = [
    {
      'NIP': '198506142010011009',
      'Nama Lengkap & Gelar': 'Muhammad Asri, S.Pd., Gr.',
      'Peran GTK': 'Guru Wali',
      'Kelas / Rombel Binaan': 'Lintas Kelas (VII & VIII)',
      'Total Siswa Binaan': 25,
      'Nomor WhatsApp': '0813-4455-6677',
      'Pos-el (Email)': 'asri.spd@smpn1suppa.sch.id',
      'Status Keaktifan': 'Aktif'
    },
    {
      'NIP': '199004122019032015',
      'Nama Lengkap & Gelar': 'Sri Wahyuni, S.Pd',
      'Peran GTK': 'Guru BK',
      'Kelas / Rombel Binaan': 'Layanan Bimbingan Konseling Sekolah',
      'Total Siswa Binaan': 32,
      'Nomor WhatsApp': '0852-1122-3344',
      'Pos-el (Email)': 'sri.wahyuni@smpn1suppa.sch.id',
      'Status Keaktifan': 'Aktif'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(templateRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template_Guru');
  XLSX.writeFile(wb, 'Template_Data_Guru_SMPN1Suppa.xlsx');
}

export function parseStudentExcel(data: ArrayBuffer): Partial<Student>[] {
  const wb = XLSX.read(data, { type: 'array' });
  const wsName = wb.SheetNames[0];
  const ws = wb.Sheets[wsName];
  const rows: any[] = XLSX.utils.sheet_to_json(ws);

  return rows.map((r, idx) => ({
    id: `SIS_IMP_${Date.now()}_${idx}`,
    nis: String(r['NIS'] || r['nis'] || `238${80 + idx}`),
    nisn: String(r['NISN'] || r['nisn'] || `009845${1000 + idx}`),
    name: String(r['Nama Siswa'] || r['name'] || r['Nama Lengkap'] || 'Siswa Baru'),
    gender: (String(r['Jenis Kelamin (L/P)'] || r['gender'] || 'L').toUpperCase().startsWith('P') ? 'P' : 'L') as 'L' | 'P',
    class: String(r['Kelas'] || r['class'] || 'Kelas VIII-B'),
    status: (r['Status Pembinaan'] || r['status'] || 'Normal') as any,
    guruWali: String(r['Guru Wali'] || 'Drs. H. Ahmad Dahlan, M.Pd'),
    parentName: String(r['Nama Orang Tua/Wali'] || r['parentName'] || 'Wali Siswa'),
    phone: String(r['Nomor WhatsApp'] || r['phone'] || '0812-0000-0000'),
    notes: String(r['Catatan Kasus / Perilaku'] || r['notes'] || 'Data diimpor melalui Excel.'),
    attendance: String(r['Presensi Kehadiran (%)'] || r['attendance'] || '95.0%'),
    alpa: Number(r['Alpa'] || 0),
    sakit: Number(r['Sakit'] || 0),
    izin: Number(r['Izin'] || 0)
  }));
}

export function parseTeacherExcel(data: ArrayBuffer): Partial<Teacher>[] {
  const wb = XLSX.read(data, { type: 'array' });
  const wsName = wb.SheetNames[0];
  const ws = wb.Sheets[wsName];
  const rows: any[] = XLSX.utils.sheet_to_json(ws);

  return rows.map((r, idx) => ({
    id: `GUR_IMP_${Date.now()}_${idx}`,
    nip: String(r['NIP'] || r['nip'] || `19850101201001${1000 + idx}`),
    name: String(r['Nama Lengkap & Gelar'] || r['name'] || r['Nama'] || 'Guru Baru'),
    role: (r['Peran GTK'] || r['role'] || 'Guru Wali') as any,
    classBinaan: String(r['Kelas / Rombel Binaan'] || r['classBinaan'] || 'Lintas Kelas'),
    totalStudents: Number(r['Total Siswa Binaan'] || r['totalStudents'] || 20),
    phone: String(r['Nomor WhatsApp'] || r['phone'] || '0812-0000-0000'),
    email: String(r['Pos-el (Email)'] || r['email'] || 'guru@smpn1suppa.sch.id'),
    status: (r['Status Keaktifan'] || r['status'] || 'Aktif') as any
  }));
}

export function exportStudentsToExcel(students: Student[]) {
  const exportData = students.map((s, idx) => ({
    'No': idx + 1,
    'NIS': s.nis,
    'NISN': s.nisn,
    'Nama Lengkap': s.name,
    'L/P': s.gender,
    'Kelas': s.class,
    'Status Pembinaan': s.status,
    'Guru Wali': s.guruWali,
    'Nama Orang Tua': s.parentName,
    'No WhatsApp Ortu': s.phone,
    'Kehadiran (%)': s.attendance,
    'Alpa': s.alpa,
    'Sakit': s.sakit,
    'Izin': s.izin,
    'Catatan Khusus': s.notes
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data_Siswa');
  XLSX.writeFile(wb, `Data_Siswa_Binaan_SMPN1Suppa_${Date.now()}.xlsx`);
}

export function exportTeachersToExcel(teachers: Teacher[]) {
  const exportData = teachers.map((t, idx) => ({
    'No': idx + 1,
    'NIP': t.nip,
    'Nama Lengkap & Gelar': t.name,
    'Peran GTK': t.role,
    'Kelas / Wilayah Binaan': t.classBinaan,
    'Total Siswa Binaan': t.totalStudents,
    'No WhatsApp': t.phone,
    'Pos-el (Email)': t.email,
    'Status': t.status
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data_Guru_GTK');
  XLSX.writeFile(wb, `Data_Guru_GTK_SMPN1Suppa_${Date.now()}.xlsx`);
}
