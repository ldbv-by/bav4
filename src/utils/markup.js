/**
 * @module utils/markup
 */
import { MvuElement } from '../modules/MvuElement';

/**
 * An element containing this attribute will be provided with a generated test id.
 */
export const TEST_ID_ATTRIBUTE_NAME = 'data-test-id';

/**
 * An element containing this attribute registers for taking part in viewport calculation.
 */
export const REGISTER_FOR_VIEWPORT_CALCULATION_ATTRIBUTE_NAME = 'data-register-for-viewport-calc';

/**
 * An element containing this attribute will be logging its lifecycle.
 */
export const LOG_LIFECYLE_ATTRIBUTE_NAME = 'data-log-lifecycle';

/**
 * An iframe element containing this attribute will expose the current encoded state of an embedded BA app.
 */
export const IFRAME_ENCODED_STATE = 'data-iframe-encoded-state';

/**
 *An iframe element containing this attribute will expose the reference id of an user-generated geometry.
 */
export const IFRAME_GEOMETRY_REFERENCE_ID = 'data-iframe-geometry-reference-id';

/**
 * Name of the CSS class which marks a ba-form element as visited by the user.
 */
export const BA_FORM_ELEMENT_VISITED_CLASS = 'userVisited';

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
			if (currentParent instanceof MvuElement) {
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
		[...element.shadowRoot.querySelectorAll(`[${TEST_ID_ATTRIBUTE_NAME}]`)].forEach((el) => {
			// MvuElement/BaElement instances are handled on their own
			if (!(el instanceof MvuElement)) {
				//priority: id -> css-classes
				const qualifier = el.getAttribute('id') ?? el.getAttribute('class');
				if (qualifier) {
					el.setAttribute(TEST_ID_ATTRIBUTE_NAME, `${basePath}_${qualifier.replace(' ', '-')}`);
				} else {
					console.warn(
						`No data-test-id qualifier found for: ${basePath} -> ${el.tagName.toLocaleLowerCase()}. Please add either an id or a class attribute.`
					);
				}
			}
		});
	}
};

/**
 * Applies a function on all children (including custom elements) matching a given element containing a given selector.
 * The start element will be excluded.
 * @param {HTMLElement} element start element
 * @param {string} selector CSS selector
 * @param {Function} callback callback function
 */
export const forEachBySelector = (element, selector, callback) => {
	const checkShadowDOM = (el) => el.shadowRoot ?? el;

	checkShadowDOM(element).childNodes.forEach((el) => {
		if (el.matches && el?.matches(selector)) {
			callback(el);
		}
		forEachBySelector(checkShadowDOM(el), selector, callback);
	});
};

/**
 * Returns an array containing all elements matching the given selector starting from a given element.
 * The start element will be excluded.
 * @param {HTMLElement} element
 * @param {string} selector CSS selector
 * @returns array
 */
export const findAllBySelector = (element, selector) => {
	const elements = [];
	forEachBySelector(element, selector, (el) => elements.push(el));
	return elements;
};

/**
 * Basically the same as `Element.closest()` but working with custom elements.
 * @param {HTMLElement} element
 * @param {string} selector CSS selector
 * @returns {HTMLElement|null}
 */
export const findClosest = (element, selector) => {
	const getNext = (el) => {
		if (el instanceof Window || el instanceof Document || !el) {
			return null;
		}
		const next = el.closest(selector);
		return next ? next : getNext(el.getRootNode()?.host);
	};

	return getNext(element);
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
