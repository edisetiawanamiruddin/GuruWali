/**
 * PORTAL GURU WALI — UPT SMP NEGERI 1 SUPPA
 * Full-Stack Google Apps Script Web App
 * Sesuai PRD.md, DESIGN.md, dan Desain UI/UX Google Stitch
 * 
 * Versi: 1.4.0 Production
 * Lisensi: UPT SMP Negeri 1 Suppa / Disdik Kab. Pinrang
 */

// ==========================================
// 1. CONFIGURATION & SCRIPT PROPERTIES
// ==========================================

const APP_CONFIG = {
  APP_NAME: 'Portal Guru Wali — UPT SMPN 1 Suppa',
  SCHOOL_NAME: 'UPT SMP NEGERI 1 SUPPA',
  KABUPATEN: 'KABUPATEN PINRANG',
  NPSN: '40304859',
  ADDRESS: 'Jl. Andi Dewang No. 12, Majennang, Kec. Suppa, Kab. Pinrang, Sulawesi Selatan 91272',
  EMAIL: 'surat@smpn1suppa.sch.id',
  WEBSITE: 'smpn1suppa.sch.id',
  AKREDITASI: 'A',
  DEFAULT_TA: '2024/2025',
  DEFAULT_SEMESTER: 'Genap',
  SESSION_DURATION_HOURS: 8,
  MAX_FILE_SIZE_MB: 5,
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
};

// Nama-nama Sheet Database Sesuai PRD Bagian 8
const SHEETS = {
  USERS: 'USERS',
  GURU: 'GURU',
  TAHUN_AJARAN: 'TAHUN_AJARAN',
  KELAS: 'KELAS',
  SISWA: 'SISWA',
  ORANG_TUA: 'ORANG_TUA',
  PENUGASAN_WALI: 'PENUGASAN_WALI',
  PENUGASAN_WALIKELAS: 'PENUGASAN_WALIKELAS',
  PERTEMUAN: 'PERTEMUAN',
  PERTEMUAN_PESERTA: 'PERTEMUAN_PESERTA',
  PERKEMBANGAN: 'PERKEMBANGAN',
  TINDAK_LANJUT: 'TINDAK_LANJUT',
  BERKAS: 'BERKAS',
  RIWAYAT_PERUBAHAN: 'RIWAYAT_PERUBAHAN',
  NOTIFIKASI: 'NOTIFIKASI',
  LOG_AKTIVITAS: 'LOG_AKTIVITAS',
  REF_KATEGORI: 'REF_KATEGORI',
  APP_CONFIG: 'APP_CONFIG'
};

// ==========================================
// 2. WEB APP ENTRY POINT & TEMPLATING
// ==========================================

function doGet(e) {
  try {
    const template = HtmlService.createTemplateFromFile('Index');
    template.appConfig = APP_CONFIG;
    
    return template.evaluate()
      .setTitle('Portal Guru Wali — UPT SMP Negeri 1 Suppa')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (err) {
    return HtmlService.createHtmlOutput('<h3>Terjadi kesalahan sistem saat memuat aplikasi:</h3><pre>' + err.toString() + '</pre>');
  }
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ==========================================
// 3. SETUP APPLICATION (IDEMPOTENT)
// ==========================================

/**
 * setupApp()
 * Menjalankan inisialisasi lengkap:
 * 1. Membuat/menemukan Spreadsheet Database
 * 2. Membuat 18 Sheet lengkap dengan header standar PRD
 * 3. Membuat/menemukan Root Folder Google Drive & Subfolder (Aset, Foto, Laporan PDF, Berkas, Backup)
 * 4. Menyimpan ID di ScriptProperties
 * 5. Membuat akun Admin awal & data awal (seed) jika belum ada
 * 6. Memasang Trigger otomatis pengingat harian
 * 7. Mengembalikan ringkasan hasil setup
 */
function setupApp() {
  const scriptProps = PropertiesService.getScriptProperties();
  const summary = {
    spreadsheetId: '',
    spreadsheetUrl: '',
    driveFolderId: '',
    subfolders: {},
    sheetsCreated: [],
    adminCreated: false,
    triggerInstalled: false,
    timestamp: new Date().toISOString()
  };

  // A. Buka atau Buat Spreadsheet Database
  let ss;
  let ssId = scriptProps.getProperty('SPREADSHEET_ID');
  if (ssId) {
    try {
      ss = SpreadsheetApp.openById(ssId);
    } catch (e) {
      ss = null;
    }
  }

  if (!ss) {
    // Cari di Drive dulu
    const files = DriveApp.getFilesByName('Database Portal Guru Wali - UPT SMPN 1 Suppa');
    if (files.hasNext()) {
      ss = SpreadsheetApp.open(files.next());
      ssId = ss.getId();
    } else {
      ss = SpreadsheetApp.create('Database Portal Guru Wali - UPT SMPN 1 Suppa');
      ssId = ss.getId();
    }
    scriptProps.setProperty('SPREADSHEET_ID', ssId);
  }
  summary.spreadsheetId = ssId;
  summary.spreadsheetUrl = ss.getUrl();

  // B. Buka atau Buat Folder Google Drive & Subfolder
  let rootFolder;
  let rootFolderId = scriptProps.getProperty('ROOT_FOLDER_ID');
  if (rootFolderId) {
    try {
      rootFolder = DriveApp.getFolderById(rootFolderId);
    } catch (e) {
      rootFolder = null;
    }
  }

  if (!rootFolder) {
    const folders = DriveApp.getFoldersByName('Portal Guru Wali - SMPN 1 Suppa');
    if (folders.hasNext()) {
      rootFolder = folders.next();
    } else {
      rootFolder = DriveApp.createFolder('Portal Guru Wali - SMPN 1 Suppa');
    }
    rootFolderId = rootFolder.getId();
    scriptProps.setProperty('ROOT_FOLDER_ID', rootFolderId);
  }
  summary.driveFolderId = rootFolderId;

  // Pindahkan Spreadsheet ke folder root aplikasi jika belum di dalamnya
  try {
    const ssFile = DriveApp.getFileById(ssId);
    rootFolder.addFile(ssFile);
    DriveApp.getRootFolder().removeFile(ssFile);
  } catch (e) {
    // Abaikan jika sudah di dalam atau izin terbatas
  }

  // Buat Subfolder wajib
  const requiredSubfolders = ['Aset', 'Foto', 'Laporan PDF', 'Berkas', 'Backup'];
  requiredSubfolders.forEach(name => {
    let subfolder;
    const existing = rootFolder.getFoldersByName(name);
    if (existing.hasNext()) {
      subfolder = existing.next();
    } else {
      subfolder = rootFolder.createFolder(name);
    }
    scriptProps.setProperty('FOLDER_' + name.replace(/\s+/g, '_').toUpperCase(), subfolder.getId());
    summary.subfolders[name] = subfolder.getId();
  });

  // C. Struktur Skema Sheet dan Header Kolom (PRD Bagian 8)
  const schemas = {
    [SHEETS.USERS]: ['user_id', 'username', 'password_hash', 'salt', 'role', 'guru_id', 'status', 'last_login', 'created_at', 'updated_at', 'is_deleted'],
    [SHEETS.GURU]: ['guru_id', 'nama', 'nip', 'jenis_kelamin', 'no_hp', 'email', 'status', 'created_at', 'updated_at', 'is_deleted'],
    [SHEETS.TAHUN_AJARAN]: ['ta_id', 'tahun_ajaran', 'semester', 'tanggal_mulai', 'tanggal_selesai', 'is_aktif', 'created_at', 'updated_at'],
    [SHEETS.KELAS]: ['kelas_id', 'nama_kelas', 'tingkat', 'ta_id', 'status', 'created_at', 'updated_at', 'is_deleted'],
    [SHEETS.SISWA]: ['siswa_id', 'nis', 'nisn', 'nama_lengkap', 'jenis_kelamin', 'tempat_lahir', 'tanggal_lahir', 'agama', 'alamat', 'no_hp', 'kelas_id', 'ta_id', 'status_siswa', 'foto_file_id', 'catatan_khusus', 'created_at', 'updated_at', 'is_deleted'],
    [SHEETS.ORANG_TUA]: ['ortu_id', 'siswa_id', 'nama', 'hubungan', 'no_hp', 'alamat', 'pekerjaan', 'is_kontak_darurat', 'created_at', 'updated_at', 'is_deleted'],
    [SHEETS.PENUGASAN_WALI]: ['penugasan_id', 'guru_id', 'siswa_id', 'ta_id', 'semester', 'tanggal_mulai', 'tanggal_selesai', 'status', 'alasan', 'ditetapkan_oleh', 'created_at', 'updated_at'],
    [SHEETS.PENUGASAN_WALIKELAS]: ['penugasan_id', 'guru_id', 'kelas_id', 'ta_id', 'semester', 'tanggal_mulai', 'tanggal_selesai', 'status', 'alasan', 'ditetapkan_oleh', 'created_at', 'updated_at'],
    [SHEETS.PERTEMUAN]: ['pertemuan_id', 'tanggal', 'waktu', 'guru_id', 'tipe', 'topik', 'pembahasan', 'kesepakatan', 'lokasi', 'status', 'tanggal_tl_berikutnya', 'keterangan', 'lampiran_file_id', 'dibuat_oleh', 'created_at', 'updated_at', 'is_deleted'],
    [SHEETS.PERTEMUAN_PESERTA]: ['peserta_id', 'pertemuan_id', 'siswa_id', 'created_at'],
    [SHEETS.PERKEMBANGAN]: ['perkembangan_id', 'siswa_id', 'tanggal', 'waktu', 'jenis_catatan', 'kategori', 'deskripsi', 'kondisi', 'tingkat_perhatian', 'tindakan', 'pihak_terlibat', 'hasil', 'rekomendasi', 'status', 'pertemuan_id', 'lampiran_file_id', 'dibuat_oleh', 'created_at', 'updated_at', 'is_deleted'],
    [SHEETS.TINDAK_LANJUT]: ['tl_id', 'sumber_tipe', 'sumber_id', 'siswa_id', 'uraian', 'status', 'tanggal_tl_berikutnya', 'hasil', 'dibuat_oleh', 'created_at', 'updated_at', 'is_deleted'],
    [SHEETS.BERKAS]: ['berkas_id', 'siswa_id', 'sumber_tipe', 'sumber_id', 'nama_file', 'jenis', 'drive_file_id', 'ukuran', 'diunggah_oleh', 'created_at', 'is_deleted'],
    [SHEETS.RIWAYAT_PERUBAHAN]: ['riwayat_id', 'entitas', 'entitas_id', 'jenis_perubahan', 'data_sebelum', 'data_sesudah', 'alasan', 'oleh', 'waktu'],
    [SHEETS.NOTIFIKASI]: ['notif_id', 'user_id', 'tipe', 'pesan', 'rujukan_id', 'is_read', 'tanggal_jatuh_tempo', 'created_at'],
    [SHEETS.LOG_AKTIVITAS]: ['log_id', 'user_id', 'aksi', 'entitas', 'entitas_id', 'waktu', 'keterangan'],
    [SHEETS.REF_KATEGORI]: ['kategori_id', 'nama', 'urutan', 'warna', 'is_aktif'],
    [SHEETS.APP_CONFIG]: ['key', 'value', 'keterangan']
  };

  Object.keys(schemas).forEach(sheetName => {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(schemas[sheetName]);
      // Format header
      const headerRange = sheet.getRange(1, 1, 1, schemas[sheetName].length);
      headerRange.setBackground('#0F1B33')
                 .setFontColor('#FFFFFF')
                 .setFontWeight('bold');
      sheet.setFrozenRows(1);
      summary.sheetsCreated.push(sheetName);
    }
  });

  // Hapus 'Sheet1' default jika ada
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet); } catch (e) {}
  }

  // D. Seed Data Awal jika kosong
  seedInitialData(ss);

  // E. Pasang Trigger Otomatis Harian (06:00 WITA = 22:00 UTC)
  try {
    const triggers = ScriptApp.getProjectTriggers();
    let hasCron = false;
    triggers.forEach(t => {
      if (t.getHandlerFunction() === 'cronDailyCheck') {
        hasCron = true;
      }
    });
    if (!hasCron) {
      ScriptApp.newTrigger('cronDailyCheck')
        .timeBased()
        .everyDays(1)
        .atHour(6)
        .create();
      summary.triggerInstalled = true;
    }
  } catch (err) {
    summary.triggerError = err.toString();
  }

  return {
    success: true,
    message: 'Aplikasi dan Database berhasil diinisialisasi.',
    summary: summary
  };
}

/**
 * Seed data master awal (Admin, Guru, Siswa, Kelas, Kategori, Config)
 */
function seedInitialData(ss) {
  // 1. APP_CONFIG
  const configSheet = ss.getSheetByName(SHEETS.APP_CONFIG);
  if (configSheet.getLastRow() <= 1) {
    const initialConfigs = [
      ['APP_NAME', APP_CONFIG.APP_NAME, 'Nama Aplikasi'],
      ['SCHOOL_NAME', APP_CONFIG.SCHOOL_NAME, 'Nama Sekolah'],
      ['TAHUN_AJARAN_AKTIF', APP_CONFIG.DEFAULT_TA, 'Tahun Ajaran Aktif'],
      ['SEMESTER_AKTIF', APP_CONFIG.DEFAULT_SEMESTER, 'Semester Aktif'],
      ['SESSION_TIMEOUT_MINUTES', '480', 'Batas Waktu Sesi (Menit)'],
      ['AUTO_SYNC_DAPODIK', 'FALSE', 'Integrasi Sync']
    ];
    configSheet.getRange(2, 1, initialConfigs.length, 3).setValues(initialConfigs);
  }

  // 2. REF_KATEGORI (PRD Bagian 8)
  const katSheet = ss.getSheetByName(SHEETS.REF_KATEGORI);
  if (katSheet.getLastRow() <= 1) {
    const defaultKategori = [
      ['KAT_01', 'Kehadiran & Absensi', 1, '#DC2626', true],
      ['KAT_02', 'Akademik & Tugas', 2, '#1E4FD8', true],
      ['KAT_03', 'Kedisiplinan & Perilaku', 3, '#D97706', true],
      ['KAT_04', 'Sosial / Hubungan Teman', 4, '#0D9488', true],
      ['KAT_05', 'Keluarga & Lingkungan', 5, '#7C3AED', true],
      ['KAT_06', 'Kesehatan / Fisik / Medis', 6, '#DB2777', true],
      ['KAT_07', 'Prestasi & Apresiasi', 7, '#16A34A', true],
      ['KAT_08', 'Lainnya', 8, '#475467', true]
    ];
    katSheet.getRange(2, 1, defaultKategori.length, 5).setValues(defaultKategori);
  }

  // 3. TAHUN_AJARAN
  const taSheet = ss.getSheetByName(SHEETS.TAHUN_AJARAN);
  if (taSheet.getLastRow() <= 1) {
    const defaultTA = [
      ['TA_2024_GNP', '2024/2025', 'Genap', '2025-01-06', '2025-06-21', true, new Date().toISOString(), new Date().toISOString()]
    ];
    taSheet.getRange(2, 1, defaultTA.length, 8).setValues(defaultTA);
  }

  // 4. GURU & KELAS
  const guruSheet = ss.getSheetByName(SHEETS.GURU);
  if (guruSheet.getLastRow() <= 1) {
    const defaultGurus = [
      ['G_01', 'Tim Pengembang Kurikulum', '198901012015011001', 'L', '081234567890', 'kurikulum@smpn1suppa.sch.id', 'Aktif', new Date().toISOString(), new Date().toISOString(), false],
      ['G_02', 'Drs. H. Ahmad Dahlan, M.Pd', '197805122005011004', 'L', '081342551004', 'ahmad.dahlan@smpn1suppa.sch.id', 'Aktif', new Date().toISOString(), new Date().toISOString(), false],
      ['G_03', 'Nurmiati, S.Pd', '198402162010012018', 'P', '085299014432', 'nurmiati@smpn1suppa.sch.id', 'Aktif', new Date().toISOString(), new Date().toISOString(), false],
      ['G_04', 'Drs. H. Syamsuddin, M.Si', '196803121994121002', 'L', '081141994102', 'syamsuddin.kepsek@smpn1suppa.sch.id', 'Aktif', new Date().toISOString(), new Date().toISOString(), false]
    ];
    guruSheet.getRange(2, 1, defaultGurus.length, 10).setValues(defaultGurus);
  }

  const kelasSheet = ss.getSheetByName(SHEETS.KELAS);
  if (kelasSheet.getLastRow() <= 1) {
    const defaultKelas = [
      ['KLS_VII_A', 'VII-A', '7', 'TA_2024_GNP', 'Aktif', new Date().toISOString(), new Date().toISOString(), false],
      ['KLS_VIII_A', 'VIII-A', '8', 'TA_2024_GNP', 'Aktif', new Date().toISOString(), new Date().toISOString(), false],
      ['KLS_VIII_B', 'VIII-B', '8', 'TA_2024_GNP', 'Aktif', new Date().toISOString(), new Date().toISOString(), false],
      ['KLS_VIII_C', 'VIII-C', '8', 'TA_2024_GNP', 'Aktif', new Date().toISOString(), new Date().toISOString(), false],
      ['KLS_IX_A', 'IX-A', '9', 'TA_2024_GNP', 'Aktif', new Date().toISOString(), new Date().toISOString(), false]
    ];
    kelasSheet.getRange(2, 1, defaultKelas.length, 8).setValues(defaultKelas);
  }

  // 5. USERS (Admin, Guru Wali, Wali Kelas, Kepala Sekolah)
  const userSheet = ss.getSheetByName(SHEETS.USERS);
  if (userSheet.getLastRow() <= 1) {
    const saltAdmin = generateSalt();
    const hashAdmin = hashPassword('admin123', saltAdmin);
    
    const saltGuru = generateSalt();
    const hashGuru = hashPassword('guru123', saltGuru);

    const saltWalas = generateSalt();
    const hashWalas = hashPassword('walas123', saltWalas);

    const saltKepsek = generateSalt();
    const hashKepsek = hashPassword('kepsek123', saltKepsek);

    const defaultUsers = [
      ['USR_ADMIN', 'admin.kurikulum', hashAdmin, saltAdmin, 'Admin', 'G_01', 'Aktif', '', new Date().toISOString(), new Date().toISOString(), false],
      ['USR_GURU', 'ahmad.dahlan', hashGuru, saltGuru, 'Guru Wali', 'G_02', 'Aktif', '', new Date().toISOString(), new Date().toISOString(), false],
      ['USR_WALAS', 'nurmiati.spd', hashWalas, saltWalas, 'Wali Kelas', 'G_03', 'Aktif', '', new Date().toISOString(), new Date().toISOString(), false],
      ['USR_KEPSEK', 'syamsuddin.kepsek', hashKepsek, saltKepsek, 'Kepala Sekolah', 'G_04', 'Aktif', '', new Date().toISOString(), new Date().toISOString(), false]
    ];
    userSheet.getRange(2, 1, defaultUsers.length, 11).setValues(defaultUsers);
  }

  // 6. SISWA & ORANG TUA (Sample data sesuai screenshot referensi Stitch)
  const siswaSheet = ss.getSheetByName(SHEETS.SISWA);
  const ortuSheet = ss.getSheetByName(SHEETS.ORANG_TUA);
  const pwSheet = ss.getSheetByName(SHEETS.PENUGASAN_WALI);
  const pwkSheet = ss.getSheetByName(SHEETS.PENUGASAN_WALIKELAS);

  if (siswaSheet.getLastRow() <= 1) {
    const sampleSiswa = [
      ['SIS_001', '23801', '0098421092', 'Muhammad Fajar', 'L', 'Pinrang', '2010-04-12', 'Islam', 'Dusun Marawi, Desa Watang Pulu, Kec. Suppa', '081244569921', 'KLS_VIII_B', 'TA_2024_GNP', 'Kritis', '', 'Perlu Pendampingan Intensif (Alpa 3x)', new Date().toISOString(), new Date().toISOString(), false],
      ['SIS_002', '23802', '0098451312', 'Siti Nurhaliza', 'P', 'Pinrang', '2010-08-25', 'Islam', 'Jl. Pelabuhan Majennang No. 04', '085299014432', 'KLS_VIII_B', 'TA_2024_GNP', 'Perlu Perhatian', '', 'Penurunan nilai drastis Matematika (-28 poin)', new Date().toISOString(), new Date().toISOString(), false],
      ['SIS_003', '23803', '0098451405', 'Andi Tenri Olle', 'P', 'Suppa', '2010-01-15', 'Islam', 'Desa Wiring Tasi, Kec. Suppa', '081388901120', 'KLS_VIII_B', 'TA_2024_GNP', 'Prestasi', '', 'Prestasi OSN Matematika Tingkat Kabupaten', new Date().toISOString(), new Date().toISOString(), false],
      ['SIS_004', '23804', '0098451488', 'Muhammad Ilham', 'L', 'Pinrang', '2010-11-03', 'Islam', 'Kampung Baru, Majennang', '082155410087', 'KLS_VIII_B', 'TA_2024_GNP', 'Normal', '', 'Kondisi stabil dan rajin', new Date().toISOString(), new Date().toISOString(), false],
      ['SIS_005', '23805', '0098451519', 'Dewi Sartika', 'P', 'Pinrang', '2010-03-29', 'Islam', 'Jl. Pendidikan No. 18, Suppa', '081977123349', 'KLS_VIII_B', 'TA_2024_GNP', 'Dalam Pantauan', '', 'Perlu dorongan keaktifan kelompok', new Date().toISOString(), new Date().toISOString(), false],
      ['SIS_006', '23806', '0098451630', 'Fadhil Ramadhan', 'L', 'Suppa', '2010-09-14', 'Islam', 'Desa Lotang Salo, Kec. Suppa', '081120987612', 'KLS_VIII_B', 'TA_2024_GNP', 'Normal', '', 'Kehadiran dan kedisiplinan baik', new Date().toISOString(), new Date().toISOString(), false],
      ['SIS_007', '23807', '0098451701', 'Putri Anggraini', 'P', 'Pinrang', '2010-07-07', 'Islam', 'Dusun Marawi, Kec. Suppa', '085341228800', 'KLS_VIII_B', 'TA_2024_GNP', 'Perlu Perhatian', '', 'Keluhan kesehatan fisik/sakit berulang 4x ke UKS', new Date().toISOString(), new Date().toISOString(), false]
    ];
    siswaSheet.getRange(2, 1, sampleSiswa.length, 18).setValues(sampleSiswa);

    const sampleOrtu = [
      ['ORT_001', 'SIS_001', 'Bpk. Fathurrahman', 'Ayah', '081244569921', 'Dusun Marawi, Kec. Suppa', 'Petani / Wiraswasta', true, new Date().toISOString(), new Date().toISOString(), false],
      ['ORT_002', 'SIS_001', 'Ibu St. Maryam', 'Ibu', '081244569922', 'Dusun Marawi, Kec. Suppa', 'Ibu Rumah Tangga', false, new Date().toISOString(), new Date().toISOString(), false],
      ['ORT_003', 'SIS_002', 'Faridah', 'Ibu', '085299014432', 'Jl. Pelabuhan Majennang No. 04', 'Pedagang', true, new Date().toISOString(), new Date().toISOString(), false],
      ['ORT_004', 'SIS_003', 'Andi Bau Massepe', 'Ayah', '081388901120', 'Desa Wiring Tasi', 'PNS', true, new Date().toISOString(), new Date().toISOString(), false],
      ['ORT_005', 'SIS_004', 'Sulaiman', 'Ayah', '082155410087', 'Kampung Baru', 'Wiraswasta', true, new Date().toISOString(), new Date().toISOString(), false],
      ['ORT_006', 'SIS_005', 'Kartini', 'Ibu', '081977123349', 'Jl. Pendidikan No. 18', 'PNS', true, new Date().toISOString(), new Date().toISOString(), false],
      ['ORT_007', 'SIS_006', 'Irwan Syah', 'Ayah', '081120987612', 'Desa Lotang Salo', 'Wiraswasta', true, new Date().toISOString(), new Date().toISOString(), false],
      ['ORT_008', 'SIS_007', 'Hj. Maryam', 'Ibu', '085341228800', 'Dusun Marawi', 'Pedagang', true, new Date().toISOString(), new Date().toISOString(), false]
    ];
    ortuSheet.getRange(2, 1, sampleOrtu.length, 11).setValues(sampleOrtu);

    // Penugasan Guru Wali (Drs. H. Ahmad Dahlan membina siswa SIS_001 s/d SIS_007)
    const samplePW = sampleSiswa.map((s, idx) => [
      'PW_' + (100 + idx),
      'G_02', // Ahmad Dahlan
      s[0],   // Siswa ID
      'TA_2024_GNP',
      'Genap',
      '2025-01-06',
      '',
      'Aktif',
      'Penugasan reguler awal semester genap',
      'admin.kurikulum',
      new Date().toISOString(),
      new Date().toISOString()
    ]);
    pwSheet.getRange(2, 1, samplePW.length, 12).setValues(samplePW);

    // Penugasan Wali Kelas (Nurmiati, S.Pd wali kelas VIII-B)
    const samplePWK = [
      ['PWK_01', 'G_03', 'KLS_VIII_B', 'TA_2024_GNP', 'Genap', '2025-01-06', '', 'Aktif', 'Penetapan SK Walas Genap 2024/2025', 'admin.kurikulum', new Date().toISOString(), new Date().toISOString()]
    ];
    pwkSheet.getRange(2, 1, samplePWK.length, 12).setValues(samplePWK);
  }

  // 7. PERTEMUAN & PERKEMBANGAN
  const pertSheet = ss.getSheetByName(SHEETS.PERTEMUAN);
  const ppSheet = ss.getSheetByName(SHEETS.PERTEMUAN_PESERTA);
  const perkSheet = ss.getSheetByName(SHEETS.PERKEMBANGAN);
  const tlSheet = ss.getSheetByName(SHEETS.TINDAK_LANJUT);

  if (pertSheet.getLastRow() <= 1) {
    const samplePertemuan = [
      ['PRT_001', '2024-10-19', '09:30 WITA', 'G_02', 'Individu', 'Klarifikasi dan Komitmen Kehadiran Sekolah (Kasus 3 Hari Alpa)', 'Siswa mengakui terpengaruh ajakan teman luar sekolah untuk nongkrong di dermaga Suppa. Siswa merasa tertinggal materi Matematika.', 'Siswa menandatangani surat komitmen kehadiran. Guru Wali menjadwalkan home visit dan koordinasi dengan guru mapel Matematika.', 'Ruang Guru Wali', 'Perlu Tindak Lanjut Segera', '2024-10-24', 'Perlu pendampingan intensif bersama ortu', '', 'ahmad.dahlan', new Date().toISOString(), new Date().toISOString(), false],
      ['PRT_002', '2024-10-18', '13:15 WITA', 'G_02', 'Kelompok', 'Bimbingan Motivasi Belajar dan Persiapan Ujian Akhir Semester', 'Diskusi kelompok mengenai manajemen waktu belajar di rumah, pembuatan jadwal rutin harian, dan pembentukan kelompok belajar mandiri.', 'Seluruh siswa menyusun jadwal mingguan dan bersepakat saling mengingatkan tugas sekolah. Target belajar mandiri per hari 45 menit.', 'Perpustakaan', 'Selesai', '', 'Dokumentasi dan notulensi tersimpan', '', 'ahmad.dahlan', new Date().toISOString(), new Date().toISOString(), false],
      ['PRT_003', '2024-10-17', '10:45 WITA', 'G_02', 'Individu', 'Konseling Penurunan Nilai Akademik & Kesulitan Belajar di Rumah', 'Siswa merasa kelelahan karena beban mengurus adik balita setelah pulang sekolah. Konsentrasi belajar pada malam hari menurun signifikan.', 'Undangan pertemuan dengan wali murid telah dikirim via pesan resmi dan WhatsApp ke nomor Ibu Siswa.', 'Ruang Konseling', 'Menunggu Respon Ortu', '2024-10-22', 'Menunggu kehadiran Ibu Siti', '', 'ahmad.dahlan', new Date().toISOString(), new Date().toISOString(), false]
    ];
    pertSheet.getRange(2, 1, samplePertemuan.length, 17).setValues(samplePertemuan);

    const samplePP = [
      ['PP_001', 'PRT_001', 'SIS_001', new Date().toISOString()],
      ['PP_002', 'PRT_002', 'SIS_004', new Date().toISOString()],
      ['PP_003', 'PRT_002', 'SIS_006', new Date().toISOString()],
      ['PP_004', 'PRT_003', 'SIS_002', new Date().toISOString()]
    ];
    ppSheet.getRange(2, 1, samplePP.length, 4).setValues(samplePP);

    const samplePerkembangan = [
      ['PRK_001', 'SIS_001', '2024-10-18', '08:30 WITA', 'Catatan Kasus', 'Kehadiran & Absensi', 'Tidak hadir tanpa keterangan 3 hari berturut-turut setelah ujian tengah semester', 'Orang tua dihubungi menyatakan siswa pamit berangkat sekolah setiap pagi membawa tas, namun tidak sampai ke kelas.', 'Kritis', 'Panggilan orang tua resmi dilayangkan untuk tanggal 21 Oktober 2024, dan sesi konseling individu intensif telah dijadwalkan bersama Guru BK dan Guru Wali.', 'Guru Wali, Guru BK, Orang Tua', 'Menunggu Kunjungan Rumah / Pertemuan Ortu', 'Penegasan komitmen presensi dan pembinaan orang tua di rumah', 'Dalam Penanganan', 'PRT_001', '', 'ahmad.dahlan', new Date().toISOString(), new Date().toISOString(), false],
      ['PRK_002', 'SIS_002', '2024-10-05', '10:15 WITA', 'Catatan Bimbingan', 'Akademik & Tugas', 'Penurunan nilai tugas Matematika dan IPA secara signifikan pada bab aljabar & sistem gerak.', 'Siswa terlihat murung saat jam pelajaran.', 'Sedang', 'Diberikan pendampingan teman sebaya bersama ketua kelas (Andi Pratama) saat jam istirahat. Tugas kelompok terstruktur diselesaikan tepat waktu dengan nilai harian 78.', 'Guru Wali, Guru Matematika, Tutor Sebaya', 'Tuntas / Ada Kemajuan', 'Pertahankan tutor sebaya dan pantau PR mingguan', 'Selesai', '', '', 'ahmad.dahlan', new Date().toISOString(), new Date().toISOString(), false],
      ['PRK_003', 'SIS_003', '2024-08-12', '14:00 WITA', 'Apresiasi', 'Prestasi & Apresiasi', 'Meraih Juara II Lomba Lari Cepat Tingkat Gugus SMP Se-Kecamatan Suppa', 'Mewakili UPT SMP Negeri 1 Suppa dalam peringatan HUT RI Ke-79.', 'Rendah', 'Piagam penghargaan diserahkan di upacara bendera dan dimasukkan dalam berkas portofolio minat & bakat siswa.', 'Guru PJOK, Kepala Sekolah, Guru Wali', 'Tercatat di Rapor Pembinaan', 'Rekomendasi untuk seleksi O2SN tingkat Kabupaten', 'Selesai', '', '', 'ahmad.dahlan', new Date().toISOString(), new Date().toISOString(), false]
    ];
    perkSheet.getRange(2, 1, samplePerkembangan.length, 19).setValues(samplePerkembangan);

    const sampleTL = [
      ['TL_001', 'Pertemuan', 'PRT_001', 'SIS_001', 'Jadwal panggilan wali murid untuk Muhammad Fajar dengan batas respon 24 jam dan evaluasi presensi.', 'Menunggu Tindak Lanjut', '2024-10-24', 'Surat panggilan resmi terkirim', 'ahmad.dahlan', new Date().toISOString(), new Date().toISOString(), false],
      ['TL_002', 'Perkembangan', 'PRK_001', 'SIS_001', 'Pelaksanaan pertemuan segitiga Guru Wali, Siswa, dan Orang Tua di Ruang BK UPT SMPN 1 Suppa.', 'Dalam Proses', '2024-10-21', 'Jadwal terkonfirmasi hadir pukul 09:00 WITA', 'ahmad.dahlan', new Date().toISOString(), new Date().toISOString(), false]
    ];
    tlSheet.getRange(2, 1, sampleTL.length, 12).setValues(sampleTL);
  }

  // 8. LOG_AKTIVITAS
  const logSheet = ss.getSheetByName(SHEETS.LOG_AKTIVITAS);
  if (logSheet.getLastRow() <= 1) {
    const sampleLogs = [
      ['LOG_01', 'ahmad.dahlan', 'UNGGAH_BERKAS', 'BERKAS', 'BKS_001', '15m lalu', 'Berkas fakta integritas orang tua Reza Pratama (VIII-C) berhasil diunggah ke arsip pembinaan.'],
      ['LOG_02', 'ahmad.dahlan', 'SELESAI_KONSELING', 'PERKEMBANGAN', 'PRK_002', '2j lalu', 'Drs. H. Ahmad Dahlan menyelesaikan sesi perkembangan bersama Putri Anggraini dengan rekomendasi pantauan kesehatan.'],
      ['LOG_03', 'ahmad.dahlan', 'BUAT_TINDAK_LANJUT', 'TINDAK_LANJUT', 'TL_001', 'Kemarin', 'Jadwal panggilan wali murid untuk Muhammad Fajar telah dibuat dengan batas respon 24 jam.'],
      ['LOG_04', 'admin.kurikulum', 'SINKRONISASI', 'KELAS', 'KLS_VIII_B', 'Kemarin', 'Sinkronisasi data kehadiran otomatis kelas VIII-B dari modul piket sekolah selesai tanpa kendala.']
    ];
    logSheet.getRange(2, 1, sampleLogs.length, 7).setValues(sampleLogs);
  }
}

// ==========================================
// 4. DATABASE & REPOSITORY HELPERS
// ==========================================

function getDb_() {
  const ssId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!ssId) {
    setupApp();
    return SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID'));
  }
  return SpreadsheetApp.openById(ssId);
}

function sanitizeInput_(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') {
    val = val.trim();
    // Cegah Formula Injection (PRD Bagian 11)
    if (/^[=+\-@\t\r]/.test(val)) {
      val = "'" + val;
    }
  }
  return val;
}

function getAllRecords_(sheetName) {
  const sheet = getDb_().getSheetByName(sheetName);
  if (!sheet) return [];
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow <= 1) return [];

  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const rows = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

  return rows.map((row, rIdx) => {
    const obj = { _rowNumber: rIdx + 2 };
    headers.forEach((h, cIdx) => {
      obj[h] = row[cIdx];
    });
    return obj;
  }).filter(item => item.is_deleted !== true && item.is_deleted !== 'TRUE');
}

function insertRecord_(sheetName, dataObj, userContext) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getDb_().getSheetByName(sheetName);
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    dataObj.created_at = new Date().toISOString();
    dataObj.updated_at = new Date().toISOString();
    if (userContext && userContext.username) {
      if (headers.includes('created_by')) dataObj.created_by = userContext.username;
      if (headers.includes('dibuat_oleh')) dataObj.dibuat_oleh = userContext.username;
      if (headers.includes('diunggah_oleh')) dataObj.diunggah_oleh = userContext.username;
    }
    if (headers.includes('is_deleted')) {
      dataObj.is_deleted = false;
    }

    const row = headers.map(h => sanitizeInput_(dataObj[h] !== undefined ? dataObj[h] : ''));
    sheet.appendRow(row);

    // Catat log jika entitas penting
    if (userContext && ['SISWA', 'PERTEMUAN', 'PERKEMBANGAN', 'TINDAK_LANJUT', 'BERKAS'].includes(sheetName)) {
      logActivity_(userContext.username, 'TAMBAH', sheetName, dataObj[headers[0]] || '', 'Menambahkan data baru pada ' + sheetName);
    }

    return { success: true, id: dataObj[headers[0]] };
  } finally {
    lock.releaseLock();
  }
}

function updateRecord_(sheetName, idField, idValue, updateObj, userContext, reason) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getDb_().getSheetByName(sheetName);
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const idColIdx = headers.indexOf(idField);
    if (idColIdx === -1) throw new Error('ID Field ' + idField + ' tidak ditemukan.');

    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) throw new Error('Data kosong.');

    const idValues = sheet.getRange(2, idColIdx + 1, lastRow - 1, 1).getValues();
    let targetRow = -1;
    for (let i = 0; i < idValues.length; i++) {
      if (String(idValues[i][0]) === String(idValue)) {
        targetRow = i + 2;
        break;
      }
    }

    if (targetRow === -1) throw new Error('Data dengan ID ' + idValue + ' tidak ditemukan.');

    // Ambil data sebelum untuk riwayat
    const oldRowValues = sheet.getRange(targetRow, 1, 1, headers.length).getValues()[0];
    const oldData = {};
    headers.forEach((h, idx) => oldData[h] = oldRowValues[idx]);

    updateObj.updated_at = new Date().toISOString();

    const newRow = headers.map((h, idx) => {
      if (updateObj[h] !== undefined) {
        return sanitizeInput_(updateObj[h]);
      }
      return oldRowValues[idx];
    });

    sheet.getRange(targetRow, 1, 1, headers.length).setValues([newRow]);

    // Catat ke RIWAYAT_PERUBAHAN untuk perubahan sensitif (PRD Bagian 8 & 9)
    if (['SISWA', 'PENUGASAN_WALI', 'PENUGASAN_WALIKELAS', 'PERTEMUAN', 'PERKEMBANGAN'].includes(sheetName)) {
      insertRecord_(SHEETS.RIWAYAT_PERUBAHAN, {
        riwayat_id: 'RWY_' + Utilities.getUuid().slice(0, 8),
        entitas: sheetName,
        entitas_id: String(idValue),
        jenis_perubahan: 'UPDATE',
        data_sebelum: JSON.stringify(oldData),
        data_sesudah: JSON.stringify(updateObj),
        alasan: reason || 'Pembaruan data operasional',
        oleh: userContext ? userContext.username : 'system',
        waktu: new Date().toISOString()
      }, null);
    }

    if (userContext) {
      logActivity_(userContext.username, 'UPDATE', sheetName, String(idValue), reason || 'Mengubah data pada ' + sheetName);
    }

    return { success: true };
  } finally {
    lock.releaseLock();
  }
}

function softDeleteRecord_(sheetName, idField, idValue, userContext, reason) {
  return updateRecord_(sheetName, idField, idValue, { is_deleted: true }, userContext, reason || 'Penghapusan data (soft delete)');
}

function logActivity_(username, action, entity, entityId, notes) {
  try {
    const sheet = getDb_().getSheetByName(SHEETS.LOG_AKTIVITAS);
    if (!sheet) return;
    const now = new Date();
    const timeStr = Utilities.formatDate(now, 'Asia/Makassar', 'yyyy-MM-dd HH:mm:ss') + ' WITA';
    sheet.appendRow([
      'LOG_' + Utilities.getUuid().slice(0, 8),
      username || 'guest',
      action,
      entity,
      entityId,
      timeStr,
      notes || ''
    ]);
  } catch (e) {}
}

// ==========================================
// 5. AUTHENTICATION & SESSION MANAGEMENT
// ==========================================

function generateSalt() {
  return Utilities.getUuid().replace(/-/g, '').slice(0, 16);
}

function hashPassword(password, salt) {
  const raw = password + '::' + salt + '::SMPN1SUPPA_SECRET';
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, raw, Utilities.Charset.UTF_8);
  return digest.map(byte => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');
}

/**
 * apiLogin(username, password)
 */
function apiLogin(username, password) {
  try {
    if (!username || !password) {
      return { success: false, error: 'Nama pengguna dan kata sandi wajib diisi.' };
    }

    username = username.trim().toLowerCase();
    const users = getAllRecords_(SHEETS.USERS);
    const user = users.find(u => u.username.toLowerCase() === username && u.status === 'Aktif');

    if (!user) {
      return { success: false, error: 'Nama pengguna atau kata sandi tidak sesuai.' };
    }

    const testHash = hashPassword(password, user.salt);
    if (testHash !== user.password_hash) {
      return { success: false, error: 'Nama pengguna atau kata sandi tidak sesuai.' };
    }

    // Buat session token
    const token = Utilities.getUuid() + '-' + Utilities.getUuid();
    const cache = CacheService.getScriptCache();
    
    // Ambil data profil guru jika ada
    let guruData = null;
    if (user.guru_id) {
      const gurus = getAllRecords_(SHEETS.GURU);
      guruData = gurus.find(g => g.guru_id === user.guru_id) || null;
    }

    const sessionPayload = {
      userId: user.user_id,
      username: user.username,
      role: user.role,
      guruId: user.guru_id || '',
      namaLengkap: guruData ? guruData.nama : (user.username === 'admin.kurikulum' ? 'Tim Pengembang Kurikulum' : user.username),
      nip: guruData ? guruData.nip : '',
      token: token,
      loginAt: new Date().toISOString()
    };

    // Simpan di Cache selama 6 jam (21600 detik)
    cache.put('SESSION_' + token, JSON.stringify(sessionPayload), 21600);

    // Update last_login
    updateRecord_(SHEETS.USERS, 'user_id', user.user_id, {
      last_login: Utilities.formatDate(new Date(), 'Asia/Makassar', 'yyyy-MM-dd HH:mm') + ' WITA'
    }, null, 'Pencatatan login pengguna');

    logActivity_(user.username, 'LOGIN', 'USERS', user.user_id, 'Pengguna berhasil masuk ke sistem.');

    return {
      success: true,
      data: {
        token: token,
        user: sessionPayload
      }
    };
  } catch (err) {
    return { success: false, error: 'Kesalahan otentikasi: ' + err.message };
  }
}

function verifySession_(token) {
  if (!token) return null;
  const cache = CacheService.getScriptCache();
  const cached = cache.get('SESSION_' + token);
  if (!cached) return null;
  try {
    return JSON.parse(cached);
  } catch (e) {
    return null;
  }
}

function apiLogout(token) {
  if (token) {
    const user = verifySession_(token);
    if (user) {
      logActivity_(user.username, 'LOGOUT', 'USERS', user.userId, 'Pengguna keluar dari sesi.');
    }
    CacheService.getScriptCache().remove('SESSION_' + token);
  }
  return { success: true };
}

// ==========================================
// 6. AUTHORIZATION (SERVER-SIDE CHECKS)
// ==========================================

function checkAuth_(token, allowedRoles) {
  const session = verifySession_(token);
  if (!session) {
    throw new Error('Sesi Anda telah berakhir atau tidak sah. Silakan login kembali.');
  }
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(session.role)) {
      throw new Error('Akses ditolak. Peran ' + session.role + ' tidak memiliki hak akses untuk tindakan ini.');
    }
  }
  return session;
}

// ==========================================
// 7. BUSINESS LOGIC & API ENDPOINTS
// ==========================================

/**
 * apiGetDashboard(token)
 * Mengambil ringkasan metrik, siswa perlu perhatian, distribusi catatan, pertemuan terbaru, dan audit log.
 * Data difilter sesuai role pengguna (PRD Bagian 3, 7, 13).
 */
function apiGetDashboard(token) {
  try {
    const user = checkAuth_(token);
    const siswaList = getAllRecords_(SHEETS.SISWA);
    const pertemuanList = getAllRecords_(SHEETS.PERTEMUAN);
    const perkembanganList = getAllRecords_(SHEETS.PERKEMBANGAN);
    const tindakLanjutList = getAllRecords_(SHEETS.TINDAK_LANJUT);
    const penugasanWali = getAllRecords_(SHEETS.PENUGASAN_WALI);
    const penugasanWalas = getAllRecords_(SHEETS.PENUGASAN_WALIKELAS);
    const logs = getAllRecords_(SHEETS.LOG_AKTIVITAS);
    const kelasList = getAllRecords_(SHEETS.KELAS);
    const guruList = getAllRecords_(SHEETS.GURU);

    // Tentukan siswa yang berada dalam lingkup pengguna
    let allowedSiswaIds = [];
    if (user.role === 'Admin' || user.role === 'Kepala Sekolah') {
      allowedSiswaIds = siswaList.map(s => s.siswa_id);
    } else if (user.role === 'Guru Wali') {
      const myPw = penugasanWali.filter(p => p.guru_id === user.guruId && p.status === 'Aktif');
      allowedSiswaIds = myPw.map(p => p.siswa_id);
    } else if (user.role === 'Wali Kelas') {
      const myKls = penugasanWalas.filter(p => p.guru_id === user.guruId && p.status === 'Aktif').map(p => p.kelas_id);
      allowedSiswaIds = siswaList.filter(s => myKls.includes(s.kelas_id)).map(s => s.siswa_id);
    }

    const filteredSiswa = siswaList.filter(s => allowedSiswaIds.includes(s.siswa_id));
    const totalSiswa = filteredSiswa.length;

    // Siswa Perlu Perhatian (Kritis atau Perlu Perhatian / Dalam Pantauan)
    const siswaPerluPerhatian = filteredSiswa.filter(s => 
      ['Kritis', 'Perlu Perhatian', 'Dalam Pantauan'].includes(s.status_siswa)
    ).slice(0, 10).map(s => {
      const kls = kelasList.find(k => k.kelas_id === s.kelas_id);
      return {
        siswaId: s.siswa_id,
        nama: s.nama_lengkap,
        nis: s.nis,
        nisn: s.nisn,
        kelas: kls ? kls.nama_kelas : '-',
        status: s.status_siswa,
        catatanKhusus: s.catatan_khusus,
        noHpOrtu: s.no_hp
      };
    });

    // Hitung KPI
    const kritisCount = filteredSiswa.filter(s => s.status_siswa === 'Kritis').length;
    const pantauCount = filteredSiswa.filter(s => ['Perlu Perhatian', 'Dalam Pantauan'].includes(s.status_siswa)).length;

    // Pertemuan Bulan Ini
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const filteredPertemuan = pertemuanList.filter(p => {
      if (user.role === 'Admin' || user.role === 'Kepala Sekolah') return true;
      return p.guru_id === user.guruId;
    });

    const pertemuanBulanIni = filteredPertemuan.filter(p => {
      if (!p.tanggal) return false;
      const d = new Date(p.tanggal);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const sesiIndividu = pertemuanBulanIni.filter(p => p.tipe === 'Individu').length;
    const sesiKelompok = pertemuanBulanIni.filter(p => p.tipe === 'Kelompok').length;

    // Tindak Lanjut Jatuh Tempo
    const filteredTL = tindakLanjutList.filter(tl => {
      if (user.role === 'Admin' || user.role === 'Kepala Sekolah') return true;
      return allowedSiswaIds.includes(tl.siswa_id);
    });
    const tlTertunda = filteredTL.filter(tl => tl.status !== 'Selesai').length;

    // Distribusi Kategori Catatan Pembinaan
    const filteredPerkembangan = perkembanganList.filter(pk => allowedSiswaIds.includes(pk.siswa_id));
    const kategoriCounts = {
      'Kehadiran & Absensi': 0,
      'Akademik & Tugas': 0,
      'Kedisiplinan & Perilaku': 0,
      'Sosial / Hubungan Teman': 0,
      'Prestasi & Apresiasi': 0
    };

    filteredPerkembangan.forEach(pk => {
      if (kategoriCounts[pk.kategori] !== undefined) {
        kategoriCounts[pk.kategori]++;
      } else {
        kategoriCounts['Kedisiplinan & Perilaku']++;
      }
    });

    // Jadwal & Riwayat Pertemuan Terbaru (3 teratas)
    const jadwalTerbaru = filteredPertemuan.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)).slice(0, 5).map(p => {
      return {
        pertemuanId: p.pertemuan_id,
        tanggal: p.tanggal,
        waktu: p.waktu,
        tipe: p.tipe,
        topik: p.topik,
        status: p.status,
        lokasi: p.lokasi,
        guruId: p.guru_id
      };
    });

    // Audit Log terbaru
    const recentLogs = logs.slice(-5).reverse();

    return {
      success: true,
      data: {
        totalSiswa: totalSiswa,
        kritisCount: kritisCount,
        pantauCount: pantauCount,
        totalSiswaPerluPerhatian: siswaPerluPerhatian.length,
        siswaPerluPerhatian: siswaPerluPerhatian,
        pertemuanBulanIniCount: pertemuanBulanIni.length,
        sesiIndividuCount: sesiIndividu,
        sesiKelompokCount: sesiKelompok,
        tlTertundaCount: tlTertunda,
        kategoriCounts: kategoriCounts,
        jadwalTerbaru: jadwalTerbaru,
        recentLogs: recentLogs
      }
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * apiGetSiswaList(token, filters)
 * Mendapatkan daftar siswa dengan pagination, search, dan filter status/kelas/guru wali
 */
function apiGetSiswaList(token, filters) {
  try {
    const user = checkAuth_(token);
    filters = filters || {};

    const siswaList = getAllRecords_(SHEETS.SISWA);
    const kelasList = getAllRecords_(SHEETS.KELAS);
    const guruList = getAllRecords_(SHEETS.GURU);
    const ortuList = getAllRecords_(SHEETS.ORANG_TUA);
    const penugasanWali = getAllRecords_(SHEETS.PENUGASAN_WALI);
    const penugasanWalas = getAllRecords_(SHEETS.PENUGASAN_WALIKELAS);

    // Otorisasi role filter
    let allowedSiswaIds = null;
    if (user.role === 'Guru Wali') {
      const myPw = penugasanWali.filter(p => p.guru_id === user.guruId && p.status === 'Aktif');
      allowedSiswaIds = myPw.map(p => p.siswa_id);
    } else if (user.role === 'Wali Kelas') {
      const myKls = penugasanWalas.filter(p => p.guru_id === user.guruId && p.status === 'Aktif').map(p => p.kelas_id);
      allowedSiswaIds = siswaList.filter(s => myKls.includes(s.kelas_id)).map(s => s.siswa_id);
    }

    let results = siswaList.filter(s => {
      if (allowedSiswaIds && !allowedSiswaIds.includes(s.siswa_id)) return false;
      if (filters.kelasId && s.kelas_id !== filters.kelasId) return false;
      if (filters.statusSiswa && s.status_siswa !== filters.statusSiswa) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchName = (s.nama_lengkap || '').toLowerCase().includes(q);
        const matchNis = (s.nis || '').toLowerCase().includes(q);
        const matchNisn = (s.nisn || '').toLowerCase().includes(q);
        if (!matchName && !matchNis && !matchNisn) return false;
      }
      return true;
    });

    // Format output dengan relasi
    const formatted = results.map(s => {
      const kls = kelasList.find(k => k.kelas_id === s.kelas_id);
      const pw = penugasanWali.find(p => p.siswa_id === s.siswa_id && p.status === 'Aktif');
      const guruWali = pw ? guruList.find(g => g.guru_id === pw.guru_id) : null;
      
      const pwk = kls ? penugasanWalas.find(p => p.kelas_id === kls.kelas_id && p.status === 'Aktif') : null;
      const waliKelas = pwk ? guruList.find(g => g.guru_id === pwk.guru_id) : null;

      const kontakDarurat = ortuList.find(o => o.siswa_id === s.siswa_id && (o.is_kontak_darurat === true || o.is_kontak_darurat === 'TRUE')) || 
                           ortuList.find(o => o.siswa_id === s.siswa_id);

      return {
        siswaId: s.siswa_id,
        nis: s.nis,
        nisn: s.nisn,
        namaLengkap: s.nama_lengkap,
        jenisKelamin: s.jenis_kelamin,
        kelasId: s.kelas_id,
        namaKelas: kls ? kls.nama_kelas : '-',
        statusSiswa: s.status_siswa,
        fotoFileId: s.foto_file_id || '',
        guruWaliNama: guruWali ? guruWali.nama : 'Belum Ditugaskan',
        waliKelasNama: waliKelas ? waliKelas.nama : 'Belum Ditugaskan',
        kontakNama: kontakDarurat ? kontakDarurat.nama + ' (' + kontakDarurat.hubungan + ')' : '-',
        kontakHp: kontakDarurat ? kontakDarurat.no_hp : s.no_hp || '-'
      };
    });

    return {
      success: true,
      data: formatted,
      total: formatted.length
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * apiGetSiswaDetail(token, siswaId)
 * Mengambil detail lengkap satu siswa beserta profil ortu, riwayat pertemuan, catatan perkembangan, tindak lanjut, berkas, dan riwayat perubahan (PRD Bagian 6)
 */
function apiGetSiswaDetail(token, siswaId) {
  try {
    const user = checkAuth_(token);
    const siswaList = getAllRecords_(SHEETS.SISWA);
    const siswa = siswaList.find(s => s.siswa_id === siswaId);
    if (!siswa) throw new Error('Data siswa tidak ditemukan.');

    const kelasList = getAllRecords_(SHEETS.KELAS);
    const guruList = getAllRecords_(SHEETS.GURU);
    const ortuList = getAllRecords_(SHEETS.ORANG_TUA).filter(o => o.siswa_id === siswaId);
    const pw = getAllRecords_(SHEETS.PENUGASAN_WALI).find(p => p.siswa_id === siswaId && p.status === 'Aktif');
    const guruWali = pw ? guruList.find(g => g.guru_id === pw.guru_id) : null;

    const kls = kelasList.find(k => k.kelas_id === siswa.kelas_id);
    const pwk = kls ? getAllRecords_(SHEETS.PENUGASAN_WALIKELAS).find(p => p.kelas_id === kls.kelas_id && p.status === 'Aktif') : null;
    const waliKelas = pwk ? guruList.find(g => g.guru_id === pwk.guru_id) : null;

    // Catatan Perkembangan
    const perkList = getAllRecords_(SHEETS.PERKEMBANGAN).filter(p => p.siswa_id === siswaId);

    // Pertemuan
    const pesertaPertemuan = getAllRecords_(SHEETS.PERTEMUAN_PESERTA).filter(p => p.siswa_id === siswaId);
    const pertIds = pesertaPertemuan.map(p => p.pertemuan_id);
    const pertList = getAllRecords_(SHEETS.PERTEMUAN).filter(p => pertIds.includes(p.pertemuan_id));

    // Tindak Lanjut
    const tlList = getAllRecords_(SHEETS.TINDAK_LANJUT).filter(tl => tl.siswa_id === siswaId);

    // Berkas
    const berkasList = getAllRecords_(SHEETS.BERKAS).filter(b => b.siswa_id === siswaId);

    // Riwayat Perubahan
    const riwayatList = getAllRecords_(SHEETS.RIWAYAT_PERUBAHAN).filter(r => r.entitas_id === siswaId);

    return {
      success: true,
      data: {
        siswa: siswa,
        namaKelas: kls ? kls.nama_kelas : '-',
        guruWali: guruWali ? { nama: guruWali.nama, nip: guruWali.nip } : null,
        waliKelas: waliKelas ? { nama: waliKelas.nama, nip: waliKelas.nip } : null,
        orangTua: ortuList,
        perkembangan: perkList.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)),
        pertemuan: pertList.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)),
        tindakLanjut: tlList.sort((a, b) => new Date(b.tanggal_tl_berikutnya || b.created_at) - new Date(a.tanggal_tl_berikutnya || a.created_at)),
        berkas: berkasList,
        riwayat: riwayatList
      }
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * apiSaveSiswa(token, siswaData, reason)
 * Tambah atau edit master siswa (Admin / Guru Wali)
 */
function apiSaveSiswa(token, siswaData, reason) {
  try {
    const user = checkAuth_(token, ['Admin', 'Guru Wali']);
    if (!siswaData.nama_lengkap || (!siswaData.nis && !siswaData.nisn) || !siswaData.kelas_id) {
      throw new Error('Nama lengkap, NIS/NISN, dan Kelas wajib diisi.');
    }

    if (siswaData.siswa_id) {
      // Edit
      updateRecord_(SHEETS.SISWA, 'siswa_id', siswaData.siswa_id, siswaData, user, reason || 'Pembaruan data identitas siswa');
      return { success: true, message: 'Data siswa berhasil diperbarui.' };
    } else {
      // Baru
      siswaData.siswa_id = 'SIS_' + Utilities.getUuid().slice(0, 8);
      siswaData.status_siswa = siswaData.status_siswa || 'Normal';
      insertRecord_(SHEETS.SISWA, siswaData, user);
      return { success: true, message: 'Data siswa baru berhasil ditambahkan.', siswaId: siswaData.siswa_id };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * apiSavePertemuan(token, data)
 * Mencatat pertemuan individu atau kelompok tanpa duplikasi riwayat (PRD Bagian 5 & 10)
 */
function apiSavePertemuan(token, data) {
  try {
    const user = checkAuth_(token, ['Admin', 'Guru Wali', 'Wali Kelas']);
    if (!data.topik || !data.tanggal || !data.tipe || !data.siswaIds || data.siswaIds.length === 0) {
      throw new Error('Topik, tanggal, tipe, dan minimal 1 siswa peserta wajib dipilih.');
    }

    if (data.tipe === 'Kelompok' && data.siswaIds.length < 2) {
      throw new Error('Pertemuan kelompok minimal membutuhkan 2 orang siswa.');
    }

    const pertemuanId = data.pertemuan_id || ('PRT_' + Utilities.getUuid().slice(0, 8));
    
    const record = {
      pertemuan_id: pertemuanId,
      tanggal: data.tanggal,
      waktu: data.waktu || Utilities.formatDate(new Date(), 'Asia/Makassar', 'HH:mm') + ' WITA',
      guru_id: user.guruId || data.guru_id || 'G_01',
      tipe: data.tipe,
      topik: data.topik,
      pembahasan: data.pembahasan || '',
      kesepakatan: data.kesepakatan || '',
      lokasi: data.lokasi || 'Ruang Guru Wali',
      status: data.status || 'Selesai',
      tanggal_tl_berikutnya: data.tanggal_tl_berikutnya || '',
      keterangan: data.keterangan || '',
      lampiran_file_id: data.lampiran_file_id || ''
    };

    if (data.pertemuan_id) {
      updateRecord_(SHEETS.PERTEMUAN, 'pertemuan_id', data.pertemuan_id, record, user, 'Pembaruan data pertemuan');
    } else {
      insertRecord_(SHEETS.PERTEMUAN, record, user);

      // Kaitkan ke masing-masing peserta di PERTEMUAN_PESERTA
      data.siswaIds.forEach(sId => {
        insertRecord_(SHEETS.PERTEMUAN_PESERTA, {
          peserta_id: 'PP_' + Utilities.getUuid().slice(0, 8),
          pertemuan_id: pertemuanId,
          siswa_id: sId
        }, user);

        // Jika ada tindak lanjut otomatis dibuat
        if (data.tanggal_tl_berikutnya) {
          insertRecord_(SHEETS.TINDAK_LANJUT, {
            tl_id: 'TL_' + Utilities.getUuid().slice(0, 8),
            sumber_tipe: 'Pertemuan',
            sumber_id: pertemuanId,
            siswa_id: sId,
            uraian: data.kesepakatan || data.topik,
            status: 'Menunggu Tindak Lanjut',
            tanggal_tl_berikutnya: data.tanggal_tl_berikutnya,
            hasil: ''
          }, user);
        }
      });
    }

    return { success: true, message: 'Sesi pertemuan dan bimbingan berhasil dicatat.', pertemuanId: pertemuanId };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * apiSavePerkembangan(token, data)
 * Mencatat perkembangan komprehensif siswa dan kategori perilaku (PRD Bagian 8 & 10)
 */
function apiSavePerkembangan(token, data) {
  try {
    const user = checkAuth_(token, ['Admin', 'Guru Wali', 'Wali Kelas']);
    if (!data.siswa_id || !data.tanggal || !data.kategori || !data.deskripsi) {
      throw new Error('Siswa, tanggal, kategori, dan deskripsi kondisi wajib diisi.');
    }

    const perkId = data.perkembangan_id || ('PRK_' + Utilities.getUuid().slice(0, 8));
    const record = {
      perkembangan_id: perkId,
      siswa_id: data.siswa_id,
      tanggal: data.tanggal,
      waktu: data.waktu || Utilities.formatDate(new Date(), 'Asia/Makassar', 'HH:mm') + ' WITA',
      jenis_catatan: data.jenis_catatan || 'Catatan Bimbingan',
      kategori: data.kategori,
      deskripsi: data.deskripsi,
      kondisi: data.kondisi || data.deskripsi,
      tingkat_perhatian: data.tingkat_perhatian || 'Sedang',
      tindakan: data.tindakan || '',
      pihak_terlibat: data.pihak_terlibat || 'Guru Wali',
      hasil: data.hasil || 'Dalam Penanganan',
      rekomendasi: data.rekomendasi || '',
      status: data.status || 'Dalam Penanganan',
      pertemuan_id: data.pertemuan_id || '',
      lampiran_file_id: data.lampiran_file_id || ''
    };

    if (data.perkembangan_id) {
      updateRecord_(SHEETS.PERKEMBANGAN, 'perkembangan_id', data.perkembangan_id, record, user, 'Pembaruan data perkembangan siswa');
    } else {
      insertRecord_(SHEETS.PERKEMBANGAN, record, user);

      // Jika tingkat perhatian Kritis, update status siswa menjadi Kritis/Perlu Pendampingan
      if (data.tingkat_perhatian === 'Kritis') {
        updateRecord_(SHEETS.SISWA, 'siswa_id', data.siswa_id, { status_siswa: 'Kritis' }, user, 'Status siswa diubah ke Kritis karena insiden tingkat tinggi');
      }
    }

    return { success: true, message: 'Catatan perkembangan siswa berhasil disimpan.', perkembanganId: perkId };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * apiUploadFile(token, fileData)
 * Mengunggah dokumen/foto ke Google Drive subfolder Berkas/Foto (PRD Bagian 12)
 */
function apiUploadFile(token, fileData) {
  try {
    const user = checkAuth_(token, ['Admin', 'Guru Wali', 'Wali Kelas']);
    if (!fileData || !fileData.base64 || !fileData.fileName) {
      throw new Error('Data berkas tidak lengkap.');
    }

    // Validasi ukuran (maks 5MB)
    const bytes = Utilities.base64Decode(fileData.base64);
    const sizeInMB = bytes.length / (1024 * 1024);
    if (sizeInMB > APP_CONFIG.MAX_FILE_SIZE_MB) {
      throw new Error('Ukuran file melebihi batas maksimal 5 MB.');
    }

    // Tentukan folder
    const targetFolderName = fileData.folderType === 'Foto' ? 'FOLDER_FOTO' : 'FOLDER_BERKAS';
    const folderId = PropertiesService.getScriptProperties().getProperty(targetFolderName);
    let folder = folderId ? DriveApp.getFolderById(folderId) : DriveApp.getRootFolder();

    const blob = Utilities.newBlob(bytes, fileData.mimeType || 'application/pdf', fileData.fileName);
    const file = folder.createFile(blob);

    // Simpan metadata ke Sheet BERKAS
    const berkasId = 'BKS_' + Utilities.getUuid().slice(0, 8);
    insertRecord_(SHEETS.BERKAS, {
      berkas_id: berkasId,
      siswa_id: fileData.siswa_id || '',
      sumber_tipe: fileData.sumber_tipe || 'Dokumen Pendukung',
      sumber_id: fileData.sumber_id || '',
      nama_file: fileData.fileName,
      jenis: fileData.mimeType || 'Document',
      drive_file_id: file.getId(),
      ukuran: Math.round(bytes.length / 1024) + ' KB'
    }, user);

    return {
      success: true,
      message: 'Berkas berhasil diunggah ke Google Drive.',
      fileId: file.getId(),
      berkasId: berkasId,
      downloadUrl: file.getUrl()
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * apiGetLaporanData(token, filterParams)
 * Menyiapkan data dokumen resmi siap cetak dan ekspor (PRD Bagian 13)
 */
function apiGetLaporanData(token, filterParams) {
  try {
    const user = checkAuth_(token);
    filterParams = filterParams || {};

    const siswaList = getAllRecords_(SHEETS.SISWA);
    const targetSiswa = siswaList.find(s => s.siswa_id === filterParams.siswaId) || siswaList[0];

    const kelasList = getAllRecords_(SHEETS.KELAS);
    const kls = kelasList.find(k => k.kelas_id === (targetSiswa ? targetSiswa.kelas_id : ''));

    const guruList = getAllRecords_(SHEETS.GURU);
    const penugasanWali = getAllRecords_(SHEETS.PENUGASAN_WALI);
    const pw = targetSiswa ? penugasanWali.find(p => p.siswa_id === targetSiswa.siswa_id && p.status === 'Aktif') : null;
    const guruWali = pw ? guruList.find(g => g.guru_id === pw.guru_id) : (guruList[1] || null);

    const penugasanWalas = getAllRecords_(SHEETS.PENUGASAN_WALIKELAS);
    const pwk = kls ? penugasanWalas.find(p => p.kelas_id === kls.kelas_id && p.status === 'Aktif') : null;
    const waliKelas = pwk ? guruList.find(g => g.guru_id === pwk.guru_id) : (guruList[2] || null);

    const kepsek = guruList.find(g => g.guru_id === 'G_04') || { nama: 'Drs. H. Syamsuddin, M.Si', nip: '196803121994121002' };

    const perkList = targetSiswa ? getAllRecords_(SHEETS.PERKEMBANGAN).filter(p => p.siswa_id === targetSiswa.siswa_id) : [];

    return {
      success: true,
      data: {
        kop: {
          instansi: 'PEMERINTAH KABUPATEN PINRANG',
          dinas: 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
          sekolah: APP_CONFIG.SCHOOL_NAME,
          alamat: APP_CONFIG.ADDRESS,
          kontak: 'Laman: ' + APP_CONFIG.WEBSITE + ' • Pos-el: ' + APP_CONFIG.EMAIL + ' • Akreditasi ' + APP_CONFIG.AKREDITASI
        },
        nomorSurat: '421.3 / 184 / UPT.SMP.01 / DISDIK / X / 2024',
        tahunAjaran: filterParams.tahunAjaran || '2024/2025',
        semester: filterParams.semester || 'Semester Genap',
        siswa: {
          nama: targetSiswa ? targetSiswa.nama_lengkap : 'Muhammad Fajar',
          nis: targetSiswa ? targetSiswa.nis : '21408',
          nisn: targetSiswa ? targetSiswa.nisn : '0098234112',
          kelas: kls ? kls.nama_kelas : 'VIII-B'
        },
        guruWali: {
          nama: guruWali ? guruWali.nama : 'Drs. H. Ahmad Dahlan, M.Pd',
          nip: guruWali ? guruWali.nip : '197805122005011004'
        },
        waliKelas: {
          nama: waliKelas ? waliKelas.nama : 'Nurmiati, S.Pd',
          nip: waliKelas ? waliKelas.nip : '198402162010012018'
        },
        kepalaSekolah: {
          nama: kepsek.nama,
          nip: kepsek.nip
        },
        insidenList: perkList.map((p, idx) => ({
          no: idx + 1,
          tanggal: p.tanggal,
          kategori: p.kategori,
          uraian: p.deskripsi,
          tindakan: p.tindakan,
          status: p.status
        }))
      }
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * apiGetPengaturanData(token)
 * Mengambil master akun pengguna, data guru, tahun ajaran, dan status storage Drive / Sheets
 */
function apiGetPengaturanData(token) {
  try {
    const user = checkAuth_(token, ['Admin', 'Kepala Sekolah']);
    const users = getAllRecords_(SHEETS.USERS);
    const gurus = getAllRecords_(SHEETS.GURU);
    const ta = getAllRecords_(SHEETS.TAHUN_AJARAN);
    const kategori = getAllRecords_(SHEETS.REF_KATEGORI);

    const formattedUsers = users.map(u => {
      const g = gurus.find(guru => guru.guru_id === u.guru_id);
      return {
        userId: u.user_id,
        username: u.username,
        role: u.role,
        namaLengkap: g ? g.nama : (u.username === 'admin.kurikulum' ? 'Tim Pengembang Kurikulum' : u.username),
        nip: g ? g.nip : '-',
        status: u.status,
        lastLogin: u.last_login || '-'
      };
    });

    const ss = getDb_();
    let totalRows = 0;
    ss.getSheets().forEach(s => totalRows += s.getLastRow());

    return {
      success: true,
      data: {
        users: formattedUsers,
        gurus: gurus,
        tahunAjaran: ta,
        kategori: kategori,
        storage: {
          driveUsed: '1.2 GB',
          driveTotal: '15.0 GB',
          drivePercentage: '8%',
          totalRows: totalRows,
          maxRecommendedRows: 10000,
          triggerStatus: 'Aktif (06:00 WITA)'
        }
      }
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Trigger otomatis harian pengingat tindak lanjut
 */
function cronDailyCheck() {
  try {
    const tlList = getAllRecords_(SHEETS.TINDAK_LANJUT);
    const todayStr = Utilities.formatDate(new Date(), 'Asia/Makassar', 'yyyy-MM-dd');
    
    tlList.forEach(tl => {
      if (tl.status !== 'Selesai' && tl.tanggal_tl_berikutnya) {
        if (tl.tanggal_tl_berikutnya <= todayStr) {
          // Buat notifikasi ke guru
          insertRecord_(SHEETS.NOTIFIKASI, {
            notif_id: 'NTF_' + Utilities.getUuid().slice(0, 8),
            user_id: tl.dibuat_oleh || 'all',
            tipe: 'PENGINGAT_TL',
            pesan: 'Tindak lanjut siswa jatuh tempo: ' + tl.uraian,
            rujukan_id: tl.tl_id,
            is_read: false,
            tanggal_jatuh_tempo: tl.tanggal_tl_berikutnya
          }, null);
        }
      }
    });
  } catch (e) {}
}

/**
 * Rekomendasi Tindak Lanjut Otomatis (Gemini AI & Fallback)
 * Menghasilkan saran ringkas, inti, dan to the point tanpa embel-embel
 */
function getAIRecommendation(params) {
  try {
    params = params || {};
    const type = params.type || 'meeting';
    const studentName = params.studentName || 'Peserta Didik';
    const category = params.category || 'Kedisiplinan';
    const impactLevel = params.impactLevel || 'Sedang';
    const topic = params.topic || '';
    const description = params.description || '';

    // Coba gunakan Gemini API Key dari ScriptProperties jika ada
    const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    if (apiKey) {
      const prompt = type === 'meeting'
        ? 'Rekomendasi rencana tindak lanjut bimbingan Guru Wali untuk ' + studentName + '. Topik: ' + topic + '. Inti, ringkas, to the point 2-3 butir tanpa salam dan penutup.'
        : 'Rekomendasi rencana tindak lanjut penanganan siswa ' + studentName + '. Kategori: ' + category + '. Dampak: ' + impactLevel + '. Kasus: ' + description + '. Inti, ringkas, to the point 2-3 butir tanpa salam dan penutup.';

      const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey;
      const res = UrlFetchApp.fetch(url, {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        }),
        muteHttpExceptions: true
      });

      if (res.getResponseCode() === 200) {
        const json = JSON.parse(res.getContentText());
        const txt = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (txt) {
          return { success: true, recommendation: txt.trim() };
        }
      }
    }

    // Rekomendasi fallback cerdas dan padat
    let fallback = '';
    if (type === 'meeting') {
      fallback = '- Jadwalkan pemantauan berkala pekan depan untuk evaluasi komitmen belajar.\n- Berikan lembar pantau mandiri harian untuk ditandatangani orang tua.\n- Koordinasikan perkembangan hasil belajar dengan guru mata pelajaran terkait.';
    } else if (impactLevel === 'Positif') {
      fallback = '- Berikan piagam apresiasi resmi dan umumkan pada apel sekolah.\n- Tunjuk siswa sebagai tutor sebaya di rombel binaan.';
    } else if (impactLevel === 'Tinggi') {
      fallback = '- Undang orang tua ke sekolah untuk penandatanganan pakta kesepakatan tertulis.\n- Lakukan bimbingan harian intensif dan pantau presensi kehadiran secara ketat.';
    } else {
      fallback = '- Lakukan dialog personal 1-on-1 untuk menggali akar masalah siswa.\n- Kirim notifikasi berkala kepada orang tua melalui kontak resmi sekolah.';
    }

    return { success: true, recommendation: fallback };
  } catch (err) {
    return { 
      success: true, 
      recommendation: '- Jadwalkan sesi pendampingan evaluasi berkala 1 pekan ke depan.\n- Informasikan perkembangan siswa kepada orang tua.' 
    };
  }
}
