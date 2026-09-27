export type TabKey = 
  | 'dashboard'
  | 'siswa'
  | 'kelas'
  | 'penugasan'
  | 'pertemuan'
  | 'perkembangan'
  | 'laporan'
  | 'berkas'
  | 'pengaturan'
  | 'profil'
  | 'guru'
  | 'statistik'
  | 'gas_files';

export type RoleCategory = 'Administrator' | 'Kepala Sekolah' | 'Guru Wali';

export function getRoleCategory(roleName: string): RoleCategory {
  const lower = (roleName || '').toLowerCase();
  if (lower.includes('admin')) {
    return 'Administrator';
  }
  if (lower.includes('kepala') || lower.includes('kepsek')) {
    return 'Kepala Sekolah';
  }
  return 'Guru Wali';
}

export const ROLE_PERMISSIONS: Record<RoleCategory, {
  label: string;
  badgeText: string;
  badgeColor: string;
  allowedTabs: TabKey[];
  description: string;
}> = {
  Administrator: {
    label: 'Administrator Sistem',
    badgeText: 'Akses Administrator',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
    allowedTabs: [
      'dashboard',
      'siswa',
      'kelas',
      'penugasan',
      'pertemuan',
      'perkembangan',
      'laporan',
      'berkas',
      'pengaturan',
      'profil',
      'guru',
      'statistik',
      'gas_files'
    ],
    description: 'Akses tanpa batas ke seluruh modul pembinaan, pangkalan data GTK, konfigurasi sistem, dan berkas Google Apps Script.'
  },
  'Kepala Sekolah': {
    label: 'Kepala Sekolah',
    badgeText: 'Supervisi Satuan Pendidikan',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
    allowedTabs: [
      'dashboard',
      'siswa',
      'kelas',
      'penugasan',
      'pertemuan',
      'perkembangan',
      'laporan',
      'berkas',
      'profil',
      'pengaturan'
    ],
    description: 'Wewenang supervisi manajemen pembinaan: Dashboard Kepala Sekolah, monitoring seluruh Guru Wali, seluruh siswa, rekap bimbingan, tindak lanjut, statistik terpadu di dashboard, dan laporan resmi.'
  },
  'Guru Wali': {
    label: 'Guru Wali Pembina',
    badgeText: 'Layanan Pembinaan Siswa',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
    allowedTabs: [
      'dashboard',
      'siswa',
      'kelas',
      'penugasan',
      'pertemuan',
      'perkembangan',
      'laporan',
      'berkas',
      'pengaturan',
      'profil'
    ],
    description: 'Fokus pada bimbingan siswa binaan, rekam pertemuan konseling, catatan perkembangan, profil siswa, serta cetak laporan pendampingan.'
  }
};

export function isTabAllowed(roleName: string, tab: TabKey): boolean {
  const category = getRoleCategory(roleName);
  return ROLE_PERMISSIONS[category].allowedTabs.includes(tab);
}

export function getAllowedTabs(roleName: string): TabKey[] {
  const category = getRoleCategory(roleName);
  return ROLE_PERMISSIONS[category].allowedTabs;
}
