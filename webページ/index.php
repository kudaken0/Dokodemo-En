<?php
// URLパラメータを取得
$param = isset($_GET['config']) ? $_GET['config'] : null;

// 表示する内容を決定
if ($param === 'thank') {
    $displayText = 'ダウンロードありがとうございます！！';
    $hideClass = 'hidden';
} else {
    $displayText = '為替レート変換ツールへようこそ！';
    $hideClass = '';
}
?>

<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>為替レート変換ツール</title>
    <link rel="stylesheet" href="css/style.css?ver=1.0">
    <script src="js/main.js" defer></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
    <!-- OGPの設定 -->
    <meta property="og:type" content="article" />
    <meta property="og:title" content="為替レート変換ツール" />
    <meta property="og:description" content="様々な通貨を日本円に変換します。" />
    <meta property="og:url" content="https://tool.kudaken.com/rate" />
    <meta property="og:site_name" content="kudaken.com" />
    <meta property="og:image" content="https://tool.kudaken.com/rate/img/ogp.png" />
    <!-- Twitterカードの設定 -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@kudaken0" />
    <meta name="twitter:image" content="https://tool.kudaken.com/rate/img/ogp.png">

</head>
<body>
    <div class="hero">
        <h1 class="animated-text"><?php echo htmlspecialchars($displayText, ENT_QUOTES, 'UTF-8'); ?></h1>
        <p class="subtext">リアルタイムで為替レートが更新される変換ツールです！！</p>
        <div class=""><a href="https://github.com/kudaken0/exchange-rate" class="<?php echo $hideClass; ?>"><button class="cta-btn">今すぐ試す(β版) <i class="fas fa-arrow-right"></i></button></a></div>
    </div>

    <section class="features">
        <div class="<?php echo $hideClass; ?>">
        <div class="feature">
            <i class="fas fa-bolt"></i>
            <h2>簡単インストール</h2>
            <p>数クリックであなたのブラウザにインストール可能。</p>
        </div>
        <div class="feature">
            <i class="fas fa-sync"></i>
            <h2>リアルタイム更新</h2>
            <p>常に最新の為替レートに基づき変換します。</p>
        </div>
        </div>
    </section>

    <section class="usage">
        <h2 class="usage-title" style="padding-left: 30px;">使い方</h2>
        <div class="usage-slider">
            <button class="prev-btn">&#8249;</button>
            <div class="slider-wrapper">
                <img src="img/step1.png" alt="ステップ1" class="usage-image">
                <img src="img/step2.png" alt="ステップ2" class="usage-image">
                <img src="img/step3.png" alt="ステップ3" class="usage-image">
            </div>
            <button class="next-btn">&#8250;</button>
        </div>
        <p class="usage-description">画像の説明がここに表示されます。</p>
    </section>
    <footer class="footer">
        <p>© 2024 Kudaken <br>使用API: <a href="https://docs.krnk.org/docs/api/exchange-rate-api" style="color: white;">為替レート API(KuronekoServer様)</a></p>
    </footer>
</body>
</html>
