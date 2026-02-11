import { HtmlPrintService } from '../../src/services/HtmlPrintService';
import { html } from 'lit-html';

describe('HtmlPrintService', () => {
	const setup = () => {
		return new HtmlPrintService();
	};

	describe('Print HTML', () => {
		afterEach(() => {
			/*
			 * Manually clearing document.body between tests, because
			 * when tests happen to run on the same worker they'll likely cause flaky behavior.
			 */
			const printElement = document.body.querySelector('#html-print');
			if (printElement) {
				printElement.remove();
			}
		});

		it('renders a print container when printing a htmlElement', () => {
			const htmlPrintService = setup();

			// Prevents showing the print modal, thus blocking the test
			spyOn(window, 'print').and.returnValue();

			const printElement = document.createElement('span');
			printElement.id = 'foo-id';
			printElement.innerText = 'Foo';

			htmlPrintService.printHtmlElement(printElement);

			expect(document.body.firstChild.id).toBe('html-print');
			expect(document.body.firstChild.innerHTML).toBe(printElement.outerHTML);
		});

		it('renders a print container when printing a templateResult', () => {
			const htmlPrintService = setup();

			// Prevents showing the print modal, thus blocking the test
			spyOn(window, 'print').and.returnValue();

			const templateResult = html`<span id="foo-id">foo</span>`;
			htmlPrintService.printTemplateResult(templateResult);

			expect(document.body.firstChild.id).toBe('html-print');
			// lit adds <!----> before the tag.
			expect(document.body.firstChild.innerHTML).toBe('<!----><span id="foo-id">foo</span>');
		});

		it('recycles an available print-container html element', () => {
			const htmlPrintService = setup();

			// Prevents showing the print modal, thus blocking the test
			spyOn(window, 'print').and.returnValue();

			const printElement = document.createElement('span');
			printElement.id = 'foo-id';
			printElement.innerText = 'Foo';

			// print twice to ensure that the print-container has been created once and is reused on subsequent calls.
			const createElementSpy = spyOn(document, 'createElement').and.callThrough();
			htmlPrintService.printHtmlElement(printElement);
			const printContainer = document.body.querySelector('#html-print');
			htmlPrintService.printHtmlElement(printElement);

			expect(createElementSpy).toHaveBeenCalledTimes(1);
			expect(document.body.querySelector('#html-print')).toEqual(printContainer);
			expect(document.body.querySelector('#html-print')).not.toBeNull();
		});
	});
});
