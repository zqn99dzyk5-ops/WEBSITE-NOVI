# Continental Academy - Upute za Deployment

## Preduvjeti
- VPS sa Docker i Docker Compose instaliranim
- Domena usmjerena na IP adresu servera
- SSL certifikat (preporučuje se Let's Encrypt)

## Koraci za Deployment

### 1. Priprema Servera

```bash
# Poveži se na server
ssh root@your-server-ip

# Kreiraj folder za aplikaciju
mkdir -p /opt/continental-academy
cd /opt/continental-academy
```

### 2. Prebaci Fajlove

Prebaci sve projektne fajlove na server:
- `docker-compose.yml`
- `Dockerfile.backend`
- `Dockerfile.frontend`
- `nginx.conf`
- `backend/` folder
- `frontend/` folder

### 3. Konfiguriši Environment Varijable

```bash
# Kreiraj .env fajl
cp .env.example .env
nano .env
```

Popuni vrijednosti:
```
REACT_APP_BACKEND_URL=https://tvoja-domena.com
JWT_SECRET=generiraj-siguran-kljuc-ovdje
STRIPE_API_KEY=sk_live_tvoj_stripe_kljuc
CORS_ORIGINS=https://tvoja-domena.com
```

### 4. Pokreni Aplikaciju

```bash
# Pokreni sve servise
docker-compose up -d --build

# Provjeri status
docker-compose ps

# Pogledaj logove
docker-compose logs -f
```

### 5. Konfiguracija SSL (Let's Encrypt)

Za HTTPS, koristi Certbot:

```bash
# Instaliraj Certbot
apt install certbot python3-certbot-nginx

# Dobij certifikat
certbot --nginx -d tvoja-domena.com
```

### 6. Provjera

- Otvori `https://tvoja-domena.com` u browseru
- Prijavi se kao admin: `admin@serbiana.com` / `admin123`
- **ODMAH promijeni admin lozinku!**

## Održavanje

### Restart Servisa
```bash
docker-compose restart
```

### Ažuriranje Aplikacije
```bash
# Zaustavi servise
docker-compose down

# Povuci nove promjene (ako koristiš git)
git pull

# Rebuild i pokreni
docker-compose up -d --build
```

### Backup Baze
```bash
# Kreiraj backup
docker exec continental-mongodb mongodump --out=/data/backup

# Kopiraj backup na host
docker cp continental-mongodb:/data/backup ./backup
```

### Logovi
```bash
# Svi logovi
docker-compose logs

# Backend logovi
docker-compose logs backend

# Frontend logovi
docker-compose logs frontend
```

## Troubleshooting

### Aplikacija ne radi
```bash
# Provjeri status kontejnera
docker-compose ps

# Provjeri logove
docker-compose logs backend
docker-compose logs frontend
```

### Baza podataka problemi
```bash
# Restartuj MongoDB
docker-compose restart mongodb

# Provjeri zdravlje
docker exec continental-mongodb mongosh --eval "db.adminCommand('ping')"
```

### Port konflikti
Ako port 80 već koristi drugi servis:
```bash
# Promijeni port u docker-compose.yml
ports:
  - "8080:80"  # Koristi 8080 umjesto 80
```

## Kontakt
Za tehničku podršku kontaktirajte nas na Discord: discord.gg/continentall
