# Pustaka Naskah Nusantara

Website katalog manuskrip/naskah kuno berbasis HTML, CSS, dan JavaScript murni. Dirancang untuk GitHub Pages, dengan sumber metadata katalog dari Google Sheets (dipublikasikan sebagai CSV) dan berkas scan/foto/PDF disimpan di Google Drive.

## Fitur yang tersedia

- Tampilan responsif desktop dan ponsel dengan palet hijau, emas, dan putih.
- Navigasi: Beranda, Katalog Naskah, Koleksi Digital, Jelajah Aksara, Pelestarian, Wawasan, Tentang, dan Kontak.
- Katalog dengan pencarian langsung serta filter bahasa, aksara, dan wilayah.
- Halaman detail setiap naskah, termasuk pengarang, perkiraan tahun, asal, bahan, tema, kondisi, pemilik/penyimpan, izin, dan kata kunci.
- Tautan untuk membuka naskah digital, pratinjau Google Drive, alih aksara, dan terjemahan.
- Statistik jumlah entri, berkas digital, dan wilayah asal.
- Data lokal contoh (`data.json`) sebagai demonstrasi; data tersebut bukan katalog faktual dan harus diganti sebelum website diluncurkan.
- Sumber metadata dapat dipindahkan ke Google Sheets tanpa backend atau biaya hosting tambahan.

## Struktur folder

```text
pusaka-naskah-nusantara/
├── index.html
├── styles.css
├── app.js
├── site-config.js
├── data.json
├── catalog-template.csv
├── README.md
├── .nojekyll
└── assets/
    └── favicon.svg
```

## A. Menyiapkan penyimpanan Google Drive

1. Buat folder utama di Google Drive, misalnya `Arsip Naskah Kuno`.
2. Di dalamnya, buat folder per koleksi atau per nomor inventaris agar mudah dikelola.
3. Unggah foto sampul, hasil pemindaian, atau PDF tiap naskah. Simpan nama file dengan pola yang konsisten, misalnya `NKN-0001-sampul.jpg` dan `NKN-0001-full.pdf`.
4. Untuk materi yang memang boleh dilihat publik, buka **Bagikan / Share** pada file atau folder, lalu ubah akses menjadi **Siapa saja yang memiliki link / Anyone with the link — Viewer**.
5. Salin tautan file yang akan dimasukkan ke kolom `driveUrl` atau `thumbnailUrl` di katalog.
6. Untuk koleksi terbatas, jangan aktifkan akses publik. Jangan menautkan file tersebut dari katalog publik.

**Penting:** izin pemilik naskah, hak cipta, privasi, sensitivitas isi, dan ketentuan lembaga penyimpan harus diperiksa sebelum scan dipublikasikan. Hindari mengaktifkan akses publik ke seluruh Drive pribadi. Bagikan file/folder koleksi yang memang disetujui untuk akses publik saja.

## B. Menyiapkan Google Sheets sebagai katalog

1. Buat Google Sheets baru, misalnya `Katalog Naskah Kuno`.
2. Impor `catalog-template.csv` melalui **File → Import → Upload**, atau salin header kolom berikut ke baris pertama.
3. Isi satu baris untuk setiap naskah. Jangan mengubah nama header kecuali kode `app.js` juga disesuaikan.
4. Pada kolom `status`, isi `published` hanya untuk entri yang telah diperiksa dan diizinkan untuk tampil. Baris `draft` tidak ditampilkan di katalog publik.
5. Klik **File → Share → Publish to web**. Pilih sheet katalog yang digunakan dan format **Comma-separated values (.csv)**, lalu tekan Publish.
6. Salin URL CSV hasil publikasi. URL biasanya berbentuk `https://docs.google.com/spreadsheets/d/e/.../pub?output=csv`.
7. Buka `site-config.js` dan tempel URL tersebut ke `sheetCsvUrl`:

```js
sheetCsvUrl: "https://docs.google.com/spreadsheets/d/e/ID_PUBLIKASI/pub?output=csv",
```

8. Simpan file dan unggah ulang ke GitHub. Setelah itu, setiap perubahan pada baris Google Sheets yang sudah dipublikasikan akan terbaca oleh website saat pengunjung memuat halaman.

Jangan menggunakan URL edit Google Sheets (`/edit`) sebagai `sheetCsvUrl`. Website membutuhkan URL CSV yang dipublikasikan.

## C. Arti kolom katalog

| Kolom | Isi |
|---|---|
| `id` | Nomor inventaris unik, misalnya `NKN-0001`. |
| `title` | Judul naskah atau judul deskriptif yang disepakati. |
| `author` | Pengarang, penyalin, atau `Belum diketahui`. Bedakan pengarang dan penyalin di deskripsi bila perlu. |
| `year` | Tahun penulisan atau perkiraan yang disertai keterangan, misalnya `sekitar abad ke-19`. |
| `origin` | Daerah asal naskah jika diketahui. |
| `language` | Bahasa isi naskah. |
| `script` | Aksara, misalnya Arab, Pegon, Jawi, Jawa, Sunda, Lontara, atau lainnya. |
| `material` | Bahan, misalnya kertas, daluang, lontar, bambu, atau kulit. |
| `genre` | Tema/jenis isi: keagamaan, sastra, sejarah, pengobatan, hukum, dan sebagainya. |
| `description` | Ringkasan isi dan catatan ilmiah yang telah diverifikasi. |
| `condition` | Kondisi fisik naskah. Hindari diagnosis konservasi tanpa pemeriksaan ahli. |
| `owner` | Pemilik atau lembaga penyimpan sesuai izin publikasi. |
| `region` | Wilayah yang dipakai sebagai filter katalog. |
| `thumbnailUrl` | Tautan gambar sampul/thumbnail di Drive atau URL gambar publik. |
| `driveUrl` | Tautan file scan/PDF di Google Drive. Untuk pratinjau, gunakan tautan file Google Drive. |
| `transcriptionUrl` | Tautan dokumen transkripsi/transliterasi (opsional). |
| `translationUrl` | Tautan dokumen terjemahan bahasa Indonesia (opsional). |
| `license` | Keterangan izin, atribusi, atau batas pemanfaatan. |
| `status` | `published` untuk tampil; `draft` untuk disembunyikan. |
| `keywords` | Kata kunci, pisahkan dengan titik koma. |

## D. Menyesuaikan identitas website

Edit file `site-config.js`:

- `siteName`: nama portal atau lembaga.
- `tagline`: subjudul di bawah logo.
- `about`: deskripsi singkat portal.
- `contactEmail`: email pengelola.
- `contactText`: pesan kontak.
- `sheetCsvUrl`: URL CSV Google Sheets.
- `dataUrl`: lokasi data lokal (default `data.json`).

Sebelum peluncuran, ganti `admin@example.org` dengan email resmi pengelola.

## E. Mengunggah dan menerbitkan di GitHub Pages

### Cara termudah melalui browser GitHub

1. Masuk ke GitHub dan buat repository baru, misalnya `pustaka-naskah-nusantara`.
2. Pilih **Public** jika website memang akan dibuka untuk masyarakat. Jangan mengunggah data privat atau scan yang belum mendapat izin.
3. Pada repository, pilih **Add file → Upload files**.
4. Unggah seluruh isi folder proyek ini (file `index.html`, `styles.css`, `app.js`, `site-config.js`, `data.json`, `README.md`, `.nojekyll`, `catalog-template.csv`, dan folder `assets`). Pastikan `index.html` berada di root repository, bukan di dalam folder bertingkat.
5. Klik **Commit changes**.
6. Buka **Settings → Pages**.
7. Pada **Build and deployment**, pilih **Deploy from a branch**. Pilih branch `main` dan folder `/ (root)`, lalu **Save**.
8. Tunggu sampai alamat GitHub Pages muncul di halaman Pages. Bentuk umumnya `https://USERNAME.github.io/NAMA-REPOSITORY/`.

### Jika ingin memakai domain sendiri

Atur domain pada **Settings → Pages → Custom domain**, lalu tambahkan record DNS yang diminta GitHub pada penyedia domain. Jangan menambahkan file `CNAME` sebelum nama domain final ditetapkan.

## F. Pengujian sebelum diumumkan

- Buka website melalui alamat GitHub Pages, bukan hanya dari tampilan lokal.
- Uji pencarian, semua filter, tombol detail, serta tautan Drive dari ponsel dan komputer.
- Pastikan file Drive yang ditautkan bisa dibuka menggunakan jendela browser privat/incognito tanpa login. Ini menguji akses publik.
- Pastikan semua entri yang tampil sudah `published`, metadata benar, dan izin publikasinya tercatat.
- Hapus atau ganti tiga entri demo dalam `data.json` jika website akan menggunakan data lokal. Jika `sheetCsvUrl` sudah diatur, Google Sheets menjadi sumber katalog utama.

## Catatan teknis

Website ini adalah situs statis tanpa sistem login/admin dan tanpa backend. Pengelolaan katalog dilakukan melalui Google Sheets; berkas manuskrip melalui Google Drive. Artinya, siapa pun yang memiliki akses editor ke Google Sheet dapat mengubah metadata yang tampil di website. Untuk pengelolaan multi-admin dengan audit log, persetujuan kurator, statistik unduhan, atau pembatasan akses per koleksi, diperlukan backend/CMS pada tahap pengembangan berikutnya.
