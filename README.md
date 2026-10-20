# Inventory

Этот репозиторий содержит:

- **Бэкенд** на Go (Gin + GORM) — REST API и Swagger.
- **Фронтенд** на React + TypeScript (Vite) — веб‑интерфейс.
- **База данных** — PostgreSQL (основная), опционально MySQL как источник для синхронизации сотрудников.

Документация:

- Бэкенд: `docs/README_BACKEND.md`
- Фронтенд: `frontend/README.md`
- База данных: `docs/README_DATABASE.md`

## Локальная структура проекта

- Бэкенд entrypoint: `cmd/main.go`
- Фронтенд: `frontend/`
- Конфиг бэкенда: `configs/config.yaml`
- Загрузки файлов: `uploads/`

## Production Server

Текущий виртуальный сервер:

- Host: `10.90.36.2`
- User: `pptech`
- App directory: `/home/pptech/src/inventory`

Развёрнутая структура на сервере:

- Бэкенд бинарник: `/home/pptech/src/inventory/inventory`
- Фронтенд статика: `/home/pptech/src/inventory/frontend_dist`
- Frontend static server: `/home/pptech/src/inventory/serve_frontend.py`
- Config: `/home/pptech/src/inventory/configs/config.yaml`
- Env: `/home/pptech/src/inventory/.env`
- Uploads: `/home/pptech/src/inventory/uploads`
- Backups: `/home/pptech/src/inventory/backups`

## Systemd Services

На сервере используются сервисы:

- `inventory-backend`
- `inventory-frontend`
- `inventory-postgres`
- `nginx`

Полезные команды:

```bash
sudo systemctl status inventory-backend
sudo systemctl status inventory-frontend
sudo systemctl status inventory-postgres
sudo systemctl status nginx
```

Перезапуск:

```bash
sudo systemctl restart inventory-backend
sudo systemctl restart inventory-frontend
```

## Сетевой маршрут в production

Порты и маршрутизация:

- `nginx` слушает `:80`
- backend слушает `:8080`
- frontend static server слушает `:5173`

`nginx` проксирует:

- `/api/` -> `http://127.0.0.1:8080`
- `/swagger/` -> `http://127.0.0.1:8080`
- `/uploads/` -> `http://127.0.0.1:8080`
- `/` -> `http://127.0.0.1:5173`

Важно:

- в production фронтенд должен использовать `window.location.origin`, а не прямой `:8080`
- запросы API должны идти через same-origin путь `/api/...`

## Проверка работоспособности на сервере

Проверка frontend:

```bash
curl -I http://127.0.0.1/
curl -I http://127.0.0.1:5173/
```

Проверка backend:

```bash
curl -I http://127.0.0.1:8080/
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1/api/auth/signIn
```

Проверка открытых портов:

```bash
ss -ltnp | grep 8080
ss -ltnp | grep 5173
```

## Деплой

Типовой порядок обновления:

1. Собрать backend локально:

```bash
go build -o inventory ./cmd
```

2. Собрать frontend локально:

```bash
cd frontend
npm run build
```

3. На сервере обновить:

- `/home/pptech/src/inventory/inventory`
- `/home/pptech/src/inventory/frontend_dist/`
- при необходимости `/home/pptech/src/inventory/serve_frontend.py`

4. Перезапустить сервисы:

```bash
sudo systemctl restart inventory-backend
sudo systemctl restart inventory-frontend
```

## Роли и permissions

Permissions хранятся в таблице `roles` PostgreSQL, а пользователь в `users.role` хранит только код роли.

Системные роли:

- `admin`
- `manager`
- `viewer`

При старте backend:

- выполняется `AutoMigrate`
- системные роли пересинхронизируются
- legacy-значение `users.role = 'string'` нормализуется в `admin`

Отдельные permissions для мебели уже поддерживаются:

- `can_view_furnitures`
- `can_create_furnitures`
- `can_update_furnitures`
- `can_delete_furnitures`
- `can_assign_furnitures`
- `can_return_furnitures`
