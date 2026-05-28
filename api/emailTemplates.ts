export function verificationCodeEmail(code: string, type: 'register' | 'reset_password'): { subject: string; html: string } {
  const titles: Record<string, string> = {
    register: '注册验证码',
    reset_password: '重置密码验证码'
  };
  const descs: Record<string, string> = {
    register: '您正在注册 SSD 开卡工具站账号',
    reset_password: '您正在重置 SSD 开卡工具站密码'
  };

  const title = titles[type] || '验证码';
  const desc = descs[type] || '';

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:#f0f4ff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4ff;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
          <tr>
            <td style="background:linear-gradient(180deg,#6366f1 0%,#8b5cf6 100%);border-radius:20px 20px 0 0;padding:2px;"></td>
          </tr>
          <tr>
            <td style="background:#ffffff;border-radius:0 0 20px 20px;padding:40px 32px 32px;text-align:center;">

              <div style="width:64px;height:64px;margin:0 auto 24px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:inline-block;text-align:center;line-height:64px;">
                <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><rect x='3' y='11' width='18' height='11' rx='2' ry='2'/><path d='M7 11V7a5 5 0 0 1 10 0v4'/></svg>" alt="lock" width="32" height="32" style="vertical-align:middle;" />
              </div>

              <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#1e1b4b;">${title}</h1>
              <p style="margin:0 0 28px;font-size:13px;color:#94a3b8;line-height:1.6;">${desc}</p>

              <p style="margin:0 0 10px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:#a78bfa;">验证码</p>

              <div style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#f0edff,#ede9fe);border:1px solid #c4b5fd;border-radius:12px;margin-bottom:20px;">
                <span style="font-size:30px;font-weight:800;letter-spacing:6px;color:#5b21b6;">${code}</span>
              </div>

              <div style="display:inline-block;padding:6px 14px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:16px;margin-bottom:24px;">
                <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#22c55e;margin-right:6px;vertical-align:middle;"></span>
                <span style="font-size:11px;color:#6b7280;">有效期 <strong style="color:#1e1b4b;">30 分钟</strong></span>
              </div>

              <div style="height:1px;background:linear-gradient(90deg,transparent,#e2e8f0,transparent);margin:20px 0;"></div>

              <p style="margin:0;font-size:11px;color:#cbd5e1;line-height:1.8;">
                如非本人操作，请忽略此邮件<br/>
                SSD 开卡工具站 &copy; ${new Date().getFullYear()}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject: `SSD开卡工具站 - ${title}`, html };
}