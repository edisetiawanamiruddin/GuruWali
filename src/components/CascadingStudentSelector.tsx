import React, { useState, useMemo } from 'react';
import { Search, UserCheck, Filter } from 'lucide-react';
import { Student } from '../types';

interface CascadingStudentSelectorProps {
  students: Student[];
  selectedStudentId: string;
  onSelectStudent: (student: Student) => void;
  label?: string;
  required?: boolean;
}

export const CascadingStudentSelector: React.FC<CascadingStudentSelectorProps> = ({
  students,
  selectedStudentId,
  onSelectStudent,
  label = 'Pilih Peserta Didik',
  required = true
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [quickSearch, setQuickSearch] = useState<string>('');

  // Extract unique class list
  const classList = useMemo(() => {
    const classes = Array.from(new Set(students.map(s => s.class))).filter(Boolean);
    return classes.sort();
  }, [students]);

  // Filter students based on selected class and search
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchClass = !selectedClass || s.class === selectedClass;
      const matchSearch = !quickSearch || 
        s.name.toLowerCase().includes(quickSearch.toLowerCase()) || 
        s.nis.includes(quickSearch) ||
        s.nisn.includes(quickSearch);
      return matchClass && matchSearch;
    });
  }, [students, selectedClass, quickSearch]);

  const currentStudent = students.find(s => s.id === selectedStudentId);

  return (
    <div className="space-y-2 text-xs">
      <div className="flex items-center justify-between">
        <label className="font-semibold text-gray-700">{label}</label>
        {currentStudent && (
          <span className="text-[11px] text-[#1E4FD8] font-medium">
            Terpilih: <strong>{currentStudent.name}</strong> ({currentStudent.class})
          </span>
        )}
      </div>

      {/* Cascading Controls: Class Dropdown + Search Input + Student Dropdown */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-gray-50/70 p-2.5 rounded-xl border border-gray-200">
        {/* 1. Filter Kelas */}
        <div className="sm:col-span-4">
          <div className="flex items-center gap-1 text-[10px] text-gray-500 font-semibold uppercase mb-1">
            <Filter className="w-3 h-3 text-[#1E4FD8]" />
            <span>Tingkat Kelas</span>
          </div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs outline-none focus:border-[#1E4FD8]"
          >
            <option value="">Semua Rombel ({students.length} Siswa)</option>
            {classList.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>

        {/* 2. Quick Search (Ketik Nama / NIS) */}
        <div className="sm:col-span-4">
          <div className="flex items-center gap-1 text-[10px] text-gray-500 font-semibold uppercase mb-1">
            <Search className="w-3 h-3 text-gray-400" />
            <span>Ketik Nama / NIS</span>
          </div>
          <input
            type="text"
            placeholder="Cari cepat..."
            value={quickSearch}
            onChange={(e) => setQuickSearch(e.target.value)}
            className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs outline-none focus:border-[#1E4FD8]"
          />
        </div>

        {/* 3. Dropdown Pilih Nama Siswa */}
        <div className="sm:col-span-4">
          <div className="flex items-center gap-1 text-[10px] text-gray-500 font-semibold uppercase mb-1">
            <UserCheck className="w-3 h-3 text-emerald-600" />
            <span>Daftar Siswa ({filteredStudents.length})</span>
          </div>
          <select
            value={selectedStudentId}
            onChange={(e) => {
              const target = students.find(s => s.id === e.target.value);
              if (target) onSelectStudent(target);
            }}
            required={required}
            className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-900 outline-none focus:border-[#1E4FD8]"
          >
            {filteredStudents.length === 0 ? (
              <option value="">Tidak ada siswa yang cocok</option>
            ) : (
              filteredStudents.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} • {s.nis} ({s.class})
                </option>
              ))
            )}
          </select>
        </div>
      </div>
    </div>
  );
};
