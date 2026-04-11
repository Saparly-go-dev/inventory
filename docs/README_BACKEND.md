# Бэкенд (Go)

## Стек

- Go `1.24.x` (см. `go.mod`, `go.work`)
- HTTP: Gin (`github.com/gin-gonic/gin`)
- ORM: GORM (`gorm.io/gorm`) + драйвер Postgres
- Конфиги: Viper (`github.com/spf13/viper`)
- Swagger: swaggo (`docs/`)

## Конфигурация

1) Файл настроек: `configs/config.yaml`

- `port` — порт HTTP сервера (по умолчанию `8080`)
- `db.*` — параметры подключения к PostgreSQL

2) Переменные окружения: `.env`

- `DB_PASSWORD=...` — пароль PostgreSQL пользователя из `configs/config.yaml` (по умолчанию в конфиге используется `db.username: "postgres"`).

Рекомендация: хранить секреты только в `.env`/секрет‑хранилище и **не** коммитить реальные пароли.

## Запуск (локально)

Из корня репозитория:

```bash
go run ./cmd
```

После старта:

- API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger/index.html`

## Что делает приложение при старте

- Читает `configs/config.yaml` и `.env`
- Подключается к PostgreSQL
- Запускает авто‑миграции (GORM AutoMigrate) для моделей (таблицы будут созданы/обновлены автоматически)

## Маршруты

Все маршруты — в `pkg/handler/handler.go`.

- Публично: `POST /api/auth/signIn`
- Остальные `/api/*` защищены middleware `userIdentity` (требует заголовок `Authorization: Bearer <token>`)

## Быстрая проверка

```bash
curl -i http://localhost:8080/swagger/index.html
curl -i http://localhost:8080/api/brands/
```

Ожидаемо:

- Swagger отдаёт `200`
- `/api/brands/` без токена возвращает `401`

