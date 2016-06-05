"use strict";

var latestPopupId = null;

chrome.commands.onCommand.addListener(command => {
	if (command === "switch_tab") {
		chrome.windows.getCurrent(function (wInfo){
			var createData = {
				width: 1200,
				height: 800,
				type: "popup",
				url: chrome.extension.getURL("/popup.html")
			};
			// 今のウィンドウの中央に表示
			createData.left = wInfo.left + ((wInfo.width - createData.width) / 2 | 0);
			createData.top = wInfo.top + ((wInfo.height - createData.height) / 2 | 0);

			chrome.tabs.query({
				url: chrome.extension.getURL("/popup.html")
			}, tabs => {
				var tabIds = tabs.map(tab => tab.id);
				chrome.tabs.remove(tabIds, () => {
					latestPopupId = null;
					chrome.windows.create(createData, window => {
						latestPopupId = window.id;
					});
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
