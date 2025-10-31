/**
 * @module services/HtmlPrintService
 */

import { render } from 'lit-html';

/**
 * @class
 */
export class HtmlPrintService {
	constructor() {}

	/**
	 * Opens the pdf print modal with the provided HTMLElement.
	 * @param {HTMLElement} printElement
	 */
	printHtmlElement(printElement) {
		const printContainer = this.#createPrintContainer();
		printContainer.insertAdjacentElement('afterbegin', printElement);
		document.body.insertAdjacentElement('afterbegin', printContainer);
		window.print();
		document.body.removeChild(printContainer);
	}

	/**
	 * Opens the pdf print modal with the provided lit TemplateResult
	 * @param {TemplateResult} templateResult
	 */
	printTemplateResult(templateResult) {
		const printContainer = this.#createPrintContainer();
		render(templateResult, printContainer);
		document.body.insertAdjacentElement('afterbegin', printContainer);
		window.print();
		document.body.removeChild(printContainer);
	}

	#createPrintContainer() {
		const container = document.createElement('div');
		container.id = 'html-print';
		return container;
	}
}
