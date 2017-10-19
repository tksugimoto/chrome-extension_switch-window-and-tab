((window, document) => {
	'use strict';
	
	const thatDoc = document;
	const thisDoc = thatDoc.currentScript.ownerDocument;
	
	const template = thisDoc.querySelector('template').content;
	
	class TabLinkElement extends HTMLElement {

		constructor(tab) {
			super();

			const shadowRoot = this.attachShadow({
				mode: 'closed',
			});
			
			const clone = thatDoc.importNode(template, true);
			shadowRoot.appendChild(clone);

			const link = shadowRoot.getElementById('container');
			link.href = tab.url;

			shadowRoot.getElementById('title').innerText = tab.title || tab.url;

			if (typeof tab.favIconUrl === 'string') {
				const icon = shadowRoot.getElementById('icon');
				icon.src = tab.favIconUrl;
				icon.addEventListener('error', () => {
					icon.style.display = 'none';
				});
			}
			
			link.addEventListener('click', (evt) => {
				evt.preventDefault();
				chrome.tabs.update(tab.id, {
					active: true,
				});
				chrome.windows.update(tab.windowId, {
					focused: true,
				});
			});
			this.addEventListener('click', () => {
				link.click();
			});
		}

	}
	
	window.customElements.define('tab-link', TabLinkElement);
	window.TabLinkElement = TabLinkElement;
})(window, document);
