(function (window, document) {
	"use strict";
	
	var thatDoc = document;
	var thisDoc = thatDoc.currentScript.ownerDocument;
	
	var template = thisDoc.querySelector('template').content;
	
	var MyElementProto = window.Object.create(window.HTMLElement.prototype);

	MyElementProto.createdCallback = function () {
		this.createShadowRoot();
		
		var clone = thatDoc.importNode(template, true);
		this.shadowRoot.appendChild(clone);
	};

	MyElementProto.setTab = function (tab) {
		// TODO: 2回以上setされた時の対策
		this.shadowRoot.getElementById("container").href = tab.url;
		this.shadowRoot.getElementById("title").innerText = tab.title;
		if (typeof tab.favIconUrl === "string") {
			var icon = this.shadowRoot.getElementById("icon");
			icon.src = tab.favIconUrl;
			icon.addEventListener("error", () => {
				icon.style.display = "none";
			});
		}
		
		var link = this.shadowRoot.getElementById("container");
		link.addEventListener("click", (evt) => {
			evt.preventDefault();
			chrome.tabs.update(tab.id, {
				active: true
			});
			chrome.windows.update(tab.windowId, {
				focused: true
			});
		});
		this.addEventListener("click", () => {
			link.click();
		});
	};
	
	thatDoc.registerElement("tab-link", {
		prototype: MyElementProto
	});
})(window, document);
