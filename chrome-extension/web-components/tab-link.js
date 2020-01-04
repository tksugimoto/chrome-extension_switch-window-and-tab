const templateHTML = `
	<style>
		#icon {
			height: 1em;
		}
		#title {
			word-break: break-word;
		}
	</style>
	<a id="container">
		<img id="icon">
		<span id="title">ページタイトル</span>
	</a>
`;

((window) => {
	'use strict';

	class TabLinkElement extends HTMLElement {

		constructor(tab) {
			super();

			const shadowRoot = this.attachShadow({
				mode: 'closed',
			});

			shadowRoot.innerHTML = templateHTML;

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
})(window);
