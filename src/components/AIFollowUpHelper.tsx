import React, { useState } from 'react';
import { Sparkles, Loader2, Check, RefreshCw } from 'lucide-react';

interface AIFollowUpHelperProps {
  type: 'meeting' | 'incident';
  studentName?: string;
  category?: string;
  topic?: string;
  description?: string;
  impactLevel?: string;
  currentNotes?: string;
  onApplyRecommendation: (text: string) => void;
}

export const AIFollowUpHelper: React.FC<AIFollowUpHelperProps> = ({
  type,
  studentName,
  category,
  topic,
  description,
  impactLevel,
  currentNotes,
  onApplyRecommendation,
}) => {
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  const fetchAIRecommendation = async () => {
    setLoading(true);
    setError(null);
    setApplied(false);

    try {
      const response = await fetch('/api/ai/recommend-followup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          studentName,
          category,
          topic,
          description,
          impactLevel,
          currentNotes,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      if (data.recommendation) {
        setRecommendation(data.recommendation);
      } else {
        throw new Error('Tidak ada rekomendasi yang dihasilkan');
      }
    } catch (err: any) {
      console.error('Error fetching AI recommendation:', err);
      // Fallback recommendation
      const fallback = type === 'meeting'
        ? '- Jadwalkan pemantauan berkala pekan depan untuk evaluasi komitmen belajar.\n- Berikan lembar pantau mandiri harian dengan paraf orang tua.\n- Koordinasikan kemajuan siswa bersama guru mata pelajaran.'
        : impactLevel === 'Positif'
        ? '- Berikan piagam apresiasi resmi dan umumkan pada apel sekolah.\n- Berdayakan siswa sebagai tutor sebaya bagi rekan sekelas.'
        : impactLevel === 'Tinggi'
        ? '- Undang orang tua ke sekolah untuk penandatanganan pakta kesepakatan tertulis.\n- Lakukan bimbingan harian intensif dan pantau daftar presensi berkala.'
        : '- Lakukan dialog personal berkala untuk memantau perubahan sikap siswa.\n- Kirim laporan notifikasi berkala kepada orang tua.';
      setRecommendation(fallback);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (recommendation) {
      onApplyRecommendation(recommendation);
      setApplied(true);
      setTimeout(() => setApplied(false), 2500);
    }
  };

  return (
    <div className="mt-2 p-3 bg-gradient-to-r from-blue-50/80 via-indigo-50/70 to-purple-50/80 border border-blue-200/80 rounded-xl text-xs space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#1E4FD8] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-gray-900 flex items-center gap-1.5">
              Rekomendasi AI Tindak Lanjut
              <span className="text-[10px] bg-blue-100 text-[#1E4FD8] px-1.5 py-0.2 rounded font-semibold">
                To The Point
              </span>
            </span>
            <p className="text-[11px] text-gray-500">
              Menghasilkan langkah tindak lanjut solutif, ringkas, dan tanpa embel-embel.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchAIRecommendation}
          disabled={loading}
          className="px-3 py-1.5 bg-[#1E4FD8] hover:bg-[#1A42B8] text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs transition disabled:opacity-50 shrink-0"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Memproses...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{recommendation ? 'Regenerasi AI' : 'Buat Rekomendasi'}</span>
            </>
          )}
        </button>
      </div>

      {recommendation && (
        <div className="p-2.5 bg-white border border-blue-200 rounded-lg space-y-2 shadow-2xs animate-in fade-in duration-150">
          <div className="text-[11px] text-gray-800 whitespace-pre-line font-medium leading-relaxed">
            {recommendation}
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
            <span className="text-[10px] text-gray-400">
              Model: Gemini 3.8 Flash • Jawaban inti & to the point
            </span>
            <button
              type="button"
              onClick={handleApply}
              className={`px-3 py-1 text-[11px] font-semibold rounded-md flex items-center gap-1 transition ${
                applied 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
              }`}
            >
              {applied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-700" />
                  <span>Diterapkan ke Input!</span>
                </>
              ) : (
                <>
                  <Check className="w-3 h-3" />
                  <span>Terapkan ke Form</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
