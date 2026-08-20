export const verifyAccountMailTemplate = (
  email: string,
  token: string,
  domain: string | undefined,
) => {
  const verificationUrl = `${domain}/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
  return {
    to: email,
    from: 'mauricio.ass.2016@gmail.com',
    subject: 'Verify your email address',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Email</title>
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
                      Verify your email
                    </h1>
                    
                    <p style="color: #4a4d55; font-size: 15px; line-height: 1.6; margin: 0 0 28px 0;">
                      Thanks for signing up! Please confirm your email address by clicking the button below.
                    </p>

                    <!-- CTA Button -->
                    <a href="${verificationUrl}" target="_blank" style="display: inline-block; background-color: #916cad; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 12px 32px; border-radius: 8px; box-shadow: 0 2px 8px rgba(145, 108, 173, 0.35);">
                      Verify Email
                    </a>

                    <!-- Token Display / Direct Link Fallback -->
                    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #eaeaea;">
                      <p style="color: #71717a; font-size: 13px; margin: 0 0 8px 0;">
                        Or copy and paste this link into your browser:
                      </p>
                      <p style="color: #916cad; font-size: 12px; word-break: break-all; margin: 0;">
                        ${verificationUrl}
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f0f0f0; padding: 20px 32px; text-align: center; border-top: 1px solid #eaeaea;">
                    <p style="color: #71717a; font-size: 12px; margin: 0;">
                      If you didn't request this email, you can safely ignore it.
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
