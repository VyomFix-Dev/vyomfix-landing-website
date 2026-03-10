Below is a **repeatable production deployment guide** for your app so you can recreate the setup on a **new EC2 instance anytime**.

---

# 1. Infrastructure Overview

Architecture:

```
Internet
   ↓
GoDaddy DNS
   ↓
EC2 Public IP
   ↓
Nginx (reverse proxy)
   ↓
Node.js App (PM2)
   ↓
GitHub Repo
```

Components:

| Component      | Purpose         |
| -------------- | --------------- |
| EC2 Ubuntu     | server          |
| Node.js        | runtime         |
| PM2            | process manager |
| Nginx          | reverse proxy   |
| Certbot        | SSL             |
| GitHub Actions | auto deploy     |

---

# 2. Launch EC2 Instance

Recommended configuration:

| Setting        | Value            |
| -------------- | ---------------- |
| AMI            | Ubuntu 22.04 LTS |
| Instance       | t3.small         |
| Storage        | 8–20GB           |
| Security Group | allow 22,80,443  |

Security group inbound:

| Type  | Port |
| ----- | ---- |
| SSH   | 22   |
| HTTP  | 80   |
| HTTPS | 443  |

---

# 3. Connect to Server

```
ssh -i key.pem ubuntu@EC2_PUBLIC_IP
```

Update system:

```bash
sudo apt update
sudo apt upgrade -y
```

---

# 4. Install Required Software

Install Node:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y
```

Verify:

```
node -v
npm -v
```

Install other tools:

```bash
sudo apt install git nginx -y
sudo npm install -g pm2
```

---

# 5. Deploy Application

Clone repo:

```bash
git clone https://github.com/VyomFix-Dev/vyomfix-landing-website.git
cd vyomfix-landing-website
```

Install dependencies:

```bash
npm install
```

Create `.env`:

```bash
nano .env
```

Example:

```
PORT=3000
EMAIL_USER=example@email.com
EMAIL_PASS=password
```

---

# 6. Start Application

```
pm2 start server.js --name vyomfix
pm2 save
pm2 startup
```

Verify:

```
pm2 list
```

---

# 7. Configure Nginx

Create config:

```
sudo nano /etc/nginx/sites-available/vyomfix
```

Config:

```
server {
    listen 80;
    server_name vyomfix.com www.vyomfix.com;

    location / {
        proxy_pass http://localhost:3000;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/vyomfix /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

# 8. Configure Domain (GoDaddy)

DNS records:

| Type | Name | Value         |
| ---- | ---- | ------------- |
| A    | @    | EC2_PUBLIC_IP |
| A    | www  | EC2_PUBLIC_IP |

---

# 9. Enable HTTPS

Install certbot:

```bash
sudo apt install certbot python3-certbot-nginx -y
```

Generate certificate:

```bash
sudo certbot --nginx -d vyomfix.com -d www.vyomfix.com
```

Certbot also enables **auto renewal**.

---

# 10. Auto Deployment Setup

Create deploy script:

```
nano ~/deploy.sh
```

Script:

```
#!/bin/bash

APP_DIR="/home/ubuntu/vyomfix-landing-website"

cd $APP_DIR || exit

git pull origin main

npm install

pm2 reload vyomfix
```

Make executable:

```
chmod +x ~/deploy.sh
```

---

# 11. GitHub Auto Deploy

Create workflow:

```
.github/workflows/deploy.yml
```

```
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: SSH Deploy
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            ~/deploy.sh
```

GitHub secrets:

| Secret      | Value       |
| ----------- | ----------- |
| EC2_HOST    | server IP   |
| EC2_SSH_KEY | private key |

---

# 12. Deploying Updates

Normal workflow:

```
git push origin main
```

Pipeline executes:

```
GitHub Action
     ↓
SSH → EC2
     ↓
deploy.sh
     ↓
git pull
npm install
pm2 reload
```

---

# 13. Useful Commands

PM2:

| Command             | Purpose       |
| ------------------- | ------------- |
| pm2 list            | view apps     |
| pm2 logs vyomfix    | logs          |
| pm2 restart vyomfix | restart       |
| pm2 reload vyomfix  | zero downtime |

Nginx:

```
sudo systemctl restart nginx
sudo nginx -t
```

---

# 14. Migrating to a New EC2

Steps:

1. Launch new EC2
2. Install Node + Nginx + PM2
3. Clone repo
4. Copy `.env`
5. Update GoDaddy A record
6. Run certbot again

Downtime: **<2 minutes**

---

# 15. Recommended Improvements

| Feature          | Benefit               |
| ---------------- | --------------------- |
| Cloudflare       | CDN + DDoS protection |
| Docker           | reproducible builds   |
| PM2 cluster mode | multi-core scaling    |
| S3 backups       | asset storage         |
