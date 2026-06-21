import 'server-only'

type WorkspaceInviteEmailParams = {
  inviteeEmail: string
  inviteeName?: string | null
  inviterName: string
  workspaceName: string
  inviteUrl: string
  appOrigin?: string
}

export function buildWorkspaceInviteEmailHtml(params: WorkspaceInviteEmailParams): string {
  const greetingName =
    params.inviteeName?.trim() ||
    params.inviteeEmail.split('@')[0] ||
    'there'
  const year = new Date().getFullYear()
  const logoUrl = params.appOrigin
    ? `${params.appOrigin.replace(/\/$/, '')}/Logo.png`
    : 'https://dreamscale.app/Logo.png'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Join ${params.workspaceName} on DreamScale</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#f5f5f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;background-color:#ffffff;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#005DFF 0%,#0048CC 100%);padding:40px 30px;text-align:center;">
              <img src="${logoUrl}" alt="DreamScale" style="max-width:120px;height:auto;display:block;margin:0 auto;" />
            </td>
          </tr>
          <tr>
            <td style="padding:40px 30px;">
              <h1 style="margin:0 0 20px 0;font-size:28px;font-weight:700;color:#1a1a1a;text-align:center;">
                You are invited to collaborate
              </h1>
              <p style="margin:0 0 20px 0;font-size:16px;line-height:1.6;color:#4a4a4a;text-align:center;">
                Hi ${greetingName},
              </p>
              <p style="margin:0 0 30px 0;font-size:16px;line-height:1.6;color:#4a4a4a;text-align:center;">
                <strong>${params.inviterName}</strong> invited you to join
                <strong>${params.workspaceName}</strong> on DreamScale. Click below to accept your invite,
                enter your name, and join the workspace. No DreamScale account is required.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding:0 0 30px 0;">
                    <a href="${params.inviteUrl}" style="display:inline-block;background:linear-gradient(135deg,#005DFF 0%,#0048CC 100%);color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:8px;font-size:16px;font-weight:600;box-shadow:0 2px 4px rgba(0,93,255,0.3);">
                      Accept workspace invite
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 10px 0;font-size:14px;color:#666666;text-align:center;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin:0 0 30px 0;font-size:12px;color:#999999;word-break:break-all;text-align:center;padding:10px;background-color:#f9f9f9;border-radius:6px;">
                ${params.inviteUrl}
              </p>
              <div style="background-color:#f0f7ff;border-left:4px solid #005DFF;padding:15px;border-radius:6px;margin:30px 0;">
                <p style="margin:0;font-size:13px;color:#4a4a4a;line-height:1.5;">
                  <strong style="color:#005DFF;">How it works:</strong> This works like a magic sign-in link.
                  Open the link, enter your name, and you will be added to the workspace as a guest collaborator.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f9f9f9;padding:30px;text-align:center;border-top:1px solid #e5e5e5;">
              <p style="margin:0 0 10px 0;font-size:14px;color:#666666;">
                Need help? Contact us at
                <a href="mailto:support@dreamscale.app" style="color:#005DFF;text-decoration:none;">support@dreamscale.app</a>
              </p>
              <p style="margin:0;font-size:12px;color:#999999;">© ${year} DreamScale. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function workspaceInviteEmailSubject(workspaceName: string): string {
  return `Join ${workspaceName} on DreamScale`
}
