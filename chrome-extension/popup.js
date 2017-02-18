"use strict";

const TAB_INDEX = 1;
const tabList = [];

function setupCheckBox(id) {
	const elem = document.getElementById(id);
	elem.checked = localStorage[id] === "true";
	elem.addEventListener("change", evt => {
		localStorage[id] = evt.checked;
	});
	return elem;
}

const displayScreenshot = setupCheckBox("display-screenshot");
const popupWindowFirst = setupCheckBox("popup-window-first");
let allow_only_half_width_char = (elem => {
	elem.addEventListener("change", evt => {
		allow_only_half_width_char = evt.checked;
	});
	return elem.checked;
})(setupCheckBox("allow-only-half-width-char"));

chrome.windows.getAll({
	// tab情報を含める
	populate: true,
	windowTypes: [
		"popup",
		"normal"
	]
}, windows => {
	const chromeWindows = windows.map(ChromeWindow.convert);
	const selfUrl = location.href;
	const targetWindows = chromeWindows.filter(chromeWindow => {
		const isThisWindow = chromeWindow.tabs.length === 1 && chromeWindow.tabs[0].url === selfUrl;
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
	targetWindows.forEach((chromeWindow, index) => {
		chromeWindow.tabs.forEach(tab => {
			tab.window = chromeWindow;

			delete tab.windowId;
			Object.defineProperty(tab, "windowId", {
				get: function() { return this.window.id; }
			});
		});
		const container = document.getElementById("container");
		const div = document.createElement("div");
		div.classList.add("chrome-window");
		if (chromeWindow.incognito) {
			div.classList.add("incognito");
		}

		const activeTab = chromeWindow.tabs.find(tab => tab.active);
		const a = document.createElement("a");
		a.innerText = index + "\n" + activeTab.title;
		a.href = activeTab.url;
		a.tabIndex = TAB_INDEX;
		a.className = "window-link";
		a.onclick = () => {
			chrome.windows.update(chromeWindow.id, {
				focused: true
			});
			return false;
		};
		a.addEventListener("dragstart", evt => {
			evt.dataTransfer.effectAllowed = "none";
		});
		div.appendChild(a);
		container.appendChild(div);

		const ul = document.createElement("ul");
		div.addEventListener("drop", evt => {
			div.style.opacity = null;
			if (draggingData !== null) {
				if (chromeWindow.isSameWindow(draggingData.tab.window)) {
					// 同じWindow内の移動はしない
					return;
				}
				if (!chromeWindow.canAcceptTabMove(draggingData.tab)) {
					return;
				}
				const target = draggingData.elem;
				const oldParent = target.parentNode;
				ul.appendChild(target);
				// 参照渡しでwindow(id)を変更する
				draggingData.tab.window = chromeWindow;
				chrome.tabs.move(draggingData.tab.id, {
					windowId: chromeWindow.id,
					index: -1
				});
				if (oldParent.children.length === 0) {
					// Window内のタブが無くなってWindowが閉じた
					const div = oldParent.parentNode;
					div.parentNode.removeChild(div);
				}
				// TODO: 移動前Windowでアクティブになったタブの確認とclass追加
				target.querySelector("tab-link").classList.remove("active-tab");
			}
		});
		div.addEventListener("dragleave", evt => {
			div.style.opacity = null;
		});
		div.addEventListener("dragover", evt => {
			if (draggingData !== null) {
				if (chromeWindow.isSameWindow(draggingData.tab.window)) {
					// 同じWindow内の移動はしない
					evt.dataTransfer.dropEffect = "none";
				} else if (!chromeWindow.canAcceptTabMove(draggingData.tab)) {
					// シークレットウィンドウと通常ウィンドウ間のタブ移動はできない
					evt.dataTransfer.dropEffect = "none";
				} else {
					// FIXME: マウスを動かすだけで発火するdragoverイベントでstyleを変えるべきでない
					div.style.opacity = 0.6;
				}
			}
			evt.preventDefault();
		});
		chromeWindow.tabs.forEach(tab => {
			const li = document.createElement("li");
			const tabLink = document.createElement("tab-link");
			tabLink.setTab(tab);
			if (tab.active) {
				tabLink.classList.add("active-tab");
			}
			li.addEventListener("dragstart", evt => {
				draggingData = {
					elem: li,
					tab: tab
				};
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

		// SS撮影の処理が重い
		displayScreenshot.checked && setTimeout(() => {
			chrome.tabs.captureVisibleTab(chromeWindow.id, {
				format: "jpeg",
				quality: 50
			}, dataUrl => {
				if (typeof dataUrl === "undefined") {
					const p = document.createElement("p");
					p.innerText = "最小化されているためSS撮影不可";
					a.appendChild(p);
				} else {
					const img = document.createElement("img");
					img.src = dataUrl;
					img.style.width = "95%";
					//img.style.border = "2px double black";
					a.appendChild(img);
				}
			});
		}, 300);
	});

	const onKeydownFunctions = {
		"q": () => {
			// 最後から3個目のwindow
			const index = targetWindows.length - 3;
			chrome.windows.update(targetWindows[index].id, {
				focused: true
			});
		},
		"w": () => {
			// 最後から2個目のwindow
			const index = targetWindows.length - 2;
			chrome.windows.update(targetWindows[index].id, {
				focused: true
			});
		},
		"e": () => {
			// 最後のwindow
			const index = targetWindows.length - 1;
			chrome.windows.update(targetWindows[index].id, {
				focused: true
			});
		},
		" ": evt => {
			const tagName = evt.target.tagName;
			if (tagName === "A" || tagName === "TAB-LINK") {
				evt.target.click();
			}
		}
	};
	document.body.addEventListener("keydown", evt => {
		if (evt.target !== searchWordInput) {
			if (evt.ctrlKey) return;
			if (/^\d+$/.test(evt.key)) {
				chrome.windows.update(targetWindows[evt.key].id, {
					focused: true
				});
				return;
			}
			const func = onKeydownFunctions[evt.key.toLowerCase()];
			if (func) func(evt);
		}
	});
});

const container_bookmarks = document.getElementById("container_bookmarks");
const ul_bookmarks = document.getElementById("search-result_bookmarks");

const searchWordInput = document.getElementById("search-word");
searchWordInput.addEventListener("focus", () => {
	document.body.setAttribute("data-now-searching", "true");
});
searchWordInput.addEventListener("blur", () => {
	document.body.setAttribute("data-now-searching", "false");
});
searchWordInput.focus();
searchWordInput.tabIndex = TAB_INDEX;
searchWordInput.addEventListener("keyup", evt => {
	const value = searchWordInput.value.toLowerCase();
	modeChange(value ? "tab-search" : "window-list");

	tabList.forEach(tab => {
		const targetText = (tab.url + tab.title).toLowerCase();
		const isMatched = targetText.includes(value);
		tab.elem.style.display = isMatched ? "" : "none";
	});

	if (value) {
		chrome.bookmarks.search(value, bookmarks => {
			ul_bookmarks.innerText = "";
			if (bookmarks.length > 0) {
				container_bookmarks.style.display = "";
				bookmarks.forEach(bookmark => {
					const isLink = !!bookmark.url;
					if (isLink) {
						const li = document.createElement("li");
						const a = document.createElement("a");
						const img = document.createElement("img");
						img.src = `chrome://favicon/${bookmark.url}`;
						a.appendChild(img);
						a.appendChild(document.createTextNode(bookmark.title || bookmark.url));
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
						a.addEventListener("keydown", function (evt) {
							if (/^(s|i)$/i.test(evt.key)) {
								// シークレットウィンドウで開く
								chrome.windows.create({
									url: this.href,
									incognito: true
								});
							}
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

// 全角入力を半角に変換する
// TODO: 完全対応
const codeToKeyMap = {
	"Minus": "-",
	"IntlRo": "_",
	"Period": ".",
	"Comma": ",",
	"BracketLeft": "@" 
};
for (let i = 0; i < 10; i++) {
	codeToKeyMap[`Numpad${i}`] = codeToKeyMap[`Digit${i}`] = i.toString();
}
"abcdefghijklmnopqrstuvwxyz".split("").forEach(char => {
	codeToKeyMap[`Key${char.toUpperCase()}`] = char;
});

searchWordInput.addEventListener("keydown", evt => {
	// Escが押されたら入力欄を空にする
	//   ※keyupだと日本語入力で未確定状態からEscでも反応してしまう
	if (evt.keyCode === 27) {
		searchWordInput.value = "";
	}

	if (allow_only_half_width_char && evt.key === "Process") {
		const code = evt.code;
		const key = codeToKeyMap[code];
		if (!key) return;

		document.execCommand("insertText", null, key);
		evt.preventDefault();
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

class ChromeWindow {
	static convert(windowObject) {
		return new ChromeWindow(windowObject)
	}
	constructor(_originalWindowObject) {
		this._originalWindowObject = _originalWindowObject;
		// オリジナルのプロパティをコピー
		Object.assign(this, _originalWindowObject);
	}
	isSameWindow(targetChromeWindow) {
		if (!targetChromeWindow) return false;
		return this.id === targetChromeWindow.id;
	}
	canAcceptTabMove(targetTab) {
		if (!targetTab) return false;
		return targetTab.incognito === this.incognito;
	}
}