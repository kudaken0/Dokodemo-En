document.addEventListener('DOMContentLoaded', () => {
  const ui = {
    darkMode: document.getElementById('dark-mode-switch'),
    autoPopup: document.getElementById('auto-popup-switch'),
    subSettings: document.getElementById('popup-sub-settings'),
    opacity: document.getElementById('opacity-range'),
    altKey: document.getElementById('alt-key-switch'),
    excludeList: document.getElementById('exclude-list'),
    saveBtn: document.getElementById('save'),
    statusMsg: document.getElementById('status')
  };

  function updateSubSettingsState(enabled) {
    if (!ui.subSettings) return;
    
    if (enabled) {
      ui.subSettings.classList.remove('disabled-fade');
      ui.altKey.disabled = false;
      ui.opacity.disabled = false;
    } else {
      ui.subSettings.classList.add('disabled-fade');
      ui.altKey.disabled = true;
      ui.opacity.disabled = true;
    }
  }

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get({
      darkMode: false,
      en_autoPopupEnabled: true,
      opacity: 1.0,
      altKey: false,
      excludeList: ""
    }, (result) => {
      if (ui.darkMode) ui.darkMode.checked = result.darkMode;
      if (ui.autoPopup) {
        ui.autoPopup.checked = result.en_autoPopupEnabled;
        updateSubSettingsState(result.en_autoPopupEnabled); // 初期状態を反映
      }
      if (ui.opacity) ui.opacity.value = result.opacity;
      if (ui.altKey) ui.altKey.checked = result.altKey;
      if (ui.excludeList) ui.excludeList.value = result.excludeList;
      
      if (result.darkMode) document.body.classList.add('dark-mode');
    });
  }

  ui.autoPopup?.addEventListener('change', (e) => {
    updateSubSettingsState(e.target.checked);
  });


  ui.saveBtn?.addEventListener('click', () => {
    const settings = {
      darkMode: ui.darkMode.checked,
      en_autoPopupEnabled: ui.autoPopup.checked,
      opacity: parseFloat(ui.opacity.value),
      altKey: ui.altKey.checked,
      excludeList: ui.excludeList.value
    };

    chrome.storage.sync.set(settings, () => {
      if (ui.statusMsg) {
        ui.statusMsg.textContent = '設定を保存しました！';
        ui.statusMsg.style.display = 'block';
      }
      document.body.classList.toggle('dark-mode', settings.darkMode);
      setTimeout(() => {
        if (ui.statusMsg) ui.statusMsg.style.display = 'none';
      }, 2000);
    });
  });
});