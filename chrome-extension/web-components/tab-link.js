((window, document) => {
	"use strict";
	
	const thatDoc = document;
	const thisDoc = thatDoc.currentScript.ownerDocument;
	
	const template = thisDoc.querySelector('template').content;
	
	class TabLinkElement extends HTMLElement {

		constructor() {
			super();
		}

		createdCallback() {
			this.createShadowRoot();
			
			const clone = thatDoc.importNode(template, true);
			this.shadowRoot.appendChild(clone);
		}

		setTab(tab) {
			// TODO: 2回以上setされた時の対策
			this.shadowRoot.getElementById("container").href = tab.url;
			this.shadowRoot.getElementById("title").innerText = tab.title || tab.url;
			if (typeof tab.favIconUrl === "string") {
				const icon = this.shadowRoot.getElementById("icon");
				icon.src = tab.favIconUrl;
				icon.addEventListener("error", () => {
					icon.style.display = "none";
				});
			}
			
			const link = this.shadowRoot.getElementById("container");
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
