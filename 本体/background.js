chrome.runtime.onInstalled.addListener((details) => {
  // コンテキストメニューの設定
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "convertCurrency",
      title: "どこでも円",
      contexts: ["selection"]
    });
  });



  // インストール時に特定のページを開く
  if (details.reason === "install") {
    chrome.tabs.create({ url: "https://tool.kudaken.com/rate?config=thank" }); // 開きたいページのURLを指定します
  }
});



chrome.contextMenus.onClicked.addListener(() => {
  chrome.action.openPopup();
});
