/**
 * @module utils/storeUtils
 */
import { createUniqueId } from './numberUtils';

/**
 * Registers an observer for state changes of the store.
 * @function
 * @param {object} store The redux store
 * @param {function(state)} extract A function that extract a portion (single value or a object) from the current state which will be observed for comparison
 * @param {function(observedPartOfState, state)} onChange A function that will be called when the observed state has changed
 * @param {boolean|true} ignoreInitialState A boolean which indicate, if the callback should be initially called with the current state immediately after the observer has been registered. Default is `true`
 * @returns  A function that unsubscribes the observer
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
 * Registers an one-time observer for state changes of the store. The observer will be unsubscribed after the first call of the onChange function.
 * @function
 * @param {object} store The redux store
 * @param {function(state)} extract A function that extract a portion (single value or a object) from the current state which will be observed for comparison
 * @param {function(observedPartOfState, state)} onChange A function that will be called when the observed state has changed
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
 * Returns the result of a comparison between two values. If both values are objects,
 * a deep comparison is done, otherwise a shallow one.
 * @function
 * @param {object|string|number} value0
 * @param {object|string|number} value1
 * @returns {boolean} true if both values are equal
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
 * Wrapper for payloads of actions which dispatch event-like changes of state.
 */
export class EventLike {
	constructor(payload = null) {
		this._payload = payload;
		this._id = createUniqueId();
	}

	get payload() {
		return this._payload;
	}

	get id() {
		return this._id;
	}
}
