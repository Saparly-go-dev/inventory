# Inventory Production README

Документация по production-запуску проекта Inventory на виртуальном сервере.

## 1. Сервер

IP сервера:

```text
10.90.36.2
```

Пользователь приложения:

```text
pptech
```

Рабочая директория приложения:

```text
/home/pptech/src/inventory
```

Основной URL:

```text
http://pp-tech-inventory.tdhcmb.private/
```

URL по IP:

```text
http://10.90.36.2/
```

Swagger:

```text
http://pp-tech-inventory.tdhcmb.private/swagger/index.html
http://10.90.36.2/swagger/index.html
```

Сейчас приложение работает по **HTTP**, не HTTPS.

## 2. DNS

Для домена нужна внутренняя DNS-запись:

```text
pp-tech-inventory.tdhcmb.private -> 10.90.36.2
```

Проверка DNS с клиентского компьютера:

```bash
nslookup pp-tech-inventory.tdhcmb.private
ping pp-tech-inventory.tdhcmb.private
```

Если DNS ещё не настроен, приложение доступно по IP:

```text
http://10.90.36.2/
```

## 3. Архитектура

На сервере работают 4 systemd-сервиса:

```text
nginx.service
inventory-frontend.service
inventory-backend.service
inventory-postgres.service
```

Схема открытия сайта:

```text
Browser
  -> http://pp-tech-inventory.tdhcmb.private/
  -> Nginx :80
  -> Frontend static server :5173
```

Схема API-запроса:

```text
Browser
  -> http://pp-tech-inventory.tdhcmb.private/api/...
  -> Nginx :80
  -> Backend API :8080
  -> PostgreSQL :5432
```

Nginx proxy routes:

```text
/          -> http://127.0.0.1:5173
/api/      -> http://127.0.0.1:8080
/swagger/  -> http://127.0.0.1:8080
/uploads/  -> http://127.0.0.1:8080
```

## 4. Порты

Используемые порты:

```text
80    - Nginx, основной HTTP-вход
5173  - frontend static server
8080  - Go backend API
5432  - PostgreSQL, только 127.0.0.1
22    - SSH
```

Проверка портов:

```bash
sudo ss -ltnp | grep -E ':80|:5173|:8080|:5432'
```

Ожидаемые процессы:

```text
0.0.0.0:80       nginx
0.0.0.0:5173     python3
*:8080           inventory
127.0.0.1:5432   postgres
```

## 5. Файлы и директории

Основная директория:

```text
/home/pptech/src/inventory
```

Важные файлы:

```text
/home/pptech/src/inventory/inventory              # backend binary
/home/pptech/src/inventory/frontend_dist          # frontend build
/home/pptech/src/inventory/serve_frontend.py      # static server
/home/pptech/src/inventory/configs/config.yaml    # backend config
/home/pptech/src/inventory/.env                   # secrets
/home/pptech/src/inventory/uploads                # uploaded files
/home/pptech/pgdata                               # PostgreSQL data
/etc/nginx/sites-available/inventory.conf         # Nginx config
/etc/nginx/sites-enabled/inventory.conf           # enabled Nginx site
```

Не удалять:

```text
/home/pptech/src/inventory/.env
/home/pptech/src/inventory/uploads
/home/pptech/pgdata
```

## 6. Сервисы

Проверить статус:

```bash
sudo systemctl status nginx
sudo systemctl status inventory-frontend
sudo systemctl status inventory-backend
sudo systemctl status inventory-postgres
```

Короткая проверка активности:

```bash
sudo systemctl is-active nginx inventory-frontend inventory-backend inventory-postgres
```

Проверка автозапуска:

```bash
sudo systemctl is-enabled nginx inventory-frontend inventory-backend inventory-postgres
```

Ожидаемо:

```text
active
active
active
active
enabled
enabled
enabled
enabled
```

## 7. Логи

Логи в реальном времени:

```bash
sudo journalctl -u nginx -f
sudo journalctl -u inventory-frontend -f
sudo journalctl -u inventory-backend -f
sudo journalctl -u inventory-postgres -f
```

Последние 100 строк:

```bash
sudo journalctl -u nginx -n 100 --no-pager
sudo journalctl -u inventory-frontend -n 100 --no-pager
sudo journalctl -u inventory-backend -n 100 --no-pager
sudo journalctl -u inventory-postgres -n 100 --no-pager
```

Логи с момента последней загрузки сервера:

```bash
sudo journalctl -u nginx -b --no-pager
sudo journalctl -u inventory-backend -b --no-pager
```

Самые важные логи для ошибок приложения:

```bash
sudo journalctl -u inventory-backend -n 200 --no-pager
```

## 8. Restart

Перезапуск всех сервисов:

```bash
sudo systemctl restart inventory-postgres
sudo systemctl restart inventory-backend
sudo systemctl restart inventory-frontend
sudo systemctl restart nginx
```

Перезапуск только backend:

```bash
sudo systemctl restart inventory-backend
```

Перезапуск только frontend:

```bash
sudo systemctl restart inventory-frontend
```

Перезапуск только Nginx:

```bash
sudo nginx -t
sudo systemctl restart nginx
```

Reload Nginx без полного restart:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 9. Health checks

Выполнять на сервере:

```bash
curl -I http://127.0.0.1/
curl -I http://127.0.0.1/swagger/index.html
curl -I http://127.0.0.1:5173/
curl -I http://127.0.0.1:8080/swagger/index.html
```

Ожидаемо:

```text
HTTP/1.1 200 OK
```

Проверка защищённого API без токена:

```bash
curl -i http://127.0.0.1/api/brands/
```

Ожидаемо:

```text
HTTP/1.1 401 Unauthorized
```

Это нормально: backend доступен, auth middleware работает.

## 10. Nginx

Конфиг:

```text
/etc/nginx/sites-available/inventory.conf
```

Текущий конфиг:

```nginx
server {
    listen 80;
    server_name pp-tech-inventory.tdhcmb.private 10.90.36.2;

    client_max_body_size 50m;

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    location /api/ {
        proxy_pass http://127.0.0.1:8080;
    }

    location /swagger/ {
        proxy_pass http://127.0.0.1:8080;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:8080;
    }

    location / {
        proxy_pass http://127.0.0.1:5173;
    }
}
```

Проверить конфиг:

```bash
sudo nginx -t
```

Применить изменения:

```bash
sudo systemctl reload nginx
```

## 11. Backend config

Файл:

```text
/home/pptech/src/inventory/configs/config.yaml
```

Production-пример:

```yaml
port: "8080"

db:
  username: "postgres"
  host: "127.0.0.1"
  port: "5432"
  dbname: "inventory"
  sslmode: "disable"

mysql:
  host: "localhost"
  port: "3306"
  username: "root"
  password: "<mysql-password-if-sync-is-used>"
  dbname: "info"
  sslmode: "disable"
```

Secrets:

```text
/home/pptech/src/inventory/.env
```

Ожидаемая переменная:

```text
DB_PASSWORD=...
```

Не показывать и не коммитить реальные `.env` значения.

## 12. Frontend config

Frontend собран как static build:

```text
/home/pptech/src/inventory/frontend_dist
```

Production build сделан с same-origin API:

```text
VITE_API_BASE_URL=/
```

То есть frontend отправляет API-запросы на:

```text
/api/...
```

Nginx проксирует `/api/` в backend:

```text
http://127.0.0.1:8080
```

## 13. PostgreSQL

PostgreSQL установлен здесь:

```text
/home/pptech/tools/postgresql-16.11.0/postgresql-16.11.0-x86_64-unknown-linux-gnu
```

Data directory:

```text
/home/pptech/pgdata
```

Сервис:

```bash
sudo systemctl status inventory-postgres
```

PostgreSQL слушает только localhost:

```text
127.0.0.1:5432
```

Это правильно. Базу не нужно открывать наружу.

Подключиться локально:

```bash
DB_PASSWORD=$(sed -n 's/^DB_PASSWORD=//p' /home/pptech/src/inventory/.env)
PGPASSWORD="$DB_PASSWORD" /home/pptech/tools/postgresql-16.11.0/postgresql-16.11.0-x86_64-unknown-linux-gnu/bin/psql \
  -h 127.0.0.1 \
  -p 5432 \
  -U postgres \
  -d inventory
```

## 14. Деплой новой версии

Backend собирается локально:

```bash
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath -ldflags='-s -w' -o /tmp/inventory-deploy/inventory ./cmd
```

Frontend собирается локально:

```bash
cd frontend
VITE_API_BASE_URL=/ npm run build
```

Загрузить backend:

```bash
rsync -az /tmp/inventory-deploy/inventory pptech@10.90.36.2:/home/pptech/src/inventory/inventory
ssh pptech@10.90.36.2 'chmod +x /home/pptech/src/inventory/inventory'
```

Загрузить frontend:

```bash
rsync -az --delete frontend/dist/ pptech@10.90.36.2:/home/pptech/src/inventory/frontend_dist/
```

Перезапустить:

```bash
ssh pptech@10.90.36.2
sudo systemctl restart inventory-backend
sudo systemctl restart inventory-frontend
sudo systemctl restart nginx
```

Проверить:

```bash
curl -I http://127.0.0.1/
curl -I http://127.0.0.1/swagger/index.html
sudo systemctl status inventory-backend --no-pager
```

## 15. Backup и rollback

Backup старой версии перед текущим service deployment:

```text
/home/pptech/src/inventory/backups/20260421094801
```

Создать manual backup:

```bash
TS=$(date +%Y%m%d%H%M%S)
mkdir -p /home/pptech/src/inventory/backups/$TS
cp -a /home/pptech/src/inventory/inventory /home/pptech/src/inventory/backups/$TS/
cp -a /home/pptech/src/inventory/frontend_dist /home/pptech/src/inventory/backups/$TS/
cp -a /home/pptech/src/inventory/configs/config.yaml /home/pptech/src/inventory/backups/$TS/
```

Rollback backend:

```bash
cp -a /home/pptech/src/inventory/backups/20260421094801/inventory /home/pptech/src/inventory/inventory
chmod +x /home/pptech/src/inventory/inventory
sudo systemctl restart inventory-backend
```

Rollback frontend:

```bash
rm -rf /home/pptech/src/inventory/frontend_dist
cp -a /home/pptech/src/inventory/backups/20260421094801/frontend_dist /home/pptech/src/inventory/frontend_dist
sudo systemctl restart inventory-frontend
sudo systemctl restart nginx
```

## 16. Troubleshooting

### Сайт не открывается

Проверить DNS:

```bash
nslookup pp-tech-inventory.tdhcmb.private
```

Проверить Nginx:

```bash
sudo systemctl status nginx --no-pager
sudo journalctl -u nginx -n 100 --no-pager
sudo nginx -t
```

Проверить локальный HTTP на сервере:

```bash
curl -I http://127.0.0.1/
```

Если `curl` на сервере работает, но сайт не открывается с клиентского ПК, проблема вне приложения: DNS, VLAN, network ACL или firewall для порта `80`.

### Frontend открывается, но API не работает

Проверить backend:

```bash
sudo systemctl status inventory-backend --no-pager
sudo journalctl -u inventory-backend -n 200 --no-pager
curl -I http://127.0.0.1:8080/swagger/index.html
curl -i http://127.0.0.1/api/brands/
```

`/api/brands/` без токена должен возвращать `401`.

### Backend down

Проверить:

```bash
sudo journalctl -u inventory-backend -n 200 --no-pager
sudo systemctl status inventory-backend --no-pager
```

Частые причины:

- PostgreSQL не запущен.
- Неверный `DB_PASSWORD` в `.env`.
- Неверный `configs/config.yaml`.
- Порт `8080` занят.
- Backend binary не executable.

Полезные команды:

```bash
sudo systemctl status inventory-postgres --no-pager
sudo ss -ltnp | grep 8080
ls -l /home/pptech/src/inventory/inventory
```

### Database down

Проверить:

```bash
sudo systemctl status inventory-postgres --no-pager
sudo journalctl -u inventory-postgres -n 200 --no-pager
sudo ss -ltnp | grep 5432
```

### Frontend service down

Проверить:

```bash
sudo systemctl status inventory-frontend --no-pager
sudo journalctl -u inventory-frontend -n 100 --no-pager
curl -I http://127.0.0.1:5173/
```

### Port occupied

Проверить:

```bash
sudo ss -ltnp | grep -E ':80|:5173|:8080|:5432'
```

Ожидаемые владельцы:

```text
:80    nginx
:5173  python3
:8080  inventory
:5432  postgres
```

## 17. Security notes

- Сейчас используется HTTP.
- Для HTTPS на `.private` домене нужен internal corporate CA certificate или self-signed certificate, доверенный на рабочих машинах.
- PostgreSQL открыт только на `127.0.0.1`.
- Не публиковать `.env`.
- Не удалять `/home/pptech/pgdata`.
- Перед заменой binary/frontend build делать backup.

## 18. Текущее состояние production

Ожидаемые URL:

```text
http://pp-tech-inventory.tdhcmb.private/
http://10.90.36.2/
http://pp-tech-inventory.tdhcmb.private/swagger/index.html
http://10.90.36.2/swagger/index.html
```

Ожидаемые сервисы:

```text
nginx.service                  active enabled
inventory-frontend.service     active enabled
inventory-backend.service      active enabled
inventory-postgres.service     active enabled
```
