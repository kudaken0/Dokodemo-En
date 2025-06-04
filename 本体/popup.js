document.addEventListener('DOMContentLoaded', () => {
  const convertButton = document.getElementById('convert');
  const amountInput = document.getElementById('amount');
  const currencySelect = document.getElementById('currency');
  const conversionOutput = document.getElementById('conversion');
  const roundSwitch = document.getElementById('round-switch');

  // 全角数字を半角数字に変換する関数
  function toHalfWidth(str) {
    return str.replace(/[０-９．，]/g, (char) => {
      if (char === '．') return '.';
      if (char === '，') return ',';
      return String.fromCharCode(char.charCodeAt(0) - 0xfee0);
    });
  }

  // 数字以外の文字を削除する関数（数字と小数点のみ残す）
  function removeNonNumeric(str) {
    return str.replace(/[^0-9.]/g, '');
  }

  // 通貨記号をマッピング
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
  roundSwitch.checked = true;

  // 最後に変換した値と通貨ペアを保持
  let lastConvertedAmount = null;
  let lastCurrencyPair = null;

  // 入力欄の変更時に全角→半角、数字以外を削除
  amountInput.addEventListener('input', () => {
    amountInput.value = removeNonNumeric(toHalfWidth(amountInput.value));
  });

  // 入力欄フォーカス時：通貨記号・カンマ・半角スペースを削除し数字のみ残す
  amountInput.addEventListener('focus', () => {
    let value = toHalfWidth(amountInput.value);

    const symbol = currencySymbols[currencySelect.value]?.[0] || '';
    const escapedSymbol = symbol.replace(/[$^.*+?()[\]{}|\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedSymbol}|,|\\s)`, 'g');
    value = value.replace(regex, '');

    amountInput.value = removeNonNumeric(value);
  });

  // 入力欄フォーカス解除時：数字をカンマ区切りにし「通貨記号 + 半角スペース + 数字」で表示
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

  // 通貨変換ボタンクリック時の処理
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

  // 小数点切り替えスイッチの変更時に即時変換結果更新
  roundSwitch.addEventListener('change', () => {
    if (lastConvertedAmount !== null) {
      applyRoundingAndDisplay(lastConvertedAmount);
    }
  });

  // 選択テキストを取得して変換する処理（Chrome拡張用）
  if (typeof chrome !== 'undefined' && chrome.tabs && chrome.scripting) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          function: getSelectedText,
        },
        (results) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            conversionOutput.textContent = "選択されたテキストの取得に失敗しました。";
            return;
          }

          const selectedText = results[0]?.result || "";
          const normalizedText = toHalfWidth(selectedText.trim());

          // symbolsRegexPartを各通貨の全要素で作成（長い順で優先）
          const symbolsList = Object.values(currencySymbols).flat();
          symbolsList.sort((a, b) => b.length - a.length); // 長い順
          const symbolsRegexPart = symbolsList
            .map(s => s.replace(/[$^.*+?()[\]{}|\\]/g, '\\$&'))
            .join('|');

          // 前後どちらかに記号やカタカナがあってもOKな正規表現
          const regex = new RegExp(`(?:(${symbolsRegexPart})\\s*)?([\\d,\\.]+)(?:\\s*(${symbolsRegexPart}))?`);

          const matches = normalizedText.match(regex);

          if (matches && matches[2]) {
            // カタカナや英字も含めて判定
            const currencySymbol = matches[1] || matches[3] || "";
            const amount = parseFloat(removeNonNumeric(matches[2]));

            if (!isNaN(amount)) {
              // currencySymbolsの全要素から一致するものを探す
              const currencyPair = Object.keys(currencySymbols).find(key =>
                currencySymbols[key].includes(currencySymbol)
              );

              if (currencyPair) {
                lastCurrencyPair = currencyPair;
                convertCurrency(amount, currencyPair);
              } else if (currencySymbol === "") {
                conversionOutput.textContent = "通貨記号が見つかりません。";
              } else {
                conversionOutput.textContent = "正しい通貨記号が選択されていません。";
              }
            } else {
              conversionOutput.textContent = "正しい金額を選択してください。";
            }
          } else {
            conversionOutput.textContent = "正しい金額を選択してください。";
          }
        }
      );
    });
  }

  // 通貨変換処理
  function convertCurrency(amount, currencyPair) {
    const url = `https://exchange-rate-api.krnk.org/api/rate`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data[currencyPair]) {
          const rate = data[currencyPair];
          const convertedAmount = amount * rate;
          lastConvertedAmount = convertedAmount;
          applyRoundingAndDisplay(convertedAmount);
        } else {
          conversionOutput.textContent = "為替レートの取得に失敗しました。";
        }
      })
      .catch(error => {
        console.error('為替レートの取得に失敗しました:', error);
        conversionOutput.textContent = "為替レートの取得に失敗しました。";
      });
  }

  // 小数点切り捨ての処理と表示
  function applyRoundingAndDisplay(amount) {
    const shouldRound = roundSwitch.checked;

    let displayAmount;
    if (shouldRound) {
      displayAmount = Math.floor(amount).toLocaleString();
    } else {
      displayAmount = amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    conversionOutput.textContent = `¥ ${displayAmount}`;
  }

  // 選択テキストを取得する関数（Chrome拡張API用）
  function getSelectedText() {
    return window.getSelection().toString();
  }
});
