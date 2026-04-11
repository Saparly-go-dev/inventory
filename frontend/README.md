# Фронтенд (React + TypeScript + Vite)

## Требования

- Node.js `>= 20` (рекомендуется LTS)
- npm

## Настройка API URL

Фронтенд читает адрес API из переменной окружения:

- `VITE_API_BASE_URL` (предпочтительно), например `http://10.90.36.2:8080`
- или `VITE_API_URL` (поддерживается как алиас)

Если переменная не задана — фронтенд использует `http://<текущий_хост>:8080`.

Пример файла: `frontend/.env.example`.

## Установка и запуск (dev)

```bash
npm ci
npm run dev -- --host 0.0.0.0 --port 5173
```

Открывать: `http://localhost:5173`.

## Сборка

```bash
npm run build
```

Артефакты: `frontend/dist/`.

Локальный предпросмотр:

```bash
npm run preview -- --host 0.0.0.0 --port 4173
```

## Авторизация

- JWT‑токен хранится в `localStorage` как `auth_token`.
- Если токена нет — роуты приложения редиректят на `/login` (см. `frontend/src/components/ProtectedRoute.tsx`).
- Если сервер возвращает `401` — токен очищается и происходит редирект на `/login` (см. `frontend/src/api/client.ts`).
