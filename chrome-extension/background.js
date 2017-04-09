"use strict";

let latestPopupId = null;

chrome.commands.onCommand.addListener(command => {
	if (command === "switch_tab") {
		const createData = {
			type: "popup",
			state: "fullscreen",
			url: chrome.extension.getURL("/popup.html")
		};

		chrome.tabs.query({
			url: chrome.extension.getURL("/popup.html")
		}, tabs => {
			const tabIds = tabs.map(tab => tab.id);
			chrome.tabs.remove(tabIds, () => {
				latestPopupId = null;
				chrome.windows.create(createData, window => {
					latestPopupId = window.id;
				});
			});
		});
	}
});

chrome.windows.onFocusChanged.addListener(windowId => {
	if (windowId !== chrome.windows.WINDOW_ID_NONE
		&& windowId !== latestPopupId
		&& latestPopupId !== null) {
		// 既にwindowが存在しない時にエラーにならないように確認
		chrome.windows.getAll(windows => {
			if (windows.some(window => window.id === latestPopupId)) {
				chrome.windows.remove(latestPopupId, () => {
					latestPopupId = null;
				});
			}
		});
	}
});
