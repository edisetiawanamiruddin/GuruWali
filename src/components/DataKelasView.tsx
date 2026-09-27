import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, Users, UserCheck, GraduationCap, Search, 
  Plus, ExternalLink, ChevronRight, ChevronLeft, CheckCircle2, Shield,
  Printer, Download, Edit3, Trash2, Eye, X, AlertTriangle,
  FileSpreadsheet, Filter, ArrowUpDown, Building2, User,
  Calendar, Check, AlertCircle, FileText, RotateCcw
} from 'lucide-react';
import { Student, Teacher, ClassRoom } from '../types';

interface DataKelasViewProps {
  students: Student[];
  teachers: Teacher[];
  classes: ClassRoom[];
  onAddClass: (cls: ClassRoom) => void;
  onUpdateClass: (cls: ClassRoom) => void;
  onDeleteClass: (classId: string) => void;
  onSelectClass?: (className: string) => void;
  onNavigateToSiswa?: (className: string) => void;
  activeAcademicYear?: string;
}

export const DataKelasView: React.FC<DataKelasViewProps> = ({
  students,
  teachers,
  classes,
  onAddClass,
  onUpdateClass,
  onDeleteClass,
  onNavigateToSiswa,
  activeAcademicYear = '2024/2025 Genap'
}) => {
  // Filters & View State
  const [selectedLevel, setSelectedLevel] = useState<string>('Semua');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortBy, setSortBy] = useState<'name' | 'students' | 'tingkat'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modals State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);
  const [previewClass, setPreviewClass] = useState<ClassRoom | null>(null);
  const [printClass, setPrintClass] = useState<ClassRoom | null>(null);
  const [printAllSummary, setPrintAllSummary] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState<{
    name: string;
    tingkat: 'Kelas VII' | 'Kelas VIII' | 'Kelas IX';
    waliKelas: string;
    nipWalas: string;
    guruWaliUtama: string;
    ruang: string;
    kapasitas: number;
    tahunAjaran: string;
    status: 'Aktif' | 'Nonaktif';
    keterangan: string;
  }>({
    name: '',
    tingkat: 'Kelas VII',
    waliKelas: '',
    nipWalas: '',
    guruWaliUtama: 'Drs. H. Ahmad Dahlan, M.Pd',
    ruang: 'Ruang Teori',
    kapasitas: 32,
    tahunAjaran: activeAcademicYear,
    status: 'Aktif',
    keterangan: ''
  });

  // Calculate student count per class from actual students data
  const classStats = useMemo(() => {
    const stats: Record<string, { total: number; kritis: number; perhatian: number; prestasi: number; normal: number; l: number; p: number }> = {};
    classes.forEach(c => {
      const clsStudents = students.filter(s => s.class === c.name);
      stats[c.name] = {
        total: clsStudents.length,
        kritis: clsStudents.filter(s => s.status === 'Kritis').length,
        perhatian: clsStudents.filter(s => s.status === 'Perlu Perhatian' || s.status === 'Dalam Pantauan').length,
        prestasi: clsStudents.filter(s => s.status === 'Prestasi').length,
        normal: clsStudents.filter(s => s.status === 'Normal').length,
        l: clsStudents.filter(s => s.gender === 'L').length,
        p: clsStudents.filter(s => s.gender === 'P').length,
      };
    });
    return stats;
  }, [classes, students]);

  // Overall totals
  const totalStudentsInClasses = useMemo(() => {
    return classes.reduce((acc, c) => acc + (classStats[c.name]?.total || 0), 0);
  }, [classes, classStats]);

  const totalCapacity = useMemo(() => {
    return classes.reduce((acc, c) => acc + c.kapasitas, 0);
  }, [classes]);

  // Filter & Sort
  const filteredClasses = useMemo(() => {
    return classes.filter(cls => {
      const matchSearch = cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cls.waliKelas.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cls.ruang.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cls.nipWalas.includes(searchQuery);
      const matchLevel = selectedLevel === 'Semua' || cls.tingkat === selectedLevel;
      const matchStatus = statusFilter === 'Semua' || cls.status === statusFilter;
      return matchSearch && matchLevel && matchStatus;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'students') {
        const aCount = classStats[a.name]?.total || 0;
        const bCount = classStats[b.name]?.total || 0;
        comparison = aCount - bCount;
      } else if (sortBy === 'tingkat') {
        comparison = a.tingkat.localeCompare(b.tingkat);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [classes, searchQuery, selectedLevel, statusFilter, sortBy, sortOrder, classStats]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedLevel, statusFilter, pageSize]);

  // Pagination calculation
  const totalPages = pageSize === -1 ? 1 : Math.ceil(filteredClasses.length / pageSize) || 1;
  const paginatedClasses = useMemo(() => {
    if (pageSize === -1) return filteredClasses;
    const start = (currentPage - 1) * pageSize;
    return filteredClasses.slice(start, start + pageSize);
  }, [filteredClasses, currentPage, pageSize]);

  // Export to CSV Function
  const handleExportCSV = () => {
    const headers = ['No', 'Nama Rombel', 'Tingkat', 'Wali Kelas', 'NIP Wali Kelas', 'Ruang', 'Kapasitas', 'Terisi', 'Kritis', 'Perhatian', 'Prestasi', 'Status', 'Tahun Ajaran'];
    const rows = filteredClasses.map((c, i) => {
      const st = classStats[c.name] || { total: 0, kritis: 0, perhatian: 0, prestasi: 0 };
      return [
        i + 1,
        `"${c.name}"`,
        `"${c.tingkat}"`,
        `"${c.waliKelas}"`,
        `"${c.nipWalas || '-'}"`,
        `"${c.ruang}"`,
        c.kapasitas,
        st.total,
        st.kritis,
        st.perhatian,
        st.prestasi,
        `"${c.status}"`,
        `"${c.tahunAjaran}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Data_Kelas_Rombel_UPT_SMPN_1_Suppa_${activeAcademicYear.replace(/[\/\s]+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open Edit Modal
  const handleOpenEdit = (cls: ClassRoom) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name,
      tingkat: cls.tingkat,
      waliKelas: cls.waliKelas,
      nipWalas: cls.nipWalas,
      guruWaliUtama: cls.guruWaliUtama || 'Drs. H. Ahmad Dahlan, M.Pd',
      ruang: cls.ruang,
      kapasitas: cls.kapasitas,
      tahunAjaran: cls.tahunAjaran,
      status: cls.status,
      keterangan: cls.keterangan || ''
    });
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    const defaultWalas = teachers[0] || { name: '', nip: '' };
    setFormData({
      name: 'Kelas VII-C',
      tingkat: 'Kelas VII',
      waliKelas: defaultWalas.name,
      nipWalas: defaultWalas.nip,
      guruWaliUtama: 'Drs. H. Ahmad Dahlan, M.Pd',
      ruang: `Ruang Teori ${classes.length + 1}`,
      kapasitas: 32,
      tahunAjaran: activeAcademicYear,
      status: 'Aktif',
      keterangan: 'Rombongan Belajar Baru'
    });
    setShowAddModal(true);
  };

  // Handle Save (Add or Update)
  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.waliKelas.trim()) return;

    if (editingClass) {
      const updated: ClassRoom = {
        ...editingClass,
        ...formData
      };
      onUpdateClass(updated);
      setEditingClass(null);
    } else {
      const newCls: ClassRoom = {
        id: `KLS_${Date.now()}`,
        ...formData
      };
      onAddClass(newCls);
      setShowAddModal(false);
    }
  };

  // Select Walas and auto-populate NIP
  const handleSelectWalas = (teacherName: string) => {
    const matched = teachers.find(t => t.name === teacherName);
    setFormData(prev => ({
      ...prev,
      waliKelas: teacherName,
      nipWalas: matched?.nip || ''
    }));
  };

  // Print trigger helper
  const handlePrint = () => {
    window.print();
  };

  // Students of previewed or printed class
  const activeClassStudents = useMemo(() => {
    const targetName = previewClass?.name || printClass?.name;
    if (!targetName) return [];
    return students.filter(s => s.class === targetName);
  }, [students, previewClass, printClass]);

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumbs matching reference images */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-[#1E4FD8] uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            <span>MANAJEMEN ROMBONGAN BELAJAR • T.A. {activeAcademicYear}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">
            Data Kelas &amp; Rombel Siswa
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Kelola data rombongan belajar tingkat VII, VIII, dan IX, penugasan wali kelas, rasio peserta didik, serta cetak lembar rombel resmi.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
            title="Unduh Rekap Data Rombel format CSV / Excel"
          >
            <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setPrintAllSummary(true)}
            className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
            title="Cetak Rekapitulasi Rombel Sekolah"
          >
            <Printer className="w-4 h-4 text-gray-600 dark:text-slate-400" />
            <span>Cetak Rekap Kelas</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#1E4FD8] hover:bg-[#1A42B8] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Rombel Baru</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0F172A] p-4 rounded-2xl border border-gray-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase">TOTAL ROMBEL</span>
            <span className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-[#1E4FD8] dark:text-blue-400 flex items-center justify-center font-bold text-xs">
              <BookOpen className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{classes.length}</div>
          <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
            {classes.filter(c => c.status === 'Aktif').length} Rombel Aktif • TA {activeAcademicYear}
          </div>
        </div>

        <div className="bg-white dark:bg-[#0F172A] p-4 rounded-2xl border border-gray-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase">SISWA TERDISTRIBUSI</span>
            <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{totalStudentsInClasses}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
            Dari kapasitas total {totalCapacity} kursi ({Math.round((totalStudentsInClasses / (totalCapacity || 1)) * 100)}%)
          </div>
        </div>

        <div className="bg-white dark:bg-[#0F172A] p-4 rounded-2xl border border-gray-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase">WALI KELAS DITUGASKAN</span>
            <span className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
              <UserCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {new Set(classes.map(c => c.waliKelas)).size}
          </div>
          <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
            100% Rombel memiliki Wali Kelas definitif
          </div>
        </div>

        <div className="bg-white dark:bg-[#0F172A] p-4 rounded-2xl border border-gray-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase">STATUS PERHATIAN</span>
            <span className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            {classes.reduce((acc, c) => acc + (classStats[c.name]?.perhatian || 0) + (classStats[c.name]?.kritis || 0), 0)}
          </div>
          <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
            Siswa perlu pendampingan di seluruh rombel
          </div>
        </div>
      </div>

      {/* Filter, Search & View Mode Bar */}
      <div className="bg-white dark:bg-[#0F172A] p-4 rounded-2xl border border-gray-200/90 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Cari rombel, nama wali kelas, NIP, ruang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl text-xs outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-[#1E4FD8] transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns & Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Level Filter */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl text-xs font-semibold outline-none focus:border-[#1E4FD8]"
          >
            <option value="Semua">Semua Tingkat</option>
            <option value="Kelas VII">Kelas VII</option>
            <option value="Kelas VIII">Kelas VIII</option>
            <option value="Kelas IX">Kelas IX</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl text-xs font-semibold outline-none focus:border-[#1E4FD8]"
          >
            <option value="Semua">Semua Status</option>
            <option value="Aktif">Status Aktif</option>
            <option value="Nonaktif">Status Nonaktif</option>
          </select>

          {/* Page Size Selector */}
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="px-2.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-xl text-xs font-semibold outline-none"
            title="Jumlah baris per halaman"
          >
            <option value={5}>5 / hal</option>
            <option value={10}>10 / hal</option>
            <option value={20}>20 / hal</option>
            <option value={-1}>Semua</option>
          </select>

          {/* Sort By */}
          <div className="flex items-center gap-1 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-2 py-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-semibold outline-none text-gray-700 dark:text-slate-200"
            >
              <option value="name">Urut: Nama</option>
              <option value="students">Urut: Siswa</option>
              <option value="tingkat">Urut: Tingkat</option>
            </select>
          </div>

          {/* Reset filter button if any active */}
          {(searchQuery || selectedLevel !== 'Semua' || statusFilter !== 'Semua') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedLevel('Semua');
                setStatusFilter('Semua');
              }}
              className="px-2.5 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
              title="Reset seluruh filter"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          {/* Toggle Table vs Grid */}
          <div className="flex items-center bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'table' 
                  ? 'bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-2xs' 
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Datatable
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'grid' 
                  ? 'bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-2xs' 
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Kartu
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: DATATABLE VIEW (Default) */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-3.5 px-4 w-12 text-center">No</th>
                  <th className="py-3.5 px-4">Rombongan Belajar</th>
                  <th className="py-3.5 px-4">Tingkat</th>
                  <th className="py-3.5 px-4">Wali Kelas &amp; NIP</th>
                  <th className="py-3.5 px-4">Ruang Kelas</th>
                  <th className="py-3.5 px-4">Kapasitas / Siswa</th>
                  <th className="py-3.5 px-4">Komposisi Kasus</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredClasses.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-400">
                      <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <div className="font-semibold text-sm text-gray-700">Tidak ada rombel ditemukan</div>
                      <p className="text-xs text-gray-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter tingkat kelas.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedClasses.map((cls, idx) => {
                    const st = classStats[cls.name] || { total: 0, kritis: 0, perhatian: 0, prestasi: 0, normal: 0, l: 0, p: 0 };
                    const occupancy = Math.round((st.total / (cls.kapasitas || 1)) * 100);
                    const rowNumber = pageSize === -1 ? idx + 1 : (currentPage - 1) * pageSize + idx + 1;

                    return (
                      <tr key={cls.id} className="hover:bg-gray-50/60 dark:hover:bg-slate-800/50 transition">
                        <td className="py-3.5 px-4 text-center text-gray-400 font-mono">
                          {rowNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1E4FD8] flex items-center justify-center font-bold text-xs shrink-0">
                              {cls.name.replace('Kelas ', '')}
                            </div>
                            <div>
                              <button
                                type="button"
                                onClick={() => setPreviewClass(cls)}
                                className="font-bold text-gray-900 hover:text-[#1E4FD8] text-xs text-left cursor-pointer transition block"
                              >
                                {cls.name}
                              </button>
                              <div className="text-[10px] text-gray-400">{cls.tahunAjaran}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px]">
                            {cls.tingkat}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-gray-900">{cls.waliKelas}</div>
                          <div className="text-[10px] text-gray-400 font-mono">NIP. {cls.nipWalas || '-'}</div>
                        </td>
                        <td className="py-3.5 px-4 text-gray-600">
                          {cls.ruang}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-bold text-gray-900">{st.total} Siswa</span>
                            <span className="text-gray-400">Maks. {cls.kapasitas}</span>
                          </div>
                          <div className="w-28 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                occupancy > 100 ? 'bg-red-500' : occupancy >= 80 ? 'bg-emerald-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${Math.min(occupancy, 100)}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {st.kritis > 0 && (
                              <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold text-[9px]">
                                {st.kritis} Kritis
                              </span>
                            )}
                            {st.perhatian > 0 && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-bold text-[9px]">
                                {st.perhatian} Perhatian
                              </span>
                            )}
                            {st.prestasi > 0 && (
                              <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-bold text-[9px]">
                                {st.prestasi} Prestasi
                              </span>
                            )}
                            {st.kritis === 0 && st.perhatian === 0 && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[9px]">
                                {st.normal} Kondusif
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            cls.status === 'Aktif' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {cls.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {/* Preview */}
                            <button
                              type="button"
                              onClick={() => setPreviewClass(cls)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Lihat Roster & Detail Siswa"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Print */}
                            <button
                              type="button"
                              onClick={() => setPrintClass(cls)}
                              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                              title="Cetak Lembar Rombel Resmi (PDF)"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(cls)}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                              title="Ubah Data Rombel"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(cls.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                              title="Hapus Rombel"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* Table Footer with Full Pagination Controls */}
          <div className="p-4 bg-gray-50 dark:bg-slate-800/90 border-t border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 dark:text-slate-400 gap-3">
            <div className="flex items-center gap-2">
              <span>
                Menampilkan <span className="font-bold text-gray-900 dark:text-white">
                  {filteredClasses.length === 0 ? 0 : pageSize === -1 ? `1 - ${filteredClasses.length}` : `${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, filteredClasses.length)}`}
                </span> dari <span className="font-bold text-gray-900 dark:text-white">{filteredClasses.length}</span> Rombel
              </span>
              {filteredClasses.length !== classes.length && (
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                  (terfilter dari total {classes.length})
                </span>
              )}
            </div>

            {/* Pagination buttons */}
            {totalPages > 1 && pageSize !== -1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 transition flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Sebelumnya</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                        currentPage === pageNum
                          ? 'bg-[#1E4FD8] text-white shadow-2xs'
                          : 'border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 transition flex items-center gap-1 cursor-pointer"
                >
                  <span>Berikutnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: GRID CARDS VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClasses.map((cls) => {
            const st = classStats[cls.name] || { total: 0, kritis: 0, perhatian: 0, prestasi: 0, normal: 0, l: 0, p: 0 };
            return (
              <div 
                key={cls.id}
                className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-2xs hover:shadow-xs transition space-y-4 relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#1E4FD8] flex items-center justify-center font-bold text-base shadow-2xs">
                        {cls.name.replace('Kelas ', '')}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-gray-900 leading-snug">{cls.name}</h3>
                        <div className="text-[11px] text-gray-400">{cls.ruang}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      cls.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {cls.status}
                    </span>
                  </div>

                  {/* Walas Info */}
                  <div className="mt-4 p-3 bg-gray-50/80 rounded-xl border border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold uppercase">WALI KELAS</span>
                      <span className="font-bold text-xs text-gray-900">{cls.waliKelas}</span>
                      <div className="text-[10px] text-gray-500 font-mono">NIP. {cls.nipWalas || '-'}</div>
                    </div>
                    <UserCheck className="w-4 h-4 text-gray-400" />
                  </div>

                  {/* Stats Bar */}
                  <div className="mt-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 font-medium">Peserta Didik:</span>
                      <span className="font-bold text-gray-900">{st.total} / {cls.kapasitas} Siswa</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                      <div className="p-1.5 rounded-lg bg-red-50 text-red-700">
                        <span className="font-bold block text-xs">{st.kritis}</span> Kritis
                      </div>
                      <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
                        <span className="font-bold block text-xs">{st.perhatian}</span> Perhatian
                      </div>
                      <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
                        <span className="font-bold block text-xs">{st.prestasi}</span> Prestasi
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(cls)}
                      className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg text-xs transition"
                      title="Ubah Data"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrintClass(cls)}
                      className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg text-xs transition"
                      title="Cetak Roster"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPreviewClass(cls)}
                    className="px-3 py-1.5 bg-[#1E4FD8] hover:bg-[#1A42B8] text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <span>Detail Siswa</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: TAMBAH / UBAH KELAS */}
      {(showAddModal || editingClass) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-base text-gray-900">
                  {editingClass ? `Ubah Data ${editingClass.name}` : 'Tambah Rombongan Belajar Baru'}
                </h3>
                <p className="text-xs text-gray-500">
                  Konfigurasikan informasi nama rombel, tingkat kelas, ruang, dan penugasan wali kelas.
                </p>
              </div>
              <button 
                onClick={() => { setShowAddModal(false); setEditingClass(null); }}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Nama Rombel / Kelas *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kelas VIII-C"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#1E4FD8]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Tingkat Kelas *</label>
                  <select
                    value={formData.tingkat}
                    onChange={(e) => setFormData({ ...formData, tingkat: e.target.value as any })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#1E4FD8]"
                  >
                    <option value="Kelas VII">Kelas VII</option>
                    <option value="Kelas VIII">Kelas VIII</option>
                    <option value="Kelas IX">Kelas IX</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Wali Kelas Penanggung Jawab *</label>
                <select
                  value={formData.waliKelas}
                  onChange={(e) => handleSelectWalas(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#1E4FD8]"
                  required
                >
                  <option value="">-- Pilih Guru Wali / Walas --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.name}>
                      {t.name} (NIP. {t.nip}) • {t.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Ruang Kelas</label>
                  <input
                    type="text"
                    placeholder="Contoh: Ruang Teori 7"
                    value={formData.ruang}
                    onChange={(e) => setFormData({ ...formData, ruang: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#1E4FD8]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Kapasitas Maksimal (Siswa)</label>
                  <input
                    type="number"
                    min={10}
                    max={45}
                    value={formData.kapasitas}
                    onChange={(e) => setFormData({ ...formData, kapasitas: parseInt(e.target.value) || 32 })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#1E4FD8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Tahun Ajaran</label>
                  <input
                    type="text"
                    value={formData.tahunAjaran}
                    onChange={(e) => setFormData({ ...formData, tahunAjaran: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#1E4FD8]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Status Rombel</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#1E4FD8]"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Keterangan / Catatan Tambahan</label>
                <textarea
                  rows={2}
                  placeholder="Catatan profil kelas, kekhususan minat, dsb..."
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#1E4FD8]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingClass(null); }}
                  className="px-4 py-2 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1E4FD8] hover:bg-[#1A42B8] text-white rounded-xl font-semibold shadow-xs transition"
                >
                  {editingClass ? 'Simpan Perubahan' : 'Tambah Rombel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PREVIEW DETAIL KELAS & ROSTER SISWA */}
      {previewClass && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1E4FD8] flex items-center justify-center font-bold text-base">
                  {previewClass.name.replace('Kelas ', '')}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 leading-tight">
                    {previewClass.name} — Detail Rombel &amp; Daftar Siswa
                  </h3>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {previewClass.ruang} • TA {previewClass.tahunAjaran} • Wali Kelas: {previewClass.waliKelas}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = previewClass;
                    setPreviewClass(null);
                    setPrintClass(target);
                  }}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Roster (PDF)</span>
                </button>
                <button
                  onClick={() => setPreviewClass(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-[10px] text-gray-400 font-semibold block uppercase">WALI KELAS</span>
                  <div className="font-bold text-sm text-gray-900 mt-0.5">{previewClass.waliKelas}</div>
                  <div className="text-[11px] text-gray-500 font-mono">NIP. {previewClass.nipWalas || '-'}</div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-[10px] text-gray-400 font-semibold block uppercase">GURU WALI PEMBINA</span>
                  <div className="font-bold text-sm text-[#1E4FD8] mt-0.5">{previewClass.guruWaliUtama || 'Drs. H. Ahmad Dahlan, M.Pd'}</div>
                  <div className="text-[11px] text-gray-500">Pendampingan Perwalian Terpadu</div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-[10px] text-gray-400 font-semibold block uppercase">STATISTIK SISWA</span>
                  <div className="font-bold text-sm text-gray-900 mt-0.5">
                    {activeClassStudents.length} Siswa Terdaftar
                  </div>
                  <div className="text-[11px] text-gray-500">
                    L: {activeClassStudents.filter(s => s.gender === 'L').length} Siswa • P: {activeClassStudents.filter(s => s.gender === 'P').length} Siswa
                  </div>
                </div>
              </div>

              {/* Student Table */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#1E4FD8]" />
                    <span>Daftar Peserta Didik Rombel ({activeClassStudents.length})</span>
                  </h4>
                  {onNavigateToSiswa && (
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewClass(null);
                        onNavigateToSiswa(previewClass.name);
                      }}
                      className="text-xs text-[#1E4FD8] hover:underline font-semibold flex items-center gap-1"
                    >
                      <span>Buka di Menu Data Siswa</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px]">
                        <th className="py-2.5 px-3 w-10 text-center">No</th>
                        <th className="py-2.5 px-3">Nama Siswa</th>
                        <th className="py-2.5 px-3">NIS / NISN</th>
                        <th className="py-2.5 px-3 text-center">L/P</th>
                        <th className="py-2.5 px-3">Status Perwalian</th>
                        <th className="py-2.5 px-3 text-center">Kehadiran</th>
                        <th className="py-2.5 px-3">Kontak Orang Tua</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {activeClassStudents.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-400">
                            Belum ada data siswa terdaftar dalam rombel ini.
                          </td>
                        </tr>
                      ) : (
                        activeClassStudents.map((s, idx) => (
                          <tr key={s.id} className="hover:bg-gray-50/50">
                            <td className="py-2.5 px-3 text-center text-gray-400 font-mono">{idx + 1}</td>
                            <td className="py-2.5 px-3 font-semibold text-gray-900">{s.name}</td>
                            <td className="py-2.5 px-3 text-gray-500 font-mono text-[11px]">{s.nis} / {s.nisn}</td>
                            <td className="py-2.5 px-3 text-center font-bold text-gray-700">{s.gender}</td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                                s.status === 'Kritis' ? 'bg-red-100 text-red-700' :
                                s.status === 'Perlu Perhatian' ? 'bg-amber-100 text-amber-700' :
                                s.status === 'Prestasi' ? 'bg-purple-100 text-purple-700' :
                                'bg-emerald-50 text-emerald-700'
                              }`}>
                                {s.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center font-semibold text-gray-800">{s.attendance}</td>
                            <td className="py-2.5 px-3 text-gray-500 text-[11px]">{s.phone}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs">
              <span className="text-gray-500">
                Total Rombel: {activeClassStudents.length} Siswa Aktif
              </span>
              <button
                type="button"
                onClick={() => setPreviewClass(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-semibold transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CETAK LEMBAR ROMBEL RESMI (A4 STANDAR DOKUMEN SEKOLAH) */}
      {printClass && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-8 shadow-2xl border border-gray-200 my-auto text-black print-card">
            {/* Top Toolbar (Hidden during print) */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6 no-print">
              <div>
                <h3 className="font-bold text-base text-gray-900">Pratinjau Cetak Lembar Rombel</h3>
                <p className="text-xs text-gray-500">Dokumen format resmi A4 lengkap dengan Kop Sekolah dan Tanda Tangan.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2 bg-[#1E4FD8] hover:bg-[#1A42B8] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Dokumen Sekarang</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintClass(null)}
                  className="px-3.5 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-semibold transition"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* DOKUMEN CETAK A4 ASLI DENGAN KOP SEKOLAH */}
            <div className="p-4 sm:p-6 bg-white">
              {/* Kop Surat Resmi */}
              <div className="text-center pb-3 border-b-2 border-black relative">
                <div className="text-[12px] font-bold tracking-wider uppercase text-gray-900">
                  PEMERINTAH KABUPATEN PINRANG
                </div>
                <div className="text-[13px] font-bold tracking-wider uppercase text-gray-900">
                  DINAS PENDIDIKAN DAN KEBUDAYAAN
                </div>
                <div className="text-[17px] font-black tracking-wide text-gray-900 mt-0.5">
                  UPT SMP NEGERI 1 SUPPA
                </div>
                <div className="text-[10px] text-gray-700 mt-1 leading-tight">
                  Alamat: Jl. Andi Dewang No. 12, Majennang, Kec. Suppa, Kab. Pinrang, Sulawesi Selatan 91272<br />
                  Pos-el: smpn1suppa@pinrangkab.go.id • Laman: smpn1suppa.sch.id • Akreditasi A • NPSN: 40304859
                </div>
              </div>
              <div className="border-b border-black mt-0.5 mb-5"></div>

              {/* Judul Dokumen */}
              <div className="text-center mb-5">
                <h2 className="text-sm font-black uppercase tracking-wider underline">
                  DAFTAR NOMINATIF PESERTA DIDIK &amp; DATA ROMBONGAN BELAJAR
                </h2>
                <div className="text-xs font-semibold text-gray-700 mt-0.5">
                  TAHUN AJARAN {printClass.tahunAjaran.toUpperCase()}
                </div>
              </div>

              {/* Metadata Rombel Box */}
              <div className="grid grid-cols-2 gap-4 text-xs mb-4 p-3 bg-gray-50/50 border border-gray-300 rounded-lg">
                <div className="space-y-1">
                  <div className="flex">
                    <span className="w-28 font-semibold text-gray-700">Rombongan Belajar:</span>
                    <span className="font-bold text-gray-900">{printClass.name}</span>
                  </div>
                  <div className="flex">
                    <span className="w-28 font-semibold text-gray-700">Tingkat Kelas:</span>
                    <span className="text-gray-900">{printClass.tingkat}</span>
                  </div>
                  <div className="flex">
                    <span className="w-28 font-semibold text-gray-700">Ruang Kelas:</span>
                    <span className="text-gray-900">{printClass.ruang}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex">
                    <span className="w-32 font-semibold text-gray-700">Wali Kelas:</span>
                    <span className="font-bold text-gray-900">{printClass.waliKelas}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 font-semibold text-gray-700">NIP Wali Kelas:</span>
                    <span className="text-gray-900 font-mono">{printClass.nipWalas || '-'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 font-semibold text-gray-700">Jumlah Siswa:</span>
                    <span className="font-bold text-gray-900">{activeClassStudents.length} Peserta Didik</span>
                  </div>
                </div>
              </div>

              {/* Tabel Siswa Lengkap */}
              <div className="mb-6">
                <table className="w-full text-left text-[11px] border border-black border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b border-black text-center font-bold">
                      <th className="py-2 px-2 border-r border-black w-8">No</th>
                      <th className="py-2 px-3 border-r border-black text-left">Nama Lengkap Siswa</th>
                      <th className="py-2 px-2 border-r border-black w-20">NIS / NISN</th>
                      <th className="py-2 px-2 border-r border-black w-10">L/P</th>
                      <th className="py-2 px-3 border-r border-black">Status Perwalian</th>
                      <th className="py-2 px-2 border-r border-black w-16">Presensi</th>
                      <th className="py-2 px-3 border-black text-left">Catatan / Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeClassStudents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-4 text-center text-gray-500">
                          Tidak ada siswa dalam rombel ini.
                        </td>
                      </tr>
                    ) : (
                      activeClassStudents.map((s, idx) => (
                        <tr key={s.id} className="border-b border-black">
                          <td className="py-1.5 px-2 border-r border-black text-center">{idx + 1}</td>
                          <td className="py-1.5 px-3 border-r border-black font-semibold">{s.name}</td>
                          <td className="py-1.5 px-2 border-r border-black text-center font-mono text-[10px]">{s.nis} / {s.nisn}</td>
                          <td className="py-1.5 px-2 border-r border-black text-center font-bold">{s.gender}</td>
                          <td className="py-1.5 px-3 border-r border-black text-center">{s.status}</td>
                          <td className="py-1.5 px-2 border-r border-black text-center font-semibold">{s.attendance}</td>
                          <td className="py-1.5 px-3 border-black text-gray-700 text-[10px] truncate max-w-[150px]">{s.notes}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* 3 Kolom Tanda Tangan Resmi */}
              <div className="pt-4 grid grid-cols-3 text-center text-xs gap-4 break-inside-avoid">
                <div>
                  <div className="font-semibold text-gray-700">Wali Kelas,</div>
                  <div className="h-16"></div>
                  <div className="font-bold underline">{printClass.waliKelas}</div>
                  <div className="text-[10px] text-gray-600 font-mono">NIP. {printClass.nipWalas || '........................'}</div>
                </div>

                <div>
                  <div className="font-semibold text-gray-700">Guru Wali Pembina,</div>
                  <div className="h-16"></div>
                  <div className="font-bold underline">{printClass.guruWaliUtama || 'Drs. H. Ahmad Dahlan, M.Pd'}</div>
                  <div className="text-[10px] text-gray-600 font-mono">NIP. 197805122005011004</div>
                </div>

                <div>
                  <div className="font-semibold text-gray-700">
                    Suppa, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br />
                    Kepala UPT SMPN 1 Suppa,
                  </div>
                  <div className="h-12"></div>
                  <div className="font-bold underline">Drs. H. Syamsuddin, M.Si</div>
                  <div className="text-[10px] text-gray-600 font-mono">NIP. 196803121994121002</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: CETAK REKAPITULASI KELAS (SELURUH ROMBEL SEKOLAH) */}
      {printAllSummary && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-8 shadow-2xl border border-gray-200 my-auto text-black print-card">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6 no-print">
              <div>
                <h3 className="font-bold text-base text-gray-900">Rekapitulasi Struktur Rombongan Belajar</h3>
                <p className="text-xs text-gray-500">Rekap seluruh rombel tingkat VII, VIII, IX TA {activeAcademicYear}.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2 bg-[#1E4FD8] hover:bg-[#1A42B8] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Rekap (PDF)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintAllSummary(false)}
                  className="px-3.5 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-semibold transition"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="p-4 sm:p-6 bg-white">
              {/* Kop Surat Resmi */}
              <div className="text-center pb-3 border-b-2 border-black">
                <div className="text-[12px] font-bold tracking-wider uppercase text-gray-900">
                  PEMERINTAH KABUPATEN PINRANG
                </div>
                <div className="text-[13px] font-bold tracking-wider uppercase text-gray-900">
                  DINAS PENDIDIKAN DAN KEBUDAYAAN
                </div>
                <div className="text-[17px] font-black tracking-wide text-gray-900 mt-0.5">
                  UPT SMP NEGERI 1 SUPPA
                </div>
                <div className="text-[10px] text-gray-700 mt-1 leading-tight">
                  Alamat: Jl. Andi Dewang No. 12, Majennang, Kec. Suppa, Kab. Pinrang, Sulawesi Selatan 91272<br />
                  Pos-el: smpn1suppa@pinrangkab.go.id • Laman: smpn1suppa.sch.id • Akreditasi A • NPSN: 40304859
                </div>
              </div>
              <div className="border-b border-black mt-0.5 mb-5"></div>

              {/* Title */}
              <div className="text-center mb-5">
                <h2 className="text-sm font-black uppercase tracking-wider underline">
                  REKAPITULASI PEMETAAN ROMBONGAN BELAJAR &amp; WALI KELAS
                </h2>
                <div className="text-xs font-semibold text-gray-700 mt-0.5">
                  TAHUN PELAJARAN {activeAcademicYear.toUpperCase()}
                </div>
              </div>

              {/* Summary Table */}
              <div className="mb-6">
                <table className="w-full text-left text-xs border border-black border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b border-black text-center font-bold">
                      <th className="py-2 px-2 border-r border-black w-8">No</th>
                      <th className="py-2 px-3 border-r border-black text-left">Nama Rombel</th>
                      <th className="py-2 px-2 border-r border-black w-24">Tingkat</th>
                      <th className="py-2 px-3 border-r border-black text-left">Wali Kelas</th>
                      <th className="py-2 px-3 border-r border-black text-left">Ruang</th>
                      <th className="py-2 px-2 border-r border-black w-16">Kapasitas</th>
                      <th className="py-2 px-2 border-r border-black w-16">Terisi</th>
                      <th className="py-2 px-2 border-black w-16">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map((c, i) => {
                      const st = classStats[c.name] || { total: 0 };
                      return (
                        <tr key={c.id} className="border-b border-black">
                          <td className="py-2 px-2 border-r border-black text-center">{i + 1}</td>
                          <td className="py-2 px-3 border-r border-black font-bold">{c.name}</td>
                          <td className="py-2 px-2 border-r border-black text-center">{c.tingkat}</td>
                          <td className="py-2 px-3 border-r border-black">
                            <span className="font-semibold">{c.waliKelas}</span>
                            <div className="text-[10px] text-gray-500 font-mono">NIP. {c.nipWalas || '-'}</div>
                          </td>
                          <td className="py-2 px-3 border-r border-black text-gray-700">{c.ruang}</td>
                          <td className="py-2 px-2 border-r border-black text-center">{c.kapasitas}</td>
                          <td className="py-2 px-2 border-r border-black text-center font-bold">{st.total}</td>
                          <td className="py-2 px-2 border-black text-center font-semibold">{c.status}</td>
                        </tr>
                      );
                    })}
                    <tr className="bg-gray-50 font-bold border-t-2 border-black">
                      <td colSpan={5} className="py-2.5 px-3 border-r border-black text-right uppercase">
                        Total Keseluruhan:
                      </td>
                      <td className="py-2.5 px-2 border-r border-black text-center">{totalCapacity}</td>
                      <td className="py-2.5 px-2 border-r border-black text-center">{totalStudentsInClasses}</td>
                      <td className="py-2.5 px-2 border-black text-center">100% Aktif</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              <div className="pt-6 grid grid-cols-2 text-center text-xs gap-8 break-inside-avoid">
                <div>
                  <div className="font-semibold text-gray-700">Koordinator Bimbingan &amp; Guru Wali,</div>
                  <div className="h-16"></div>
                  <div className="font-bold underline">Drs. H. Ahmad Dahlan, M.Pd</div>
                  <div className="text-[10px] text-gray-600 font-mono">NIP. 197805122005011004</div>
                </div>

                <div>
                  <div className="font-semibold text-gray-700">
                    Suppa, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br />
                    Kepala UPT SMPN 1 Suppa,
                  </div>
                  <div className="h-16"></div>
                  <div className="font-bold underline">Drs. H. Syamsuddin, M.Si</div>
                  <div className="text-[10px] text-gray-600 font-mono">NIP. 196803121994121002</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL DELETE */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-gray-200">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">Konfirmasi Hapus Rombel</h3>
              <p className="text-xs text-gray-500 mt-1">
                Apakah Anda yakin ingin menghapus rombongan belajar ini dari pangkalan data sekolah?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteClass(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
              >
                Ya, Hapus Rombel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
