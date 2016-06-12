"use strict";

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
		var a = document.createElement("a");
		a.innerText = window.tabs.find(tab => tab.active).title;
		a.href = "#";
		a.tabIndex = 1;
		a.onclick = () => {
			chrome.windows.update(window.id, {
				focused: true
			});
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
		});
		div.appendChild(ul);

		console.log(window)
	});
});