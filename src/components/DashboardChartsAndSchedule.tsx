import React from 'react';
import { 
  Users, AlertTriangle, Calendar, Clock, FileText, CheckCircle2, 
  ChevronRight, Phone, MessageSquare, ExternalLink, RotateCcw,
  Sparkles, Bell, RefreshCw, PenSquare, Eye
} from 'lucide-react';
import { Student, Meeting, Incident } from '../types';

interface DashboardChartsAndScheduleProps {
  students: Student[];
  meetings: Meeting[];
  incidents: Incident[];
  userRole: string;
  onSelectMeetingTab: () => void;
  onOpenNewSessionModal: () => void;
  onSelectStudentTab?: () => void;
  onSelectStudent?: (student: Student) => void;
  onOpenIncidentModal?: () => void;
  onEditMeeting?: (meeting: Meeting) => void;
  onViewMeeting?: (meeting: Meeting) => void;
}

export const DashboardChartsAndSchedule: React.FC<DashboardChartsAndScheduleProps> = ({
  students,
  meetings,
  incidents,
  userRole,
  onSelectMeetingTab,
  onOpenNewSessionModal,
  onSelectStudentTab,
  onSelectStudent,
  onOpenIncidentModal,
  onEditMeeting,
  onViewMeeting
}) => {
  const fajar = students.find(s => s.name.toLowerCase().includes('fajar')) || students[0];
  const siti = students.find(s => s.name.toLowerCase().includes('nurhaliza')) || students[1];
  const reza = students.find(s => s.name.toLowerCase().includes('reza')) || students[2];
  const putri = students.find(s => s.name.toLowerCase().includes('putri')) || students[3];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-['Poppins']">
      {/* ================= LEFT COLUMN (~7 cols / ~60%) ================= */}
      <div className="lg:col-span-7 space-y-6">
        {/* Card 1: Siswa Perlu Perhatian Segera */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-5 md:p-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]"></span>
              <h3 className="font-bold text-base text-gray-900">
                Siswa Perlu Perhatian Segera
              </h3>
            </div>
            <button 
              onClick={onSelectStudentTab}
              className="text-xs text-[#1E4FD8] hover:text-[#1A42B8] font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <span>Lihat Semua (4)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Student 1: Muhammad Fajar */}
            <div className="p-3.5 bg-white border border-gray-100 hover:border-gray-200 rounded-xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 text-[#B42318] flex items-center justify-center font-bold text-xs shrink-0">
                  MF
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-gray-900">Muhammad Fajar</span>
                    <span className="text-xs text-gray-500 font-medium">Kelas VIII-B</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEE4E2] text-[#B42318]">
                      Kritis
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    <strong className="text-gray-800">Kehadiran:</strong> 3 Hari Alpa berturut-turut tanpa kabar orang tua.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <a
                  href="https://wa.me/6281244569921"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Phone className="w-3.5 h-3.5 text-gray-500" />
                  <span>Hubungi Ortu</span>
                </a>
                <button
                  onClick={onOpenNewSessionModal}
                  className="px-3 py-1.5 rounded-lg bg-[#1E4FD8] hover:bg-[#1A42B8] text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Buat Pertemuan</span>
                </button>
              </div>
            </div>

            {/* Student 2: Siti Nurhaliza */}
            <div className="p-3.5 bg-white border border-gray-100 hover:border-gray-200 rounded-xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 text-[#0F766E] flex items-center justify-center font-bold text-xs shrink-0">
                  SN
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-gray-900">Siti Nurhaliza</span>
                    <span className="text-xs text-gray-500 font-medium">Kelas VIII-B</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3E0] text-[#B54708]">
                      Perlu Perhatian
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    <strong className="text-gray-800">Akademik:</strong> Penurunan nilai drastis Matematika (-28 poin) & IPA.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={onOpenNewSessionModal}
                  className="px-3 py-1.5 rounded-lg bg-[#1E4FD8] hover:bg-[#1A42B8] text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Buat Janji Konseling</span>
                </button>
              </div>
            </div>

            {/* Student 3: Reza Pratama */}
            <div className="p-3.5 bg-white border border-gray-100 hover:border-gray-200 rounded-xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-[#1D4ED8] flex items-center justify-center font-bold text-xs shrink-0">
                  RP
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-gray-900">Reza Pratama</span>
                    <span className="text-xs text-gray-500 font-medium">Kelas VIII-C</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8EFFE] text-[#1D4ED8]">
                      Dalam Pantauan
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    <strong className="text-gray-800">Sosial:</strong> Konflik pertemanan antar kelas saat jam istirahat.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => onSelectStudent && onSelectStudent(reza)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-gray-500" />
                  <span>Review Tindak Lanjut</span>
                </button>
              </div>
            </div>

            {/* Student 4: Putri Anggraini */}
            <div className="p-3.5 bg-white border border-gray-100 hover:border-gray-200 rounded-xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#15803D] flex items-center justify-center font-bold text-xs shrink-0">
                  PA
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-gray-900">Putri Anggraini</span>
                    <span className="text-xs text-gray-500 font-medium">Kelas VIII-B</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8EFFE] text-[#1D4ED8]">
                      Dalam Pantauan
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    <strong className="text-gray-800">Kesehatan:</strong> Keluhan sakit berulang & 4 kali izin ke UKS bulan ini.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => onSelectStudent && onSelectStudent(putri)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-gray-500" />
                  <span>Detail Riwayat</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Jadwal & Riwayat Pertemuan Terbaru */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-5 md:p-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
            <div>
              <h3 className="font-bold text-base text-gray-900">
                Jadwal & Riwayat Pertemuan Terbaru
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Sesi tatap muka pembinaan murid dan orang tua
              </p>
            </div>
            <button 
              onClick={onSelectMeetingTab}
              className="text-xs text-[#1E4FD8] hover:text-[#1A42B8] font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>Kalender Lengkap</span>
              <Calendar className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Session 1: Muhammad Fajar */}
            <div className="p-3.5 bg-white border border-gray-200/80 hover:border-gray-300 rounded-xl transition flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">FEB</span>
                  <span className="text-base font-bold text-gray-900 leading-none">24</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-gray-900 truncate">Muhammad Fajar</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700">
                      Individu
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700">
                      Menunggu Respon Ortu
                    </span>
                  </div>
                  <div className="text-xs text-gray-700 font-medium truncate mt-0.5">
                    Topik: Konfirmasi Ketidakhadiran 3 Hari & Komitmen Kehadiran
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    🕒 10:15 - 10:45 WITA • Ruang Guru Wali
                  </div>
                </div>
              </div>

              <button 
                onClick={onOpenNewSessionModal}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition shrink-0 cursor-pointer"
                title="Edit Sesi"
              >
                <PenSquare className="w-4 h-4" />
              </button>
            </div>

            {/* Session 2: Kelompok Belajar B-1 */}
            <div className="p-3.5 bg-white border border-gray-200/80 hover:border-gray-300 rounded-xl transition flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">FEB</span>
                  <span className="text-base font-bold text-gray-900 leading-none">22</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-gray-900 truncate">Kelompok Belajar B-1 (5 Siswa)</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-teal-50 text-teal-700">
                      Kelompok
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700">
                      Selesai
                    </span>
                  </div>
                  <div className="text-xs text-gray-700 font-medium truncate mt-0.5">
                    Topik: Evaluasi Kedisiplinan Tugas & Minat Literasi Digital
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    🕒 13:00 - 14:15 WITA • Perpustakaan
                  </div>
                </div>
              </div>

              <button 
                onClick={onSelectMeetingTab}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition shrink-0 cursor-pointer"
                title="Lihat Detail"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>

            {/* Session 3: Siti Nurhaliza */}
            <div className="p-3.5 bg-white border border-gray-200/80 hover:border-gray-300 rounded-xl transition flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">FEB</span>
                  <span className="text-base font-bold text-gray-900 leading-none">20</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-gray-900 truncate">Siti Nurhaliza</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700">
                      Individu
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700">
                      Selesai
                    </span>
                  </div>
                  <div className="text-xs text-gray-700 font-medium truncate mt-0.5">
                    Topik: Identifikasi Hambatan Belajar Matematika Bersama Guru Mapel
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    🕒 09:30 - 10:15 WITA • Pojok Konseling
                  </div>
                </div>
              </div>

              <button 
                onClick={onSelectMeetingTab}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition shrink-0 cursor-pointer"
                title="Lihat Detail"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= RIGHT COLUMN (~5 cols / ~40%) ================= */}
      <div className="lg:col-span-5 space-y-6">
        {/* Card 1: Distribusi Catatan Pembinaan */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-5 md:p-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
            <div>
              <h3 className="font-bold text-base text-gray-900">
                Distribusi Catatan Pembinaan
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Kompilasi isu siswa semester berjalan
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-700">
              Total: 64 Log
            </span>
          </div>

          {/* SVG Donut Chart */}
          <div className="flex justify-center my-4">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                {/* Background Ring */}
                <circle cx="80" cy="80" r="58" stroke="#F1F4F9" strokeWidth="18" fill="none" />
                
                {/* Segment 1: Kehadiran 35% */}
                <circle
                  cx="80"
                  cy="80"
                  r="58"
                  stroke="#DC2626"
                  strokeWidth="18"
                  fill="none"
                  strokeDasharray="127.5 364.4"
                  strokeDashoffset="0"
                />
                
                {/* Segment 2: Akademik 25% */}
                <circle
                  cx="80"
                  cy="80"
                  r="58"
                  stroke="#1E4FD8"
                  strokeWidth="18"
                  fill="none"
                  strokeDasharray="91.1 364.4"
                  strokeDashoffset="-127.5"
                />

                {/* Segment 3: Kedisiplinan 18% */}
                <circle
                  cx="80"
                  cy="80"
                  r="58"
                  stroke="#D97706"
                  strokeWidth="18"
                  fill="none"
                  strokeDasharray="65.6 364.4"
                  strokeDashoffset="-218.6"
                />

                {/* Segment 4: Sosial 12% */}
                <circle
                  cx="80"
                  cy="80"
                  r="58"
                  stroke="#0D9488"
                  strokeWidth="18"
                  fill="none"
                  strokeDasharray="43.7 364.4"
                  strokeDashoffset="-284.2"
                />

                {/* Segment 5: Prestasi 10% */}
                <circle
                  cx="80"
                  cy="80"
                  r="58"
                  stroke="#7C3AED"
                  strokeWidth="18"
                  fill="none"
                  strokeDasharray="36.4 364.4"
                  strokeDashoffset="-327.9"
                />
              </svg>

              {/* Center Counter */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-gray-900 tracking-tight">64</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">CATATAN</span>
              </div>
            </div>
          </div>

          {/* Breakdown Items */}
          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-center justify-between text-gray-700">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]"></span>
                <span>Kehadiran & Absensi</span>
              </span>
              <span className="font-semibold text-gray-900">
                35% <span className="font-normal text-gray-500">(22)</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-gray-700">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1E4FD8]"></span>
                <span>Akademik & Tugas</span>
              </span>
              <span className="font-semibold text-gray-900">
                25% <span className="font-normal text-gray-500">(16)</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-gray-700">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]"></span>
                <span>Kedisiplinan & Perilaku</span>
              </span>
              <span className="font-semibold text-gray-900">
                18% <span className="font-normal text-gray-500">(12)</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-gray-700">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0D9488]"></span>
                <span>Sosial / Hubungan Teman</span>
              </span>
              <span className="font-semibold text-gray-900">
                12% <span className="font-normal text-gray-500">(8)</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-gray-700">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]"></span>
                <span>Prestasi & Apresiasi</span>
              </span>
              <span className="font-semibold text-gray-900">
                10% <span className="font-normal text-gray-500">(6)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Log Aktivitas Pembinaan & Audit */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-5 md:p-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
            <div>
              <h3 className="font-bold text-base text-gray-900">
                Log Aktivitas Pembinaan & Audit
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Jejak rekaman dan update sistem terbaru
              </p>
            </div>
            <RotateCcw className="w-4 h-4 text-gray-400" />
          </div>

          <div className="space-y-4 text-xs">
            {/* Log 1 */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-teal-100 text-[#0F766E] flex items-center justify-center shrink-0 mt-0.5">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">Unggah Dokumen Surat Pernyataan</span>
                  <span className="text-[11px] text-gray-400">15m lalu</span>
                </div>
                <p className="text-gray-600 mt-0.5 leading-relaxed">
                  Berkas fakta integritas orang tua <strong className="text-gray-800">Reza Pratama (VIII-C)</strong> berhasil diunggah ke arsip pembinaan.
                </p>
              </div>
            </div>

            {/* Log 2 */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1D4ED8] flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">Penyelesaian Sesi Konseling</span>
                  <span className="text-[11px] text-gray-400">2j lalu</span>
                </div>
                <p className="text-gray-600 mt-0.5 leading-relaxed">
                  Drs. H. Ahmad Dahlan menyelesaikan sesi perkembangan bersama <strong className="text-gray-800">Putri Anggraini</strong> dengan rekomendasi pantauan kesehatan.
                </p>
              </div>
            </div>

            {/* Log 3 */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1D4ED8] flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">Penetapan Tindak Lanjut Baru</span>
                  <span className="text-[11px] text-gray-400">Kemarin</span>
                </div>
                <p className="text-gray-600 mt-0.5 leading-relaxed">
                  Jadwal panggilan wali murid untuk <strong className="text-gray-800">Muhammad Fajar</strong> telah dibuat dengan batas respon 24 jam.
                </p>
              </div>
            </div>

            {/* Log 4 */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1D4ED8] flex items-center justify-center shrink-0 mt-0.5">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">Sinkronisasi Absensi Harian</span>
                  <span className="text-[11px] text-gray-400">Kemarin</span>
                </div>
                <p className="text-gray-600 mt-0.5 leading-relaxed">
                  Sinkronisasi data kehadiran otomatis kelas VIII-B dari modul piket sekolah selesai tanpa kendala.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
