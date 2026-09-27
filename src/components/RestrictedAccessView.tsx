import React from 'react';
import { ShieldAlert, ArrowLeft, CheckCircle2, Lock, LogOut } from 'lucide-react';
import { TabKey, getRoleCategory, ROLE_PERMISSIONS } from '../utils/permissions';

interface RestrictedAccessViewProps {
  currentRole: string;
  attemptedTab: TabKey;
  onNavigateToAllowedTab: (tab: TabKey) => void;
  onLogout: () => void;
}

const TAB_NAMES: Record<TabKey, string> = {
  dashboard: 'Dashboard Pembinaan',
  penugasan: 'Penugasan Guru Wali (Lintas Kelas)',
  siswa: 'Data Siswa Binaan',
  kelas: 'Data Kelas & Rombel',
  guru: 'Data Guru & GTK',
  profil: 'Profil Lengkap Siswa',
  pertemuan: 'Pertemuan & Konseling',
  perkembangan: 'Perkembangan Siswa',
  statistik: 'Statistik & Analisis',
  berkas: 'Berkas / Dokumen',
  laporan: 'Laporan Resmi (A4)',
  pengaturan: 'Pengaturan Sistem',
  gas_files: 'Google Apps Script (5 Berkas)'
};

export const RestrictedAccessView: React.FC<RestrictedAccessViewProps> = ({
  currentRole,
  attemptedTab,
  onNavigateToAllowedTab,
  onLogout
}) => {
  const roleCategory = getRoleCategory(currentRole);
  const roleConfig = ROLE_PERMISSIONS[roleCategory];
  const tabTitle = TAB_NAMES[attemptedTab] || attemptedTab;

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-white max-w-xl w-full rounded-2xl border border-red-200 shadow-xl p-8 text-center space-y-6 relative overflow-hidden">
        {/* Top warning stripe */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-amber-500 to-red-500" />

        {/* Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shadow-xs">
          <ShieldAlert className="w-9 h-9" />
        </div>

        {/* Headings */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
            <Lock className="w-3.5 h-3.5" />
            <span>HAK AKSES TERBATAS SISTEM</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 font-['Poppins']">
            Modul &quot;{tabTitle}&quot; Dibatasi
          </h2>
          <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
            Role akun Anda adalah <strong className="text-gray-900">{currentRole}</strong>. Sesuai tata kelola wewenang UPT SMP Negeri 1 Suppa, modul ini dikunci dan hanya dapat diakses oleh role yang berwenang.
          </p>
        </div>

        {/* Role Permissions Card */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-left space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-gray-200">
            <span className="font-bold text-gray-800">Cakupan Akses Akun Anda:</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${roleConfig.badgeColor}`}>
              {roleConfig.badgeText}
            </span>
          </div>
          <p className="text-gray-600 text-[11px] leading-relaxed">
            {roleConfig.description}
          </p>
          <div>
            <span className="text-[11px] font-bold text-gray-700 block mb-1.5">
              Halaman yang Dapat Anda Akses:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {roleConfig.allowedTabs.map(t => (
                <button
                  key={t}
                  onClick={() => onNavigateToAllowedTab(t)}
                  className="px-2.5 py-1 bg-white hover:bg-blue-50 text-[#1E4FD8] border border-blue-200 rounded-lg text-[11px] font-medium transition flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>{TAB_NAMES[t]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onNavigateToAllowedTab('dashboard')}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#1E4FD8] hover:bg-[#1A42B8] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dashboard Pembinaan</span>
          </button>
          <button
            onClick={onLogout}
            className="w-full sm:w-auto px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Ganti Akun</span>
          </button>
        </div>
      </div>
    </div>
  );
};
