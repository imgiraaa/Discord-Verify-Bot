# Proyek Bot Discord Verifikasi Versi 1.0.

Bot Discord untuk sistem verifikasi anggota dengan atau tanpa Captcha.

## Fitur
- Pengaturan verifikasi via Modal
- Slash Commands
- Sistem Captcha dengan tingkat kesulitan
- Manajemen role otomatis (Non-Verify -> Verified)

## Setup
1. Isi file `.env` dengan token dan ID yang benar.
2. Jalankan `npm install` untuk menginstal dependensi.
3. Jalankan `npm run deploy` untuk mendaftarkan slash commands.
4. Jalankan `npm start` untuk menyalakan bot.
5. Jalankan command `/verifikasi-setup` Untuk mengatur sistem verifikasi pada bot.

## Info
Tidak perlu memodifikasi file `config.json` Karena file ini menyimpan data yang sudah di atur di bot discord lalu disimpan dalam folder ini.
