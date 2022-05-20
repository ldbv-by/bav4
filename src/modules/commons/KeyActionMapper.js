import { isString } from '../../utils/checks';
const No_Op = () => { };

/**
 * Maps actions to specific key-events
 * @class
 * @author thiloSchlemmer
 */
export class KeyActionMapper {

	constructor(document) {
		this._document = document;
		this._mapping = { keyup: {}, keydown: {} };
		this._keyUpListener = (e) => this._onKeyUp(e);
		this._keyDownListener = (e) => this._onKeyDown(e);
	}

	activate() {
		document.addEventListener('keyup', this._keyUpListener);
		document.addEventListener('keydown', this._keyDownListener);
	}

	deactivate() {
		document.removeEventListener('keyup', this._keyUpListener);
		document.removeEventListener('keydown', this._keyDownListener);
	}

	/**
	 * Maps a action to a specific keyup event, where a key with the defined key-value is pressed.
	 * @param {string} key the key-value representing a key on the keyboard
	 * @param {function} action the action which is called on keyup
	 */
	addForKeyUp(key, action) {
		this._add(key, 'keyup', action);
		return this;
	}

	/**
	 * Maps a action to a specific keydown event, where a key with the defined key-value is pressed.
	 * @param {string} key the key-value representing a key on the keyboard
	 * @param {function} action the action which is called on keydown
	 */
	addForKeyDown(key, action) {
		this._add(key, 'keydown', action);
		return this;
	}

	_add(key, eventType, action) {
		if (!isString(key)) {
			throw new TypeError('keyCode must be a string');
		}

		if (typeof action !== 'function') {
			throw new TypeError('action must be a function');
		}

		this._mapping[eventType] = { ...this._mapping[eventType], [key]: action };
	}

	_isInputElement(node) {
		return /^(input|textarea)$/i.test(node.nodeName);
	}

	_onKeyUp(event) {
		const action = this._isInputElement(event.target) ? No_Op : this._mapToAction(event.key, 'keyup');
		action();
	}

	_onKeyDown(event) {
		const action = this._isInputElement(event.target) ? No_Op : this._mapToAction(event.key, 'keydown');
		action();
	}

	_mapToAction(key, eventType) {
		return this._mapping[eventType][key] ? this._mapping[eventType][key] : No_Op;
	}
}
