chrome.runtime.onInstalled.addListener((details) => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "convertCurrency",
      title: "どこでも円",
      contexts: ["selection"]
    });
  });




  if (details.reason === "install") {
    chrome.tabs.create({ url: "https://dokodemo-en.kudaken.com/?config=thank" });
  }
});



chrome.contextMenus.onClicked.addListener(() => {
  chrome.action.openPopup();
});
