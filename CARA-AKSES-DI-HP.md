# Cara Akses Panel Admin dari HP (Live Server)

## 1. Pastikan HP dan laptop/PC satu WiFi
HP dan komputer harus terhubung ke **jaringan WiFi yang sama**.

## 2. Cek IP address komputer
- **Windows**: Buka CMD, ketik `ipconfig`, cari **IPv4 Address** (biasanya seperti `192.168.1.x` atau `192.168.0.x`).
- **Mac**: System Preferences → Network → lihat IP.

## 3. Set Live Server agar bisa diakses dari jaringan
Di VS Code/Cursor sudah ada file `.vscode/settings.json` dengan:
- `"liveServer.settings.host": "0.0.0.0"`  
Artinya server bisa diakses dari HP di WiFi yang sama.

**Restart Live Server** setelah mengubah setting:
- Klik "Port: 3000" di status bar bawah → pilih "Stop Live Server", lalu jalankan lagi "Go Live".

## 4. Buka di HP
Di browser HP ketik:

- **Website utama:**  
  `http://[IP-KOMPUTER]:3000/index.html`  
  Contoh: `http://192.168.1.10:3000/index.html`

- **Panel admin:**  
  `http://[IP-KOMPUTER]:3000/admin.html`  
  Contoh: `http://192.168.1.10:3000/admin.html`

Ganti `[IP-KOMPUTER]` dengan IPv4 Address dari langkah 2. Port **3000** dipakai di project ini (lihat status bar: "Port: 3000").

## 5. Firewall
Kalau HP tidak bisa buka:
- Windows: izinkan aplikasi/port yang dipakai Live Server (Node/VS Code) di **Windows Defender Firewall** untuk jaringan Private.
- Atau sementara matikan firewall untuk tes (hanya di jaringan aman).

---

## ⚠️ Kalau Muncul Error PHP / Composer

**Pesan error:**  
*"Fatal error: Composer detected issues... PHP version... platform_check.php... app-sppd"*

Itu **bukan** dari project Valentine. Itu dari aplikasi lain (IIS) di komputer kamu.

**Penyebab:** Di HP kamu buka URL **tanpa port :3000**, jadi browser pakai port 80 (default) → yang jalan adalah IIS (app-sppd) → muncul error PHP.

**Solusi:** Di HP **harus** ketik URL **dengan :3000** di belakang IP.

| ❌ Salah (tanpa port)     | ✅ Benar (pakai port 3000)        |
|--------------------------|-----------------------------------|
| `http://192.168.1.10`    | `http://192.168.1.10:3000`        |
| `http://192.168.1.10/admin.html` | `http://192.168.1.10:3000/admin.html` |

**Langkah:**
1. Cek IP komputer: buka CMD → ketik `ipconfig` → catat IPv4 (misalnya 192.168.1.10).
2. Di **browser HP**, ketik persis: **`http://[IP-kamu]:3000/admin.html`**  
   Contoh: `http://192.168.1.10:3000/admin.html`
3. Jangan pakai link yang tanpa `:3000`. Simpan di bookmark HP biar tidak salah lagi.

---

## Ringkasan
1. HP dan PC satu WiFi  
2. Cek IP PC (`ipconfig`)  
3. Restart Live Server (setelah host 0.0.0.0)  
4. Di HP buka: `http://[IP]:3000/admin.html`
