export const resetPasswordMailTemplate = (
  email: string,
  token: string,
  domain: string | undefined,
) => {
  const resetUrl = `${domain}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  return {
    to: email,
    from: 'mauricio.ass.2016@gmail.com',
    subject: 'Reset your password',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Password</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #eaeaea; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #eaeaea; padding: 40px 16px;">
          <tr>
            <td align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
                
                <!-- Accent Header Strip -->
                <tr>
                  <td style="background-color: #916cad; height: 6px;"></td>
                </tr>

                <!-- Content Body -->
                <tr>
                  <td style="padding: 40px 32px; text-align: center;">
                    <h1 style="color: #16181d; font-size: 22px; font-weight: 700; margin: 0 0 12px 0;">
                      Reset your password
                    </h1>
                    
                    <p style="color: #4a4d55; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
                      We received a request to reset the password for your account. Click the button below to set up a new password.
                    </p>

                    <!-- Security Notice Box -->
                    <div style="background-color: #f0f0f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 28px;">
                      <p style="color: #16181d; font-size: 13px; font-weight: 500; margin: 0;">
                        ⏳ This link will expire in 1 hour.
                      </p>
                    </div>

                    <!-- CTA Button -->
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; background-color: #916cad; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 12px 32px; border-radius: 8px; box-shadow: 0 2px 8px rgba(145, 108, 173, 0.35);">
                      Reset Password
                    </a>

                    <!-- Direct Link Fallback -->
                    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #eaeaea;">
                      <p style="color: #71717a; font-size: 13px; margin: 0 0 8px 0;">
                        Or copy and paste this link into your browser:
                      </p>
                      <p style="color: #916cad; font-size: 12px; word-break: break-all; margin: 0;">
                        ${resetUrl}
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f0f0f0; padding: 20px 32px; text-align: center; border-top: 1px solid #eaeaea;">
                    <p style="color: #71717a; font-size: 12px; margin: 0 0 6px 0;">
                      If you didn't request a password reset, you can safely ignore this email.
                    </p>
                    <p style="color: #71717a; font-size: 12px; margin: 0;">
                      Your password won't change until you access the link above and create a new one.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };
};
