import React, { useState } from 'react';
import { 
  Users, UserPlus, Upload, Download, Search, Filter, 
  FileSpreadsheet, ShieldCheck, Mail, Phone, GraduationCap, X, Check,
  Trash2, Eye, Edit3, UserCheck, Briefcase
} from 'lucide-react';
import { Teacher } from '../types';
import { exportTeachersToExcel, downloadTeacherTemplate } from '../utils/excelHelper';
import { ConfirmationModal } from './ConfirmationModal';

interface TeacherManagementProps {
  teachers: Teacher[];
  onAddTeacher: (teacher: Teacher) => void;
  onUpdateTeacher?: (teacher: Teacher) => void;
  onDeleteTeacher?: (id: string) => void;
  onOpenImportModal: () => void;
}

export const TeacherManagement: React.FC<TeacherManagementProps> = ({
  teachers,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  onOpenImportModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [nip, setNip] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Guru Wali' | 'Guru BK' | 'Kepala Sekolah' | 'Administrator'>('Guru Wali');
  const [classBinaan, setClassBinaan] = useState('Lintas Kelas (VII & VIII)');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Confirmation Alert States
  const [confirmAddOpen, setConfirmAddOpen] = useState(false);
  const [confirmDeleteTeacher, setConfirmDeleteTeacher] = useState<Teacher | null>(null);

  // View & Edit GTK States
  const [selectedTeacherForView, setSelectedTeacherForView] = useState<Teacher | null>(null);
  const [selectedTeacherForEdit, setSelectedTeacherForEdit] = useState<Teacher | null>(null);
  const [editNip, setEditNip] = useState('');
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<'Guru Wali' | 'Guru BK' | 'Kepala Sekolah' | 'Administrator'>('Guru Wali');
  const [editClassBinaan, setEditClassBinaan] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editStatus, setEditStatus] = useState<'Aktif' | 'Cuti'>('Aktif');
  const [editTotalStudents, setEditTotalStudents] = useState<number>(0);

  const openEditModal = (t: Teacher) => {
    setSelectedTeacherForEdit(t);
    setEditNip(t.nip);
    setEditName(t.name);
    setEditRole(t.role);
    setEditClassBinaan(t.classBinaan);
    setEditPhone(t.phone);
    setEditEmail(t.email);
    setEditStatus(t.status);
    setEditTotalStudents(t.totalStudents);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherForEdit) return;
    const updated: Teacher = {
      ...selectedTeacherForEdit,
      nip: editNip,
      name: editName,
      role: editRole,
      classBinaan: editClassBinaan,
      phone: editPhone,
      email: editEmail,
      status: editStatus,
      totalStudents: editTotalStudents
    };
    if (onUpdateTeacher) {
      onUpdateTeacher(updated);
    }
    setSelectedTeacherForEdit(null);
  };

  const filteredTeachers = teachers.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        t.nip.includes(searchQuery) || 
                        t.classBinaan.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = !roleFilter || t.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nip || !name) return;
    setConfirmAddOpen(true);
  };

  const handleConfirmSave = () => {
    const newTeacher: Teacher = {
      id: `GUR_${Date.now()}`,
      nip,
      name,
      role,
      classBinaan,
      totalStudents: 15,
      phone: phone || '0812-0000-0000',
      email: email || `${name.toLowerCase().replace(/[^a-z]/g, '')}@smpn1suppa.sch.id`,
      status: 'Aktif'
    };

    onAddTeacher(newTeacher);
    setConfirmAddOpen(false);
    setShowAddModal(false);
    setNip('');
    setName('');
    setPhone('');
    setEmail('');
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteTeacher && onDeleteTeacher) {
      onDeleteTeacher(confirmDeleteTeacher.id);
    }
    setConfirmDeleteTeacher(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Main Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>PANGKALAN DATA PEGAWAI & GURU PEMBINA</span>
          </div>
          <h1 className="text-2xl font-bold">Data Guru & Tenaga Kependidikan</h1>
          <p className="text-xs text-gray-500">
            Manajemen akun pembina, Guru Wali, dan Pimpinan UPT SMP Negeri 1 Suppa.
          </p>
        </div>

        {/* Action Buttons: Import, Template, Export, Add Teacher */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => downloadTeacherTemplate()}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
            title="Unduh Format Excel untuk pengisian data guru"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Template GTK (.xlsx)</span>
          </button>

          <button
            onClick={() => exportTeachersToExcel(teachers)}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
          >
            <Download className="w-4 h-4 text-gray-700" />
            <span>Ekspor Excel</span>
          </button>

          <button
            onClick={onOpenImportModal}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
          >
            <Upload className="w-4 h-4" />
            <span>Import Excel GTK</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah GTK Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase">Total Guru & GTK</span>
          <div className="text-2xl font-bold text-gray-900 mt-1">{teachers.length}</div>
          <span className="text-[10px] text-emerald-600 font-medium">100% Terdaftar di Sistem</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase">Guru Wali Aktif</span>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {teachers.filter(t => t.role === 'Guru Wali').length}
          </div>
          <span className="text-[10px] text-gray-500">Membina Lintas Kelas</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase">Pimpinan Satdik</span>
          <div className="text-2xl font-bold text-purple-700 mt-1">
            {teachers.filter(t => t.role === 'Kepala Sekolah').length}
          </div>
          <span className="text-[10px] text-gray-500">Monitoring Holistik</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase">Status Keaktifan</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">100%</div>
          <span className="text-[10px] text-emerald-600 font-medium">Semua Akun Aktif</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Cari nama GTK, NIP, atau rombel binaan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-400 outline-none transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-gray-400 font-medium text-gray-800"
          >
            <option value="">Semua Peran GTK</option>
            <option value="Guru Wali">Guru Wali</option>
            <option value="Kepala Sekolah">Kepala Sekolah</option>
            <option value="Administrator">Administrator</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="p-3.5">NIP & Identitas</th>
                <th className="p-3.5">Peran / Jabatan</th>
                <th className="p-3.5">Rombel / Wilayah Binaan</th>
                <th className="p-3.5">Siswa Binaan</th>
                <th className="p-3.5">Kontak WhatsApp & Email</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTeachers.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition">
                  <td className="p-3.5">
                    <div className="font-bold text-gray-900">{t.name}</div>
                    <div className="text-[11px] text-gray-500 font-mono mt-0.5">NIP: {t.nip}</div>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-full font-semibold text-[11px] inline-block ${
                      t.role === 'Guru Wali' ? 'bg-blue-100 text-[#1E4FD8]' :
                      t.role === 'Kepala Sekolah' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {t.role}
                    </span>
                  </td>
                  <td className="p-3.5 font-medium text-gray-700">{t.classBinaan}</td>
                  <td className="p-3.5">
                    <span className="font-bold text-gray-900">{t.totalStudents}</span>
                    <span className="text-gray-500 text-[10px] ml-1">Siswa</span>
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <Phone className="w-3 h-3 text-emerald-600" />
                      <span>{t.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 text-[10px] mt-0.5">
                      <Mail className="w-3 h-3 text-blue-500" />
                      <span>{t.email}</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-semibold text-[10px]">
                      {t.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedTeacherForView(t)}
                        className="px-2.5 py-1 text-xs bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg font-medium transition shadow-2xs flex items-center gap-1"
                        title="Lihat Detail GTK"
                      >
                        <Eye className="w-3.5 h-3.5 text-gray-500" />
                        <span>Lihat</span>
                      </button>
                      <button
                        onClick={() => openEditModal(t)}
                        className="px-2.5 py-1 text-xs bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-lg font-medium transition shadow-2xs flex items-center gap-1"
                        title="Edit Data GTK"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => setConfirmDeleteTeacher(t)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                        title="Hapus Data GTK"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah GTK Manual */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-bold text-base text-gray-900 font-['Poppins']">
                Tambah Guru & Tenaga Kependidikan Baru
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">NIP (Nomor Induk Pegawai)</label>
                <input
                  type="text"
                  placeholder="Contoh: 198506142010011005"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg font-mono outline-none focus:border-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  placeholder="Contoh: Hasnah, S.Pd., M.Pd"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-gray-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Peran / Jabatan</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-gray-400"
                  >
                    <option value="Guru Wali">Guru Wali</option>
                    <option value="Kepala Sekolah">Kepala Sekolah</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Wilayah / Rombel Binaan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Lintas Rombel (VII & VIII)"
                    value={classBinaan}
                    onChange={(e) => setClassBinaan(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-gray-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Nomor WhatsApp Aktif</label>
                  <input
                    type="text"
                    placeholder="Contoh: 0812-4455-6677"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Pos-el (Email)</label>
                  <input
                    type="email"
                    placeholder="Contoh: guru@smpn1suppa.sch.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-gray-400"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl font-semibold shadow-xs transition flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan GTK</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Lihat Detail GTK */}
      {selectedTeacherForView && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 font-['Poppins']">
                    Detail Data Pegawai / GTK
                  </h3>
                  <p className="text-xs text-gray-500">Pangkalan Data UPT SMPN 1 Suppa</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTeacherForView(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                <div>
                  <span className="text-gray-400 text-[10px] uppercase font-semibold block">Nama Lengkap & Gelar</span>
                  <p className="font-bold text-gray-900 text-sm">{selectedTeacherForView.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-200/60">
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-semibold block">NIP</span>
                    <p className="font-mono text-gray-700 font-semibold">{selectedTeacherForView.nip}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-semibold block">Peran / Jabatan</span>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md font-semibold text-[11px] bg-blue-100 text-blue-800">
                      {selectedTeacherForView.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-400 text-[10px] uppercase font-semibold block">Wilayah / Binaan</span>
                  <p className="font-semibold text-gray-800 mt-1">{selectedTeacherForView.classBinaan}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-400 text-[10px] uppercase font-semibold block">Total Siswa Binaan</span>
                  <p className="font-bold text-gray-900 text-base mt-0.5">
                    {selectedTeacherForView.totalStudents} <span className="text-xs font-normal text-gray-500">Siswa</span>
                  </p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                <div>
                  <span className="text-gray-400 text-[10px] uppercase font-semibold block">Nomor WhatsApp Aktif</span>
                  <p className="font-medium text-gray-800 flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{selectedTeacherForView.phone}</span>
                  </p>
                </div>
                <div className="pt-2 border-t border-gray-200/60">
                  <span className="text-gray-400 text-[10px] uppercase font-semibold block">Email Resmi</span>
                  <p className="font-medium text-gray-800 flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    <span>{selectedTeacherForView.email}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                <span className="text-emerald-800 font-semibold">Status Kepegawaian</span>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[11px]">
                  {selectedTeacherForView.status}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  const t = selectedTeacherForView;
                  setSelectedTeacherForView(null);
                  openEditModal(t);
                }}
                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Data Ini</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedTeacherForView(null)}
                className="px-4 py-2 bg-gray-900 hover:bg-black text-white font-semibold rounded-xl text-xs transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit GTK */}
      {selectedTeacherForEdit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-gray-900 font-['Poppins']">
                  Edit Data Guru & Tenaga Kependidikan
                </h3>
              </div>
              <button 
                onClick={() => setSelectedTeacherForEdit(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">NIP (Nomor Induk Pegawai)</label>
                <input
                  type="text"
                  value={editNip}
                  onChange={(e) => setEditNip(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg font-mono outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-indigo-500 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Peran / Jabatan</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as any)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-indigo-500 font-medium"
                  >
                    <option value="Guru Wali">Guru Wali</option>
                    <option value="Guru BK">Guru BK</option>
                    <option value="Kepala Sekolah">Kepala Sekolah</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Status Kepegawaian</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-indigo-500 font-medium"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Cuti">Cuti</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Wilayah / Rombel Binaan</label>
                  <input
                    type="text"
                    value={editClassBinaan}
                    onChange={(e) => setEditClassBinaan(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Total Siswa Binaan</label>
                  <input
                    type="number"
                    value={editTotalStudents}
                    onChange={(e) => setEditTotalStudents(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Nomor WhatsApp Aktif</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Pos-el (Email)</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTeacherForEdit(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs transition flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Alert Konfirmasi Tambah GTK */}
      <ConfirmationModal
        isOpen={confirmAddOpen}
        type="create"
        title="Konfirmasi Tambah Guru & Tenaga Kependidikan"
        message="Apakah Anda yakin data GTK berikut sudah lengkap dan siap disimpan ke sistem?"
        itemName={`${name} (NIP: ${nip}) - Jabatan: ${role}`}
        confirmLabel="Ya, Simpan GTK"
        onConfirm={handleConfirmSave}
        onCancel={() => setConfirmAddOpen(false)}
      />

      {/* Alert Konfirmasi Hapus GTK */}
      <ConfirmationModal
        isOpen={!!confirmDeleteTeacher}
        type="delete"
        title="Konfirmasi Hapus Data GTK"
        message="Apakah Anda yakin ingin menghapus data GTK ini dari sistem? Tindakan ini bersifat permanen."
        itemName={confirmDeleteTeacher ? `${confirmDeleteTeacher.name} (NIP: ${confirmDeleteTeacher.nip})` : undefined}
        confirmLabel="Ya, Hapus GTK"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteTeacher(null)}
      />
    </div>
  );
};
