(function (window, document) {
	"use strict";
	
	var thatDoc = document;
	var thisDoc = thatDoc.currentScript.ownerDocument;
	
	var template = thisDoc.querySelector('template').content;
	
	class TabLinkElement extends HTMLElement {

		constructor() {
			super();
		}

		createdCallback() {
			this.createShadowRoot();
			
			var clone = thatDoc.importNode(template, true);
			this.shadowRoot.appendChild(clone);
		}

		setTab(tab) {
			// TODO: 2回以上setされた時の対策
			this.shadowRoot.getElementById("container").href = tab.url;
			this.shadowRoot.getElementById("title").innerText = tab.title || tab.url;
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
		}

	}
	
	thatDoc.registerElement("tab-link", TabLinkElement);
})(window, document);
