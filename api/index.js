const express = require('express');
const ytdl = require('ytdl-core');
const app = express();

// --- サーバー側の処理 ---
app.get('/api/video', async (req, res) => {
    const videoId = req.query.v;
    if (!videoId) return res.status(400).send("IDが必要です");
    try {
        const info = await ytdl.getInfo(videoId);
        const format = ytdl.chooseFormat(info.formats, { quality: 'highest', filter: 'audioandvideo' });
        res.json({
            url: format.url,
            title: info.videoDetails.title,
            author: info.videoDetails.author.name,
            views: parseInt(info.videoDetails.viewCount).toLocaleString(),
            description: info.videoDetails.description.slice(0, 300) + "..."
        });
    } catch (err) {
        res.status(500).json({ error: "動画を取得できませんでした" });
    }
});

// --- 見た目（HTML/CSS） ---
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>akkunn.tube</title>
    <style>
        :root { --yt-red: #ff0000; --yt-bg: #0f0f0f; --yt-text: #ffffff; --yt-gray: #3f3f3f; }
        body { background: var(--yt-bg); color: var(--yt-text); font-family: Roboto, Arial, sans-serif; margin: 0; }
        header { background: var(--yt-bg); height: 56px; display: flex; align-items: center; padding: 0 16px; position: sticky; top:0; z-index: 100; border-bottom: 1px solid #333; }
        .logo { color: white; text-decoration: none; font-size: 20px; font-weight: bold; display: flex; align-items: center; }
        .logo span { color: var(--yt-red); font-size: 28px; margin-right: 4px; }
        .search-area { flex: 1; display: flex; justify-content: center; }
        .search-box { display: flex; width: 100%; max-width: 500px; background: #121212; border: 1px solid var(--yt-gray); border-radius: 40px; overflow: hidden; }
        .search-box input { flex: 1; background: transparent; border: none; color: white; padding: 10px 20px; outline: none; }
        .search-box button { background: #222; border: none; border-left: 1px solid var(--yt-gray); color: white; padding: 0 20px; cursor: pointer; }
        .content { max-width: 1200px; margin: 20px auto; padding: 0 20px; }
        video { width: 100%; border-radius: 12px; background: #000; aspect-ratio: 16/9; }
        .info-card h1 { font-size: 20px; margin: 15px 0 8px; }
        .meta { color: #aaa; font-size: 14px; margin-bottom: 15px; }
        .desc { background: #272727; padding: 15px; border-radius: 12px; font-size: 14px; white-space: pre-wrap; }
    </style>
</head>
<body>
    <header>
        <a href="/" class="logo"><span>▶</span> akkunn.tube</a>
        <div class="search-area">
            <div class="search-box">
                <input type="text" id="vID" placeholder="YouTube動画IDを入力">
                <button onclick="play()">🔍</button>
            </div>
        </div>
    </header>
    <div class="content">
        <div id="player-view">
            <div style="text-align:center; padding-top:100px; color:#aaa;">
                <h2>自分専用の akkunn.tube へようこそ</h2>
                <p>動画IDを入力して再生ボタンを押してください</p>
            </div>
        </div>
    </div>
    <script>
        async function play() {
            const id = document.getElementById('vID').value;
            if(!id) return;
            const view = document.getElementById('player-view');
            view.innerHTML = '<p>読み込み中...</p>';
            try {
                const res = await fetch('/api/video?v=' + id);
                const data = await res.json();
                view.innerHTML = \`
                    <video src="\${data.url}" controls autoplay></video>
                    <div class="info-card">
                        <h1>\${data.title}</h1>
                        <div class="meta">\${data.author} • 視聴回数 \${data.views}回</div>
                        <div class="desc">\${data.description}</div>
                    </div>
                \`;
            } catch (e) {
                view.innerHTML = '<p>エラーが発生しました。別のIDを試してください。</p>';
            }
        }
    </script>
</body>
</html>
    `);
});

module.exports = app;
