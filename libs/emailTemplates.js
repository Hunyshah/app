/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable padding-line-between-statements */

export const buildSignupOtpEmail = (otp) => {
  const websiteName = "AI Sales Forecasting";
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${websiteName} | Verify Your Account</title>
      <style>
        /* Base reset */
        body { margin: 0; padding: 0; background: #f5f7fb; color: #1c1c1c; }
        a { color: inherit; text-decoration: none; }
        /* Container */
        .container { max-width: 560px; margin: 0 auto; padding: 24px 16px; }
        .card { background: #ffffff; border-radius: 12px; box-shadow: 0 6px 18px rgba(0,0,0,0.08); overflow: hidden; }
        .header { background: #0f9d7c; color: #ffffff; padding: 20px 24px; text-align: center; }
        .brand { font-size: 20px; font-weight: 700; letter-spacing: 0.2px; }
        .content { padding: 24px; font-size: 16px; line-height: 1.6; }
        .otp-box { margin: 16px 0 20px; padding: 16px; background: #f0fbf8; border: 1px solid #c8eee5; color: #0f9d7c; font-weight: 700; font-size: 22px; text-align: center; border-radius: 10px; letter-spacing: 4px; }
        .muted { color: #60676d; font-size: 14px; }
        .footer { text-align: center; color: #808991; font-size: 12px; padding: 16px 8px 24px; }
        .copyright { margin-top: 6px; }
        @media (max-width: 480px) {
          .content { padding: 20px; font-size: 15px; }
          .otp-box { font-size: 20px; letter-spacing: 3px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            <div class="brand">${websiteName}</div>
          </div>
          <div class="content">
            <p><strong>Welcome to ${websiteName}!</strong></p>
            <p>You’re receiving this email to verify your account. Please use the code below to complete your signup:</p>
            <div class="otp-box">${otp}</div>
            <p class="muted">This code will expire in 5 minutes.</p>
            <p class="muted">If you didn’t request this, please ignore this email.</p>
          </div>
          <div class="footer">
            <div>Thank you for choosing ${websiteName}.</div>
            <div class="copyright">© ${new Date().getFullYear()} ${websiteName}. All rights reserved.</div>
          </div>
        </div>
      </div>
    </body>
  </html>`;
};

export const buildResetOtpEmail = (otp) => {
  const websiteName = "AI Sales Forecasting";
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${websiteName} | Reset Your Password</title>
      <style>
        body { margin: 0; padding: 0; background: #f5f7fb; color: #1c1c1c; }
        a { color: inherit; text-decoration: none; }
        .container { max-width: 560px; margin: 0 auto; padding: 24px 16px; }
        .card { background: #ffffff; border-radius: 12px; box-shadow: 0 6px 18px rgba(0,0,0,0.08); overflow: hidden; }
        .header { background: #0f9d7c; color: #ffffff; padding: 20px 24px; text-align: center; }
        .brand { font-size: 20px; font-weight: 700; letter-spacing: 0.2px; }
        .content { padding: 24px; font-size: 16px; line-height: 1.6; }
        .otp-box { margin: 16px 0 20px; padding: 16px; background: #f0fbf8; border: 1px solid #c8eee5; color: #0f9d7c; font-weight: 700; font-size: 22px; text-align: center; border-radius: 10px; letter-spacing: 4px; }
        .muted { color: #60676d; font-size: 14px; }
        .footer { text-align: center; color: #808991; font-size: 12px; padding: 16px 8px 24px; }
        .copyright { margin-top: 6px; }
        @media (max-width: 480px) {
          .content { padding: 20px; font-size: 15px; }
          .otp-box { font-size: 20px; letter-spacing: 3px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            <div class="brand">${websiteName}</div>
          </div>
          <div class="content">
            <p><strong>Password Reset Request</strong></p>
            <p>Use the code below to verify your request and reset your password:</p>
            <div class="otp-box">${otp}</div>
            <p class="muted">This code will expire in 5 minutes.</p>
            <p class="muted">If you didn’t request this, please ignore this email.</p>
          </div>
          <div class="footer">
            <div>Need help? Reply to this email.</div>
            <div class="copyright">© ${new Date().getFullYear()} ${websiteName}. All rights reserved.</div>
          </div>
        </div>
      </div>
    </body>
  </html>`;
};