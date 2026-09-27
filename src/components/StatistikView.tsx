import React, { useState, useMemo } from 'react';
import { 
  BarChart3, PieChart, TrendingUp, Users, Calendar, Award, 
  AlertTriangle, CheckCircle2, Clock, Filter, Printer, 
  ArrowUpRight, ShieldCheck, BookOpen, Layers, HeartHandshake
} from 'lucide-react';
import { Student, Meeting, Incident, Teacher } from '../types';

interface StatistikViewProps {
  students: Student[];
  meetings: Meeting[];
  incidents: Incident[];
  teachers: Teacher[];
}

export const StatistikView: React.FC<StatistikViewProps> = ({
  students,
  meetings,
  incidents,
  teachers
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('Semua');

  // Filtered dataset
  const filteredStudents = useMemo(() => {
    if (selectedClass === 'Semua') return students;
    return students.filter(s => s.class === selectedClass);
  }, [students, selectedClass]);

  const filteredStudentIds = useMemo(() => {
    return new Set(filteredStudents.map(s => s.id));
  }, [filteredStudents]);

  const filteredMeetings = useMemo(() => {
    if (selectedClass === 'Semua') return meetings;
    return meetings.filter(m => m.studentIds && m.studentIds.some(id => filteredStudentIds.has(id)));
  }, [meetings, filteredStudentIds, selectedClass]);

  const filteredIncidents = useMemo(() => {
    if (selectedClass === 'Semua') return incidents;
    return incidents.filter(inc => filteredStudentIds.has(inc.studentId));
  }, [incidents, filteredStudentIds, selectedClass]);

  // Unique Classes
  const uniqueClasses = useMemo(() => {
    return Array.from(new Set(students.map(s => s.class))).sort();
  }, [students]);

  // Key Metrics
  const totalStudents = filteredStudents.length || 1;
  const guruWaliList = teachers.filter(t => t.role === 'Guru Wali');
  
  // Status Distribution
  const statusCounts = {
    Normal: filteredStudents.filter(s => s.status === 'Normal').length,
    'Perlu Perhatian': filteredStudents.filter(s => s.status === 'Perlu Perhatian').length,
    Kritis: filteredStudents.filter(s => s.status === 'Kritis').length,
    Prestasi: filteredStudents.filter(s => s.status === 'Prestasi').length,
    'Dalam Pantauan': filteredStudents.filter(s => s.status === 'Dalam Pantauan').length
  };

  // Average Attendance
  const avgAttendance = useMemo(() => {
    if (filteredStudents.length === 0) return 0;
    const sum = filteredStudents.reduce((acc, curr) => {
      const val = parseFloat(curr.attendance.replace('%', '')) || 0;
      return acc + val;
    }, 0);
    return Math.round((sum / filteredStudents.length) * 10) / 10;
  }, [filteredStudents]);

  // Meeting Categories breakdown
  const meetingTypeBreakdown = useMemo(() => {
    const counts: Record<string, number> = {
      'Bimbingan Individu': 0,
      'Bimbingan Kelompok': 0,
      'Konsultasi Akademik': 0,
      'Sosial & Karakter': 0
    };
    filteredMeetings.forEach(m => {
      if (m.type === 'Individu') {
        counts['Bimbingan Individu']++;
      } else {
        counts['Bimbingan Kelompok']++;
      }

      const topicLower = (m.topic || '').toLowerCase();
      if (topicLower.includes('akademik') || topicLower.includes('nilai') || topicLower.includes('belajar')) {
        counts['Konsultasi Akademik']++;
      } else {
        counts['Sosial & Karakter']++;
      }
    });
    return counts;
  }, [filteredMeetings]);

  // Incident categories breakdown
  const incidentCategoryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {
      Kedisiplinan: 0,
      Prestasi: 0,
      Kehadiran: 0,
      Karakter: 0
    };
    filteredIncidents.forEach(inc => {
      const cat = inc.category || 'Kedisiplinan';
      if (cat.includes('Sosial') || cat.includes('Karakter')) {
        counts.Karakter++;
      } else if (counts[cat] !== undefined) {
        counts[cat]++;
      } else {
        counts.Kedisiplinan++;
      }
    });
    return counts;
  }, [filteredIncidents]);

  // Guru Wali workload overview
  const teacherWorkloads = useMemo(() => {
    return guruWaliList.map(teacher => {
      const assigned = students.filter(s => s.guruWali === teacher.name);
      const studentIds = new Set(assigned.map(s => s.id));
      const sessions = meetings.filter(m => m.studentIds && m.studentIds.some(id => studentIds.has(id))).length;
      const notes = incidents.filter(i => studentIds.has(i.studentId)).length;
      return {
        teacher,
        assignedCount: assigned.length,
        sessionCount: sessions,
        incidentCount: notes
      };
    });
  }, [guruWaliList, students, meetings, incidents]);

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-1">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span>ANALISIS DATA & STATISTIK PEMBINAAN SATDIK</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 font-['Poppins']">
            Statistik & Monitoring Terpadu
          </h1>
          <p className="text-xs text-gray-500">
            Pusat analitik perkembangan, kehadiran, dan tindak lanjut siswa UPT SMP Negeri 1 Suppa
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-500 font-medium">Filter Rombel:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-transparent font-bold text-gray-800 outline-hidden cursor-pointer"
            >
              <option value="Semua">Semua Rombel ({students.length} Siswa)</option>
              {uniqueClasses.map(cls => (
                <option key={cls} value={cls}>Kelas {cls}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-gray-700" />
            <span>Cetak Statistik</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-900 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Siswa Terdata</div>
            <div className="text-2xl font-extrabold text-gray-900 font-['Poppins']">{filteredStudents.length}</div>
            <div className="text-[10px] text-gray-600 font-medium mt-0.5">
              {selectedClass === 'Semua' ? 'Seluruh Rombel Sekolah' : `Kelas ${selectedClass}`}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Rekap Sesi</div>
            <div className="text-2xl font-extrabold text-gray-900 font-['Poppins']">{filteredMeetings.length}</div>
            <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
              Sesi Bimbingan Tercatat
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Rata-rata Presensi</div>
            <div className="text-2xl font-extrabold text-gray-900 font-['Poppins']">{avgAttendance}%</div>
            <div className="text-[10px] text-purple-600 font-medium mt-0.5">
              Tingkat Kehadiran Siswa
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Catatan Tindak Lanjut</div>
            <div className="text-2xl font-extrabold text-gray-900 font-['Poppins']">{filteredIncidents.length}</div>
            <div className="text-[10px] text-amber-600 font-medium mt-0.5">
              Perkembangan & Kasus
            </div>
          </div>
        </div>
      </div>

      {/* Row 1: Status Distribution & Attendance per Class */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Distribusi Status Siswa */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#1E4FD8]" />
              <h3 className="font-bold text-sm text-gray-800">Distribusi Status Siswa</h3>
            </div>
            <span className="text-[11px] font-semibold text-gray-500">{filteredStudents.length} Siswa</span>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Normal / Stabil', count: statusCounts.Normal, color: 'bg-emerald-500', barBg: 'bg-emerald-100', text: 'text-emerald-700' },
              { label: 'Prestasi Akademik / Non-Akademik', count: statusCounts.Prestasi, color: 'bg-blue-500', barBg: 'bg-blue-100', text: 'text-blue-700' },
              { label: 'Dalam Pantauan Guru Wali', count: statusCounts['Dalam Pantauan'], color: 'bg-indigo-500', barBg: 'bg-indigo-100', text: 'text-indigo-700' },
              { label: 'Perlu Perhatian Khusus', count: statusCounts['Perlu Perhatian'], color: 'bg-amber-500', barBg: 'bg-amber-100', text: 'text-amber-700' },
              { label: 'Kritis / Butuh Tindakan Cepat', count: statusCounts.Kritis, color: 'bg-red-500', barBg: 'bg-red-100', text: 'text-red-700' }
            ].map(item => {
              const pct = Math.round((item.count / totalStudents) * 100);
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-gray-700">{item.label}</span>
                    <span className={`font-bold ${item.text}`}>{item.count} siswa ({pct}%)</span>
                  </div>
                  <div className={`w-full h-2.5 rounded-full ${item.barBg} overflow-hidden`}>
                    <div 
                      className={`h-full rounded-full ${item.color} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 2: Tingkat Kehadiran per Rombel */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-gray-800">Tingkat Kehadiran per Rombel</h3>
            </div>
            <span className="text-[11px] font-semibold text-gray-500">{uniqueClasses.length} Rombel</span>
          </div>

          <div className="space-y-2.5">
            {uniqueClasses.map(cls => {
              const clsStudents = students.filter(s => s.class === cls);
              const clsAvg = clsStudents.reduce((acc, curr) => {
                return acc + (parseFloat(curr.attendance.replace('%', '')) || 0);
              }, 0) / (clsStudents.length || 1);
              const rounded = Math.round(clsAvg * 10) / 10;
              return (
                <div key={cls} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-200/70 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-100 text-[#1E4FD8] font-bold flex items-center justify-center text-xs">
                      {cls}
                    </span>
                    <div>
                      <span className="font-bold text-gray-900">Kelas {cls}</span>
                      <span className="text-gray-500 text-[11px] ml-2">({clsStudents.length} siswa)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-200 h-2 rounded-full overflow-hidden hidden sm:block">
                      <div 
                        className={`h-full rounded-full ${rounded >= 95 ? 'bg-emerald-500' : rounded >= 85 ? 'bg-blue-500' : 'bg-amber-500'}`}
                        style={{ width: `${Math.min(rounded, 100)}%` }}
                      />
                    </div>
                    <span className={`font-extrabold text-xs ${rounded >= 95 ? 'text-emerald-600' : rounded >= 85 ? 'text-blue-600' : 'text-amber-600'}`}>
                      {rounded}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 2: Topik Bimbingan & Monitoring Guru Wali */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sesi Bimbingan per Kategori */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-purple-600" />
              <h3 className="font-bold text-sm text-gray-800">Komposisi Bidang Bimbingan</h3>
            </div>
            <span className="text-[11px] font-semibold text-gray-500">{filteredMeetings.length} Sesi Terlaksana</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {Object.entries(meetingTypeBreakdown).map(([type, count]) => {
              const total = filteredMeetings.length || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={type} className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl space-y-1">
                  <div className="text-[11px] font-bold text-purple-900">{type}</div>
                  <div className="text-xl font-extrabold text-gray-900 font-['Poppins']">{count} <span className="text-xs text-gray-500 font-normal">sesi</span></div>
                  <div className="text-[10px] text-purple-700 font-medium">{pct}% dari total sesi</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rekap Kejadian & Prestasi */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-sm text-gray-800">Kategori Tindak Lanjut & Kasus</h3>
            </div>
            <span className="text-[11px] font-semibold text-gray-500">{filteredIncidents.length} Catatan</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {Object.entries(incidentCategoryBreakdown).map(([cat, count]) => {
              const total = filteredIncidents.length || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={cat} className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl space-y-1">
                  <div className="text-[11px] font-bold text-amber-900">{cat}</div>
                  <div className="text-xl font-extrabold text-gray-900 font-['Poppins']">{count} <span className="text-xs text-gray-500 font-normal">kejadian</span></div>
                  <div className="text-[10px] text-amber-700 font-medium">{pct}% dari total catatan</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: Tabel Rekapitulasi Pembinaan Guru Wali (Monitoring Kepala Sekolah) */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <div>
              <h3 className="font-bold text-sm text-gray-800">Monitoring Beban Pembinaan Seluruh Guru Wali</h3>
              <p className="text-[11px] text-gray-500">Supervisi rasio binaan, keaktifan konseling, dan rekap tindak lanjut per guru wali</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {guruWaliList.length} Guru Wali Terdaftar
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200 uppercase text-[10px]">
              <tr>
                <th className="p-3">Nama Guru Wali</th>
                <th className="p-3">NIP / Identitas</th>
                <th className="p-3 text-center">Jumlah Binaan</th>
                <th className="p-3 text-center">Sesi Bimbingan</th>
                <th className="p-3 text-center">Catatan Tindak Lanjut</th>
                <th className="p-3 text-center">Status Keaktifan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {teacherWorkloads.map(item => (
                <tr key={item.teacher.id} className="hover:bg-gray-50/80 transition">
                  <td className="p-3 font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-[#1E4FD8] flex items-center justify-center text-[10px] font-bold">
                      {item.teacher.name.charAt(0)}
                    </span>
                    <span>{item.teacher.name}</span>
                  </td>
                  <td className="p-3 text-gray-500 font-mono text-[11px]">{item.teacher.nip}</td>
                  <td className="p-3 text-center">
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                      {item.assignedCount} siswa
                    </span>
                  </td>
                  <td className="p-3 text-center font-bold text-emerald-700">
                    {item.sessionCount} sesi
                  </td>
                  <td className="p-3 text-center font-bold text-amber-700">
                    {item.incidentCount} kasus
                  </td>
                  <td className="p-3 text-center">
                    {item.assignedCount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Aktif Membina</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        Belum Diberi Binaan
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
