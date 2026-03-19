const currencySymbols = {
  "USD_JPY": ["$", "ドル", "USD"], "EUR_JPY": ["€", "ユーロ", "EUR"],
  "GBP_JPY": ["£", "ポンド", "GBP"], "AUD_JPY": ["A$", "オーストラリアドル", "AUD"],
  "CAD_JPY": ["C$", "カナダドル", "CAD"], "CHF_JPY": ["CHF", "スイスフラン", "CHF"],
  "TRY_JPY": ["₺", "トルコリラ", "TRY"], "ZAR_JPY": ["ZAR", "南アフリカランド", "ZAR"],
  "MXN_JPY": ["MX$", "メキシコペソ", "MXN"]
};

// ポップアップ要素の作成
const tooltip = document.createElement('div');
tooltip.id = 'dokodemo-en-tooltip';
document.body.appendChild(tooltip);

function applyTheme() {
  try {
    const storage = chrome?.storage?.sync;
    if (storage) {
      storage.get(['darkMode', 'opacity'], (result) => {
        const isDark = result.darkMode || false;
        tooltip.style.backgroundColor = isDark ? '#2d2d2d' : '#ffffff';
        tooltip.style.color = isDark ? '#ffffff' : '#333333';
        tooltip.style.borderColor = isDark ? '#444' : '#ccc';
        tooltip.style.opacity = result.opacity || 1.0;
        tooltip.style.boxShadow = isDark ? '0 4px 15px rgba(0,0,0,0.5)' : '0 2px 10px rgba(0,0,0,0.2)';
      });
    }
  } catch (e) {}
}

document.addEventListener('mouseup', (event) => {
  // ツールチップ自体をクリックした場合は無視
  if (event.target.id === 'dokodemo-en-tooltip') return;
  
  // 選択範囲の取得
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  const currentDomain = window.location.hostname;


  if (!selectedText || selectedText.length < 1) {
    tooltip.style.display = 'none';
    return;
  }

  try {
    const storage = chrome?.storage?.sync;
    if (storage && chrome.runtime?.id) {
      storage.get({
        en_autoPopupEnabled: true,
        altKey: false,
        excludeList: ""
      }, (result) => {
        // 除外サイト判定
        const excludes = (result.excludeList || "").split('\n').map(d => d.trim()).filter(d => d !== "");
        if (excludes.some(domain => currentDomain.includes(domain))) {
          tooltip.style.display = 'none';
          return;
        }
        
        // 自動表示設定またはAltキー条件のチェック
        if (!result.en_autoPopupEnabled || (result.altKey && !event.altKey)) {
          tooltip.style.display = 'none';
          return;
        }

        applyTheme();
        processSelection(selectedText, event.pageX, event.pageY);
      });
    }
  } catch (e) {
    tooltip.style.display = 'none';
  }
});


document.addEventListener('mousedown', (event) => {
  if (event.target.id !== 'dokodemo-en-tooltip') {
    const selection = window.getSelection();
    if (selection.toString().trim().length === 0) {
      tooltip.style.display = 'none';
    }
  }
});

function processSelection(text, x, y) {
  const symbolsList = Object.values(currencySymbols).flat().sort((a, b) => b.length - a.length);
  const symbolsRegexPart = symbolsList.map(s => s.replace(/[$^.*+?()[\]{}|\\]/g, '\\$&')).join('|');
  const regex = new RegExp(`(?:(${symbolsRegexPart})\\s*)?([\\d,\\.]+)(?:\\s*(${symbolsRegexPart}))?`);
  
  const matches = text.match(regex);
  if (matches && matches[2]) {
    const symbol = matches[1] || matches[3] || "";
    const amountStr = matches[2].replace(/,/g, '');
    const amount = parseFloat(amountStr);
    const pair = Object.keys(currencySymbols).find(k => currencySymbols[k].includes(symbol));
    
    if (pair && !isNaN(amount)) {
      fetchRateAndDisplay(amount, symbol, pair, x, y);
    } else {
      tooltip.style.display = 'none';
    }
  } else {
    tooltip.style.display = 'none';
  }
}

function fetchRateAndDisplay(amount, symbol, currencyPair, x, y) {
  fetch(`https://exchange-rate-api.krnk.org/api/rate`)
    .then(res => res.json()).then(data => {
      if (data[currencyPair]) {
        const rate = data[currencyPair];
        const converted = Math.floor(amount * rate);

        tooltip.innerHTML = `
          <div style="font-size:12px;opacity:0.8;border-bottom:1px solid rgba(128,128,128,0.3);padding-bottom:4px;margin-bottom:4px;">
            ${symbol}${amount.toLocaleString()}
          </div>
          <div style="font-weight:bold;color:#3794ff;font-size:17px;white-space:nowrap;">
            ¥ ${converted.toLocaleString()}
          </div>
        `;
        
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y + 15}px`;
        tooltip.style.display = 'block';
      }
    }).catch(() => {
      tooltip.style.display = 'none';
    });
}