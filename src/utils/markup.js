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
	const workingRect = base.getBoundingClientRect();
	const dirtyRects = dirtyElements.map(e => e.getBoundingClientRect());

	const isEmpty = (rect) => {
		return rect.left >= rect.right || rect.top >= rect.bottom;
	};

	const clone = (domRect) => {
		return DOMRect.fromRect({ x: domRect.x, y: domRect.y, width: domRect.width, height: domRect.height });
	};

	const fromBounds = (left, top, right, bottom) => {
		return DOMRect.fromRect({ x: left, y: top, width: right - left, height: bottom - top });
	};

	const intersect = (base, other) => {
		if (isEmpty(base) || isEmpty(other)) {
			return DOMRect.fromRect();
		}

		const x1 = Math.max(base.left, other.left);
		const x2 = Math.min(base.right, other.right);
		const y1 = Math.max(base.top, other.top);
		const y2 = Math.min(base.bottom, other.bottom);
		// If width or height is 0, the intersection was empty.
		return DOMRect.fromRect({ x: x1, y: y1, width: Math.max(0, x2 - x1), height: Math.max(0, y2 - y1) });
	};

	const subtract = (base, other) => {

		const result = [];
		other = intersect(other, base);
		if (isEmpty(other)) {
			return [clone(base)];
		}

		const leftStrip = fromBounds(base.left, base.top, other.left, base.bottom);
		if (!isEmpty(leftStrip)) {
			result.push(leftStrip);
		}

		const upperInsideStrip = fromBounds(other.left, base.top, other.right, other.top);
		if (!isEmpty(upperInsideStrip)) {
			result.push(upperInsideStrip);
		}

		const lowerInsideStrip = fromBounds(other.left, other.bottom, other.right, base.bottom);
		if (!isEmpty(lowerInsideStrip)) {
			result.push(lowerInsideStrip);
		}

		const rightStrip = fromBounds(other.right, base.top, base.right, base.bottom);

		if (!isEmpty(rightStrip)) {
			result.push(rightStrip);
		}

		return result;
	};

	const subtractAll = (base, others) => {
		const subtractOthers = (previousResult, other) => {
			return previousResult.map(r => subtract(r, other)).flat();
		};

		const getArea = (rect) => rect.width * rect.height;
		const byAreaThenXThenY = (a, b) => getArea(a) - getArea(b) || a.x - b.x || a.y - b.y;

		return others.reduce(subtractOthers, [base]).sort(byAreaThenXThenY);
	};

	const candidates = subtractAll(workingRect, dirtyRects);

	return candidates[candidates.length - 1];
};






