import React, { useState } from 'react';
import { 
  Printer, FileText, Download, CheckCircle2, ChevronDown, 
  FileSpreadsheet, Users, Calendar, Sliders, Check
} from 'lucide-react';
import { Student, Meeting, Incident } from '../types';

interface ReportCustomizerProps {
  students: Student[];
  selectedStudent: Student;
  meetings: Meeting[];
  incidents: Incident[];
  onSelectStudent: (student: Student) => void;
}

export const ReportCustomizer: React.FC<ReportCustomizerProps> = ({
  students,
  selectedStudent,
  meetings,
  incidents,
  onSelectStudent
}) => {
  const [selectedFormat, setSelectedFormat] = useState<
    'perkembangan' | 'pertemuan' | 'rekap_guru' | 'rekap_kelas'
  >('perkembangan');

  const [academicYear, setAcademicYear] = useState('2024/2025 Genap');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Student incidents & meetings
  const currentIncidents = incidents.filter(
    i => i.studentId === selectedStudent.id || i.studentName === selectedStudent.name
  );
  const currentMeetings = meetings.filter(
    m => m.studentIds?.includes(selectedStudent.id) || m.studentNames?.includes(selectedStudent.name)
  );

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    setExportNotice('Menyiapkan file Excel rekapitulasi data siswa...');
    setTimeout(() => {
      setExportNotice('Rekapitulasi Excel siap diunduh!');
      setTimeout(() => setExportNotice(null), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header matching laporan.png */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="text-[11px] font-bold text-[#1E4FD8] uppercase tracking-wider">
            ARSIP & TATA USAHA • GENERASI BERKAS
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-0.5">
            Pusat Laporan & Ekspor Dokumen Resmi
          </h1>
          <p className="text-xs text-gray-500">
            Cetak dokumen resmi pembinaan ber-kop surat UPT SMP Negeri 1 Suppa dalam format PDF atau rekapitulasi data Excel
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Status Penandatanganan: Aktif (3 Otoritas)</span>
          </span>
        </div>
      </div>

      {/* 2 Column Layout: Left Options & Right Paper Preview matching laporan.png */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (360px approx -> 4 cols on lg) */}
        <div className="lg:col-span-4 space-y-4 no-print">
          {/* Card 1: Pilih Format Laporan */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-2xs space-y-3">
            <h3 className="font-bold text-sm text-gray-900">Pilih Format Laporan</h3>
            
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setSelectedFormat('perkembangan')}
                className={`w-full p-3 rounded-xl text-left text-xs font-semibold transition flex items-center gap-2.5 border ${
                  selectedFormat === 'perkembangan'
                    ? 'bg-blue-50/70 border-[#1E4FD8] text-[#1E4FD8] shadow-2xs'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-base">📄</span>
                <span>Laporan Perkembangan per Siswa</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFormat('pertemuan')}
                className={`w-full p-3 rounded-xl text-left text-xs font-semibold transition flex items-center gap-2.5 border ${
                  selectedFormat === 'pertemuan'
                    ? 'bg-blue-50/70 border-[#1E4FD8] text-[#1E4FD8] shadow-2xs'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-base">📋</span>
                <span>Riwayat Pertemuan per Siswa</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFormat('rekap_guru')}
                className={`w-full p-3 rounded-xl text-left text-xs font-semibold transition flex items-center gap-2.5 border ${
                  selectedFormat === 'rekap_guru'
                    ? 'bg-blue-50/70 border-[#1E4FD8] text-[#1E4FD8] shadow-2xs'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-base">📊</span>
                <span>Rekapitulasi per Guru Wali</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFormat('rekap_kelas')}
                className={`w-full p-3 rounded-xl text-left text-xs font-semibold transition flex items-center gap-2.5 border ${
                  selectedFormat === 'rekap_kelas'
                    ? 'bg-blue-50/70 border-[#1E4FD8] text-[#1E4FD8] shadow-2xs'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-base">🏫</span>
                <span>Rekapitulasi per Kelas</span>
              </button>
            </div>
          </div>

          {/* Card 2: Parameter Cetak */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-gray-900">Parameter Cetak</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Tahun Ajaran & Semester
                </label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-800 outline-none focus:border-[#1E4FD8] focus:bg-white transition"
                >
                  <option value="2024/2025 Genap">2024/2025 Genap</option>
                  <option value="2024/2025 Ganjil">2024/2025 Ganjil</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Target Siswa
                </label>
                <select
                  value={selectedStudent.id}
                  onChange={(e) => {
                    const st = students.find(s => s.id === e.target.value);
                    if (st) onSelectStudent(st);
                  }}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-800 outline-none focus:border-[#1E4FD8] focus:bg-white transition"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.nis})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {exportNotice && (
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-700 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-blue-600" />
                <span>{exportNotice}</span>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handlePrint}
                className="w-full py-2.5 px-4 bg-[#1E4FD8] hover:bg-[#1A42B8] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition"
              >
                <Printer className="w-4 h-4" />
                <span>Unduh Dokumen PDF Resmi</span>
              </button>

              <button
                type="button"
                onClick={handleExportExcel}
                className="w-full py-2.5 px-4 bg-white hover:bg-emerald-50 border border-emerald-600 text-emerald-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition shadow-2xs"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Ekspor Data ke Excel (.xlsx)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live A4 Document Preview matching laporan.png (8 cols on lg) */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl border border-gray-300 shadow-xl p-8 md:p-12 font-['Poppins'] text-gray-900 text-xs leading-relaxed max-w-3xl mx-auto print:border-none print:shadow-none print:p-0">
            {/* Kop Surat Resmi UPT SMPN 1 Suppa */}
            <div className="border-b-4 border-double border-gray-900 pb-3 mb-6 flex items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-xl bg-[#0D3380] text-white flex items-center justify-center font-bold text-2xl shrink-0">
                🎓
              </div>
              <div className="flex-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-800">
                  PEMERINTAH KABUPATEN PINRANG
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-900">
                  DINAS PENDIDIKAN DAN KEBUDAYAAN
                </div>
                <h2 className="text-lg font-extrabold uppercase tracking-tight text-[#092C78] mt-0.5">
                  UPT SMP NEGERI 1 SUPPA
                </h2>
                <div className="text-[11px] text-gray-700">
                  Jl. Poros Pinrang - Parepare KM. 25, Majakka, Suppa, Kab. Pinrang 91272
                </div>
                <div className="text-[10px] text-gray-600">
                  Telp: (0421) 921004 • Pos-el: smpn1suppa@pinrangkab.go.id • NPSN: 40304918
                </div>
              </div>
            </div>

            {/* Judul & Nomor Dokumen */}
            <div className="text-center mb-6">
              <h3 className="font-extrabold text-sm uppercase tracking-wide">
                LEMBAR LAPORAN PERKEMBANGAN DAN PEMBINAAN SISWA
              </h3>
              <div className="text-[11px] text-gray-600 mt-0.5">
                Nomor: 421.3 / 184 / SMP.01 / SUPPA / 2024
              </div>
            </div>

            {/* Identitas Siswa Table */}
            <table className="w-full mb-6 text-xs">
              <tbody>
                <tr>
                  <td className="w-1/4 py-1 text-gray-600">Nama Peserta Didik</td>
                  <td className="w-1/4 py-1 font-bold">: {selectedStudent.name}</td>
                  <td className="w-1/4 py-1 text-gray-600">Kelas / Rombel</td>
                  <td className="w-1/4 py-1 font-bold">: {selectedStudent.class}</td>
                </tr>
                <tr>
                  <td className="py-1 text-gray-600">NIS / NISN</td>
                  <td className="py-1">: {selectedStudent.nis} / {selectedStudent.nisn}</td>
                  <td className="py-1 text-gray-600">Wali Kelas</td>
                  <td className="py-1">: Nurmiati, S.Pd</td>
                </tr>
                <tr>
                  <td className="py-1 text-gray-600">Guru Wali Pembimbing</td>
                  <td colSpan={3} className="py-1">
                    : <strong>{selectedStudent.guruWali}</strong> (NIP 197805122005011004)
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Bagian I: Ringkasan Kejadian & Penanganan Pembinaan */}
            <div className="mb-6">
              <div className="font-bold text-xs uppercase mb-2 text-gray-900">
                I. RINGKASAN KEJADIAN & PENANGANAN PEMBINAAN
              </div>
              <table className="w-full border border-gray-400 border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100 text-gray-800">
                    <th className="border border-gray-400 p-2 text-center w-8">No</th>
                    <th className="border border-gray-400 p-2 text-left w-24">Tanggal</th>
                    <th className="border border-gray-400 p-2 text-left w-28">Kategori Kasus</th>
                    <th className="border border-gray-400 p-2 text-left">Uraian Masalah & Observasi</th>
                    <th className="border border-gray-400 p-2 text-left">Tindakan Pembinaan</th>
                    <th className="border border-gray-400 p-2 text-center w-20">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentIncidents.length > 0 ? (
                    currentIncidents.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="border border-gray-400 p-2 text-center">{idx + 1}</td>
                        <td className="border border-gray-400 p-2">{item.date}</td>
                        <td className="border border-gray-400 p-2 font-medium">{item.category}</td>
                        <td className="border border-gray-400 p-2">{item.description}</td>
                        <td className="border border-gray-400 p-2">{item.followUp || 'Dalam pemantauan'}</td>
                        <td className="border border-gray-400 p-2 text-center font-semibold text-emerald-700">
                          {item.status}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="border border-gray-400 p-2 text-center">1</td>
                      <td className="border border-gray-400 p-2">18 Okt 2024</td>
                      <td className="border border-gray-400 p-2 font-medium">Kehadiran</td>
                      <td className="border border-gray-400 p-2">Tidak hadir tanpa keterangan 3 hari berturut-turut</td>
                      <td className="border border-gray-400 p-2">Panggilan orang tua resmi & pendampingan Guru BK</td>
                      <td className="border border-gray-400 p-2 text-center font-semibold text-amber-700">
                        Dalam Proses
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Bagian II: Kesimpulan Rekomendasi & Tindak Lanjut Terpadu */}
            <div className="mb-8">
              <div className="font-bold text-xs uppercase mb-1.5 text-gray-900">
                II. KESIMPULAN REKOMENDASI & TINDAK LANJUT TERPADU
              </div>
              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                <li>Menegakkan komitmen kehadiran belajar dan pengawasan kepulangan siswa dari sekolah.</li>
                <li>Kerjasama intensif antara orang tua/wali murid dengan pihak sekolah dalam memantau jam belajar mandiri di rumah.</li>
                <li>Evaluasi berkala bimbingan konseling setiap dua pekan bersama Guru Wali pembimbing.</li>
              </ol>
            </div>

            {/* Bagian III: 3 Tanda Tangan */}
            <div className="pt-4 text-xs">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col justify-between h-32">
                  <div>
                    <div>Mengetahui,</div>
                    <div className="font-bold">Orang Tua / Wali Siswa</div>
                  </div>
                  <div>
                    <div className="font-bold">( ............................................ )</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{selectedStudent.parentName}</div>
                  </div>
                </div>

                <div className="flex flex-col justify-between h-32">
                  <div>
                    <div>Suppa, 24 Oktober 2024</div>
                    <div className="font-bold">Guru Wali Pembimbing,</div>
                  </div>
                  <div>
                    <div className="font-bold underline">{selectedStudent.guruWali}</div>
                    <div className="text-[10px] text-gray-600 mt-0.5">NIP 197805122005011004</div>
                  </div>
                </div>

                <div className="flex flex-col justify-between h-32">
                  <div>
                    <div>Mengetahui,</div>
                    <div className="font-bold">Kepala UPT SMPN 1 Suppa</div>
                  </div>
                  <div>
                    <div className="font-bold underline">Drs. H. Syamsuddin, M.Si</div>
                    <div className="text-[10px] text-gray-600 mt-0.5">NIP 196803121994121002</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
