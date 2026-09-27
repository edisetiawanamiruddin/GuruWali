import React, { useState, useMemo, useRef } from 'react';
import { 
  Users, UserCheck, Plus, Upload, Download, Search, Filter, 
  CheckSquare, Square, Trash2, Check, AlertCircle, FileSpreadsheet,
  Layers, ArrowRight, ShieldCheck, UserPlus, X, HelpCircle
} from 'lucide-react';
import { Student, Teacher } from '../types';
import * as XLSX from 'xlsx';
import { ConfirmationModal } from './ConfirmationModal';

interface GuruWaliAssignmentViewProps {
  students: Student[];
  teachers: Teacher[];
  onUpdateStudents: (updatedStudents: Student[]) => void;
}

export const GuruWaliAssignmentView: React.FC<GuruWaliAssignmentViewProps> = ({
  students,
  teachers,
  onUpdateStudents
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState('');
  
  // Modal State for Manual Multi-Select Assignment
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignTeacherName, setAssignTeacherName] = useState<string>('');
  const [modalClassFilter, setModalClassFilter] = useState<string>('');
  const [modalSearchStudent, setModalSearchStudent] = useState<string>('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [onlyUnassigned, setOnlyUnassigned] = useState(false);

  // Modal State for Import Assignment
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Confirmation Modal for Unassigning Student
  const [unassignTarget, setUnassignTarget] = useState<{
    isOpen: boolean;
    student: Student | null;
    teacherName: string;
  }>({
    isOpen: false,
    student: null,
    teacherName: ''
  });

  // Filter list of Guru Wali only
  const guruWaliList = useMemo(() => {
    return teachers.filter(t => t.role === 'Guru Wali');
  }, [teachers]);

  // Unique Classes
  const classList = useMemo(() => {
    return Array.from(new Set(students.map(s => s.class))).sort();
  }, [students]);

  // Overall Statistics
  const totalAssigned = students.filter(s => s.guruWali && s.guruWali.trim() !== '').length;
  const totalUnassigned = students.length - totalAssigned;

  // Filtered students for modal multi-select
  const eligibleStudentsForModal = useMemo(() => {
    return students.filter(s => {
      const matchClass = !modalClassFilter || s.class === modalClassFilter;
      const matchSearch = !modalSearchStudent || 
        s.name.toLowerCase().includes(modalSearchStudent.toLowerCase()) || 
        s.nis.includes(modalSearchStudent);
      const matchUnassigned = !onlyUnassigned || !s.guruWali || s.guruWali.trim() === '';
      return matchClass && matchSearch && matchUnassigned;
    });
  }, [students, modalClassFilter, modalSearchStudent, onlyUnassigned]);

  // Handle manual multi-select toggle
  const toggleStudentSelection = (id: string) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter(item => item !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const toggleSelectAllInModal = () => {
    if (selectedStudentIds.length === eligibleStudentsForModal.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(eligibleStudentsForModal.map(s => s.id));
    }
  };

  // Commit Manual Assignment
  const handleSaveManualAssignment = () => {
    if (!assignTeacherName || selectedStudentIds.length === 0) return;

    const updated = students.map(s => {
      if (selectedStudentIds.includes(s.id)) {
        return {
          ...s,
          guruWali: assignTeacherName
        };
      }
      return s;
    });

    onUpdateStudents(updated);
    setShowAssignModal(false);
    setSelectedStudentIds([]);
  };

  // Remove assignment for a specific student
  const handleUnassignStudent = (studentId: string) => {
    const updated = students.map(s => {
      if (s.id === studentId) {
        return { ...s, guruWali: '' };
      }
      return s;
    });
    onUpdateStudents(updated);
  };

  // Export Assignment Table to Excel
  const handleExportAssignmentExcel = () => {
    const exportRows = students.map((s, idx) => ({
      No: idx + 1,
      NIS: s.nis,
      NISN: s.nisn,
      'Nama Siswa': s.name,
      Kelas: s.class,
      'Status Pembinaan': s.status,
      'Guru Wali Pembina': s.guruWali || 'Belum Ditugaskan',
      'Kontak Ortu': s.phone
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Penugasan_Guru_Wali');
    XLSX.writeFile(workbook, `Pemetaan_Penugasan_Guru_Wali_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  // Download Assignment Template
  const handleDownloadTemplate = () => {
    const templateRows = [
      {
        NIS_Siswa: '23801',
        Nama_Siswa: 'Muhammad Fajar',
        Kelas: 'Kelas VIII-B',
        Nama_Guru_Wali: 'Drs. H. Ahmad Dahlan, M.Pd'
      },
      {
        NIS_Siswa: '23803',
        Nama_Siswa: 'Andi Tenri Olle',
        Kelas: 'Kelas VIII-A',
        Nama_Guru_Wali: 'Drs. H. Ahmad Dahlan, M.Pd'
      },
      {
        NIS_Siswa: '23807',
        Nama_Siswa: 'Putri Ayu Wandira',
        Kelas: 'Kelas VII-B',
        Nama_Guru_Wali: 'Hasnah, S.Pd'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template_Penugasan');
    XLSX.writeFile(wb, 'template_penugasan_guru_wali.xlsx');
  };

  // Handle File Upload for Import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportError('');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const json = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (json.length === 0) {
          setImportError('Berkas Excel kosong atau header kolom tidak sesuai template.');
        } else {
          setImportPreview(json);
        }
      } catch (err) {
        setImportError('Format berkas tidak terbaca. Harap gunakan format .xlsx atau .csv.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Commit Imported Assignment
  const handleCommitImport = () => {
    if (importPreview.length === 0) return;

    const updated = [...students];
    importPreview.forEach((row: any) => {
      const nis = String(row['NIS_Siswa'] || row['NIS'] || '').trim();
      const guruName = String(row['Nama_Guru_Wali'] || row['Guru_Wali'] || '').trim();

      if (nis && guruName) {
        const studentIndex = updated.findIndex(s => s.nis === nis);
        if (studentIndex >= 0) {
          updated[studentIndex] = {
            ...updated[studentIndex],
            guruWali: guruName
          };
        }
      }
    });

    onUpdateStudents(updated);
    setShowImportModal(false);
    setImportFile(null);
    setImportPreview([]);
  };

  return (
    <div className="space-y-6 font-['Poppins']">
      {/* Header & Main Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>MANAJEMEN PEMETAAN SISWA BINAAN LINTAS KELAS</span>
          </div>
          <h1 className="text-2xl font-bold">Penugasan Guru Wali</h1>
          <p className="text-xs text-gray-500">
            Petakan siswa binaan ke Guru Wali lintas rombel/tingkatan dengan checklist multi-select atau import Excel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportAssignmentExcel}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Ekspor Pemetaan (.xlsx)</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
          >
            <Upload className="w-4 h-4" />
            <span>Import Penugasan Excel</span>
          </button>

          <button
            onClick={() => {
              if (guruWaliList.length > 0) {
                setAssignTeacherName(guruWaliList[0].name);
              }
              setShowAssignModal(true);
            }}
            className="px-3.5 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Penugasan Manual</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase">Guru Wali Aktif</span>
          <div className="text-2xl font-bold text-gray-900 mt-1">{guruWaliList.length} Pembina</div>
          <span className="text-[10px] text-gray-400">Lintas Rombel</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase">Total Siswa Binaan</span>
          <div className="text-2xl font-bold text-gray-900 mt-1">{students.length} Siswa</div>
          <span className="text-[10px] text-gray-400">Seluruh Tingkatan</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase">Sudah Ditugaskan</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{totalAssigned} Siswa</div>
          <span className="text-[10px] text-emerald-600 font-medium">
            {((totalAssigned / students.length) * 100).toFixed(0)}% Terpetakan
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase">Belum Ditugaskan</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">{totalUnassigned} Siswa</div>
          <span className="text-[10px] text-amber-600 font-medium">Perlu Pemetaan Segera</span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Cari nama Guru Wali, siswa binaan, atau NIS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-400 outline-none transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select 
            value={selectedTeacherFilter}
            onChange={(e) => setSelectedTeacherFilter(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-gray-400 font-medium text-gray-800"
          >
            <option value="">Semua Guru Wali</option>
            {guruWaliList.map(t => (
              <option key={t.id} value={t.name}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Guru Wali Cards with Multi-Class Assigned Students */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {guruWaliList
          .filter(t => !selectedTeacherFilter || t.name === selectedTeacherFilter)
          .map(teacher => {
            // Find all students assigned to this teacher
            const assignedStudents = students.filter(s => s.guruWali === teacher.name);
            
            // Group students by class
            const classesRepresented = Array.from(new Set(assignedStudents.map(s => s.class)));

            return (
              <div key={teacher.id} className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden flex flex-col justify-between">
                {/* Card Header */}
                <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-900 text-white flex items-center justify-center font-bold text-base shadow-xs">
                        {teacher.name.split(' ').map(n=>n[0]).slice(0,2).join('')}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-gray-900">{teacher.name}</h3>
                        <p className="text-[11px] text-gray-500 font-mono">NIP: {teacher.nip}</p>
                        <p className="text-xs text-gray-700 font-medium mt-0.5">
                          Total Binaan: <strong>{assignedStudents.length} Siswa</strong>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setAssignTeacherName(teacher.name);
                        setShowAssignModal(true);
                      }}
                      className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 rounded-xl text-xs font-semibold flex items-center gap-1 transition shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Siswa</span>
                    </button>
                  </div>

                  {/* Badges of classes served by this teacher */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-gray-100 text-[11px]">
                    <span className="text-gray-500 font-medium">Sebaran Kelas:</span>
                    {classesRepresented.length > 0 ? (
                      classesRepresented.map(cls => {
                        const countInClass = assignedStudents.filter(s => s.class === cls).length;
                        return (
                          <span key={cls} className="px-2 py-0.5 bg-white border border-gray-200 rounded-md font-semibold text-gray-700">
                            {cls} ({countInClass})
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-amber-600 italic">Belum ada siswa yang dipetakan</span>
                    )}
                  </div>
                </div>

                {/* Assigned Students List */}
                <div className="p-4 flex-1 divide-y divide-gray-100 max-h-72 overflow-y-auto">
                  {assignedStudents.length > 0 ? (
                    assignedStudents.map((s, idx) => (
                      <div key={s.id} className="py-2.5 flex items-center justify-between text-xs hover:bg-gray-50/80 px-2 rounded-lg transition">
                        <div className="flex items-center gap-2.5">
                          <span className="text-gray-400 font-mono text-[11px] w-5">{idx + 1}.</span>
                          <div>
                            <div className="font-semibold text-gray-900">{s.name}</div>
                            <div className="text-[10px] text-gray-500 font-mono">
                              NIS: {s.nis} • <strong>{s.class}</strong>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            s.status === 'Kritis' ? 'bg-red-100 text-red-700' :
                            s.status === 'Prestasi' ? 'bg-purple-100 text-purple-700' :
                            s.status === 'Perlu Perhatian' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {s.status}
                          </span>
                          <button
                            onClick={() => setUnassignTarget({
                              isOpen: true,
                              student: s,
                              teacherName: teacher.name
                            })}
                            className="p-1 text-gray-400 hover:text-red-600 rounded transition"
                            title="Lepas Siswa dari Binaan Guru Wali ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs text-gray-400 italic">
                      Guru Wali ini belum memiliki siswa binaan. Klik tombol &quot;Tambah Siswa&quot; untuk memilih siswa.
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="p-3 bg-gray-50 border-t border-gray-100 text-[11px] text-gray-500 flex justify-between items-center">
                  <span>Kontak: {teacher.phone}</span>
                  <span className="text-emerald-700 font-medium">Status Akun Aktif</span>
                </div>
              </div>
            );
          })}
      </div>

      {/* ================= MODAL 1: TAMBAH PENUGASAN MANUAL (CHECKLIST MULTI-SELECT) ================= */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-base text-gray-900 font-['Poppins']">
                  Penugasan Siswa Binaan Manual (Ceklist Multi-Siswa)
                </h3>
                <p className="text-xs text-gray-500">
                  Pilih Guru Wali dan centang siswa dari satu atau beberapa kelas sekaligus.
                </p>
              </div>
              <button 
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Filters */}
            <div className="py-4 space-y-3 flex-1 overflow-y-auto">
              {/* Select Target Teacher */}
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                <label className="block text-xs font-bold text-gray-800 uppercase mb-1">
                  Pilih Guru Wali Penerima Tugas
                </label>
                <select
                  value={assignTeacherName}
                  onChange={(e) => setAssignTeacherName(e.target.value)}
                  className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 outline-none focus:border-gray-400"
                >
                  {guruWaliList.map(t => (
                    <option key={t.id} value={t.name}>
                      {t.name} (NIP: {t.nip})
                    </option>
                  ))}
                </select>
              </div>

              {/* Class Filter & Quick Search inside modal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Filter Tingkat Kelas</label>
                  <select
                    value={modalClassFilter}
                    onChange={(e) => setModalClassFilter(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-gray-400"
                  >
                    <option value="">Semua Kelas ({students.length} Siswa)</option>
                    {classList.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Cari Nama Siswa / NIS</label>
                  <input
                    type="text"
                    placeholder="Ketik nama atau NIS..."
                    value={modalSearchStudent}
                    onChange={(e) => setModalSearchStudent(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-gray-400"
                  />
                </div>
              </div>

              {/* Toggle Only Unassigned */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 select-none">
                  <input
                    type="checkbox"
                    checked={onlyUnassigned}
                    onChange={(e) => setOnlyUnassigned(e.target.checked)}
                    className="rounded text-gray-900"
                  />
                  <span>Hanya tampilkan siswa yang belum memiliki Guru Wali</span>
                </label>

                <button
                  type="button"
                  onClick={toggleSelectAllInModal}
                  className="text-xs text-gray-800 font-semibold hover:underline"
                >
                  {selectedStudentIds.length === eligibleStudentsForModal.length ? 'Batal Centang Semua' : 'Centang Semua'}
                </button>
              </div>

              {/* Students Multi-Select Table */}
              <div className="border border-gray-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-100 text-gray-600 font-semibold sticky top-0">
                    <tr>
                      <th className="p-2.5 w-10 text-center">Pilih</th>
                      <th className="p-2.5">NIS</th>
                      <th className="p-2.5">Nama Siswa</th>
                      <th className="p-2.5">Kelas</th>
                      <th className="p-2.5">Guru Wali Saat Ini</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {eligibleStudentsForModal.map(s => {
                      const isSelected = selectedStudentIds.includes(s.id);
                      return (
                        <tr 
                          key={s.id} 
                          onClick={() => toggleStudentSelection(s.id)}
                          className={`cursor-pointer transition ${isSelected ? 'bg-blue-50/70 font-medium' : 'hover:bg-gray-50'}`}
                        >
                          <td className="p-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}} // Handled by tr click
                              className="rounded text-[#1E4FD8]"
                            />
                          </td>
                          <td className="p-2.5 font-mono">{s.nis}</td>
                          <td className="p-2.5 font-semibold text-gray-900">{s.name}</td>
                          <td className="p-2.5">{s.class}</td>
                          <td className="p-2.5 text-gray-500">
                            {s.guruWali ? (
                              <span className="text-gray-700">{s.guruWali}</span>
                            ) : (
                              <span className="text-amber-600 font-semibold text-[10px]">Belum Ditugaskan</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-gray-500 text-right">
                Terpilih: <strong>{selectedStudentIds.length} Siswa</strong> untuk ditugaskan ke <strong>{assignTeacherName}</strong>
              </p>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={selectedStudentIds.length === 0}
                onClick={handleSaveManualAssignment}
                className="px-4 py-2 bg-gray-900 hover:bg-black disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Penugasan ({selectedStudentIds.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: IMPORT DATA PENUGASAN (EXCEL) ================= */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 font-['Poppins']">
                    Import Pemetaan Penugasan Guru Wali (.xlsx)
                  </h3>
                  <p className="text-xs text-gray-500">
                    Gunakan file Excel untuk memetakan siswa dan Guru Wali secara massal.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 overflow-y-auto flex-1">
              {/* Step 1: Download Template */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-gray-800 uppercase">
                    1. Unduh Template Pemetaan
                  </h4>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Kolom wajib: <code>NIS_Siswa</code> dan <code>Nama_Guru_Wali</code>.
                  </p>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-200 text-gray-800 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh .xlsx</span>
                </button>
              </div>

              {/* Step 2: Upload Excel File */}
              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase mb-2">
                  2. Unggah Berkas Excel Penugasan
                </h4>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 hover:border-gray-400 bg-gray-50 rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2"
                >
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept=".xlsx, .xls, .csv" 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                  <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-800 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-gray-800">
                    {importFile ? importFile.name : 'Klik untuk memilih berkas Excel'}
                  </p>
                </div>
              </div>

              {importError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{importError}</span>
                </div>
              )}

              {/* Preview */}
              {importPreview.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    Pratinjau ({importPreview.length} baris pemetaan terdeteksi)
                  </span>
                  <div className="border border-gray-200 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                    <table className="w-full text-[11px] text-left">
                      <thead className="bg-gray-100 text-gray-600 font-semibold sticky top-0">
                        <tr>
                          <th className="p-2">NIS Siswa</th>
                          <th className="p-2">Nama Siswa</th>
                          <th className="p-2">Guru Wali Ditugaskan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {importPreview.slice(0, 5).map((row, i) => (
                          <tr key={i}>
                            <td className="p-2 font-mono">{row['NIS_Siswa'] || row['NIS']}</td>
                            <td className="p-2 font-semibold">{row['Nama_Siswa'] || row['Nama']}</td>
                            <td className="p-2 text-gray-800 font-semibold">{row['Nama_Guru_Wali'] || row['Guru_Wali']}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={importPreview.length === 0}
                onClick={handleCommitImport}
                className="px-4 py-2 bg-gray-900 hover:bg-black disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
              >
                <Check className="w-4 h-4" />
                <span>Terapkan Pemetaan Data ({importPreview.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Unassigning Student */}
      <ConfirmationModal
        isOpen={unassignTarget.isOpen}
        type="delete"
        title="Konfirmasi Pelepasan Siswa Binaan"
        message={`Apakah Anda yakin ingin melepas siswa ini dari daftar binaan ${unassignTarget.teacherName}? Status penugasan Guru Wali untuk siswa ini akan dikosongkan.`}
        itemName={unassignTarget.student ? `${unassignTarget.student.name} (NIS: ${unassignTarget.student.nis} • Kelas ${unassignTarget.student.class})` : undefined}
        confirmLabel="Ya, Lepaskan Siswa"
        onConfirm={() => {
          if (unassignTarget.student) {
            handleUnassignStudent(unassignTarget.student.id);
          }
          setUnassignTarget({ isOpen: false, student: null, teacherName: '' });
        }}
        onCancel={() => setUnassignTarget({ isOpen: false, student: null, teacherName: '' })}
      />
    </div>
  );
};
