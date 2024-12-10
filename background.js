chrome.runtime.onInstalled.addListener((details) => {
  // コンテキストメニューの設定
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "convertCurrency",
      title: "選択した金額を日本円に変換",
      contexts: ["selection"]
    });
  });



  // インストール時に特定のページを開く
  if (details.reason === "install") {
    chrome.tabs.create({ url: "https://tool.kudaken.com/rate" }); // 開きたいページのURLを指定します
  }
});



chrome.contextMenus.onClicked.addListener(() => {
  chrome.action.openPopup();
});
