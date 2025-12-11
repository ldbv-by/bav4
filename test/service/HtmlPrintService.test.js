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
			// Prevents removing the printElement to see expecting result.
			spyOn(document.body, 'removeChild').and.returnValue();

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
			// Prevents removing the printElement to see expecting result.
			spyOn(document.body, 'removeChild').and.returnValue();

			const templateResult = html`<span id="foo-id">foo</span>`;
			htmlPrintService.printTemplateResult(templateResult);

			expect(document.body.firstChild.id).toBe('html-print');
			// lit adds <!----> before the tag.
			expect(document.body.firstChild.innerHTML).toBe('<!----><span id="foo-id">foo</span>');
		});

		it('removes the print container after printing', () => {
			const htmlPrintService = setup();

			// Prevents showing the print modal, thus blocking the test
			spyOn(window, 'print').and.returnValue();

			const printElement = document.createElement('span');
			printElement.id = 'foo-id';
			printElement.innerText = 'Foo';

			htmlPrintService.printHtmlElement(printElement);
			expect(document.body.querySelector('#html-print')).toBeNull();
		});
	});
});
