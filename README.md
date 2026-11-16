# Finbot — Bot & Mini App Keuangan Usaha (Telegram + Cloudflare)

Catat kas masuk/keluar, penjualan, omzet, laba rugi, dan laporan harian/mingguan/bulanan langsung dari Telegram. Berjalan di akun Cloudflare kamu sendiri (gratis, Free plan).

> Status: **Fase 0** — setup, webhook, klaim owner, `/start`, `/app`. Fitur pencatatan menyusul per fase (lihat `ARCHITECTURE.md` §15).
> Tombol "Deploy to Cloudflare" baru tersedia di Fase 7. Untuk sekarang, deploy manual lewat terminal.

## Deploy manual (sementara)

Butuh: Node.js 20+, akun Cloudflare, dan bot dari [@BotFather](https://t.me/BotFather).

1. Pasang dependensi dan login ke Cloudflare:
   ```bash
   npm install
   ```
   ```bash
   npx wrangler login
   ```
2. Deploy pertama (D1 `finbot-db` dibuat otomatis):
   ```bash
   npm run deploy
   ```
3. Isi secret (ketik nilainya saat diminta):
   ```bash
   npx wrangler secret put BOT_TOKEN
   ```
   ```bash
   npx wrangler secret put SETUP_KEY
   ```
   `SETUP_KEY` = password buatanmu sendiri, minimal 12 karakter.
4. Buka `https://finbot.<subdomain-kamu>.workers.dev/setup`, masukkan `SETUP_KEY`, lalu klik **Jalankan setup**.
5. Klik tombol **Klaim sebagai owner** dari akun Telegram yang akan jadi owner, lalu tekan *Start* di bot.
6. Kirim `/start` ke bot. Bot membalas dengan sapaan dan tombol **Buka Aplikasi**.

Setelah update kode: `npm run deploy`, lalu buka `/setup` lagi (migrasi baru jalan otomatis).

## Pengembangan

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Build Mini App + `wrangler dev` (butuh `.dev.vars`, salin dari `.dev.vars.example`) |
| `npm test` | Vitest di runtime Workers (D1 lokal) |
| `npm run typecheck` | Cek tipe worker & Mini App |
| `npm run deploy` | Build + deploy |

Webhook Telegram butuh HTTPS publik, jadi bot tidak bisa menerima pesan dari `wrangler dev` lokal. Logika bot dites lewat `npm test`.
