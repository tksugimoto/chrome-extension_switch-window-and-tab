"use strict";

var TAB_INDEX = 1;
var tabList = [];

function setupCheckBox(id) {
	let elem = document.getElementById(id);
	elem.checked = localStorage[id] === "true";
	elem.addEventListener("change", evt => {
		localStorage[id] = evt.checked;
	});
	return elem;
}

var displayScreenshot = setupCheckBox("display-screenshot");
var popupWindowFirst = setupCheckBox("popup-window-first");

chrome.windows.getAll({
	// tab情報を含める
	populate: true,
	windowTypes: [
		"popup",
		"normal"
	]
}, windows => {
	var selfUrl = location.href;
	var targetWindows = windows.filter(window => {
		var isThisWindow = window.tabs.length === 1 && window.tabs[0].url === selfUrl;
		return !isThisWindow;
	});
	if (popupWindowFirst.checked) {
		targetWindows.sort((win1, win2) => {
			if (win1.type === win2.type) {
				return win1.id - win2.id;
			}
			if (win1.type === "popup") return -1;
			if (win2.type === "popup") return 1;
			return 0;

		});
	}
	let draggingData = null;
	targetWindows.forEach((window, index) => {
		var container = document.getElementById("container");
		var div = document.createElement("div");

		var activeTab = window.tabs.find(tab => tab.active);
		var a = document.createElement("a");
		a.innerText = index + "\n" + activeTab.title;
		a.href = activeTab.url;
		a.tabIndex = TAB_INDEX;
		a.className = "window-link"
		a.onclick = () => {
			chrome.windows.update(window.id, {
				focused: true
			});
			return false;
		};
		div.appendChild(a);
		container.appendChild(div);

		var ul = document.createElement("ul");
		div.addEventListener("drop", evt => {
			if (draggingData !== null) {
				const target = draggingData.elem;
				const oldParent = target.parentNode;
				if (oldParent === ul) {
					// 同じWindow内の移動はしない
					return;
				}
				ul.appendChild(target);
				chrome.tabs.move(draggingData.tabId, {
					windowId: window.id,
					index: -1
				});
				if (oldParent.children.length === 0) {
					// Window内のタブが無くなってWindowが閉じた
					const div = oldParent.parentNode;
					div.parentNode.removeChild(div);
				}
			}
		});
		div.addEventListener("dragover", evt => {
			evt.preventDefault();
		});
		window.tabs.forEach(tab => {
			var li = document.createElement("li");
			var tabLink = document.createElement("tab-link");
			tabLink.setTab(tab);
			if (tab.active) {
				// TODO: 見やすい目立たせ方にする
				tabLink.style.backgroundColor = "white";
			}
			li.addEventListener("dragstart", evt => {
				draggingData = {
					elem: li,
					tabId: tab.id
				};
				evt.dataTransfer.setData("tabId", tab.id);
			});
			li.addEventListener("dragend", evt => {
				draggingData = null;
			});
			li.appendChild(tabLink);
			ul.appendChild(li);
			tabList.push({
				elem: li,
				url: tab.url,
				title: tab.title
			});
		});
		div.appendChild(ul);

		console.log(window)

		// SS撮影の処理が重い
		displayScreenshot.checked && setTimeout(() => {
			chrome.tabs.captureVisibleTab(window.id, {
				format: "jpeg",
				quality: 50
			}, dataUrl => {
				if (typeof dataUrl === "undefined") {
					var p = document.createElement("p");
					p.innerText = "最小化されているためSS撮影不可"
					a.appendChild(p);
				} else {
					var img = document.createElement("img");
					img.src = dataUrl;
					img.style.width = "95%";
					//img.style.border = "2px double black";
					a.appendChild(img);
				}
			});
		}, 300);
	});

	document.body.addEventListener("keydown", evt => {
		if (evt.target !== searchWordInput && /^\d+$/.test(evt.key)) {
			chrome.windows.update(targetWindows[evt.key].id, {
				focused: true
			});
		} else if (evt.key === " " && evt.target.tagName === "A") {
			evt.target.click();
		} else if (evt.key === " " && evt.target.tagName === "TAB-LINK") {
			evt.target.click();
		}
	});
});

var container_bookmarks = document.getElementById("container_bookmarks");
var ul_bookmarks = document.getElementById("search-result_bookmarks");

var searchWordInput = document.getElementById("search-word");
searchWordInput.focus();
searchWordInput.tabIndex = TAB_INDEX;
searchWordInput.addEventListener("keyup", evt => {
	var value = searchWordInput.value.toLowerCase();
	modeChange(value ? "tab-search" : "window-list");

	tabList.forEach(tab => {
		var targetText = (tab.url + tab.title).toLowerCase();
		var isMatched = targetText.includes(value);
		tab.elem.style.display = isMatched ? "" : "none";
	});

	if (value) {
		chrome.bookmarks.search(value, bookmarks => {
			ul_bookmarks.innerText = "";
			if (bookmarks.length > 0) {
				container_bookmarks.style.display = "";
				bookmarks.forEach(bookmark => {
					var isLink = !!bookmark.url;
					if (isLink) {
						var li = document.createElement("li");
						var a = document.createElement("a");
						a.innerText = bookmark.title || bookmark.url;
						a.href = bookmark.url;
						a.addEventListener("click", function (evt) {
							evt.preventDefault();
							chrome.tabs.create({
								url: this.href
							}, tab=> {
								chrome.windows.update(tab.windowId, {
									focused: true
								});
							});
						});
						li.appendChild(a);
						ul_bookmarks.appendChild(li);
					}
				});
			}
		});
	} else {
		container_bookmarks.style.display = "none";
	}
});
searchWordInput.addEventListener("keydown", evt => {
	// Escが押されたら入力欄を空にする
	//   ※keyupだと日本語入力で未確定状態からEscでも反応してしまう
	if (evt.keyCode === 27) {
		searchWordInput.value = "";
	}
});

function modeChange(modeName) {
	document.body.setAttribute("data-mode", modeName);
}

document.querySelectorAll(".mode-tab").forEach(elem => {
	elem.addEventListener("click", () => {
		modeChange(elem.id);
	});
});
document.getElementById("tab-search").addEventListener("click", () => {
	searchWordInput.focus();
});
