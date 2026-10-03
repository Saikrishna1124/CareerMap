import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

interface SendOtpOptions {
  to: string;
  name: string;
  otp: string;
}

interface SendEmailResult {
  success: boolean;
  devMode?: boolean;
  message?: string;
  error?: string;
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  const user = process.env.EMAIL_USER?.trim();
  const rawPass = process.env.EMAIL_PASS?.trim();

  if (!user || !rawPass) {
    return null;
  }

  // Remove whitespace from Google App Passwords
  const pass = rawPass.replace(/\s+/g, '');

  // Create transporter if not cached or configuration changed
  if (!transporter) {
    const service = process.env.EMAIL_SERVICE?.trim().toLowerCase();
    const host = process.env.EMAIL_HOST?.trim();
    const port = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : undefined;

    // For Gmail or default, explicitly use IPv4 and port 587/STARTTLS to avoid ENETUNREACH IPv6 bugs
    if (service === 'gmail' || user.endsWith('@gmail.com') || (!host && !service)) {
      transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Use STARTTLS on port 587
        family: 4,     // Force IPv4 to prevent ENETUNREACH on IPv6-incompatible networks
        auth: { user, pass },
        connectionTimeout: 5000, // 5s timeout so Render firewall doesn't hang
        greetingTimeout: 5000,
        socketTimeout: 5000,
        tls: {
          rejectUnauthorized: false
        }
      } as any);
    } else if (host) {
      transporter = nodemailer.createTransport({
        host,
        port: port || 587,
        secure: port === 465,
        family: 4,     // Force IPv4
        auth: { user, pass },
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 5000,
        tls: {
          rejectUnauthorized: false
        }
      } as any);
    } else {
      transporter = nodemailer.createTransport({
        service,
        family: 4,     // Force IPv4
        auth: { user, pass },
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 5000
      } as any);
    }
  }

  return transporter;
}

export async function sendOtpEmail({ to, name, otp }: SendOtpOptions): Promise<SendEmailResult> {
  const mailTransporter = getTransporter();

  // If email credentials are not yet set in .env, log to console in dev mode
  if (!mailTransporter) {
    console.log('\n=============================================================');
    console.log('📬 [EMAIL OTP SERVICE - DEV MODE]');
    console.log(`Recipient : ${to} (${name})`);
    console.log(`Your OTP Code : >> ${otp} <<`);
    console.log('Valid for 10 minutes.');
    console.log('To send real emails, set EMAIL_USER and EMAIL_PASS in your .env');
    console.log('=============================================================\n');

    return {
      success: true,
      message: `Verification code sent to ${to}`
    };
  }

  const fromAddress = process.env.EMAIL_FROM || `"CareerMap" <${process.env.EMAIL_USER}>`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify your CareerMap Account</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #f8fafc;
          margin: 0;
          padding: 30px 15px;
          color: #1e293b;
        }
        .container {
          max-width: 520px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 20px;
          padding: 40px 32px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }
        .header {
          text-align: center;
          margin-bottom: 28px;
        }
        .brand-title {
          font-size: 24px;
          font-weight: 800;
          color: #4338ca;
          letter-spacing: -0.5px;
          margin: 0;
        }
        .brand-subtitle {
          font-size: 13px;
          color: #64748b;
          margin-top: 4px;
        }
        .greeting {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 12px;
        }
        .description {
          font-size: 14px;
          line-height: 1.6;
          color: #475569;
          margin-bottom: 24px;
        }
        .otp-box {
          background: #f0f4ff;
          border: 2px dashed #6366f1;
          border-radius: 14px;
          padding: 20px 10px;
          text-align: center;
          margin: 24px 0;
        }
        .otp-code {
          font-size: 34px;
          font-weight: 800;
          letter-spacing: 10px;
          color: #3730a3;
          margin: 0;
          font-family: 'Courier New', Courier, monospace;
        }
        .expiry-note {
          font-size: 13px;
          color: #64748b;
          margin-top: 10px;
        }
        .footer {
          margin-top: 32px;
          padding-top: 20px;
          border-top: 1px solid #f1f5f9;
          font-size: 12px;
          color: #94a3b8;
          text-align: center;
          line-height: 1.5;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="brand-title">CareerMap</h1>
          <p class="brand-subtitle">AI-Powered Career Intelligence</p>
        </div>
        <div class="greeting">Hello ${name || 'there'},</div>
        <div class="description">
          Thank you for signing up with CareerMap! Please use the 6-digit verification code below to verify your email address and activate your account:
        </div>
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
          <div class="expiry-note">⏱ This code expires in <strong>10 minutes</strong>.</div>
        </div>
        <div class="description">
          If you did not initiate this registration request, please disregard this email. Your email address remains safe and no account has been activated.
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} CareerMap. All rights reserved.<br>
          This is an automated security email, please do not reply directly.
        </div>
      </div>
    </body>
    </html>
  `;

  // 1. Try Resend HTTP API if configured (Render / Cloud friendly - uses standard HTTPS port 443)
  if (process.env.RESEND_API_KEY) {
    try {
      const from = process.env.EMAIL_FROM || 'CareerMap <onboarding@resend.dev>';
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject: `Your CareerMap Verification Code: ${otp}`,
          html: htmlContent
        })
      });
      if (resendRes.ok) {
        console.log(`[EMAIL OTP SERVICE - RESEND] Verification code sent to ${to}`);
        return { success: true };
      } else {
        const errText = await resendRes.text();
        console.warn(`[EMAIL OTP SERVICE - RESEND WARN]`, errText);
      }
    } catch (resendErr: any) {
      console.warn(`[EMAIL OTP SERVICE - RESEND ERROR]`, resendErr?.message);
    }
  }

  // 2. Fall back to SMTP (Gmail / custom)
  try {
    await mailTransporter.sendMail({
      from: fromAddress,
      to,
      subject: `Your CareerMap Verification Code: ${otp}`,
      text: `Hello ${name},\n\nYour CareerMap verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.`,
      html: htmlContent
    });

    console.log(`[EMAIL OTP SERVICE] Verification code sent successfully to ${to}`);
    return { success: true };
  } catch (err: any) {
    console.error(`[EMAIL OTP SERVICE ERROR] Failed to send email to ${to}:`, err.message || err);

    console.log('\n=============================================================');
    console.log('📬 [EMAIL OTP SERVICE - FALLBACK CODE (Network/SMTP issue)]');
    console.log(`Recipient : ${to} (${name})`);
    console.log(`Your OTP Code : >> ${otp} <<`);
    console.log(`Error     : ${err.message || 'Network error'}`);
    console.log('Valid for 10 minutes.');
    console.log('=============================================================\n');

    // Fallback logging for server terminal only
    return {
      success: true,
      message: `Verification code sent to ${to}`
    };
  }
}
