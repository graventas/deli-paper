# Deli

Tempel teks esai, dapat foto tulisan tangan di kertas. Semuanya jalan di browser, tanpa install apa pun dan tanpa server.

## Fitur

- 10 gaya tulisan tangan dan 4 warna tinta
- 5 jenis kertas: bergaris, kotak-kotak, polos, buku kuning, dan kertas deli (kraft)
- Pengaturan ukuran huruf, jarak baris, dan tingkat "kerapian" tulisan
- Efek foto: scan bersih, foto kertas, atau foto di atas meja
- Teks panjang otomatis dipecah jadi beberapa halaman
- Header opsional di halaman 1 (nama, kelas, tanggal)
- Unduh per halaman atau semua sekaligus, format PNG atau JPG

## Cara pakai

1. Buka halaman Deli.
2. Tempel teks di kolom kiri.
3. Atur tulisan, kertas, dan efek foto sesuai selera.
4. Klik **Unduh** pada halaman yang diinginkan, atau **Unduh semua**.

Klik **Acak ulang tulisan** kalau mau variasi goyangan tulisan yang berbeda.

## Upload ke GitHub dan aktifkan GitHub Pages

1. Buat repository baru di GitHub, misalnya `deli`.
2. Klik **Add file → Upload files**, lalu seret semua file di folder ini (`index.html`, `style.css`, `script.js`, `README.md`, `LICENSE`).
3. Klik **Commit changes**.
4. Buka **Settings → Pages**. Di bagian *Build and deployment*, pilih **Deploy from a branch**, branch `main`, folder `/ (root)`, lalu **Save**.
5. Tunggu sekitar satu menit. Alamat situsnya: `https://USERNAME.github.io/deli/`

## Menjalankan di komputer sendiri

Buka `index.html` langsung di browser. Font tulisan tangan diambil dari Google Fonts, jadi perlu koneksi internet.

## Struktur

| File | Isi |
| --- | --- |
| `index.html` | Halaman dan form pengaturan |
| `style.css` | Tampilan |
| `script.js` | Pemecah baris, penggambar kertas, dan efek foto |
| `LICENSE` | Lisensi MIT |

## Lisensi

MIT. Bebas dipakai dan diubah.
