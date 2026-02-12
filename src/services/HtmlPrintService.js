/**
 * @module services/HtmlPrintService
 */

import { render } from 'lit-html';

/**
 * Service outputs the provided html elements to the browser's window.print modal
 * @class
 * @author herrmutig
 */
export class HtmlPrintService {
	constructor() {}

	/**
	 * Opens the pdf print modal with the provided lit TemplateResult or HTMLElement
	 * @param {TemplateResult|HTMLElement|string} templateResult
	 */
	printContent(templateResult) {
		if (typeof templateResult !== 'object') {
			throw new Error(`Argument of type "${typeof templateResult}" is not supported. Use a TemplateResult or HTMLElement object instead!`);
		}

		const printContainer = this.#getOrCreatePrintContainer();
		render(templateResult, printContainer);
		document.body.insertAdjacentElement('afterbegin', printContainer);
		window.print();
	}

	/**
	 * Creates a print container if not present and adds it to the body as first child.
	 * If a print container already exists, it gets returned instead.
	 * Note: A print container persists during the life time of the application to avoid
	 * side effects when printing with mobile devices.
	 * @returns {HTMLElement}
	 */
	#getOrCreatePrintContainer() {
		let container = document.getElementById('html-print');

		if (!container) {
			container = document.createElement('div');
			container.id = 'html-print';
			document.body.insertAdjacentElement('afterbegin', container);
		}

		return container;
	}
}
