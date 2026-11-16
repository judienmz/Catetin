// Placeholder Fase 0. Mini App sebenarnya (React) dibangun di Fase 4.
import "./style.css";

interface TgWebApp {
  ready(): void;
  expand(): void;
  initDataUnsafe?: { user?: { first_name?: string } };
}

const tg = (window as unknown as { Telegram?: { WebApp?: TgWebApp } }).Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  const name = tg.initDataUnsafe?.user?.first_name;
  const el = document.getElementById("hello");
  if (name && el) el.textContent = `Halo, ${name}! Aplikasi sedang disiapkan. Untuk sementara, gunakan perintah di chat bot.`;
}
