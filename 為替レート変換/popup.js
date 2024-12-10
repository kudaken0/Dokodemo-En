document.addEventListener('DOMContentLoaded', () => {
  const convertButton = document.getElementById('convert');
  const amountInput = document.getElementById('amount');
  const currencySelect = document.getElementById('currency');
  const conversionOutput = document.getElementById('conversion');
  const roundSwitch = document.getElementById('roundSwitch');

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

  let currentSymbol = currencySymbols[currencySelect.value][0];
  let lastConvertedAmount = null; // 最後に変換された金額を保持

  updateAmountInputSymbol();

  // 通貨選択が変更されたら、通貨記号を更新
  currencySelect.addEventListener('change', () => {
    currentSymbol = currencySymbols[currencySelect.value][0];
    updateAmountInputSymbol();
  });

  // 入力時に通貨記号を一時的に削除
  amountInput.addEventListener('focus', () => {
    amountInput.value = amountInput.value.replace(currentSymbol, '').trim();
  });

  // フォーカスが外れたら通貨記号を再度追加
  amountInput.addEventListener('blur', updateAmountInputSymbol);

  function updateAmountInputSymbol() {
    let value = amountInput.value.replace(/[^0-9.,]/g, '').trim();
    if (value) {
      amountInput.value = `${currentSymbol} ${value}`; // 通貨記号を前に表示
    }
  }

  // 手動入力された金額を変換する処理
  convertButton.addEventListener('click', () => {
    convertAndDisplayCurrency();
  });

  // 小数点切り捨てのスイッチが変わったときに即時に反映
  roundSwitch.addEventListener('change', () => {
    if (lastConvertedAmount !== null) {
      applyRoundingAndDisplay(lastConvertedAmount);
    }
  });

  function convertAndDisplayCurrency() {
    let amount = parseFloat(amountInput.value.replace(/[^0-9.]/g, '').trim());
    let currencyPair = currencySelect.value;

    if (!isNaN(amount)) {
      convertCurrency(amount, currencyPair);
    } else {
      conversionOutput.textContent = "正しい金額を入力してください。";
    }
  }

  function convertCurrency(amount, currencyPair) {
    const url = `https://exchange-rate-api.krnk.org/api/rate`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data[currencyPair]) {
          let rate = data[currencyPair];
          let convertedAmount = amount * rate;
          lastConvertedAmount = convertedAmount; // 変換結果を保存
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

  function applyRoundingAndDisplay(amount) {
    let finalAmount = amount;
    if (roundSwitch.checked) {
      finalAmount = Math.floor(amount); // 小数点を切り捨て
    }
    conversionOutput.textContent = `¥${finalAmount.toLocaleString()}`;
  }

  // 選択テキストの取得と変換処理
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        function: getSelectedText,
      },
      (selection) => {
        let selectedText = selection[0].result.trim();
        selectedText = selectedText.replace(/\s/g, ''); // 空白を削除
        let matches = selectedText.match(/([¥$€£₺A$C$CHFZARMX$ドルユーロポンドオーストラリアドルカナダドルスイスフラントルコリラ南アフリカランドメキシコペソ]+)?\s?([\d,\.]+)\s?([¥$€£₺A$C$CHFZARMX$ドルユーロポンドオーストラリアドルカナダドルスイスフラントルコリラ南アフリカランドメキシコペソ]+)?/);

        if (matches) {
          let currencySymbol = matches[1] || matches[3] || "";
          let amount = parseFloat(matches[2].replace(/,/g, ''));

          if (!isNaN(amount)) {
            let currencyPair = Object.keys(currencySymbols).find(key => currencySymbols[key].includes(currencySymbol));
            if (currencyPair) {
              convertCurrency(amount, currencyPair);
            } else {
              conversionOutput.textContent = "正しい金額と通貨記号が選択されていません。";
            }
          } else {
            conversionOutput.textContent = "正しい金額と通貨記号が選択されていません。";
          }
        } else {
          conversionOutput.textContent = "正しい金額と通貨記号が選択されていません。";
        }
      }
    );
  });
});

function getSelectedText() {
  return window.getSelection().toString();
}
