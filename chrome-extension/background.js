'use strict';

let latestPopupId = null;

chrome.commands.onCommand.addListener(command => {
	if (command === 'switch_tab') {
		createSwitchTabPopupWindow();
	}
});

const createSwitchTabPopupWindow = () => {
	const popupUrl = chrome.extension.getURL('/popup.html');

	const createData = {
		type: 'popup',
		state: 'fullscreen',
		url: popupUrl,
	};

	chrome.tabs.query({
		url: popupUrl,
	}, tabs => {
		const tabIds = tabs.map(tab => tab.id);
		chrome.tabs.remove(tabIds, () => {
			latestPopupId = null;
			chrome.windows.create(createData, window => {
				latestPopupId = window.id;
			});
		});
	});
};

chrome.windows.onFocusChanged.addListener(windowId => {
	if (windowId === chrome.windows.WINDOW_ID_NONE) return;
	if (windowId === latestPopupId) return;
	if (latestPopupId === null) return;

	// 既にwindowが存在しない時にエラーにならないように確認
	chrome.windows.getAll(windows => {
		if (windows.some(window => window.id === latestPopupId)) {
			chrome.windows.remove(latestPopupId, () => {
				latestPopupId = null;
			});
		}
	});
});
