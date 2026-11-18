/**
 * @module utils/storeUtils
 */
import { createUniqueId } from './numberUtils';

/**
 * Observes a selected value from the store and calls `onChange` when that value
 * changes. The current value is captured when the observer is registered; by
 * default, this initial value does not trigger the callback.
 * @function
 * @param {object} store Redux store to observe.
 * @param {function(state): *} extract Selects the value to watch from the store's current state.
 * @param {function(*, state): void} onChange Called with the selected value and the full state when the selected value changes.
 * @param {boolean} [ignoreInitialState=true] When `false`, call `onChange` immediately with the current selected value and state.
 * @returns {function(): void} A function that unsubscribes the observer.
 */
export const observe = (store, extract, onChange, ignoreInitialState = true) => {
	const initialFlag = Object.freeze({});
	let currentState = initialFlag;

	const handleChange = () => {
		const nextState = extract(store.getState());
		if (!equals(nextState, currentState)) {
			const callCallback = currentState !== initialFlag || !ignoreInitialState;
			currentState = nextState;
			if (callCallback) {
				onChange(currentState, store.getState());
			}
		}
	};

	const unsubscribe = store.subscribe(handleChange);
	handleChange();
	return unsubscribe;
};

/**
 * Calls `onChange` once when the selected store value changes after registration,
 * then unsubscribes the observer. The current value is captured at registration
 * and does not trigger the callback.
 * @function
 * @param {object} store Redux store to observe.
 * @param {function(state): *} extract Selects the value to watch from the store's current state.
 * @param {function(*, state): void} onChange Called once with the selected value and the full state when the selected value changes.
 */
export const observeOnce = (store, extract, onChange) => {
	const unsubscribeFn = observe(
		store,
		extract,
		(param0, param1) => {
			onChange(param0, param1);
			unsubscribeFn();
		},
		true
	);
};

/**
 * Compares two values. Strictly equal values match; functions match when their
 * source text is equal. Arrays and other objects are compared recursively by
 * their enumerable own string-keyed properties; arrays only match other arrays.
 * @function
 * @param {*} value0 First value to compare.
 * @param {*} value1 Second value to compare.
 * @returns {boolean} `true` when the values match according to these rules.
 */
export const equals = (value0, value1) => {
	if (value0 === value1) {
		return true;
	}

	if (typeof value0 === 'function' && typeof value1 === 'function') {
		return value0.toString() === value1.toString();
	}

	if (typeof value0 !== 'object' || typeof value1 !== 'object' || !value0 || !value1) {
		return false;
	}

	if ((Array.isArray(value0) && !Array.isArray(value1)) || (!Array.isArray(value0) && Array.isArray(value1))) {
		return false;
	}

	const keys0 = Object.keys(value0);
	const keys1 = Object.keys(value1);

	if (keys0.length !== keys1.length) {
		return false;
	}

	return keys0.every((key) => {
		if (!keys1.includes(key)) {
			return false;
		}
		return equals(value0[key], value1[key]);
	});
};

/**
 * Wraps an action payload with a generated numeric identifier, allowing
 * event-like state changes to be distinguished even when their payloads match.
 */
export class EventLike {
	/**
	 * @param {*} [payload=null] Payload associated with this event.
	 */
	constructor(payload = null) {
		this._payload = payload;
		this._id = createUniqueId();
	}

	/** @returns {*} The payload associated with this event. */
	get payload() {
		return this._payload;
	}

	/** @returns {number} The generated identifier for this event. */
	get id() {
		return this._id;
	}
}
