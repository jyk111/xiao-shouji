export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>正在返回小手机</title>
    <style>
      :root { color-scheme: dark; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #101010;
        color: #fffaf0;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      main {
        width: min(92vw, 420px);
        border: 2px solid rgba(255, 250, 240, 0.18);
        border-radius: 24px;
        padding: 28px;
        background: #171717;
        text-align: center;
      }
      h1 { margin: 0 0 12px; font-size: 24px; }
      p { margin: 0 0 18px; color: rgba(255, 250, 240, 0.72); line-height: 1.7; }
      a {
        display: inline-flex;
        justify-content: center;
        width: 100%;
        border-radius: 999px;
        padding: 13px 16px;
        background: #dceecd;
        color: #111;
        font-weight: 900;
        text-decoration: none;
      }
      small { display: block; margin-top: 14px; color: rgba(255, 250, 240, 0.5); line-height: 1.6; }
    </style>
  </head>
  <body>
    <main>
      <h1>正在返回小手机</h1>
      <p>Discord 已经完成授权。如果没有自动跳回 App，请点击下面的按钮。</p>
      <a id="open-small-phone" href="smallphone://discord-callback">打开小手机</a>
      <small>这个页面只负责把 Discord 返回结果交回小手机，不保存登录信息。</small>
    </main>
    <script>
      (function () {
        var target = 'smallphone://discord-callback' + window.location.search + window.location.hash;
        var link = document.getElementById('open-small-phone');
        link.href = target;
        window.setTimeout(function () {
          window.location.href = target;
        }, 350);
      })();
    </script>
  </body>
</html>`);
}
