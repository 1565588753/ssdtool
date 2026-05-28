export function verificationCodeEmail(code: string, type: 'register' | 'reset_password'): { subject: string; html: string } {
  const titles: Record<string, string> = {
    register: '注册验证码',
    reset_password: '重置密码验证码'
  };

  const title = titles[type] || '验证码';

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      max-width: 520px;
      width: 100%;
      background: rgba(255,255,255,0.05);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 24px;
      padding: 48px 40px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .container::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle at 30% 20%, rgba(99,102,241,0.08) 0%, transparent 50%),
                  radial-gradient(circle at 70% 80%, rgba(139,92,246,0.06) 0%, transparent 50%);
      animation: bgShift 8s ease-in-out infinite alternate;
      pointer-events: none;
    }
    @keyframes bgShift {
      0% { transform: translate(0, 0) rotate(0deg); }
      100% { transform: translate(-2%, -2%) rotate(3deg); }
    }
    .icon {
      width: 72px;
      height: 72px;
      margin: 0 auto 24px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 1;
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(99,102,241,0.4); }
      50% { transform: scale(1.05); box-shadow: 0 0 24px 4px rgba(99,102,241,0.3); }
    }
    .icon svg {
      width: 36px;
      height: 36px;
    }
    h1 {
      color: #ffffff;
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 8px;
      position: relative;
      z-index: 1;
    }
    p {
      color: rgba(255,255,255,0.6);
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 32px;
      position: relative;
      z-index: 1;
    }
    .code-wrapper {
      display: inline-flex;
      gap: 12px;
      padding: 20px 32px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 16px;
      margin-bottom: 32px;
      position: relative;
      z-index: 1;
      animation: codeFadeIn 0.6s ease-out;
    }
    @keyframes codeFadeIn {
      0% { opacity: 0; transform: translateY(10px) scale(0.95); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    .code-digit {
      display: inline-block;
      font-size: 36px;
      font-weight: 800;
      letter-spacing: 4px;
      color: #ffffff;
      text-shadow: 0 0 20px rgba(99,102,241,0.3);
    }
    .hint {
      color: rgba(255,255,255,0.4);
      font-size: 12px;
      margin-bottom: 0;
    }
    .footer {
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px solid rgba(255,255,255,0.06);
      position: relative;
      z-index: 1;
    }
    .footer p {
      font-size: 12px;
      color: rgba(255,255,255,0.3);
      margin-bottom: 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    </div>
    <h1>${title}</h1>
    <p>请使用以下验证码完成操作，验证码有效期为 <strong style="color:rgba(255,255,255,0.8)">30 分钟</strong>。</p>
    <div class="code-wrapper">
      <span class="code-digit">${code}</span>
    </div>
    <p class="hint">如非本人操作，请忽略此邮件。</p>
    <div class="footer">
      <p>SSD 开卡工具站 &copy; ${new Date().getFullYear()}</p>
    </div>
  </div>
</body>
</html>`;

  return { subject: `SSD开卡工具站 - ${title}`, html };
}