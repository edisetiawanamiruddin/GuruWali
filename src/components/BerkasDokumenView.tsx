import React, { useState } from 'react';
import { 
  FolderArchive, FileText, Upload, Download, Eye, 
  Search, Filter, HardDrive, CheckCircle2, Clock, Trash2,
  X, Check, AlertCircle, FileCheck, ExternalLink, ShieldCheck
} from 'lucide-react';

interface ArchiveFile {
  id: string;
  name: string;
  category: string;
  size: string;
  student: string;
  date: string;
  author: string;
  driveStatus: string;
  description?: string;
}

const INITIAL_FILES: ArchiveFile[] = [
  {
    id: 'DOC_01',
    name: 'Surat_Pernyataan_Ortu_Muhammad_Fajar.pdf',
    category: 'Surat Pernyataan',
    size: '245 KB',
    student: 'Muhammad Fajar (VIII-B)',
    date: '18 Okt 2024',
    author: 'Drs. H. Ahmad Dahlan',
    driveStatus: 'Tersimpan di Google Drive',
    description: 'Surat komitmen kedisiplinan dan kehadiran bersama orang tua murid.'
  },
  {
    id: 'DOC_02',
    name: 'Berita_Acara_Bimbingan_Kelompok_UAS.pdf',
    category: 'Berita Acara',
    size: '512 KB',
    student: 'Kelompok VIII-B (4 Siswa)',
    date: '18 Okt 2024',
    author: 'Drs. H. Ahmad Dahlan',
    driveStatus: 'Tersimpan di Google Drive',
    description: 'Dokumentasi hasil konseling kelompok persiapan ujian akhir semester.'
  },
  {
    id: 'DOC_03',
    name: 'Sertifikat_Juara_2_Lari_100M_Provinsi.pdf',
    category: 'Prestasi',
    size: '1.2 MB',
    student: 'Muhammad Fajar (VIII-B)',
    date: '12 Sep 2024',
    author: 'Nurmiati, S.Pd',
    driveStatus: 'Tersimpan di Google Drive',
    description: 'Piagam penghargaan kejuaraan atletik tingkat provinsi Sulawesi Selatan.'
  },
  {
    id: 'DOC_04',
    name: 'Formulir_Komitmen_Belajar_Siti_Nurhaliza.pdf',
    category: 'Surat Pernyataan',
    size: '180 KB',
    student: 'Siti Nurhaliza (VIII-B)',
    date: '05 Okt 2024',
    author: 'Drs. H. Ahmad Dahlan',
    driveStatus: 'Tersimpan di Google Drive',
    description: 'Rencana pendampingan perbaikan nilai matematika bersama wali murid.'
  },
  {
    id: 'DOC_05',
    name: 'SK_Pembagian_Tugas_Guru_Wali_Genap_2024_2025.pdf',
    category: 'SK Resmi',
    size: '890 KB',
    student: 'Seluruh Satdik',
    date: '02 Jan 2025',
    author: 'Drs. H. Syamsuddin, M.Si',
    driveStatus: 'Tersimpan di Google Drive',
    description: 'Surat Keputusan Kepala Sekolah tentang penetapan Guru Wali binaan tahun ajaran 2024/2025.'
  }
];

export const BerkasDokumenView: React.FC = () => {
  const [files, setFiles] = useState<ArchiveFile[]>(INITIAL_FILES);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('Semua');

  // Modals State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewFile, setPreviewFile] = useState<ArchiveFile | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  // Form State
  const [newFileName, setNewFileName] = useState('');
  const [newFileCategory, setNewFileCategory] = useState('Surat Pernyataan');
  const [newFileStudent, setNewFileStudent] = useState('Muhammad Fajar (VIII-B)');
  const [newFileDesc, setNewFileDesc] = useState('');

  const filteredFiles = files.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) ||
                        f.student.toLowerCase().includes(search.toLowerCase()) ||
                        (f.description && f.description.toLowerCase().includes(search.toLowerCase()));
    const matchType = filterType === 'Semua' || f.category === filterType;
    return matchSearch && matchType;
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    const formattedName = newFileName.endsWith('.pdf') ? newFileName : `${newFileName}.pdf`;
    const newDoc: ArchiveFile = {
      id: `DOC_${Date.now()}`,
      name: formattedName.replace(/\s+/g, '_'),
      category: newFileCategory,
      size: `${Math.floor(150 + Math.random() * 600)} KB`,
      student: newFileStudent,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      author: 'Drs. H. Ahmad Dahlan',
      driveStatus: 'Tersimpan di Google Drive',
      description: newFileDesc || 'Dokumen arsip digital GuruWali UPT SMPN 1 Suppa.'
    };

    setFiles([newDoc, ...files]);
    setShowUploadModal(false);
    setNewFileName('');
    setNewFileDesc('');
    showToast(`Dokumen "${newDoc.name}" berhasil diunggah ke Google Drive!`);
  };

  const handleDownload = (file: ArchiveFile) => {
    // Generate simulated text download
    const blob = new Blob([
      `ARSIP RESMI DOKUMEN DIGITAL GURU WALI\nUPT SMP NEGERI 1 SUPPA\n\nNama Dokumen: ${file.name}\nKategori: ${file.category}\nSiswa: ${file.student}\nTanggal: ${file.date}\nPengunggah: ${file.author}\nKeterangan: ${file.description || '-'}\n\nStatus: Terverifikasi oleh Sistem Google Drive Satuan Pendidikan.`
    ], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Mengunduh berkas: ${file.name}`);
  };

  const handleDeleteFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setDeleteConfirmId(null);
    showToast('Dokumen berhasil dihapus dari arsip.');
  };

  const showToast = (msg: string) => {
    setDownloadToast(msg);
    setTimeout(() => setDownloadToast(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {downloadToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{downloadToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-[#1E4FD8] uppercase tracking-wider flex items-center gap-1.5">
            <FolderArchive className="w-3.5 h-3.5" />
            <span>ARSIP DIGITAL &amp; GOOGLE DRIVE SATDIK</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
            Arsip Berkas &amp; Dokumen Terpusat
          </h1>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Seluruh dokumen, surat pernyataan orang tua, berita acara bimbingan, dan sertifikat prestasi tersimpan aman di Google Drive sekolah.
          </p>
        </div>

        <button 
          type="button" 
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-[#1E4FD8] hover:bg-[#1A42B8] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>+ Unggah Berkas Baru</span>
        </button>
      </div>

      {/* Drive Status Card */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-gray-200/90 dark:border-slate-800 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-[#1E4FD8] dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">Google Drive: Folder GuruWali SMPN 1 Suppa</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">Kapasitas terpakai: 1.2 GB dari 15 GB kuota Google Workspace for Education</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-semibold rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Sinkronisasi Otomatis Aktif</span>
          </span>
        </div>
      </div>

      {/* Files Table */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-gray-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
        {/* Search & Filter */}
        <div className="p-4 bg-gray-50/60 dark:bg-slate-800/60 border-b border-gray-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Cari nama berkas atau siswa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl focus:border-[#1E4FD8] outline-none transition"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl font-medium text-gray-700 dark:text-slate-200 outline-none focus:border-[#1E4FD8]"
          >
            <option value="Semua">Semua Kategori</option>
            <option value="Surat Pernyataan">Surat Pernyataan</option>
            <option value="Berita Acara">Berita Acara</option>
            <option value="Prestasi">Prestasi &amp; Sertifikat</option>
            <option value="SK Resmi">SK Resmi</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 font-semibold border-b border-gray-200 dark:border-slate-700 uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Nama Berkas &amp; Dokumen</th>
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5">Ukuran</th>
                <th className="p-3.5">Terkait Siswa</th>
                <th className="p-3.5">Tanggal Unggah</th>
                <th className="p-3.5">Pengunggah</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-400">
                    Tidak ada berkas yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-red-500 shrink-0" />
                        <div>
                          <button
                            type="button"
                            onClick={() => setPreviewFile(file)}
                            className="font-semibold text-gray-900 dark:text-white hover:text-[#1E4FD8] dark:hover:text-blue-400 text-left transition cursor-pointer"
                          >
                            {file.name}
                          </button>
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400">{file.driveStatus}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-semibold border border-blue-200 dark:border-blue-800">
                        {file.category}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-gray-500 dark:text-slate-400">{file.size}</td>
                    <td className="p-3.5 font-medium text-gray-800 dark:text-slate-200">{file.student}</td>
                    <td className="p-3.5 text-gray-500 dark:text-slate-400">{file.date}</td>
                    <td className="p-3.5 text-gray-600 dark:text-slate-300">{file.author}</td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          type="button" 
                          onClick={() => setPreviewFile(file)}
                          className="p-1.5 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                          title="Pratinjau Dokumen"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handleDownload(file)}
                          className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition cursor-pointer"
                          title="Unduh Berkas"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setDeleteConfirmId(file.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition cursor-pointer"
                          title="Hapus Berkas"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: UNGGAH BERKAS BARU */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  Unggah Berkas Baru ke Google Drive
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Dokumen akan tersinkronisasi otomatis ke folder arsip sekolah.
                </p>
              </div>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  Nama Berkas / Dokumen *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Surat_Panggilan_Ortu_Ahmad_Fauzi"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-[#1E4FD8] text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Kategori Berkas
                  </label>
                  <select
                    value={newFileCategory}
                    onChange={(e) => setNewFileCategory(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:border-[#1E4FD8] text-gray-900 dark:text-white font-medium"
                  >
                    <option value="Surat Pernyataan">Surat Pernyataan</option>
                    <option value="Berita Acara">Berita Acara</option>
                    <option value="Prestasi">Prestasi &amp; Sertifikat</option>
                    <option value="SK Resmi">SK Resmi</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Terkait Siswa / Satdik
                  </label>
                  <input
                    type="text"
                    value={newFileStudent}
                    onChange={(e) => setNewFileStudent(e.target.value)}
                    placeholder="Nama Siswa atau Rombel"
                    className="w-full p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:border-[#1E4FD8] text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Upload Dropzone Simulation */}
              <div>
                <label className="block font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  Pilih Berkas (PDF, DOCX, JPG - Maks 10MB)
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-2xl p-6 text-center bg-gray-50/50 dark:bg-slate-800/40 hover:bg-gray-50 transition cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div className="font-semibold text-gray-700 dark:text-slate-200">
                    Klik untuk memilih berkas dari komputer Anda
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1">
                    Atau seret berkas ke area ini
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  Catatan / Keterangan Dokumen
                </label>
                <textarea
                  rows={2}
                  value={newFileDesc}
                  onChange={(e) => setNewFileDesc(e.target.value)}
                  placeholder="Catatan tujuan penerbitan surat atau berita acara..."
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:border-[#1E4FD8] text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1E4FD8] hover:bg-[#1A42B8] text-white rounded-xl font-semibold shadow-xs transition"
                >
                  Simpan &amp; Unggah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PRATINJAU DOKUMEN */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-tight">
                    {previewFile.name}
                  </h3>
                  <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                    {previewFile.category} • {previewFile.size}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setPreviewFile(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Details Box */}
            <div className="p-4 bg-gray-50 dark:bg-slate-800/70 rounded-xl border border-gray-200/80 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">Terkait Siswa:</span>
                <span className="font-bold text-gray-900 dark:text-white">{previewFile.student}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">Tanggal Unggah:</span>
                <span className="text-gray-800 dark:text-slate-200">{previewFile.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">Pengunggah / Petugas:</span>
                <span className="text-gray-800 dark:text-slate-200">{previewFile.author}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">Lokasi Penyimpanan:</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {previewFile.driveStatus}
                </span>
              </div>
              {previewFile.description && (
                <div className="pt-2 border-t border-gray-200/60 dark:border-slate-700 text-gray-600 dark:text-slate-300">
                  <strong>Keterangan:</strong> {previewFile.description}
                </div>
              )}
            </div>

            {/* Preview Sheet Mockup */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-center space-y-2">
              <FileCheck className="w-12 h-12 text-[#1E4FD8] mx-auto opacity-80" />
              <div className="font-bold text-xs text-gray-900 dark:text-white">
                Dokumen Digital Terverifikasi
              </div>
              <p className="text-[11px] text-gray-500 dark:text-slate-400 max-w-xs mx-auto">
                Berkas telah tersinkronisasi dengan aman di Google Drive UPT SMPN 1 Suppa dan siap diunduh atau dicetak.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setPreviewFile(null)}
                className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-50 transition"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => handleDownload(previewFile)}
                className="px-4 py-2 bg-[#1E4FD8] hover:bg-[#1A42B8] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Berkas Ini</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL DELETE */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-gray-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Hapus Berkas Dokumen?</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Berkas akan dihapus dari arsip lokal dan dipindahkan ke tong sampah Google Drive.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDeleteFile(deleteConfirmId)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
