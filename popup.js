"use strict";

var TAB_INDEX = 1;
var tabList = [];

chrome.windows.getAll({
	// tab情報を含める
	populate: true,
	windowTypes: [
		"popup",
		"normal"
	]
}, windows => {
	var selfUrl = location.href;
	windows.filter(window => {
		var isThisWindow = window.tabs.length === 1 && window.tabs[0].url === selfUrl;
		return !isThisWindow;
	}).forEach(window => {
		var container = document.getElementById("container");
		var div = document.createElement("div");

		var activeTab = window.tabs.find(tab => tab.active);
		var a = document.createElement("a");
		a.innerText = activeTab.title;
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

		var ul = document.createElement("ul");
		window.tabs.forEach(tab => {
			var li = document.createElement("li");
			var tabLink = document.createElement("tab-link");
			tabLink.setTab(tab);
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
	});
});

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
