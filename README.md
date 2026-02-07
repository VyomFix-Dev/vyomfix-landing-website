# VyomFix | Assemble It 🚀

**Assemble It** is an AI-powered aerospace manufacturing platform designed to optimize rocket manufacturing through AI intelligence, compliance management, and unified workflow orchestration.

## ✨ Features

- **Unified Dashboard**: Advanced UI components for monitoring stage assembly and compliance.
- **Space-Grade Aesthetics**: Modern dark-mode design with neon accents and high-performance glassmorphism.
- **Responsive Design**: Fully optimized for Desktop, Tablet, and Mobile devices.
- **Interactive Elements**: Scroll-triggered animations, antigravity particle backgrounds, and dynamic counters.
- **Secure Gateway**: Backend-protected Enterprise briefing form with mission-critical security layers.

## 🛡️ Security & Gateway Features

The website includes a robust backend "Secure Gateway" powered by Node.js and Express to handle sensitive mission briefings with the following security layers:

- **Anti-Spam Rate Limiting**: An in-memory tracking system that restricts each user (by IP address) to exactly **3 submissions every 3 hours**. Attempts beyond this limit receive a `429 Too Many Requests` response.
- **Honeypot Bot Protection**: A hidden "website" field designed to trap automated spam bots. Any submission with this field filled is immediately aborted.
- **Strict Data Validation**: Server-side verification ensures all required fields (Name, Email, Org, Tier) are present and sanitized before any processing.
- **Security Logging**: Real-time server-side monitoring that flags bot detections and rate-limit violations for administrative review.
- **Encrypted Transmission**: Secure SMTP configuration using Google App Passwords for reliable and encrypted briefing confirmations.

## 🚀 How to Run the Project

### Option 1: Simple Preview (No Installation)
1. Navigate to the project folder.
2. Double-click **`index.html`** to open it in your default web browser.

### Option 2: Local Development Server (Recommended)
This method ensures all features and file paths work exactly like a production environment.

**Prerequisites:**
- [Node.js](https://nodejs.org/) installed on your system.

**Steps:**
1. Open your terminal/command prompt in the project directory.
2. Run the following command to start the server:
   ```bash
   npm run dev
   ```
3. Open your browser and go to the URL shown in the terminal (usually `http://localhost:3000`).

## 📁 File Structure

- `index.html` — The main structure and content of the landing page.
- `style.css` — Custom aerospace design system and animations.
- `script.js` — Interaction logic, scroll reveals, and stat animations.
- `package.json` — Configuration for the local development server.
- `README.md` — Project documentation.

---

Built with ❤️ for VyomFix Technologies.
