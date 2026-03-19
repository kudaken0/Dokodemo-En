document.addEventListener('DOMContentLoaded', () => {
  const convertButton = document.getElementById('convert');
  const amountInput = document.getElementById('amount');
  const currencySelect = document.getElementById('currency');
  const conversionOutput = document.getElementById('conversion');
  const roundSwitch = document.getElementById('round-switch');
  const openOptionsButton = document.getElementById('open-options');


  // 設定を読み込んでbodyにクラスを付与する
  function applyTheme() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get(['darkMode'], (result) => {
        if (result.darkMode) {
          document.body.classList.add('dark-mode');
        } else {
          document.body.classList.remove('dark-mode');
        }
      });
    }
  }

  // 初期読み込み時に適用
  applyTheme();

  // 設定が変更されたときにリアルタイムで反映
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'sync' && changes.darkMode) {
        applyTheme();
      }
    });
  }


  // 全角数字を半角数字に変換
  function toHalfWidth(str) {
    return str.replace(/[０-９．，]/g, (char) => {
      if (char === '．') return '.';
      if (char === '，') return ',';
      return String.fromCharCode(char.charCodeAt(0) - 0xfee0);
    });
  }

  // 数字と小数点以外を削除
  function removeNonNumeric(str) {
    return str.replace(/[^0-9.]/g, '');
  }

  // 通貨記号マッピング
  const currencySymbols = {
    "USD_JPY": ["$", "ドル", "USD"],
    "EUR_JPY": ["€", "ユーロ", "EUR"],
    "GBP_JPY": ["£", "ポンド", "GBP"],
    "AUD_JPY": ["A$", "オーストラリアドル", "AUD"],
    "CAD_JPY": ["C$", "カナダドル", "CAD"],
    "CHF_JPY": ["CHF", "スイスフラン", "CHF"],
    "TRY_JPY": ["₺", "トルコリラ", "TRY"],
    "ZAR_JPY": ["ZAR", "南アフリカランド", "ZAR"],
    "MXN_JPY": ["MX$", "メキシコペソ", "MXN"]
  };

  // 小数点切り替えスイッチをデフォルトONに設定
  if (roundSwitch) roundSwitch.checked = true;

  let lastConvertedAmount = null;
  let lastCurrencyPair = null;


  amountInput.addEventListener('input', () => {
    amountInput.value = removeNonNumeric(toHalfWidth(amountInput.value));
  });

  amountInput.addEventListener('focus', () => {
    let value = toHalfWidth(amountInput.value);
    const symbol = currencySymbols[currencySelect.value]?.[0] || '';
    const escapedSymbol = symbol.replace(/[$^.*+?()[\]{}|\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedSymbol}|,|\\s)`, 'g');
    value = value.replace(regex, '');
    amountInput.value = removeNonNumeric(value);
  });

  amountInput.addEventListener('blur', () => {
    const currencyPair = currencySelect.value;
    const value = amountInput.value;
    const numericValue = parseFloat(removeNonNumeric(toHalfWidth(value)));

    if (!isNaN(numericValue)) {
      const formatted = numericValue.toLocaleString();
      const symbol = currencySymbols[currencyPair]?.[0] || '';
      amountInput.value = `${symbol} ${formatted}`;
    } else {
      amountInput.value = '';
    }
  });


  convertButton.addEventListener('click', () => {
    const normalizedInput = removeNonNumeric(toHalfWidth(amountInput.value));
    const amount = parseFloat(normalizedInput);
    const currencyPair = currencySelect.value;

    if (!isNaN(amount)) {
      lastCurrencyPair = currencyPair;
      convertCurrency(amount, currencyPair);
    } else {
      conversionOutput.textContent = "正しい金額を入力してください。";
    }
  });

  if (roundSwitch) {
    roundSwitch.addEventListener('change', () => {
      if (lastConvertedAmount !== null) {
        applyRoundingAndDisplay(lastConvertedAmount);
      }
    });
  }

  // レート取得と計算
  function convertCurrency(amount, currencyPair) {
    fetch(`https://exchange-rate-api.krnk.org/api/rate`)
      .then(response => response.json())
      .then(data => {
        if (data[currencyPair]) {
          const rate = data[currencyPair];
          lastConvertedAmount = amount * rate;
          applyRoundingAndDisplay(lastConvertedAmount);
        } else {
          conversionOutput.textContent = "レート取得に失敗しました。";
        }
      })
      .catch(error => {
        console.error('Fetch error:', error);
        conversionOutput.textContent = "接続エラーが発生しました。";
      });
  }

  function applyRoundingAndDisplay(amount) {
    const shouldRound = roundSwitch ? roundSwitch.checked : true;
    let displayAmount = shouldRound 
      ? Math.floor(amount).toLocaleString() 
      : amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    conversionOutput.textContent = `¥ ${displayAmount}`;
  }


  if (typeof chrome !== 'undefined' && chrome.tabs && chrome.scripting) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0] || !tabs[0].url || tabs[0].url.startsWith('chrome://')) {
        return;
      }

      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          function: () => window.getSelection().toString(),
        },
        (results) => {
          if (chrome.runtime.lastError || !results || !results[0]) return;

          const selectedText = results[0].result || "";
          if (!selectedText.trim()) return;

          const normalizedText = toHalfWidth(selectedText.trim());
          const symbolsList = Object.values(currencySymbols).flat().sort((a, b) => b.length - a.length);
          const symbolsRegexPart = symbolsList.map(s => s.replace(/[$^.*+?()[\]{}|\\]/g, '\\$&')).join('|');
          const regex = new RegExp(`(?:(${symbolsRegexPart})\\s*)?([\\d,\\.]+)(?:\\s*(${symbolsRegexPart}))?`);

          const matches = normalizedText.match(regex);
          if (matches && matches[2]) {
            const currencySymbol = matches[1] || matches[3] || "";
            const amount = parseFloat(removeNonNumeric(matches[2]));
            const currencyPair = Object.keys(currencySymbols).find(key => currencySymbols[key].includes(currencySymbol));

            if (currencyPair && !isNaN(amount)) {
              lastCurrencyPair = currencyPair;
              currencySelect.value = currencyPair; // セレクトボックスも自動で合わせる
              convertCurrency(amount, currencyPair);
            }
          }
        }
      );
    });
  }


  if (openOptionsButton) {
    openOptionsButton.addEventListener('click', () => {
      if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      } else {
        window.open(chrome.runtime.getURL('options.html'));
      }
    });
  }
});