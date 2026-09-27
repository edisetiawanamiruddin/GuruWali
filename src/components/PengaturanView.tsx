import React, { useState } from 'react';
import { 
  Settings, Users, Database, HardDrive, Clock, RefreshCw, 
  Shield, Plus, Search, Filter, CheckCircle2, AlertTriangle,
  FileSpreadsheet, ExternalLink, Key, UserCheck, Layers, Calendar,
  Sun, Moon, Palette, Check, Edit3, Trash2, Lock, X, ArrowRight
} from 'lucide-react';
import { Teacher, AcademicYear } from '../types';

interface PengaturanViewProps {
  teachers: Teacher[];
  onAddTeacher?: (t: Teacher) => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  academicYears?: AcademicYear[];
  activeAcademicYear?: string;
  onSetActiveAcademicYear?: (name: string) => void;
  onAddAcademicYear?: (ay: AcademicYear) => void;
  onUpdateAcademicYear?: (ay: AcademicYear) => void;
  onDeleteAcademicYear?: (id: string) => void;
  initialSubTab?: 'akun' | 'master_guru' | 'tahun_ajaran' | 'kategori' | 'spreadsheet' | 'tema';
}

export const PengaturanView: React.FC<PengaturanViewProps> = ({ 
  teachers, 
  theme = 'light',
  onToggleTheme,
  academicYears = [],
  activeAcademicYear = '2024/2025 Genap',
  onSetActiveAcademicYear,
  onAddAcademicYear,
  onUpdateAcademicYear,
  onDeleteAcademicYear,
  initialSubTab = 'akun'
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'akun' | 'master_guru' | 'tahun_ajaran' | 'kategori' | 'spreadsheet' | 'tema'>(initialSubTab);

  React.useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const [searchUser, setSearchUser] = useState('');
  const [roleFilter, setRoleFilter] = useState('Semua');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success'>('idle');

  // Initial user list matching reference image
  const [users, setUsers] = useState([
    {
      id: 'USR_01',
      username: 'ahmad.dahlan',
      namaLengkap: 'Drs. H. Ahmad Dahlan, M.Pd',
      nip: '197805122005011004',
      role: 'Guru Wali',
      roleScope: 'Kelas VIII-B (32 Siswa)',
      status: 'Aktif',
      lastLogin: 'Hari ini, 07:15 WITA'
    },
    {
      id: 'USR_02',
      username: 'nurmiati.spd',
      namaLengkap: 'Nurmiati, S.Pd',
      nip: '198203152008042003',
      role: 'Wali Kelas',
      roleScope: 'Wali Kelas VIII-B',
      status: 'Aktif',
      lastLogin: 'Hari ini, 06:40 WITA'
    },
    {
      id: 'USR_03',
      username: 'admin.suppa',
      namaLengkap: 'Administrator Sistem',
      nip: '198501012010011002',
      role: 'Administrator',
      roleScope: 'Akses Penuh Seluruh Modul',
      status: 'Aktif',
      lastLogin: 'Kemarin, 21:12 WITA'
    },
    {
      id: 'USR_04',
      username: 'kepsek.suppa',
      namaLengkap: 'Drs. H. Syamsuddin, M.Si',
      nip: '196803121994121002',
      role: 'Kepala Sekolah',
      roleScope: 'Supervisi & Pengesahan Dokumen',
      status: 'Aktif',
      lastLogin: '24 Okt 2024, 08:30 WITA'
    },
    {
      id: 'USR_05',
      username: 'marwah.bk',
      namaLengkap: 'Marwah, S.Pd',
      nip: '198507202011012009',
      role: 'Guru BK',
      roleScope: 'Konseling Bimbingan Tingkat VIII',
      status: 'Aktif',
      lastLogin: '23 Okt 2024, 14:05 WITA'
    }
  ]);

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newNip, setNewNip] = useState('');
  const [newRole, setNewRole] = useState('Guru Wali');

  // Academic Year State & Modals
  const [showAddYearModal, setShowAddYearModal] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
  const [yearTahun, setYearTahun] = useState('2025/2026');
  const [yearSemester, setYearSemester] = useState<'Ganjil' | 'Genap'>('Ganjil');
  const [yearStartDate, setYearStartDate] = useState('2025-07-14');
  const [yearEndDate, setYearEndDate] = useState('2025-12-19');
  const [yearHariEfektif, setYearHariEfektif] = useState(110);
  const [yearKeterangan, setYearKeterangan] = useState('Semester Baru Kalender Pendidikan UPT SMPN 1 Suppa');
  const [yearStatus, setYearStatus] = useState<'Aktif' | 'Arsip' | 'Rencana'>('Rencana');

  const handleOpenEditYear = (ay: AcademicYear) => {
    setEditingYear(ay);
    setYearTahun(ay.tahun);
    setYearSemester(ay.semester);
    setYearStartDate(ay.startDate);
    setYearEndDate(ay.endDate);
    setYearHariEfektif(ay.totalHariEfektif);
    setYearKeterangan(ay.keterangan);
    setYearStatus(ay.status);
  };

  const handleOpenAddYear = () => {
    setEditingYear(null);
    setYearTahun('2025/2026');
    setYearSemester('Ganjil');
    setYearStartDate('2025-07-14');
    setYearEndDate('2025-12-19');
    setYearHariEfektif(110);
    setYearKeterangan('Semester Baru Kalender Pendidikan UPT SMPN 1 Suppa');
    setYearStatus('Rencana');
    setShowAddYearModal(true);
  };

  const handleSaveYear = (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = `${yearTahun} ${yearSemester}`;
    if (editingYear) {
      if (onUpdateAcademicYear) {
        onUpdateAcademicYear({
          ...editingYear,
          tahun: yearTahun,
          semester: yearSemester,
          name: fullName,
          startDate: yearStartDate,
          endDate: yearEndDate,
          totalHariEfektif: yearHariEfektif,
          keterangan: yearKeterangan,
          status: yearStatus
        });
      }
      setEditingYear(null);
    } else {
      if (onAddAcademicYear) {
        const newAY: AcademicYear = {
          id: `AY_${Date.now()}`,
          tahun: yearTahun,
          semester: yearSemester,
          name: fullName,
          startDate: yearStartDate,
          endDate: yearEndDate,
          isActive: false,
          status: yearStatus,
          keterangan: yearKeterangan,
          totalHariEfektif: yearHariEfektif
        };
        onAddAcademicYear(newAY);
      }
      setShowAddYearModal(false);
    }
  };

  const handleSyncTrigger = () => {
    setSyncStatus('syncing');
    setTimeout(() => {
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }, 1200);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim()) return;
    const newUser = {
      id: `USR_${Date.now()}`,
      username: newUsername || newFullName.toLowerCase().replace(/[^a-z0-9]/g, '.'),
      namaLengkap: newFullName,
      nip: newNip || '198001012005011001',
      role: newRole,
      roleScope: `${newRole} Binaan Baru`,
      status: 'Aktif',
      lastLogin: 'Belum pernah login'
    };
    setUsers([newUser, ...users]);
    setShowAddUserModal(false);
    setNewFullName('');
    setNewUsername('');
    setNewNip('');
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = u.namaLengkap.toLowerCase().includes(searchUser.toLowerCase()) ||
                        u.username.toLowerCase().includes(searchUser.toLowerCase()) ||
                        u.nip.includes(searchUser);
    const matchRole = roleFilter === 'Semua' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      {/* Header section matching pengaturan.png */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-[#1E4FD8] uppercase tracking-wider">
            Akses Tingkat: Administrator Sistem
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-0.5">
            Pengaturan & Konfigurasi Master Data
          </h1>
          <p className="text-xs text-gray-500">
            Kelola pengguna aplikasi, master guru, tahun ajaran, dan status penyimpanan Google Drive
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            type="button" 
            className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
          >
            <Clock className="w-4 h-4 text-gray-500" />
            <span>Log Audit</span>
          </button>
          <button 
            type="button" 
            onClick={handleSyncTrigger}
            disabled={syncStatus === 'syncing'}
            className="px-4 py-2 bg-[#1E4FD8] hover:bg-[#1A42B8] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition disabled:opacity-70"
          >
            <RefreshCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
            <span>{syncStatus === 'syncing' ? 'Menyinkronkan...' : syncStatus === 'success' ? 'Tersinkron!' : 'Sinkronisasi GAS'}</span>
          </button>
        </div>
      </div>

      {/* Secondary Navigation Tabs matching pengaturan.png */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveSubTab('akun')}
          className={`px-4 py-2.5 text-xs font-semibold transition border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'akun'
              ? 'border-[#1E4FD8] text-[#1E4FD8]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Akun Pengguna</span>
        </button>
        <button
          onClick={() => setActiveSubTab('master_guru')}
          className={`px-4 py-2.5 text-xs font-semibold transition border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'master_guru'
              ? 'border-[#1E4FD8] text-[#1E4FD8]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Master Guru & Walas</span>
        </button>
        <button
          onClick={() => setActiveSubTab('tahun_ajaran')}
          className={`px-4 py-2.5 text-xs font-semibold transition border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'tahun_ajaran'
              ? 'border-[#1E4FD8] text-[#1E4FD8]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Tahun Ajaran</span>
        </button>
        <button
          onClick={() => setActiveSubTab('kategori')}
          className={`px-4 py-2.5 text-xs font-semibold transition border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'kategori'
              ? 'border-[#1E4FD8] text-[#1E4FD8]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Kategori Pendampingan</span>
        </button>
        <button
          onClick={() => setActiveSubTab('spreadsheet')}
          className={`px-4 py-2.5 text-xs font-semibold transition border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'spreadsheet'
              ? 'border-[#1E4FD8] text-[#1E4FD8]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Integrasi Spreadsheet</span>
        </button>
        <button
          onClick={() => setActiveSubTab('tema')}
          className={`px-4 py-2.5 text-xs font-semibold transition border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'tema'
              ? 'border-[#1E4FD8] text-[#1E4FD8]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Tema & Tampilan</span>
        </button>
      </div>

      {/* 3 Infrastructure KPI Cards matching pengaturan.png */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Google Drive */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              GOOGLE DRIVE (BERKAS SISWA)
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1E4FD8] flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            1.2 GB <span className="text-xs font-normal text-gray-400">/ 15 GB</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Status Optimal (Tersisa 13.8 GB)</span>
          </div>
        </div>

        {/* Card 2: Database Sheets */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              DATABASE SHEETS (BARIS AKTIF)
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            4,210 <span className="text-xs font-normal text-gray-400">/ 10,000</span>
          </div>
          <div className="text-[11px] text-[#1E4FD8] font-medium mt-1">
            Kinerja baca/tulis normal
          </div>
        </div>

        {/* Card 3: Trigger Cron Otomatis */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                TRIGGER CRON OTOMATIS
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-[#0D9488] mt-2">
              06:00 WITA
            </div>
          </div>
          <button 
            type="button" 
            onClick={handleSyncTrigger}
            className="mt-2 w-full py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 transition"
          >
            Uji Trigger Sekarang
          </button>
        </div>
      </div>

      {/* Main Content Area based on Tab */}
      {activeSubTab === 'akun' && (
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
          {/* Table Header & Controls */}
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-gray-900">Manajemen Akun Pengguna</h3>
              <p className="text-xs text-gray-500">Daftar akun pendidik, pembina guru wali, dan administrator sistem</p>
            </div>

            <div className="flex items-center gap-2">
              <button 
                type="button" 
                onClick={() => setShowAddUserModal(true)}
                className="px-3.5 py-2 bg-[#1E4FD8] hover:bg-[#1A42B8] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Akun</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="p-4 bg-gray-50/60 border-b border-gray-100 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari username, nama lengkap, atau NIP..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:border-[#1E4FD8] outline-none transition"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl font-medium text-gray-700 outline-none focus:border-[#1E4FD8]"
            >
              <option value="Semua">Semua Hak Akses</option>
              <option value="Guru Wali">Guru Wali</option>
              <option value="Wali Kelas">Wali Kelas</option>
              <option value="Administrator">Administrator</option>
              <option value="Kepala Sekolah">Kepala Sekolah</option>
              <option value="Guru BK">Guru BK</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="p-3.5">Pengguna & Akun</th>
                  <th className="p-3.5">Nama Lengkap & NIP</th>
                  <th className="p-3.5">Hak Akses / Peran</th>
                  <th className="p-3.5">Cakupan Wilayah</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Terakhir Login</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/70 transition">
                    <td className="p-3.5 font-bold text-gray-900">
                      <div className="font-mono">{u.username}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-gray-900">{u.namaLengkap}</div>
                      <div className="text-[11px] text-gray-400 font-mono mt-0.5">{u.nip}</div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        u.role === 'Administrator' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'Kepala Sekolah' ? 'bg-indigo-100 text-indigo-700' :
                        u.role === 'Wali Kelas' ? 'bg-teal-100 text-teal-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-gray-600">{u.roleScope}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                        ● {u.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-gray-500">{u.lastLogin}</td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <button 
                        type="button"
                        className="px-2.5 py-1 text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-lg font-medium transition"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Master Guru */}
      {activeSubTab === 'master_guru' && (
        <div className="bg-white rounded-2xl border border-gray-200/90 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Master Data Tenaga Pendidik & Kependidikan</h3>
            <span className="text-xs text-gray-500">{teachers.length} Guru Terdata</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {teachers.map((t) => (
              <div key={t.id} className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs text-gray-900">{t.name}</div>
                  <div className="text-[10px] text-gray-500 font-mono">NIP. {t.nip}</div>
                  <div className="text-[10px] text-[#1E4FD8] font-medium mt-1">{t.role} {t.classBinaan ? `• ${t.classBinaan}` : ''}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Tahun Ajaran (Manajemen Penuh) */}
      {activeSubTab === 'tahun_ajaran' && (
        <div className="space-y-5">
          {/* Subtab Header */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold text-[#1E4FD8] uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>KALENDER AKADEMIK &amp; PERIODE PERWALIAN</span>
              </div>
              <h3 className="text-base font-bold text-gray-900 mt-1">Konfigurasi Kalender &amp; Tahun Ajaran</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Atur tahun pelajaran berjalan, tanggal pembukaan semester, target hari efektif belajar, dan arsip riwayat pembinaan.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddYear}
              className="px-4 py-2 bg-[#1E4FD8] hover:bg-[#1A42B8] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Buka Tahun Ajaran Baru</span>
            </button>
          </div>

          {/* Active Period Highlight Banner */}
          <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[9px] uppercase tracking-wider">
                    PERIODE AKTIF SAAT INI
                  </span>
                  <span className="text-xs text-emerald-800 font-semibold">Tersinkronisasi ke Seluruh Modul</span>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mt-1">
                  Tahun Ajaran {activeAcademicYear}
                </h4>
                <p className="text-xs text-gray-600 mt-0.5">
                  Seluruh pencatatan pertemuan bimbingan, catatan perkembangan, dan cetak dokumen resmi menggunakan periode ini.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right hidden sm:block">
                <div className="text-[10px] text-gray-500 uppercase font-semibold">TARGET EFEKTIF</div>
                <div className="text-base font-bold text-gray-900">
                  {academicYears.find(y => y.name === activeAcademicYear)?.totalHariEfektif || 114} Hari
                </div>
              </div>
            </div>
          </div>

          {/* Table of All Academic Years */}
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wider">
                Daftar Riwayat &amp; Rencana Tahun Ajaran ({academicYears.length})
              </h4>
              <span className="text-xs text-gray-500">Klik "Jadikan Aktif" untuk mengalihkan periode berjalan</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 uppercase text-[10px] font-bold">
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4">Tahun Ajaran &amp; Semester</th>
                    <th className="py-3 px-4">Rentang Tanggal</th>
                    <th className="py-3 px-4 text-center">Hari Efektif</th>
                    <th className="py-3 px-4">Keterangan</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {academicYears.map((ay, idx) => {
                    const isCurrentlyActive = ay.name === activeAcademicYear;
                    return (
                      <tr key={ay.id} className={`hover:bg-gray-50/60 transition ${isCurrentlyActive ? 'bg-emerald-50/20' : ''}`}>
                        <td className="py-3.5 px-4 text-center text-gray-400 font-mono">{idx + 1}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{ay.name}</span>
                            {isCurrentlyActive && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[9px]">
                                Aktif
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-gray-400">Tahun {ay.tahun} • Semester {ay.semester}</div>
                        </td>
                        <td className="py-3.5 px-4 text-gray-700">
                          <div className="flex items-center gap-1.5 font-medium">
                            <span>{ay.startDate}</span>
                            <ArrowRight className="w-3 h-3 text-gray-400" />
                            <span>{ay.endDate}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-gray-800">
                          {ay.totalHariEfektif} Hari
                        </td>
                        <td className="py-3.5 px-4 text-gray-600 max-w-xs truncate">
                          {ay.keterangan || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            isCurrentlyActive ? 'bg-emerald-100 text-emerald-800' :
                            ay.status === 'Arsip' ? 'bg-gray-100 text-gray-600' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {isCurrentlyActive ? 'Aktif Berjalan' : ay.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {!isCurrentlyActive && (
                              <button
                                type="button"
                                onClick={() => onSetActiveAcademicYear && onSetActiveAcademicYear(ay.name)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold transition shadow-2xs"
                                title="Aktifkan tahun ajaran ini ke seluruh sistem"
                              >
                                Aktifkan
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleOpenEditYear(ay)}
                              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                              title="Ubah Data Periode"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {!isCurrentlyActive && (
                              <button
                                type="button"
                                onClick={() => onDeleteAcademicYear && onDeleteAcademicYear(ay.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                                title="Hapus Periode"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal Tambah / Edit Tahun Ajaran */}
          {(showAddYearModal || editingYear) && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                  <div>
                    <h3 className="font-bold text-base text-gray-900">
                      {editingYear ? `Ubah Periode ${editingYear.name}` : 'Buka Tahun Ajaran Baru'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Konfigurasikan rentang semester dan kalender hari efektif belajar.
                    </p>
                  </div>
                  <button 
                    onClick={() => { setShowAddYearModal(false); setEditingYear(null); }}
                    className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveYear} className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Tahun Pelajaran *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: 2025/2026"
                        value={yearTahun}
                        onChange={(e) => setYearTahun(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#1E4FD8]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Semester *</label>
                      <select
                        value={yearSemester}
                        onChange={(e) => setYearSemester(e.target.value as any)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#1E4FD8]"
                      >
                        <option value="Ganjil">Semester Ganjil</option>
                        <option value="Genap">Semester Genap</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Tanggal Mulai *</label>
                      <input
                        type="date"
                        required
                        value={yearStartDate}
                        onChange={(e) => setYearStartDate(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#1E4FD8]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Tanggal Selesai *</label>
                      <input
                        type="date"
                        required
                        value={yearEndDate}
                        onChange={(e) => setYearEndDate(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#1E4FD8]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Hari Efektif Belajar</label>
                      <input
                        type="number"
                        min={30}
                        max={180}
                        value={yearHariEfektif}
                        onChange={(e) => setYearHariEfektif(parseInt(e.target.value) || 110)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#1E4FD8]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Status Periode</label>
                      <select
                        value={yearStatus}
                        onChange={(e) => setYearStatus(e.target.value as any)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#1E4FD8]"
                      >
                        <option value="Rencana">Rencana</option>
                        <option value="Aktif">Aktif</option>
                        <option value="Arsip">Arsip Terkunci</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Keterangan / Agenda Periode</label>
                    <textarea
                      rows={2}
                      placeholder="Catatan kalender, target pembinaan..."
                      value={yearKeterangan}
                      onChange={(e) => setYearKeterangan(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#1E4FD8]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => { setShowAddYearModal(false); setEditingYear(null); }}
                      className="px-4 py-2 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#1E4FD8] hover:bg-[#1A42B8] text-white rounded-xl font-semibold shadow-xs transition"
                    >
                      {editingYear ? 'Simpan Perubahan' : 'Buka Periode'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Kategori Pendampingan */}
      {activeSubTab === 'kategori' && (
        <div className="bg-white rounded-2xl border border-gray-200/90 p-6 shadow-2xs space-y-4">
          <h3 className="text-base font-bold text-gray-900">Kategori Kasus & Aspek Pembinaan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {[
              { name: 'Kehadiran & Absensi', color: 'border-red-300 bg-red-50/30', desc: 'Pemantauan alpa, bolos, dan keterlambatan berulang' },
              { name: 'Akademik & Tugas', color: 'border-blue-300 bg-blue-50/30', desc: 'Penurunan nilai, kesulitan belajar, remedi' },
              { name: 'Kedisiplinan & Tata Tertib', color: 'border-amber-300 bg-amber-50/30', desc: 'Seragam, kepatuhan aturan, atribut' },
              { name: 'Sosial & Emosional', color: 'border-teal-300 bg-teal-50/30', desc: 'Interaksi teman sebaya, bullying, motivasi' },
              { name: 'Prestasi & Bakat', color: 'border-purple-300 bg-purple-50/30', desc: 'Lomba akademik, seni, olahraga, OSN' }
            ].map(k => (
              <div key={k.name} className={`p-4 rounded-xl border ${k.color}`}>
                <div className="font-bold text-gray-900">{k.name}</div>
                <div className="text-gray-600 mt-1 text-[11px]">{k.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Integrasi Spreadsheet */}
      {activeSubTab === 'spreadsheet' && (
        <div className="bg-white rounded-2xl border border-gray-200/90 p-6 shadow-2xs space-y-4">
          <h3 className="text-base font-bold text-gray-900">Koneksi Google Sheets & Google Apps Script</h3>
          <p className="text-xs text-gray-600">
            Aplikasi terhubung langsung dengan backend Google Apps Script yang menyimpan seluruh data ke dalam Google Spreadsheet sekolah.
          </p>
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Koneksi Google Sheets: AKTIF & TERSINKRONISASI</span>
            </div>
            <div className="text-gray-600">
              Sheet Terdaftar: <code>Siswa</code>, <code>Guru</code>, <code>Pertemuan</code>, <code>Perkembangan</code>, <code>TindakLanjut</code>, <code>Pengaturan</code>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Tema & Tampilan (Light & Dark Mode) */}
      {activeSubTab === 'tema' && (
        <div className="bg-white rounded-2xl border border-gray-200/90 p-6 shadow-2xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Palette className="w-5 h-5 text-[#1E4FD8]" />
              <span>Preferensi Tema & Tampilan Antarmuka</span>
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Pilih tema tampilan yang sesuai dengan preferensi Anda. Pengaturan ini disimpan secara otomatis di peramban Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Option 1: Light Mode (Clean White Sidebar) */}
            <div 
              onClick={() => { if (theme === 'dark' && onToggleTheme) onToggleTheme(); }}
              className={`p-5 rounded-2xl border-2 transition cursor-pointer relative flex flex-col justify-between ${
                theme === 'light' 
                  ? 'border-[#1E4FD8] bg-blue-50/30 shadow-md ring-4 ring-blue-500/10' 
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Sun className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">Mode Terang (Clean White)</h4>
                      <span className="text-[11px] text-gray-500">Sidebar Putih Bersih</span>
                    </div>
                  </div>
                  {theme === 'light' && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#1E4FD8] bg-blue-100/70 px-2.5 py-1 rounded-full">
                      <Check className="w-3.5 h-3.5" />
                      Aktif
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  Sidebar putih bersih modern, kontras teks optimal, dan tata letak elegan. Sangat ideal untuk input data di siang hari dan pratinjau dokumen cetak.
                </p>

                {/* Preview Mini UI */}
                <div className="p-3 bg-gray-100 rounded-xl border border-gray-200 flex gap-2 items-center">
                  <div className="w-16 h-12 bg-white rounded-lg border border-gray-200 p-1 flex flex-col justify-between">
                    <div className="h-1.5 w-6 bg-[#1E4FD8] rounded"></div>
                    <div className="h-1.5 w-10 bg-blue-100 rounded"></div>
                    <div className="h-1.5 w-8 bg-gray-200 rounded"></div>
                  </div>
                  <div className="flex-1 h-12 bg-[#F8FAFC] rounded-lg border border-gray-200 p-1 flex flex-col justify-between">
                    <div className="h-2 w-16 bg-gray-300 rounded"></div>
                    <div className="h-4 w-full bg-white rounded border border-gray-200"></div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (theme === 'dark' && onToggleTheme) onToggleTheme();
                }}
                className={`mt-4 w-full py-2 rounded-xl text-xs font-semibold transition ${
                  theme === 'light'
                    ? 'bg-[#1E4FD8] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {theme === 'light' ? 'Tema Aktif Saat Ini' : 'Terapkan Mode Terang'}
              </button>
            </div>

            {/* Option 2: Dark Mode */}
            <div 
              onClick={() => { if (theme === 'light' && onToggleTheme) onToggleTheme(); }}
              className={`p-5 rounded-2xl border-2 transition cursor-pointer relative flex flex-col justify-between ${
                theme === 'dark' 
                  ? 'border-[#1E4FD8] bg-slate-900/5 shadow-md ring-4 ring-blue-500/10' 
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 text-indigo-400 flex items-center justify-center">
                      <Moon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">Mode Gelap (Dark Navy)</h4>
                      <span className="text-[11px] text-gray-500">Sidebar Biru Dongker</span>
                    </div>
                  </div>
                  {theme === 'dark' && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#1E4FD8] bg-blue-100/70 px-2.5 py-1 rounded-full">
                      <Check className="w-3.5 h-3.5" />
                      Aktif
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  Sidebar bernuansa biru dongker gelap (#0B192C) dengan aksen hijau mint (#6EE7B7). Mengurangi silau layar dan nyaman di mata untuk sesi malam.
                </p>

                {/* Preview Mini UI */}
                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex gap-2 items-center">
                  <div className="w-16 h-12 bg-[#0B192C] rounded-lg border border-slate-700 p-1 flex flex-col justify-between">
                    <div className="h-1.5 w-6 bg-[#1E4FD8] rounded"></div>
                    <div className="h-1.5 w-10 bg-[#6EE7B7]/40 rounded"></div>
                    <div className="h-1.5 w-8 bg-slate-700 rounded"></div>
                  </div>
                  <div className="flex-1 h-12 bg-[#0B1120] rounded-lg border border-slate-700 p-1 flex flex-col justify-between">
                    <div className="h-2 w-16 bg-slate-600 rounded"></div>
                    <div className="h-4 w-full bg-slate-800 rounded border border-slate-700"></div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (theme === 'light' && onToggleTheme) onToggleTheme();
                }}
                className={`mt-4 w-full py-2 rounded-xl text-xs font-semibold transition ${
                  theme === 'dark'
                    ? 'bg-[#1E4FD8] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {theme === 'dark' ? 'Tema Aktif Saat Ini' : 'Terapkan Mode Gelap'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tambah Akun Baru */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <h3 className="font-bold text-base text-gray-900 mb-1">Tambah Akun Pengguna Baru</h3>
            <p className="text-xs text-gray-500 mb-4">
              Buat akun akses untuk Guru Wali, Wali Kelas, atau staf bimbingan.
            </p>

            <form onSubmit={handleAddUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  placeholder="Contoh: Drs. H. Ahmad Dahlan, M.Pd"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#1E4FD8]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">NIP (Nomor Induk Pegawai)</label>
                <input
                  type="text"
                  placeholder="Contoh: 197805122005011004"
                  value={newNip}
                  onChange={(e) => setNewNip(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg font-mono outline-none focus:border-[#1E4FD8]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Username Login *</label>
                <input
                  type="text"
                  placeholder="Contoh: ahmad.dahlan"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg font-mono outline-none focus:border-[#1E4FD8]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Peran / Hak Akses</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#1E4FD8]"
                >
                  <option value="Guru Wali">Guru Wali</option>
                  <option value="Wali Kelas">Wali Kelas</option>
                  <option value="Kepala Sekolah">Kepala Sekolah</option>
                  <option value="Administrator">Administrator</option>
                  <option value="Guru BK">Guru BK</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1E4FD8] hover:bg-[#1A42B8] text-white rounded-lg font-semibold shadow-xs transition"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
