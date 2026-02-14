# Data untuk situs yang di-host (GitHub Pages / hosting)

Agar foto, lagu, dan teks yang kamu edit tampil di situs yang di-host:

1. Di **panel admin** (local), edit semua yang mau ditampilkan lalu klik **Simpan Semua**.
2. Klik **Export Data** → file JSON akan terunduh.
3. **Rename** file tersebut menjadi: **`valentine-data.json`**
4. **Pindahkan** file itu ke folder ini (`data/`) sehingga jalurnya: **`data/valentine-data.json`**
5. **Push** ke GitHub (commit + push).

Setelah itu, situs yang di-host akan memuat data dari `data/valentine-data.json` dan tampil sesuai isi file tersebut.

Kalau file ini tidak ada, situs akan memakai data dari browser (IndexedDB/localStorage) atau default dari `config.js`.
