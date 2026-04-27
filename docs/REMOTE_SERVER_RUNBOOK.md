# Remote server runbook

Server: `10.90.36.2`

Application path: `/home/pptech/src/inventory`

Services:

- `nginx.service` - reverse proxy on `:80`
- `inventory-postgres.service` - PostgreSQL 16 from `/home/pptech/tools/postgresql-16.11.0/...`
- `inventory-backend.service` - Go API on `:8080`
- `inventory-frontend.service` - static React build on `:5173`

URLs:

- Frontend via reverse proxy: `http://pp-tech-inventory.tdhcmb.private/`
- Frontend via IP reverse proxy: `http://10.90.36.2/`
- Frontend: `http://10.90.36.2:5173/`
- Backend Swagger: `http://10.90.36.2:8080/swagger/index.html`
- Backend Swagger via reverse proxy: `http://pp-tech-inventory.tdhcmb.private/swagger/index.html`

## Status

```bash
sudo systemctl status inventory-postgres
sudo systemctl status inventory-backend
sudo systemctl status inventory-frontend
sudo systemctl status nginx
```

Short health check:

```bash
curl -I http://127.0.0.1:5173/
curl -I http://127.0.0.1:8080/swagger/index.html
curl -I http://127.0.0.1/
```

## Logs

Follow live logs:

```bash
sudo journalctl -u inventory-postgres -f
sudo journalctl -u inventory-backend -f
sudo journalctl -u inventory-frontend -f
sudo journalctl -u nginx -f
```

Recent logs:

```bash
sudo journalctl -u inventory-backend -n 100 --no-pager
sudo journalctl -u inventory-frontend -n 100 --no-pager
sudo journalctl -u inventory-postgres -n 100 --no-pager
sudo journalctl -u nginx -n 100 --no-pager
```

Logs since boot:

```bash
sudo journalctl -u inventory-backend -b --no-pager
```

## Restart

```bash
sudo systemctl restart inventory-postgres
sudo systemctl restart inventory-backend
sudo systemctl restart inventory-frontend
sudo systemctl restart nginx
```

Restart only backend after changing backend config or binary:

```bash
sudo systemctl restart inventory-backend
```

Restart only frontend after replacing `frontend_dist`:

```bash
sudo systemctl restart inventory-frontend
```

## Why service is down

Check service state:

```bash
sudo systemctl status inventory-backend --no-pager
```

Check the exact exit reason:

```bash
sudo journalctl -u inventory-backend -n 200 --no-pager
```

Common causes:

- PostgreSQL is not running: check `inventory-postgres`.
- Wrong DB password in `/home/pptech/src/inventory/.env`.
- Invalid DB settings in `/home/pptech/src/inventory/configs/config.yaml`.
- Port is already occupied: `sudo ss -ltnp | grep -E ':8080|:5173|:5432'`.
- The uploaded binary is not executable: `ls -l /home/pptech/src/inventory/inventory`.

## Network access

The services listen on:

- nginx reverse proxy: `0.0.0.0:80`
- frontend: `0.0.0.0:5173`
- backend: `0.0.0.0:8080`
- PostgreSQL: `127.0.0.1:5432` only

Check listening ports:

```bash
sudo ss -ltnp | grep -E ':80|:8080|:5173|:5432'
```

The DNS record must point to the server:

```text
pp-tech-inventory.tdhcmb.private -> 10.90.36.2
```

For normal users, prefer the reverse proxy URL without app ports:

```text
http://pp-tech-inventory.tdhcmb.private/
```

If `curl http://127.0.0.1:5173/` works on the server but another computer cannot open `http://10.90.36.2:5173/`, the problem is outside the app process. Check VM/network ACLs, VLAN routing, or external firewall rules for ports `5173` and `8080`.

## Files

- Backend binary: `/home/pptech/src/inventory/inventory`
- Backend config: `/home/pptech/src/inventory/configs/config.yaml`
- Secret env file: `/home/pptech/src/inventory/.env`
- Frontend build: `/home/pptech/src/inventory/frontend_dist`
- Uploaded device files: `/home/pptech/src/inventory/uploads`
- Frontend static server script: `/home/pptech/src/inventory/serve_frontend.py`
- PostgreSQL data directory: `/home/pptech/pgdata`
- Nginx site config: `/etc/nginx/sites-available/inventory.conf`

Do not delete `.env`, `uploads`, or `/home/pptech/pgdata` during deployment.
