import React, { useState, useMemo } from 'react';
import { 
  Printer, User, Phone, MapPin, Calendar, Award, AlertTriangle, 
  FileText, CheckCircle2, ChevronRight, BookOpen, Clock, HeartHandshake,
  Eye, Download, Trash2, Plus, MessageSquare, AlertCircle
} from 'lucide-react';
import { Student, Meeting, Incident } from '../types';
import { CascadingStudentSelector } from './CascadingStudentSelector';

interface StudentProfileViewProps {
  students: Student[];
  selectedStudent: Student;
  meetings: Meeting[];
  incidents: Incident[];
  onSelectStudent: (student: Student) => void;
  onOpenNewSessionModal: () => void;
  onOpenNewIncidentModal: () => void;
  onDeleteMeeting?: (meeting: Meeting) => void;
  onDeleteIncident?: (incident: Incident) => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  students,
  selectedStudent,
  meetings,
  incidents,
  onSelectStudent,
  onOpenNewSessionModal,
  onOpenNewIncidentModal,
  onDeleteMeeting,
  onDeleteIncident
}) => {
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [profileSubTab, setProfileSubTab] = useState<'perkembangan' | 'pertemuan' | 'tindak_lanjut'>('perkembangan');

  // Filter meetings & incidents for this specific student
  const studentMeetings = useMemo(() => {
    return meetings.filter(m => m.studentIds?.includes(selectedStudent.id) || m.studentNames?.includes(selectedStudent.name));
  }, [meetings, selectedStudent.id, selectedStudent.name]);

  const studentIncidents = useMemo(() => {
    return incidents.filter(inc => inc.studentId === selectedStudent.id || inc.studentName === selectedStudent.name);
  }, [incidents, selectedStudent.id, selectedStudent.name]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bertingkat: Pilih Kelas & Nama Siswa */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-gray-200/90 shadow-2xs space-y-3 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100">
          <div>
            <div className="text-[11px] font-bold text-[#1E4FD8] uppercase tracking-wider">
              DATA INDUK PERWALIAN • SMPN 1 SUPPA
            </div>
            <h2 className="text-base font-bold text-gray-900 mt-0.5">
              Pencarian & Pemilihan Profil Peserta Didik
            </h2>
            <p className="text-xs text-gray-500">
              Gunakan pemilih kelas bertingkat atau cari langsung berdasarkan nama / NIS murid.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPrintPreview(!showPrintPreview)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition ${
                showPrintPreview 
                  ? 'bg-blue-50 border-blue-300 text-[#1E4FD8]' 
                  : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700 shadow-2xs'
              }`}
            >
              <Eye className="w-4 h-4 text-[#1E4FD8]" />
              <span>{showPrintPreview ? 'Tutup Pratinjau' : 'Pratinjau Lembar A4'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#1E4FD8] hover:bg-[#1A42B8] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Biodata & Rekap PDF</span>
            </button>
          </div>
        </div>

        {/* Cascading Selector Component */}
        <CascadingStudentSelector
          students={students}
          selectedStudentId={selectedStudent.id}
          onSelectStudent={onSelectStudent}
          label="Pilih Kelas kemudian Nama Siswa"
        />
      </div>

      {/* ----------------- PRATINJAU CETAK RESMI FORMAT A4 ----------------- */}
      {showPrintPreview ? (
        <div className="bg-white p-8 md:p-12 max-w-4xl mx-auto border border-gray-300 rounded-2xl shadow-xl print-card font-['Poppins'] text-black leading-relaxed">
          {/* Kop Sekolah */}
          <div className="border-b-4 border-double border-black pb-3 mb-6 flex items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-xl bg-[#092C78] text-white flex items-center justify-center font-bold text-2xl shrink-0">
              🎓
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider">Pemerintah Kabupaten Pinrang • Dinas Pendidikan dan Kebudayaan</p>
              <h2 className="text-lg font-bold uppercase tracking-tight text-[#092C78]">UPT SMP NEGERI 1 SUPPA</h2>
              <p className="text-[11px] text-gray-700">Jl. Poros Pinrang - Parepare KM. 25, Majakka, Suppa, Kab. Pinrang 91272</p>
              <p className="text-[10px] text-gray-600">Laman: smpn1suppa.sch.id • Pos-el: info@smpn1suppa.sch.id • NPSN: 40304918</p>
            </div>
          </div>

          <div className="text-center mb-6">
            <h3 className="font-bold text-sm uppercase underline tracking-wider">LEMBAR REKAPITULASI PEMBINAAN & BIODATA SISWA</h3>
            <p className="text-xs text-gray-600 mt-0.5">Tahun Ajaran 2024/2025 Genap</p>
          </div>

          {/* Biodata Tabel */}
          <div className="mb-6 text-xs">
            <h4 className="font-bold uppercase mb-2">I. Data Identitas Peserta Didik</h4>
            <table className="w-full border border-black border-collapse">
              <tbody>
                <tr>
                  <td className="border border-black p-2 font-semibold bg-gray-50 w-1/4">Nama Lengkap</td>
                  <td className="border border-black p-2 font-bold w-1/4">{selectedStudent.name}</td>
                  <td className="border border-black p-2 font-semibold bg-gray-50 w-1/4">Jenis Kelamin</td>
                  <td className="border border-black p-2 w-1/4">{selectedStudent.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-semibold bg-gray-50">NIS / NISN</td>
                  <td className="border border-black p-2">{selectedStudent.nis} / {selectedStudent.nisn}</td>
                  <td className="border border-black p-2 font-semibold bg-gray-50">Kelas / Rombel</td>
                  <td className="border border-black p-2 font-semibold">{selectedStudent.class}</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-semibold bg-gray-50">Guru Wali Pembina</td>
                  <td className="border border-black p-2 font-semibold">{selectedStudent.guruWali}</td>
                  <td className="border border-black p-2 font-semibold bg-gray-50">Status Pembinaan</td>
                  <td className="border border-black p-2 font-bold">{selectedStudent.status}</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-semibold bg-gray-50">Nama Orang Tua / Wali</td>
                  <td className="border border-black p-2">{selectedStudent.parentName}</td>
                  <td className="border border-black p-2 font-semibold bg-gray-50">Kontak Darurat</td>
                  <td className="border border-black p-2 font-mono">{selectedStudent.phone}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Rekap Kehadiran */}
          <div className="mb-6 text-xs">
            <h4 className="font-bold uppercase mb-2">II. Rekapitulasi Presensi Kehadiran</h4>
            <table className="w-full border border-black border-collapse text-center">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-black p-1.5 font-bold">Total Hari Efektif</th>
                  <th className="border border-black p-1.5 font-bold">Persentase Kehadiran</th>
                  <th className="border border-black p-1.5 font-bold">Sakit (S)</th>
                  <th className="border border-black p-1.5 font-bold">Izin (I)</th>
                  <th className="border border-black p-1.5 font-bold text-red-600">Alpa (A)</th>
                  <th className="border border-black p-1.5 font-bold">Tingkat Risiko</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-2 font-medium">92 Hari</td>
                  <td className="border border-black p-2 font-bold text-blue-700">{selectedStudent.attendance}</td>
                  <td className="border border-black p-2">{selectedStudent.sakit} Hari</td>
                  <td className="border border-black p-2">{selectedStudent.izin} Hari</td>
                  <td className="border border-black p-2 font-bold text-red-600">{selectedStudent.alpa} Hari</td>
                  <td className="border border-black p-2 font-bold">{selectedStudent.status}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Tanda Tangan 3 Pihak */}
          <div className="mt-10 pt-4 text-xs">
            <div className="text-right mb-4">
              <span>Suppa, 24 Oktober 2024</span>
            </div>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="flex flex-col justify-between h-32">
                <div>
                  <p className="font-medium">Mengetahui,</p>
                  <p className="font-bold uppercase">Orang Tua / Wali Siswa</p>
                </div>
                <div>
                  <p className="font-bold underline">{selectedStudent.parentName}</p>
                  <p className="text-[10px] text-gray-500">Tanda Tangan & Nama Terang</p>
                </div>
              </div>

              <div className="flex flex-col justify-between h-32">
                <div>
                  <p className="font-medium">Guru Wali Pembina,</p>
                  <p className="font-bold uppercase">UPT SMPN 1 Suppa</p>
                </div>
                <div>
                  <p className="font-bold underline">{selectedStudent.guruWali}</p>
                  <p className="text-[10px] text-gray-600">NIP. 197805122005011004</p>
                </div>
              </div>

              <div className="flex flex-col justify-between h-32">
                <div>
                  <p className="font-medium">Mengesahkan,</p>
                  <p className="font-bold uppercase">Kepala UPT SMPN 1 Suppa</p>
                </div>
                <div>
                  <p className="font-bold underline">Drs. H. Syamsuddin, M.Si</p>
                  <p className="text-[10px] text-gray-600">NIP. 196803121994121002</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ----------------- TAMPILAN INTERAKTIF PROFIL SISWA (MATCHING profil siswa.png) ----------------- */
        <div className="space-y-6">
          {/* Header Card matching profil siswa.png */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-6 shadow-2xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                {/* Big Avatar with Badge VIII-B at bottom right */}
                <div className="relative w-20 h-20 md:w-22 md:h-22 rounded-2xl bg-[#1E4FD8] text-white flex items-center justify-center font-bold text-2xl md:text-3xl shrink-0 shadow-xs">
                  {selectedStudent.name.split(' ').map(n=>n[0]).slice(0,2).join('')}
                  <span className="absolute -bottom-1.5 -right-1.5 bg-[#0D9488] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs border border-white">
                    {selectedStudent.class.replace('Kelas ', '')}
                  </span>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">{selectedStudent.name}</h1>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      selectedStudent.status === 'Kritis' ? 'bg-red-50 text-red-700 border border-red-200' :
                      selectedStudent.status === 'Prestasi' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                      selectedStudent.status === 'Perlu Perhatian' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      Status: {selectedStudent.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    {selectedStudent.gender === 'L' ? 'Laki-laki' : 'Perempuan'} • NIS: <strong className="font-mono text-gray-800">{selectedStudent.nis}</strong> • NISN: <strong className="font-mono text-gray-800">{selectedStudent.nisn}</strong> • Kelas Unggulan {selectedStudent.class}
                  </p>

                  <div className="text-xs text-gray-600 mt-2 flex flex-wrap gap-x-4 gap-y-1">
                    <span>👨‍🏫 Guru Wali: <strong className="text-gray-900">{selectedStudent.guruWali}</strong></span>
                    <span>👩‍🏫 Wali Kelas: <strong className="text-gray-900">Nurmiati, S.Pd</strong></span>
                    <span>📞 Kontak Ortu: <strong className="text-[#1E4FD8]">{selectedStudent.phone} ({selectedStudent.parentName})</strong></span>
                  </div>
                </div>
              </div>

              {/* Header Right Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                <button 
                  type="button"
                  onClick={handlePrint}
                  className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs"
                >
                  <Printer className="w-4 h-4 text-gray-700" />
                  <span>Cetak Biodata & Rekap PDF</span>
                </button>

                <button 
                  type="button"
                  onClick={onOpenNewSessionModal}
                  className="px-3.5 py-2 bg-[#1E4FD8] hover:bg-[#1A42B8] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Catat Pertemuan Baru</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2-Column Layout matching profil siswa.png */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Tabs for Perkembangan, Pertemuan, Tindak Lanjut */}
            <div className="lg:col-span-2 space-y-4">
              {/* Secondary Navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-px">
                <button
                  type="button"
                  onClick={() => setProfileSubTab('perkembangan')}
                  className={`px-4 py-2.5 text-xs font-semibold transition border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                    profileSubTab === 'perkembangan'
                      ? 'border-[#1E4FD8] text-[#1E4FD8]'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <span>Catatan Perkembangan ({studentIncidents.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProfileSubTab('pertemuan')}
                  className={`px-4 py-2.5 text-xs font-semibold transition border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                    profileSubTab === 'pertemuan'
                      ? 'border-[#1E4FD8] text-[#1E4FD8]'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <span>Riwayat Pertemuan ({studentMeetings.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProfileSubTab('tindak_lanjut')}
                  className={`px-4 py-2.5 text-xs font-semibold transition border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                    profileSubTab === 'tindak_lanjut'
                      ? 'border-[#1E4FD8] text-[#1E4FD8]'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <span>Tindak Lanjut & Pengingat ({studentIncidents.filter(i => i.status !== 'Selesai').length})</span>
                </button>
              </div>

              {/* Subtab 1: Catatan Perkembangan List Cards */}
              {profileSubTab === 'perkembangan' && (
                <div className="space-y-3">
                  {studentIncidents.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-2xl border border-gray-200/90 text-gray-400">
                      <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <div className="font-semibold text-gray-700 text-sm">Belum Ada Catatan Perkembangan Khusus</div>
                      <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                        Siswa memiliki rekam jejak perilaku yang terpantau normal pada semester ini.
                      </p>
                      <button
                        type="button"
                        onClick={onOpenNewIncidentModal}
                        className="mt-3 px-3 py-1.5 bg-[#1E4FD8] text-white rounded-lg text-xs font-semibold"
                      >
                        + Catat Perkembangan Sekarang
                      </button>
                    </div>
                  ) : (
                    studentIncidents.map((inc) => (
                      <div 
                        key={inc.id}
                        className={`bg-white rounded-2xl border border-gray-200/90 p-4 shadow-2xs border-l-4 transition hover:shadow-xs ${
                          inc.impactLevel === 'Tinggi' ? 'border-l-[#DC2626]' :
                          inc.impactLevel === 'Positif' ? 'border-l-[#7C3AED]' : 'border-l-[#1E4FD8]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            inc.impactLevel === 'Tinggi' ? 'bg-red-50 text-red-700 border border-red-200' :
                            inc.impactLevel === 'Positif' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {inc.category} • {inc.date}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                            {inc.status}
                          </span>
                        </div>

                        <h3 className="font-semibold text-sm text-gray-900 mb-1">{inc.description}</h3>
                        
                        <div className="text-xs text-gray-600 mb-3 bg-gray-50/70 p-2.5 rounded-xl border border-gray-100">
                          <strong>Tindakan Pembinaan:</strong> {inc.followUp || 'Dalam pemantauan Guru Wali'}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-100 pt-2.5">
                          <span>Dibuat oleh: {selectedStudent.guruWali || 'Guru Wali'}</span>
                          <button 
                            type="button"
                            onClick={onOpenNewIncidentModal}
                            className="text-[#1E4FD8] hover:underline font-semibold"
                          >
                            Perbarui Tindak Lanjut
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Subtab 2: Riwayat Pertemuan */}
              {profileSubTab === 'pertemuan' && (
                <div className="space-y-3">
                  {studentMeetings.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-2xl border border-gray-200/90 text-gray-400">
                      <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <div className="font-semibold text-gray-700 text-sm">Belum Ada Sesi Pertemuan Bimbingan</div>
                      <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                        Belum ada sesi tatap muka individu ataupun kelompok yang tercatat untuk siswa ini.
                      </p>
                      <button
                        type="button"
                        onClick={onOpenNewSessionModal}
                        className="mt-3 px-3 py-1.5 bg-[#1E4FD8] text-white rounded-lg text-xs font-semibold"
                      >
                        + Catat Pertemuan Baru
                      </button>
                    </div>
                  ) : (
                    studentMeetings.map((m) => (
                      <div key={m.id} className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                            {m.type} • {m.date}
                          </span>
                          <span className="text-xs text-emerald-600 font-semibold">{m.status}</span>
                        </div>
                        <h4 className="font-bold text-sm text-gray-900">{m.topic}</h4>
                        <p className="text-xs text-gray-600">{m.notes}</p>
                        <div className="text-[11px] text-gray-500 bg-gray-50 p-2 rounded-lg">
                          <strong>Hasil & Tindak Lanjut:</strong> {m.followUp}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Subtab 3: Tindak Lanjut & Pengingat */}
              {profileSubTab === 'tindak_lanjut' && (
                <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-2xs space-y-3">
                  <h4 className="font-bold text-sm text-gray-900">Agenda & Pengingat Tindak Lanjut</h4>
                  <div className="space-y-2.5">
                    <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-xs flex items-center justify-between">
                      <div>
                        <div className="font-bold text-amber-900">Klarifikasi Kehadiran & Surat Panggilan Ortu</div>
                        <div className="text-amber-700 text-[11px]">Tenggat waktu: Jumat, 25 Okt 2024</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-[10px]">
                        Menunggu
                      </span>
                    </div>
                    <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-xs flex items-center justify-between">
                      <div>
                        <div className="font-bold text-blue-900">Evaluasi Belajar Mandiri Matematika</div>
                        <div className="text-blue-700 text-[11px]">Tenggat waktu: Senin, 28 Okt 2024</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-blue-200 text-blue-900 font-bold text-[10px]">
                        Terjadwal
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Stats & Family Info matching profil siswa.png */}
            <div className="space-y-5">
              {/* Card 1: Statistik & Kebugaran Presensi */}
              <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-2xs">
                <h3 className="font-bold text-sm text-gray-900 mb-3">Statistik & Kebugaran Presensi</h3>
                
                <div className="text-center py-2">
                  <div className={`text-4xl font-extrabold tracking-tight ${
                    selectedStudent.alpa > 2 ? 'text-[#DC2626]' : 'text-[#1E4FD8]'
                  }`}>
                    {selectedStudent.attendance}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 font-medium">Presensi Semester Berjalan</div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-around text-xs text-gray-600">
                  <div className="text-center">
                    <span className="text-gray-400 block text-[10px] uppercase">Sakit</span>
                    <strong className="text-gray-800">{selectedStudent.sakit} hari</strong>
                  </div>
                  <div className="text-center">
                    <span className="text-gray-400 block text-[10px] uppercase">Izin</span>
                    <strong className="text-gray-800">{selectedStudent.izin} hari</strong>
                  </div>
                  <div className="text-center">
                    <span className="text-gray-400 block text-[10px] uppercase">Alpa</span>
                    <strong className={`font-bold ${selectedStudent.alpa > 0 ? 'text-[#DC2626]' : 'text-gray-800'}`}>
                      {selectedStudent.alpa} hari
                    </strong>
                  </div>
                </div>
              </div>

              {/* Card 2: Keluarga & Kontak Darurat */}
              <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-2xs space-y-3.5">
                <h3 className="font-bold text-sm text-gray-900">Keluarga & Kontak Darurat</h3>
                
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">NAMA AYAH</div>
                    <div className="font-bold text-gray-900 mt-0.5">{selectedStudent.parentName}</div>
                    <div className="text-[11px] text-gray-500">Pekerjaan: Wiraswasta / Petani</div>
                  </div>

                  <div className="pt-2.5 border-t border-gray-100">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">NAMA IBU</div>
                    <div className="font-bold text-gray-900 mt-0.5">Ibu St. Maryam</div>
                    <div className="text-[11px] text-gray-500">Pekerjaan: Ibu Rumah Tangga</div>
                  </div>

                  <div className="pt-2.5 border-t border-gray-100">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">KONTAK DARURAT (WHATSAPP AKTIF)</div>
                    <div className="font-bold text-[#1E4FD8] font-mono text-sm mt-0.5">{selectedStudent.phone}</div>
                    <div className="text-[10px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Terverifikasi Dapodik
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
