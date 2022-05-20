import { isNumber } from '../../utils/checks';
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
	 * Maps a action to a specific keyup event, where a key with the defined keyCode is pressed.
	 * @param {number} keyCode the keyCode representing a key on the keyboard
	 * @param {function} action the action which is called on keyup
	 */
	addForKeyUp(keyCode, action) {
		this._add(keyCode, 'keyup', action);
		return this;
	}

	/**
	 * Maps a action to a specific keydown event, where a key with the defined keyCode is pressed.
	 * @param {number} keyCode the keyCode representing a key on the keyboard
	 * @param {function} action the action which is called on keydown
	 */
	addForKeyDown(keyCode, action) {
		this._add(keyCode, 'keydown', action);
		return this;
	}

	_add(keyCode, eventType, action) {
		if (!isNumber(keyCode)) {
			throw new TypeError('keyCode must be a number');
		}

		if (typeof action !== 'function') {
			throw new TypeError('action must be a function');
		}

		this._mapping[eventType] = { ...this._mapping[eventType], [keyCode]: action };
	}

	_isInputElement(node) {
		return /^(input|textarea)$/i.test(node.nodeName);
	}

	_getKeyCode(event) {
		return event.which ? event.which : event.code;
	}

	_onKeyUp(event) {
		const action = this._isInputElement(event.target) ? No_Op : this._mapToAction(this._getKeyCode(event), 'keyup');
		action();
	}

	_onKeyDown(event) {
		const action = this._isInputElement(event.target) ? No_Op : this._mapToAction(this._getKeyCode(event), 'keydown');
		action();
	}

	_mapToAction(keyCode, eventType) {
		return this._mapping[eventType][keyCode] ? this._mapping[eventType][keyCode] : No_Op;
	}
}
