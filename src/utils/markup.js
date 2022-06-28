import { BaElement } from '../modules/BaElement';
import { MvuElement } from '../modules/MvuElement';

export const TEST_ID_ATTRIBUTE_NAME = 'data-test-id';

/**
 * Sets the value of the `data-test-id` attribute for a MvuElement and all of its children.
 * The Test-Id is derived from the DOM hierarchy of the current MvuElement following its parent MvuElements
 *(BaElements are also supported).
 *
 * @param {MvuElement|BaElement} element
 */
export const generateTestIds = (element) => {

	/**
	 * We cannot use a service here, it's a low-level function for MvuElements, other services than the store service are not available.
	 * So we use a global window property for switching on id generation.
	 */
	if (window.ba_enableTestIds) {

		/**
		* Let's traverse the DOM and search for all parent MvuElement, also detect the child of each MvuElement
		*/
		const pathElements = [];
		let currentParent = element.parentNode;
		let currentMvuElement = element;

		while (currentParent) {
			if (currentParent instanceof BaElement || currentParent instanceof MvuElement) {
				const elementIndex = [...currentParent.shadowRoot.querySelectorAll(currentMvuElement.tagName)].indexOf(currentMvuElement);
				const elementTag = currentMvuElement.tagName.toLowerCase();
				pathElements.push(`${elementTag}-${elementIndex}`);
				currentMvuElement = currentParent;
			}

			currentParent = currentParent.parentNode ?? currentParent.host;
			//if we have no more parent MvuElement we finally add the current one
			if (!currentParent) {
				pathElements.push(`${currentMvuElement.tagName.toLowerCase()}-0`);
			}
		}

		const basePath = pathElements.reverse().join('_');

		//Give the current MvuElement only a test id if it requests it
		if (element.hasAttribute(TEST_ID_ATTRIBUTE_NAME)) {
			element.setAttribute(TEST_ID_ATTRIBUTE_NAME, basePath);
		}

		//Provide all child elements (except for MvuElements) with test ids if requested
		[...element.shadowRoot.querySelectorAll(`[${TEST_ID_ATTRIBUTE_NAME}]`)]
			.forEach(el => {
				// MvuElement/BaElement instances are handled on their own
				if (!(el instanceof BaElement || el instanceof MvuElement)) {

					//priority: id -> css-classes
					const qualifier = el.getAttribute('id') ?? el.getAttribute('class');
					if (qualifier) {
						el.setAttribute(TEST_ID_ATTRIBUTE_NAME, `${basePath}_${qualifier.replace(' ', '-')}`);
					}
					else {
						console.warn(`No data-test-id qualifier found for: ${basePath} -> ${el.tagName.toLocaleLowerCase()}. Please add either an id or a class attribute.`);
					}
				}
			});
	}


};

/**
 * Applies a function on all children (including custom elements) of a given element containing a given attribute.
 * The start element will be excluded.
 * @param {HTMLElement} element start element
 * @param {string} attribute target attribute
 * @param {Function} callback callback function
 */
export const forEachByAttribute = (element, attribute, callback) => {

	const checkShadowDOM = el => el.shadowRoot ?? el;

	checkShadowDOM(element).childNodes.forEach(el => {
		if (el.hasAttribute && el.hasAttribute(attribute)) {
			callback(el);
		}
		forEachByAttribute(checkShadowDOM(el), attribute, callback);
	});
};

/**
 * Returns an array containing all elements owning the given attribute starting from a a given element.
 * The start element will be excluded.
 * @param {HTMLElement} element
 * @param {string} attribute target attribute
 * @returns array
 */
export const findAllByAttribute = (element, attribute) => {

	const elements = [];
	forEachByAttribute(element, attribute, el => elements.push(el));
	return elements;
};

/**
 * Decodes the given htmlValue
 * @param {string} htmlValue the encoded html
 * @returns {string} the decoded htmlValue
 */
export const decodeHtmlEntities = (htmlValue) => {
	const document = new DOMParser().parseFromString(htmlValue, 'text/html');
	return document.documentElement.textContent;
};

/**
 *
 * @param {HTMLElement} base
 * @param {Array<HTMLElement>} dirtyElements
 */
export const calculateWorkingArea = (base, dirtyElements) => {
	const workingRect = fromDOMRect(base.getBoundingClientRect());

	const dirtyRects = dirtyElements.map(e => fromDOMRect(e.getBoundingClientRect()));

	const candidates = workingRect.subtractAll(dirtyRects);

	return candidates[candidates.length - 1];
};


const fromDOMRect = (rect) => {
	return new Rect(rect.left, rect.top, rect.right - rect.left, rect.bottom - rect.top);
};

const fromBounds = (left, top, right, bottom) => {
	return new Rect(left, top, right - left, bottom - top);
};
class Rect {

	constructor(x, y, width, height) {
		this._left = x;
		this._top = y;
		this._right = x + width;
		this._bottom = y + height;
	}

	get x() {
		return this.left;
	}

	get left() {
		return this._left;
	}

	get y() {
		return this.top;
	}

	get top() {
		return this._top;
	}

	get right() {
		return this._right;
	}

	get bottom() {
		return this._bottom;
	}

	get width() {
		return this.right - this.left;
	}

	get height() {
		return this.bottom - this.top;
	}

	get area() {
		return this.width * this.height;
	}

	clone() {
		return new Rect(
			this.left,
			this.top,
			this.width,
			this.height
		);
	}

	isEmpty() {
		return this.left >= this.right || this.top >= this.bottom;
	}

	/**
	 *
	 * @param {Rect} other
	 * @returns
	 */
	restrictTo(other) {
		if (this.isEmpty() || other.isEmpty()) {
			return new Rect(0, 0, 0, 0);
		}

		const x1 = Math.max(this.left, other.left);
		const x2 = Math.min(this.right, other.right);
		const y1 = Math.max(this.top, other.top);
		const y2 = Math.min(this.bottom, other.bottom);
		// If width or height is 0, the intersection was empty.
		return new Rect(x1, y1, Math.max(0, x2 - x1), Math.max(0, y2 - y1));
	}

	intersect(other) {
		return this.clone().restrictTo(other);
	}

	subtract(other) {

		const result = [];
		other = other.intersect(this);
		if (other.isEmpty()) {
			return [this.clone()];
		}

		const leftStrip = fromBounds(this.left, this.top, other.left, this.bottom);
		if (!leftStrip.isEmpty()) {
			result.push(leftStrip);
		}

		const upperInsideStrip = fromBounds(other.left, this.top, other.right, other.top);
		if (!upperInsideStrip.isEmpty()) {
			result.push(upperInsideStrip);
		}

		const lowerInsideStrip = fromBounds(other.left, other.bottom, other.right, this.bottom);
		if (!lowerInsideStrip.isEmpty()) {
			result.push(lowerInsideStrip);
		}

		const rightStrip = fromBounds(other.right, this.top, this.right, this.bottom);

		if (!rightStrip.isEmpty()) {
			result.push(rightStrip);
		}

		return result;
	}

	subtractAll(others) {

		const subtractOthers = (previousResult, other) => {
			const concat = (accumulator, currentValue) => accumulator.concat(currentValue);
			return previousResult.map(r => r.subtract(other)).reduceRight(concat);

		};

		const byAreaOrXOrY = (a, b) => a.area - b.area || a.x - b.x || a.y - b.y;
		return others.reduce(subtractOthers, [this]).sort(byAreaOrXOrY);
	}
}
