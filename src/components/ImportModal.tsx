import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Download, CheckCircle2, AlertCircle, X, Check } from 'lucide-react';
import { downloadStudentTemplate, downloadTeacherTemplate, parseStudentExcel, parseTeacherExcel } from '../utils/excelHelper';
import { Student, Teacher } from '../types';

interface ImportModalProps {
  type: 'siswa' | 'guru';
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedData: any[]) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  type,
  isOpen,
  onClose,
  onImportSuccess
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    if (type === 'siswa') {
      downloadStudentTemplate();
    } else {
      downloadTeacherTemplate();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setErrorMsg('');
    setFile(selectedFile);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result as ArrayBuffer;
        if (type === 'siswa') {
          const result = parseStudentExcel(buffer);
          if (result.length === 0) {
            setErrorMsg('Berkas Excel kosong atau format kolom tidak cocok dengan template.');
          } else {
            setParsedData(result);
          }
        } else {
          const result = parseTeacherExcel(buffer);
          if (result.length === 0) {
            setErrorMsg('Berkas Excel kosong atau format kolom tidak cocok dengan template.');
          } else {
            setParsedData(result);
          }
        }
      } catch (err) {
        setErrorMsg('Gagal membaca berkas. Pastikan format file .xlsx, .xls, atau .csv valid.');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Gagal membuka berkas.');
      setIsProcessing(false);
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleCommitImport = () => {
    if (parsedData.length === 0) return;
    onImportSuccess(parsedData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">
                Import Data {type === 'siswa' ? 'Siswa Binaan' : 'Guru & GTK'}
              </h3>
              <p className="text-xs text-gray-500">
                Gunakan format template Microsoft Excel (.xlsx) untuk memasukkan data secara massal.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-4 space-y-4 overflow-y-auto flex-1">
          {/* Step 1: Download Template */}
          <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-[#1E4FD8] uppercase tracking-wider">
                Langkah 1: Unduh Format Template
              </h4>
              <p className="text-xs text-gray-600 mt-0.5">
                Pastikan susunan header kolom sesuai agar data terpetakan dengan tepat ke pangkalan data sekolah.
              </p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="px-3 py-2 bg-white hover:bg-blue-50 border border-[#1E4FD8] text-[#1E4FD8] rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-xs transition"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Template .xlsx</span>
            </button>
          </div>

          {/* Step 2: Upload Area */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Langkah 2: Unggah Berkas Excel / CSV
            </h4>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 hover:border-[#1E4FD8] bg-gray-50/50 hover:bg-blue-50/20 rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2"
            >
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".xlsx, .xls, .csv" 
                className="hidden" 
                onChange={handleFileChange}
              />
              <div className="w-12 h-12 rounded-full bg-blue-100 text-[#1E4FD8] flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800">
                  {file ? file.name : 'Klik untuk memilih berkas Excel (.xlsx / .xls / .csv)'}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Maksimal ukuran file 10 MB • Mendukung multi-baris data
                </p>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Preview Table */}
          {parsedData.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Pratinjau Data Siap Impor ({parsedData.length} baris terdeteksi)
                </span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium text-[11px]">
                  Format Valid
                </span>
              </div>
              <div className="border border-gray-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-gray-100 text-gray-600 font-semibold sticky top-0">
                    <tr>
                      {type === 'siswa' ? (
                        <>
                          <th className="p-2">NIS</th>
                          <th className="p-2">Nama Siswa</th>
                          <th className="p-2">L/P</th>
                          <th className="p-2">Kelas</th>
                          <th className="p-2">Status</th>
                        </>
                      ) : (
                        <>
                          <th className="p-2">NIP</th>
                          <th className="p-2">Nama Lengkap</th>
                          <th className="p-2">Peran</th>
                          <th className="p-2">Kelas Binaan</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {parsedData.slice(0, 5).map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        {type === 'siswa' ? (
                          <>
                            <td className="p-2 font-mono">{row.nis}</td>
                            <td className="p-2 font-semibold">{row.name}</td>
                            <td className="p-2">{row.gender}</td>
                            <td className="p-2">{row.class}</td>
                            <td className="p-2">
                              <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-medium text-[10px]">
                                {row.status}
                              </span>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-2 font-mono">{row.nip}</td>
                            <td className="p-2 font-semibold">{row.name}</td>
                            <td className="p-2">{row.role}</td>
                            <td className="p-2">{row.classBinaan}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedData.length > 5 && (
                <p className="text-[10px] text-gray-400 italic text-right">
                  + {parsedData.length - 5} baris lainnya akan turut diimpor.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-semibold transition"
          >
            Batal
          </button>
          <button
            disabled={parsedData.length === 0 || isProcessing}
            onClick={handleCommitImport}
            className="px-4 py-2 bg-[#1E4FD8] hover:bg-[#1A42B8] disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
          >
            <Check className="w-4 h-4" />
            <span>Simpan & Terapkan Data ({parsedData.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
