import { BaElement } from '../modules/BaElement';
import { MvuElement } from '../modules/MvuElement';

export const TEST_ID_ATTRIBUTE_NAME = 'data-test-id';

/**
 * Sets the value (Test-Id) of the `data-test-id` attribute for a MvuElement and all of its children.
 * The Test-Id is derived from the DOM hierarchy of the current MvuElement following its parent MvuElements.
 *
 * @param {MvuElement|BaElement} element
 */
export const generateTestIds = (element) => {

	const pathElements = [];

	/**
     * Let's traverse the DOM and search for all parent MvuElements (BaElements), also detect the child index if necessary
     */
	let currentParent = element.parentNode;
	let currentMvuElement = element;
	while (currentParent) {
		if (currentParent instanceof BaElement || currentParent instanceof MvuElement) {

			const elementIndex = [...currentParent.shadowRoot.querySelectorAll(currentMvuElement.tagName.toLowerCase())].indexOf(currentMvuElement);
			const elementTag = currentMvuElement.tagName.toLowerCase();
			pathElements.push(`${elementTag}-${elementIndex}`);
			currentMvuElement = currentParent;
		}

		currentParent = currentParent.parentNode ?? currentParent.host;
		//if we have no more parent MvuElement we finally add the current
		if (!currentParent) {
			const elementTag = currentMvuElement.tagName.toLowerCase();
			pathElements.push(`${elementTag}-0`);
		}

	}
	const basePath = pathElements.reverse().join('_');

	//Provide the current MvuElement with the test id to if necessary
	if (element.hasAttribute(TEST_ID_ATTRIBUTE_NAME)) {
		element.setAttribute(TEST_ID_ATTRIBUTE_NAME, basePath);
	}

	//Provide all all child elements (except for MvuElements) with the test id if necessary
	[...element.shadowRoot.querySelectorAll(`[${TEST_ID_ATTRIBUTE_NAME}]`)]
		.filter(el => !(el instanceof BaElement) && !(el instanceof MvuElement))
		.forEach(el => {
			//priority: id -> css-classes -> tag-name
			const marker = el.getAttribute('id') ?? el.getAttribute('class') ?? el.tagName?.toLocaleLowerCase();
			el.setAttribute(TEST_ID_ATTRIBUTE_NAME, `${basePath}_${marker.replace(' ', '-')}`);
		});
};
