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
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #0a0a14;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .container {
      max-width: 480px;
      width: 100%;
      position: relative;
    }

    .card {
      background: linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 28px;
      padding: 44px 36px 36px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .card::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse at 20% 30%, rgba(99,102,241,0.10) 0%, transparent 55%),
        radial-gradient(ellipse at 80% 70%, rgba(139,92,246,0.08) 0%, transparent 55%);
      pointer-events: none;
    }

    .top-accent {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 140px;
      height: 3px;
      background: linear-gradient(90deg, transparent, #6366f1, #8b5cf6, transparent);
      border-radius: 0 0 4px 4px;
    }

    .icon-ring {
      width: 80px;
      height: 80px;
      margin: 0 auto 28px;
      position: relative;
      z-index: 1;
    }

    .icon-ring::before {
      content: '';
      position: absolute;
      inset: -4px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7);
      animation: ringPulse 2.5s ease-in-out infinite;
      opacity: 0.3;
    }

    @keyframes ringPulse {
      0%, 100% { transform: scale(1); opacity: 0.3; }
      50% { transform: scale(1.12); opacity: 0.15; }
    }

    .icon-box {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 1;
      box-shadow: 0 8px 32px rgba(99,102,241,0.25);
    }

    .icon-box svg {
      width: 36px;
      height: 36px;
    }

    .title {
      color: #ffffff;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.3px;
      margin-bottom: 8px;
      position: relative;
      z-index: 1;
    }

    .desc {
      color: rgba(255,255,255,0.45);
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 32px;
      position: relative;
      z-index: 1;
    }

    .code-label {
      color: rgba(255,255,255,0.3);
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 12px;
      position: relative;
      z-index: 1;
    }

    .code-box {
      display: inline-flex;
      gap: 8px;
      padding: 18px 36px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      margin-bottom: 28px;
      position: relative;
      z-index: 1;
    }

    .code-digit {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: 6px;
      color: #ffffff;
      text-shadow: 0 0 20px rgba(99,102,241,0.2);
    }

    .expiry {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 20px;
      margin-bottom: 24px;
      position: relative;
      z-index: 1;
    }

    .expiry-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10b981;
      animation: dotPulse 1.8s ease-in-out infinite;
    }

    @keyframes dotPulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    .expiry-text {
      color: rgba(255,255,255,0.35);
      font-size: 12px;
    }

    .expiry-text strong {
      color: rgba(255,255,255,0.6);
      font-weight: 600;
    }

    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
      margin: 24px 0;
      position: relative;
      z-index: 1;
    }

    .footer-text {
      color: rgba(255,255,255,0.2);
      font-size: 11px;
      line-height: 1.8;
      position: relative;
      z-index: 1;
    }

    .footer-text a {
      color: rgba(99,102,241,0.5);
      text-decoration: none;
    }

    @media (max-width: 520px) {
      .card { padding: 32px 20px 28px; border-radius: 20px; }
      .code-digit { font-size: 26px; }
      .code-box { padding: 14px 24px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="top-accent"></div>

      <div class="icon-ring">
        <div class="icon-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
      </div>

      <h1 class="title">${title}</h1>
      <p class="desc">${desc}</p>

      <p class="code-label">验证码</p>
      <div class="code-box">
        <span class="code-digit">${code}</span>
      </div>

      <div class="expiry">
        <span class="expiry-dot"></span>
        <span class="expiry-text">有效期 <strong>30 分钟</strong></span>
      </div>

      <div class="divider"></div>

      <p class="footer-text">
        如非本人操作，请忽略此邮件<br/>
        SSD 开卡工具站 &copy; ${new Date().getFullYear()}
      </p>
    </div>
  </div>
</body>
</html>`;

  return { subject: `SSD开卡工具站 - ${title}`, html };
}