require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'src')));

// Route for specific pages to allow clean URLs
app.get('/platform', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'platform.html'));
});

app.get('/enterprise', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'enterprise.html'));
});

// 1. Log to server console (Internal Record)
const contactAttempts = new Map();

app.post('/api/contact', async (req, res) => {
    const { name, email, org_name, tier, website } = req.body;
    const clientIp = req.ip;
    const timestamp = new Date().toISOString();

    // --- SECURITY LAYER ---

    // 1. Honeypot check (Bots fill hidden fields)
    if (website) {
        console.warn(`[SECURITY] Bot detected from IP: ${clientIp} (Honeypot filled)`);
        return res.status(403).json({ success: false, message: 'Malicious activity detected.' });
    }

    // 2. Simple Rate Limiter (3 requests per 3 hours)
    const now = Date.now();
    const timeframe = 3 * 60 * 60 * 1000; // 3 hours

    if (!contactAttempts.has(clientIp)) {
        contactAttempts.set(clientIp, []);
    }

    // Filter out old attempts
    const attempts = contactAttempts.get(clientIp).filter(time => now - time < timeframe);
    attempts.push(now);
    contactAttempts.set(clientIp, attempts);

    if (attempts.length > 3) {
        console.warn(`[SECURITY] Rate limit exceeded for IP: ${clientIp}`);
        return res.status(429).json({
            success: false,
            message: 'Too many requests. Please wait 3 hours before submitting again.'
        });
    }

    // 3. Validation
    if (!name || !email || !org_name || !tier) {
        return res.status(400).json({ success: false, message: 'Incomplete briefing data.' });
    }

    // --- END SECURITY LAYER ---

    console.log('--- MISSION BRIEFING REQUEST RECEIVED ---');
    console.log(`Name:    ${name}`);
    console.log(`Email:   ${email}`);
    console.log(`Org:     ${org_name}`);
    console.log(`Tier:    ${tier}`);
    console.log(`Time:    ${timestamp}`);
    console.log('-----------------------------------------');

    // 2. Configure Email Transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    try {
        // 3. Send structured email to the Company
        await transporter.sendMail({
            from: `"VyomFix Gateway" <${process.env.EMAIL_USER}>`,
            to: process.env.COMPANY_RECEIVER_EMAIL,
            subject: `NEW ENQUIRY: ${name} / ${org_name}`,
            text: `--- MISSION BRIEFING REQUEST RECEIVED ---\nName:    ${name}\nEmail:   ${email}\nOrg:     ${org_name}\nTier:    ${tier}\nTime:    ${timestamp}\n-----------------------------------------`,
        });

        // 4. Send automated response to the User
        await transporter.sendMail({
            from: `"Shreya Umesh | VyomFix" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Mission Briefing Request Confirmation - ${name} / ${org_name}`,
            text: `Dear ${name},

Thank you for your mission briefing request. We have received your submission and are currently reviewing the details.

Below is a summary of the information you provided:

Name: ${name}
Email: ${email}
Organization: ${org_name}
Tier: ${tier}
Request Timestamp: ${timestamp}

Our team will assess your request and reach out to you shortly with further details or to schedule a briefing. If you need to update any information or have immediate questions, please don’t hesitate to reply to this email.

We appreciate your interest and look forward to working with you.

Best regards,

Shreya Umesh
Founder & CEO
VyomFix`,
        });

        res.status(200).json({
            success: true,
            message: 'Mission briefing request transmitted successfully.'
        });

    } catch (error) {
        console.error('Email Transmission Error:', error);
        res.status(500).json({
            success: false,
            message: 'Gateway transmission failed. Please contact systems-admin@vyomfix.com'
        });
    }
});

app.listen(PORT, () => {
    console.log(`VyomFix Server running at http://localhost:${PORT}`);
    console.log('Secure Gateway Active.');
});
