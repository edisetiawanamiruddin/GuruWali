import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // Inisialisasi Google GenAI dengan env GEMINI_API_KEY
  const ai = new GoogleGenAI();

  // Endpoint rekomendasi AI untuk tindak lanjut konseling & perkembangan
  app.post('/api/ai/recommend-followup', async (req, res) => {
    try {
      const { 
        type, // 'meeting' | 'incident'
        studentName, 
        category, 
        topic, 
        description, 
        impactLevel,
        currentNotes 
      } = req.body;

      let prompt = '';
      if (type === 'meeting') {
        prompt = `Anda adalah asisten konselor Guru Wali SMP. Berikan rekomendasi rencana tindak lanjut bimbingan untuk siswa "${studentName || 'Peserta Didik'}".
Topik Bimbingan: ${topic || 'Konseling'}
Catatan dialog / hasil pembinaan: ${currentNotes || description || 'Pendampingan berkala'}

ATURAN WAJIB:
1. Berikan jawaban INTI, RINGKAS, dan LANGSUNG TO THE POINT tanpa embel-embel.
2. JANGAN sertakan basa-basi, salam pembuka ("Tentu, ini rekomendasi..."), maupun penutup ("Semoga bermanfaat...").
3. Tampilkan 2-3 poin tindakan konkret dengan format bullet strip (-).
4. Setiap poin maksimal 1-2 kalimat padat dan solutif yang bisa langsung dieksekusi Guru Wali.`;
      } else {
        prompt = `Anda adalah asisten konselor Guru Wali SMP. Berikan rekomendasi langkah tindak lanjut penanganan untuk kejadian/perkembangan siswa "${studentName || 'Peserta Didik'}".
Kategori: ${category || 'Kedisiplinan'}
Tingkat Dampak: ${impactLevel || 'Sedang'}
Deskripsi Kejadian: ${description || 'Perlu pendampingan'}

ATURAN WAJIB:
1. Berikan jawaban INTI, RINGKAS, dan LANGSUNG TO THE POINT tanpa embel-embel.
2. JANGAN sertakan basa-basi, salam pembuka, maupun kata penutup.
3. Tampilkan 2-3 poin tindakan solutif dengan format bullet strip (-).
4. Setiap poin maksimal 1-2 kalimat singkat, terarah, dan solutif.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const recommendation = response.text?.trim() || '';
      return res.json({ success: true, recommendation });
    } catch (error: any) {
      console.warn('AI generate error, providing intelligent fallback:', error?.message);
      
      // Fallback rekomendasi pintar jika API key belum dikonfigurasi atau offline
      let fallbackRec = '';
      if (req.body.type === 'meeting') {
        fallbackRec = '- Jadwalkan sesi pemantauan berkala pekan depan untuk evaluasi komitmen belajar.\n- Berikan lembar pantau mandiri harian untuk ditandatangani orang tua murid.\n- Koordinasikan perkembangan hasil belajar dengan guru mata pelajaran terkait.';
      } else if (req.body.impactLevel === 'Positif') {
        fallbackRec = '- Berikan piagam apresiasi resmi dan umumkan pencapaian dalam upacara sekolah.\n- Tunjuk siswa sebagai duta teladan atau tutor sebaya di kelas binaan.';
      } else if (req.body.impactLevel === 'Tinggi') {
        fallbackRec = '- Undang orang tua/wali ke sekolah untuk penandatanganan surat komitmen bersama.\n- Terapkan pemantauan presensi dan ketertiban harian secara ketat bersama pimpinan sekolah.';
      } else {
        fallbackRec = '- Lakukan dialog personal 1-on-1 untuk menggali akar permasalahan siswa.\n- Kirim laporan notifikasi berkala kepada orang tua melalui WhatsApp resmi sekolah.';
      }

      return res.status(200).json({
        success: true,
        fallback: true,
        recommendation: fallbackRec,
      });
    }
  });

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server Portal Guru Wali berjalan di http://0.0.0.0:${PORT}`);
  });
}

startServer();
