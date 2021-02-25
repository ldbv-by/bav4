/**
 * Registers an observer for state changes of the store.
 * @function
 * @param {object} store The redux store
 * @param {function(state)} extract A function that extract a portion (single value or a object) from the current state which will be observed for comparision
 * @param {function(changedState)} onChange A function that will be called when the extracted state has changed
 * @param {boolean|true} ignoreInitialState A boolean which indicate, if the callback should be initially called with the current state immediately after the observer has been registered
 * @returns  A function that unsubscribes the observer
 */
export const observe = (store, extract, onChange, ignoreInitialState = true) => {
	const initialFlag = Object.freeze({});
	let currentState = initialFlag;

	const handleChange = () => {
		const nextState = extract(store.getState());
		if (!equals(nextState, currentState)) {
			const callCallback = (currentState !== initialFlag || !ignoreInitialState);
			currentState = nextState;
			if (callCallback) {
				onChange(currentState);
			}
		}
	};

	const unsubscribe = store.subscribe(handleChange);
	handleChange();
	return unsubscribe;
};

/**
 * Returns the result of a comparision between two values. If both values are objects,
 * a deep comparision is done, otherwise a shallow one.
 * @function
 * @param {object|string|number} value0 
 * @param {object|string|number} value1 
 * @returns {boolean} true if both values are equal
 */
export const equals = (value0, value1) => {
	if (typeof value0 === 'object' && typeof value1 === 'object') {
		// maybe we should use Lo.isEqual later, but for now it does the job
		return JSON.stringify(value0) === JSON.stringify(value1);
	}
	return value0 === value1;
};