# Panduan Instalasi & Penerapan Portal Guru Wali
## UPT SMP Negeri 1 Suppa — Kabupaten Pinrang

Dokumen ini berisi panduan komprehensif pemasangan, konfigurasi, dan pemeliharaan aplikasi Full-Stack **Portal Guru Wali** berbasis Google Apps Script (GAS), Google Sheets, dan Google Drive.

---

### Struktur 5 Berkas Utama

1. **`Code.gs`** : Logika backend Google Apps Script, konfigurasi `APP_CONFIG`, manajemen sesi, `setupApp()`, API endpoint, operasi CRUD data, validasi hak akses, dan manajemen Google Drive.
2. **`Index.html`** : Shell UI Single Page Application (SPA), struktur halaman login, navbar, sidebar navigasi, header, dan wadah modal dialog.
3. **`Javascript.html`** : Script klien SPA, state management (`AppState`), pemanggilan `google.script.run` via Promise wrapper, router antarmuka, penanganan formulir, dan ekspor data.
4. **`Stylesheet.html`** : Variabel design tokens sesuai `DESIGN.md`, tipografi Poppins & Inter, palet warna, tata letak kartu KPI, tabel data, status badge, responsivitas seluler, dan format cetak lembar resmi A4 (Kop Surat).
5. **`Panduan Instalasi.md`** : Panduan langkah demi langkah implementasi teknis.

---

### Langkah 1: Persiapan Proyek Google Apps Script Baru

1. Buka [script.google.com](https://script.google.com/) menggunakan akun Google Workspace for Education atau akun Google resmi UPT SMP Negeri 1 Suppa.
2. Klik tombol **Proyek Baru** (*New Project*).
3. Ubah nama proyek di bagian kiri atas menjadi: `Portal Guru Wali - UPT SMPN 1 Suppa`.

---

### Langkah 2: Menyalin dan Menyimpan Berkas Aplikasi

Buat 4 berkas di editor Google Apps Script dengan nama yang tepat:

1. **Berkas Skrip `Code.gs`**:
   - Salin seluruh konten dari berkas `Code.gs` ke dalam editor.
2. **Berkas HTML `Index.html`**:
   - Klik ikon **+ (Tambahkan berkas)** > Pilih **HTML**.
   - Beri nama: `Index` (GAS otomatis menambahkan ekstensi `.html`).
   - Salin seluruh isi dari `Index.html`.
3. **Berkas HTML `Javascript.html`**:
   - Klik **+** > Pilih **HTML** > Beri nama: `Javascript`.
   - Salin seluruh isi dari `Javascript.html`.
4. **Berkas HTML `Stylesheet.html`**:
   - Klik **+** > Pilih **HTML** > Beri nama: `Stylesheet`.
   - Salin seluruh isi dari `Stylesheet.html`.
5. Simpan seluruh perubahan dengan menekan tombol **Simpan Proyek** (`Ctrl + S` atau `Cmd + S`).

---

### Langkah 3: Menjalankan Inisialisasi Otomatis (`setupApp()`)

Fungsi `setupApp()` akan menginisialisasi seluruh infrastruktur secara otomatis dan idempoten (tidak akan menduplikasi jika dijalankan ulang):

1. Pada bilah atas editor GAS, pilih fungsi `setupApp` dari menu dropdown fungsi.
2. Klik tombol **Jalankan** (*Run*).
3. Muncul jendela *Authorization Required*. Klik **Tinjau Izin** (*Review Permissions*), pilih akun Google Anda, klik **Lanjutan** (*Advanced*), lalu pilih **Buka Portal Guru Wali (tidak aman)** dan klik **Izinkan** (*Allow*).
4. `setupApp()` akan melakukan hal berikut secara otomatis:
   - Membuat file Spreadsheet database bernama: `DATABASE - Portal Guru Wali SMPN 1 Suppa`.
   - Mengisi 18 Sheet lengkap dengan header kolom sesuai PRD:
     - `PENGGUNA`, `GURU`, `KELAS`, `SISWA`, `PENUGASAN_GURU_WALI`, `PERTEMUAN`, `PESERTA_PERTEMUAN`, `PERKEMBANGAN`, `TINDAK_LANJUT`, `NOTULENSI`, `BERKAS`, `RIWAYAT_STATUS`, `LOG_AKTIVITAS`, `NOTIFIKASI`, `PENGATURAN_APLIKASI`, `TAHUN_AJARAN`, `KATEGORI_PERKEMBANGAN`, `TEMPLATE_LAPORAN`.
   - Mengisi data awal akun pengguna (Admin, Guru Wali, Wali Kelas, Kepala Sekolah) dan data master siswa uji coba.
   - Membuat struktur folder Google Drive:
     - `📁 PORTAL_GURU_WALI_SMPN1_SUPPA` (Root)
       - `📁 ASET_SISTEM`
       - `📁 FOTO_PROFIL`
       - `📁 BERKAS_SISWA`
       - `📁 LAPORAN_PDF`
       - `📁 BACKUP_DATA`
   - Menyimpan seluruh ID Spreadsheet dan Folder secara permanen di **Script Properties**.
   - Memasang Trigger Cron harian otomatis (`triggerPemeriksaanHarian`) setiap pukul 06:00 WITA.

Hasil eksekusi dapat dilihat pada log:
```json
{
  "spreadsheetId": "...",
  "spreadsheetUrl": "https://docs.google.com/spreadsheets/d/...",
  "rootFolderId": "...",
  "status": "Inisialisasi berhasil diselesaikan."
}
```

---

### Langkah 4: Penerapan Web App (*Deploy Web App*)

1. Di sudut kanan atas editor Apps Script, klik tombol biru **Terapkan** (*Deploy*) > **Penerapan baru** (*New deployment*).
2. Klik ikon gerigi ⚙️ di sebelah *Select type* > Pilih **Aplikasi Web** (*Web app*).
3. Isi konfigurasi sebagai berikut:
   - **Deskripsi**: `Portal Guru Wali V1.0 Produksi`
   - **Jalankan sebagai** (*Execute as*): **Saya** (*Me - email@smpn1suppa.sch.id*)
   - **Yang memiliki akses** (*Who has access*): **Siapa saja** (*Anyone*) — *Autentikasi dikendalikan oleh sistem login internal aplikasi.*
4. Klik **Terapkan** (*Deploy*).
5. Salin **URL Aplikasi Web** (*Web App URL*) yang dihasilkan (contoh: `https://script.google.com/macros/s/.../exec`).
6. Buka URL tersebut di peramban Anda. Halaman login portal Guru Wali akan langsung muncul.

---

### Kredensial Default untuk Pengujian

| Peran (Role) | Nama Lengkap | Username | Kata Sandi Default |
| :--- | :--- | :--- | :--- |
| **Guru Wali** | Drs. H. Ahmad Dahlan, M.Pd | `ahmad.dahlan` | `guru123` |
| **Wali Kelas** | Nurmiati, S.Pd | `nurmiati.spd` | `walas123` |
| **Administrator** | Tim Pengembang Kurikulum | `admin.kurikulum` | `admin123` |
| **Kepala Sekolah** | Drs. H. Syamsuddin, M.Si | `syamsuddin.kepsek` | `kepsek123` |

*Catatan Keamanan: Pengguna diwajibkan mengganti kata sandi setelah login pertama kali melalui menu Pengaturan Profil.*

---

### Pemeliharaan dan Backup

1. **Pencadangan Rutin**:
   - Database berada di Google Sheets sehingga riwayat revisi dapat diakses melalui menu *File > Riwayat Versi*.
   - Ekspor berkala seluruh data siswa dapat dilakukan langsung dari halaman **Data Siswa** dengan menekan tombol **Export Rekap (.xlsx)**.
2. **Kapasitas Google Drive**:
   - Penggunaan penyimpanan dapat dipantau langsung dari menu **Pengaturan & Master Data** pada kartu kuota penyimpanan.
