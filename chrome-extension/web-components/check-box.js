const templateHTML = `
	<style>
		input:checked + span  {
			font-weight: bold;
		}

		:host(:not([disabled])) input,
		:host(:not([disabled])) label {
			cursor: pointer;
		}

		input,
		label {
			user-select: none;
		}
		label > input,
		label > span {
			vertical-align: middle;
		}
	</style>
	<label>
		<input type="checkbox">
		<span>
			<slot></slot>
		</span>
	</label>
`;

class CheckBoxElement extends HTMLElement {
	constructor() {
		super();

		const shadowRoot = this.attachShadow({
			mode: 'closed',
		});

		shadowRoot.innerHTML = templateHTML;

		this._checkbox = shadowRoot.querySelector('input');

		this._checkbox.addEventListener('change', () => {
			const checked = this._checkbox.checked;
			this._updateCheckedAttribute(checked);
			const event = new window.Event('change');
			event.checked = checked;
			this.dispatchEvent(event);
		});
	}

	static get observedAttributes() {
		return [
			'checked',
			'disabled',
			'accesskey',
		];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === 'checked') {
			const checked = newValue !== null;
			this._checkbox.checked = checked;
		} else if (name === 'disabled') {
			const disabled = newValue !== null;
			this._checkbox.disabled = disabled;
		} else if (name === 'accesskey') {
			if (newValue) {
				this._checkbox.setAttribute('accesskey', newValue);
			} else {
				this._checkbox.removeAttribute('accesskey');
			}
		}
	}

	set checked(value) {
		const checked = !!value;
		this._updateCheckedAttribute(checked);
	}
	get checked() {
		return this._checkbox.checked;
	}

	_updateCheckedAttribute(checked) {
		if (checked) {
			this.setAttribute('checked', '');
		} else {
			this.removeAttribute('checked');
		}
	}

	set disabled(value) {
		if (value) {
			this.setAttribute('disabled', '');
		} else {
			this.removeAttribute('disabled');
		}
	}
	get disabled() {
		return this._checkbox.disabled;
	}
}

window.customElements.define('check-box', CheckBoxElement);
