/**
 * @module modules/search/components/menu/AbstractSearchResultItem
 */
import { MvuElement } from '../../../MvuElement';

/**
 * @abstract
 * @class
 * @author thiloSchlemmer
 */
export class AbstractResultItem extends MvuElement {
	constructor(model) {
		super(model);
		if (this.constructor === AbstractResultItem) {
			// Abstract class can not be constructed.
			throw new TypeError('Can not construct abstract class.');
		}
	}

	/**
	 * Selects the result
	 * @abstract
	 */
	selectResult() {
		// The child has not implemented this method.
		throw new Error('Please implement abstract method selectResult or do not call super.selectResult from child.');
	}

	/**
	 * Highlights the result
	 * @abstract
	 * @property {boolean} highlighted whether or not the result is highlighted
	 */
	highlightResult(/*eslint-disable no-unused-vars*/ highlighted) {
		// The child has not implemented this method.
		throw new Error('Please implement abstract method highlightResult or do not call super.highlightResult from child.');
	}
}
