document.addEventListener('DOMContentLoaded', () => {
  const convertButton = document.getElementById('convert');
  const amountInput = document.getElementById('amount');
  const currencySelect = document.getElementById('currency');
  const conversionOutput = document.getElementById('conversion');
  const roundSwitch = document.getElementById('roundSwitch');

  // 全角数字を半角数字に変換する関数
  function toHalfWidth(str) {
    return str.replace(/[０-９．，]/g, (char) => {
      if (char === '．') return '.';
      if (char === '，') return ',';
      return String.fromCharCode(char.charCodeAt(0) - 0xfee0);
    });
  }

  // 数字以外の文字を削除する関数
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

  let lastConvertedAmount = null;

  // 入力欄の変更時に自動で全角を半角に変換し、数字以外を削除
  amountInput.addEventListener('input', () => {
    amountInput.value = removeNonNumeric(toHalfWidth(amountInput.value));
  });

  // 手動入力された金額を変換する処理
  convertButton.addEventListener('click', () => {
    const normalizedInput = removeNonNumeric(toHalfWidth(amountInput.value));
    const amount = parseFloat(normalizedInput);
    const currencyPair = currencySelect.value;

    if (!isNaN(amount)) {
      convertCurrency(amount, currencyPair);
    } else {
      conversionOutput.textContent = "正しい金額を入力してください。";
    }
  });

  // 選択テキストを取得して変換する処理
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

        const matches = normalizedText.match(/([¥$€£₺A$C$CHFZARMX$ドルユーロポンドオーストラリアドルカナダドルスイスフラントルコリラ南アフリカランドメキシコペソ]+)?\s?([\d,\.]+)\s?([¥$€£₺A$C$CHFZARMX$ドルユーロポンドオーストラリアドルカナダドルスイスフラントルコリラ南アフリカランドメキシコペソ]+)?/);

        if (matches) {
          const currencySymbol = matches[1] || matches[3] || "";
          const amount = parseFloat(removeNonNumeric(matches[2]));

          if (!isNaN(amount)) {
            const currencyPair = Object.keys(currencySymbols).find(key =>
              currencySymbols[key].includes(currencySymbol)
            );

            if (currencyPair) {
              convertCurrency(amount, currencyPair);
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
    let finalAmount = amount;

    // 小数点切り捨てが有効ならMath.floorで切り捨て
    if (roundSwitch.checked) {
      finalAmount = Math.floor(amount);
    }

    // 金額をフォーマットして表示
    conversionOutput.textContent = `¥${finalAmount.toLocaleString()}`;
  }

  // 小数点切り捨てスイッチの変更時に即時反映
  roundSwitch.addEventListener('change', () => {
    if (lastConvertedAmount !== null) {
      applyRoundingAndDisplay(lastConvertedAmount);
    }
  });
});

// 選択テキストを取得する関数（ブラウザ上で実行）
function getSelectedText() {
  return window.getSelection().toString();
}
