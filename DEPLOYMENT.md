# Continental Academy - Kompletne Upute za Deployment na Hostinger VPS

## Sadržaj
1. [Preduvjeti](#1-preduvjeti)
2. [Priprema VPS-a](#2-priprema-vps-a)
3. [Instalacija Docker-a](#3-instalacija-docker-a)
4. [Upload Fajlova](#4-upload-fajlova)
5. [Konfiguracija](#5-konfiguracija)
6. [Pokretanje Aplikacije](#6-pokretanje-aplikacije)
7. [SSL/HTTPS Setup](#7-sslhttps-setup)
8. [Održavanje](#8-održavanje)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Preduvjeti

### Na Hostingeru treba:
- VPS plan (bilo koji, min. 2GB RAM preporučeno)
- Domena usmjerena na VPS IP adresu

### Prije početka:
- Zabilježi IP adresu VPS-a
- Zabilježi root lozinku
- Osiguraj da domena pokazuje na IP (A record)

---

## 2. Priprema VPS-a

### Korak 2.1: Odaberi OS
Prilikom kreiranja VPS-a na Hostingeru, odaberi:
- **Ubuntu 22.04 LTS** (preporučeno)
- ili **Ubuntu 24.04 LTS**

### Korak 2.2: Poveži se na VPS
```bash
ssh root@TVOJ_VPS_IP
```
Unesi root lozinku kada te pita.

### Korak 2.3: Ažuriraj sistem
```bash
apt update && apt upgrade -y
```

---

## 3. Instalacija Docker-a

### Korak 3.1: Instaliraj Docker
```bash
# Instaliraj potrebne pakete
apt install -y apt-transport-https ca-certificates curl software-properties-common

# Dodaj Docker GPG ključ
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Dodaj Docker repozitorij
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instaliraj Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io

# Provjeri instalaciju
docker --version
```

### Korak 3.2: Instaliraj Docker Compose
```bash
# Preuzmi Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Daj izvršne dozvole
chmod +x /usr/local/bin/docker-compose

# Provjeri instalaciju
docker-compose --version
```

---

## 4. Upload Fajlova

### Korak 4.1: Kreiraj folder za aplikaciju
```bash
mkdir -p /opt/continental-academy
cd /opt/continental-academy
```

### Korak 4.2: Prenesi fajlove
Možeš koristiti SCP, SFTP, ili FileZilla.

**Opcija A: SCP sa lokalnog računara**
```bash
# Sa tvog računara (ne na VPS-u)
scp -r ./backend root@TVOJ_VPS_IP:/opt/continental-academy/
scp -r ./frontend root@TVOJ_VPS_IP:/opt/continental-academy/
scp docker-compose.yml Dockerfile.backend Dockerfile.frontend nginx.conf root@TVOJ_VPS_IP:/opt/continental-academy/
```

**Opcija B: Git Clone** (ako imaš na GitHubu)
```bash
cd /opt/continental-academy
git clone https://github.com/tvoj-username/continental-academy.git .
```

### Korak 4.3: Provjeri strukturu
```bash
ls -la /opt/continental-academy
```
Trebalo bi prikazati:
```
backend/
frontend/
docker-compose.yml
Dockerfile.backend
Dockerfile.frontend
nginx.conf
```

---

## 5. Konfiguracija

### Korak 5.1: Kreiraj .env fajl
```bash
cd /opt/continental-academy
nano .env
```

### Korak 5.2: Popuni .env sa sljedećim:
```
# Zamijeni tvoja-domena.com sa tvojom pravom domenom
REACT_APP_BACKEND_URL=https://tvoja-domena.com

# Generiraj siguran JWT secret (možeš koristiti: openssl rand -hex 32)
JWT_SECRET=generiraj-siguran-kljuc-ovdje-minimalno-32-karaktera

# Stripe API Key (sa Stripe Dashboard-a)
STRIPE_API_KEY=sk_live_tvoj_pravi_stripe_kljuc

# CORS Origins
CORS_ORIGINS=https://tvoja-domena.com,https://www.tvoja-domena.com
```

**Za generiranje JWT_SECRET:**
```bash
openssl rand -hex 32
```
Kopiraj rezultat i zalijepi kao JWT_SECRET.

### Korak 5.3: Spremi i zatvori
Pritisni `Ctrl+X`, zatim `Y`, pa `Enter`.

---

## 6. Pokretanje Aplikacije

### Korak 6.1: Build i pokreni
```bash
cd /opt/continental-academy
docker-compose up -d --build
```

Ovo će:
- Izgraditi backend Docker image
- Izgraditi frontend Docker image
- Pokrenuti MongoDB
- Pokrenuti sve servise

**Trajanje:** 3-10 minuta ovisno o VPS performansama.

### Korak 6.2: Provjeri status
```bash
docker-compose ps
```
Svi servisi trebaju biti "Up":
```
NAME                    STATUS
continental-backend     Up
continental-frontend    Up
continental-mongodb     Up (healthy)
```

### Korak 6.3: Pogledaj logove
```bash
# Svi logovi
docker-compose logs -f

# Samo backend
docker-compose logs -f backend

# Samo frontend
docker-compose logs -f frontend
```

### Korak 6.4: Test bez SSL-a
Otvori u browseru: `http://tvoja-domena.com` ili `http://TVOJ_VPS_IP`

---

## 7. SSL/HTTPS Setup

### Korak 7.1: Instaliraj Certbot
```bash
apt install -y certbot python3-certbot-nginx
```

### Korak 7.2: Zaustavi Docker (privremeno)
```bash
cd /opt/continental-academy
docker-compose down
```

### Korak 7.3: Instaliraj Nginx na hostu
```bash
apt install -y nginx
```

### Korak 7.4: Kreiraj Nginx konfiguraciju
```bash
nano /etc/nginx/sites-available/continental
```

Zalijepi:
```nginx
server {
    listen 80;
    server_name tvoja-domena.com www.tvoja-domena.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Spremi i zatvori (`Ctrl+X`, `Y`, `Enter`).

### Korak 7.5: Aktiviraj konfiguraciju
```bash
ln -s /etc/nginx/sites-available/continental /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

### Korak 7.6: Promijeni Docker port
```bash
cd /opt/continental-academy
nano docker-compose.yml
```

Promijeni port sa "80:80" na "8080:80":
```yaml
  frontend:
    ...
    ports:
      - "8080:80"  # Promijenjeno sa 80:80
```

### Korak 7.7: Pokreni Docker ponovo
```bash
docker-compose up -d --build
```

### Korak 7.8: Dobij SSL certifikat
```bash
certbot --nginx -d tvoja-domena.com -d www.tvoja-domena.com
```
Prati upute na ekranu. Unesi email i prihvati uvjete.

### Korak 7.9: Automatska obnova certifikata
```bash
# Test obnove
certbot renew --dry-run
```
Certbot automatski dodaje cron job za obnovu.

### Korak 7.10: Ažuriraj .env sa HTTPS
```bash
nano /opt/continental-academy/.env
```
Osiguraj da REACT_APP_BACKEND_URL koristi https:
```
REACT_APP_BACKEND_URL=https://tvoja-domena.com
```

### Korak 7.11: Rebuild frontend sa novim URL-om
```bash
cd /opt/continental-academy
docker-compose up -d --build frontend
```

---

## 8. Održavanje

### Restart servisa
```bash
cd /opt/continental-academy
docker-compose restart
```

### Ažuriranje aplikacije
```bash
cd /opt/continental-academy

# Ako koristiš Git
git pull

# Rebuild i restart
docker-compose down
docker-compose up -d --build
```

### Backup MongoDB baze
```bash
# Kreiraj backup folder
mkdir -p /opt/backups

# Napravi backup
docker exec continental-mongodb mongodump --out=/data/backup

# Kopiraj na host
docker cp continental-mongodb:/data/backup /opt/backups/backup-$(date +%Y%m%d)
```

### Vraćanje backup-a
```bash
# Kopiraj backup u kontejner
docker cp /opt/backups/backup-YYYYMMDD continental-mongodb:/data/restore

# Vrati bazu
docker exec continental-mongodb mongorestore /data/restore
```

### Pregled logova
```bash
# Live logovi
docker-compose logs -f

# Zadnjih 100 linija
docker-compose logs --tail=100

# Logovi za specifičan servis
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb
```

### Provjera zauzeća diska
```bash
docker system df
```

### Čišćenje nekorištenih resursa
```bash
docker system prune -a
```

---

## 9. Troubleshooting

### Problem: Stranica ne učitava
```bash
# Provjeri da li su kontejneri pokrenuti
docker-compose ps

# Provjeri logove
docker-compose logs --tail=50

# Provjeri Nginx status (ako koristiš)
systemctl status nginx
```

### Problem: 502 Bad Gateway
```bash
# Provjeri da li backend radi
docker-compose logs backend

# Restart backend-a
docker-compose restart backend
```

### Problem: MongoDB ne starta
```bash
# Provjeri MongoDB logove
docker-compose logs mongodb

# Provjeri disk prostor
df -h

# Restart MongoDB
docker-compose restart mongodb
```

### Problem: SSL certifikat ne radi
```bash
# Provjeri certifikat
certbot certificates

# Obnovi certifikat
certbot renew --force-renewal

# Restart Nginx
systemctl restart nginx
```

### Problem: Port je već zauzet
```bash
# Nađi proces koji koristi port
lsof -i :80
lsof -i :8080

# Ubij proces ako treba
kill -9 PID_BROJ
```

### Problem: Out of Memory
```bash
# Provjeri memoriju
free -h

# Dodaj swap ako treba
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

---

## Firewall konfiguracija (opciono ali preporučeno)

```bash
# Instaliraj UFW
apt install -y ufw

# Dozvoli SSH
ufw allow 22

# Dozvoli HTTP i HTTPS
ufw allow 80
ufw allow 443

# Aktiviraj firewall
ufw enable

# Provjeri status
ufw status
```

---

## Admin pristup

Nakon uspješnog deployment-a:
- URL: https://tvoja-domena.com/admin
- Email: admin@serbiana.com
- Lozinka: admin123

**ODMAH PROMIJENI ADMIN LOZINKU!**

---

## Podrška

Ako imaš problema:
1. Provjeri logove: `docker-compose logs`
2. Provjeri Troubleshooting sekciju iznad
3. Kontaktiraj nas na Discord: discord.gg/continentall

---

## Brzi pregled naredbi

```bash
# Pokreni
docker-compose up -d

# Zaustavi
docker-compose down

# Restart
docker-compose restart

# Rebuild
docker-compose up -d --build

# Logovi
docker-compose logs -f

# Status
docker-compose ps
```
