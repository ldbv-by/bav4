import { GeoResourceResultsPanel } from '../../../../../src/modules/search/components/menu/types/geoResource/GeoResourceResultsPanel';
import { LocationResultsPanel } from '../../../../../src/modules/search/components/menu/types/location/LocationResultsPanel';
import { SearchResultsPanel } from '../../../../../src/modules/search/components/menu/SearchResultsPanel';
import { TestUtils } from '../../../../test-utils.js';
import { AbstractMvuContentPanel } from '../../../../../src/modules/menu/components/mainMenu/content/AbstractMvuContentPanel';
import { CpResultsPanel } from '../../../../../src/modules/search/components/menu/types/cp/CpResultsPanel';
import { AbstractResultItem } from '../../../../../src/modules/search/components/menu/AbstractSearchResultItem.js';
import { html } from 'lit-html';
window.customElements.define(SearchResultsPanel.tag, SearchResultsPanel);

class AbstractResultItemImpl extends AbstractResultItem {
	/**
	 * @override
	 */
	selectResult() {}

	/**
	 * @override
	 */
	highlightResult() {}

	static get tag() {
		return 'ba-test-abstract-result-item-impl';
	}
}

describe('SearchResultsPanel', () => {
	const keyCodes = { ArrowDown: 'ArrowDown', ArrowUp: 'ArrowUp', Enter: 'Enter' };

	const createResultItems = (size) =>
		Array.from(
			Array(size)
				.keys()
				.map((key) => TestUtils.renderTemplateResult(html`<ba-test-abstract-result-item-impl>${key}</ba-test-abstract-result-item-impl>`))
		);

	const setup = () => {
		TestUtils.setupStoreAndDi();
		return TestUtils.render(SearchResultsPanel.tag);
	};

	describe('class', () => {
		it('inherits from AbstractContentPanel', async () => {
			const element = await setup();

			expect(element instanceof AbstractMvuContentPanel).toBeTrue();
		});
	});

	describe('when initialized', () => {
		const getKeyEvent = (key) => {
			return new KeyboardEvent('keyup', { key: key });
		};

		it('renders the view', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelector('.search-results-panel')).toBeTruthy();
			expect(element.shadowRoot.querySelector(LocationResultsPanel.tag)).toBeTruthy();
			expect(element.shadowRoot.querySelector(GeoResourceResultsPanel.tag)).toBeTruthy();
			expect(element.shadowRoot.querySelector(CpResultsPanel.tag)).toBeTruthy();
		});

		it('activates key mappings', async () => {
			const element = await setup();
			const arrowDownSpy = spyOn(element, '_arrowDown').and.callFake(() => {});
			const arrowUpSpy = spyOn(element, '_arrowUp').and.callFake(() => {});
			const enterSpy = spyOn(element, '_enter').and.callFake(() => {});

			document.dispatchEvent(getKeyEvent(keyCodes.ArrowDown));
			document.dispatchEvent(getKeyEvent(keyCodes.ArrowUp));
			document.dispatchEvent(getKeyEvent(keyCodes.Enter));

			expect(arrowDownSpy).toHaveBeenCalled();
			expect(arrowUpSpy).toHaveBeenCalled();
			expect(enterSpy).toHaveBeenCalled();
		});

		it('when mouse enters element resets key navigation', async () => {
			const element = await setup();
			const resetSpy = spyOn(element, '_reset').and.callThrough();

			element.shadowRoot.querySelector('div').dispatchEvent(new Event('mouseenter'));

			expect(resetSpy).toHaveBeenCalled();
		});

		it('when keyup event is fired highlights the next resultItem for "arrowDown"', async () => {
			const element = await setup();
			element.ResultItemClasses = [AbstractResultItemImpl];
			const arrowDownSpy = spyOn(element, '_arrowDown').and.callThrough();
			const changeSelectedElementSpy = spyOn(element, '_changeSelectedElement').and.callThrough();

			const testResultItems = createResultItems(5);
			testResultItems.forEach((child) => element.shadowRoot.querySelector('div').appendChild(child));

			const highlightResult0Spy = jasmine.createSpy('highlightResult_0');
			const highlightResult1Spy = jasmine.createSpy('highlightResult_1');

			element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl')[0].highlightResult = highlightResult0Spy;
			element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl')[1].highlightResult = highlightResult1Spy;

			document.dispatchEvent(getKeyEvent(keyCodes.ArrowDown));
			document.dispatchEvent(getKeyEvent(keyCodes.ArrowDown));

			const resultItems = element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl');

			expect(arrowDownSpy).toHaveBeenCalledTimes(2);
			expect(changeSelectedElementSpy).toHaveBeenCalledWith(undefined, resultItems[0]);
			expect(changeSelectedElementSpy).toHaveBeenCalledWith(resultItems[0], resultItems[1]);
			expect(highlightResult0Spy).toHaveBeenCalledTimes(2); // [next] + [previous]
			expect(highlightResult1Spy).toHaveBeenCalledTimes(1); // [next]
		});

		it('when keyup event is fired highlights the next resultItem for "arrowUp"', async () => {
			const element = await setup();
			element.ResultItemClasses = [AbstractResultItemImpl];
			const arrowDownSpy = spyOn(element, '_arrowUp').and.callThrough();
			const changeSelectedElementSpy = spyOn(element, '_changeSelectedElement').and.callThrough();

			const testResultItems = createResultItems(5);
			testResultItems.forEach((child) => element.shadowRoot.querySelector('div').appendChild(child));

			// we set the flag-class manually to indicate a currently selected resultItem
			element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl')[4].classList.add('ba-key-nav-item_select');
			const highlightResult4Spy = jasmine.createSpy('highlightResult_4');
			const highlightResult3Spy = jasmine.createSpy('highlightResult_3');
			const highlightResult2Spy = jasmine.createSpy('highlightResult_2');

			element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl')[4].highlightResult = highlightResult4Spy;
			element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl')[3].highlightResult = highlightResult3Spy;
			element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl')[2].highlightResult = highlightResult2Spy;

			document.dispatchEvent(getKeyEvent(keyCodes.ArrowUp));
			document.dispatchEvent(getKeyEvent(keyCodes.ArrowUp));

			const resultItems = element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl');

			expect(arrowDownSpy).toHaveBeenCalledTimes(2);
			expect(changeSelectedElementSpy).toHaveBeenCalledWith(resultItems[4], resultItems[3]);
			expect(changeSelectedElementSpy).toHaveBeenCalledWith(resultItems[3], resultItems[2]);
			expect(highlightResult4Spy).toHaveBeenCalledTimes(1); // [previous]
			expect(highlightResult3Spy).toHaveBeenCalledTimes(2); // [next] + [previous]
			expect(highlightResult2Spy).toHaveBeenCalledTimes(1); // [next]
		});

		it('when keyup event is fired selects the next resultItem for "enter"', async () => {
			const element = await setup();
			element.ResultItemClasses = [AbstractResultItemImpl];
			const arrowDownSpy = spyOn(element, '_arrowUp').and.callThrough();
			const enterSpy = spyOn(element, '_enter').and.callThrough();
			const changeSelectedElementSpy = spyOn(element, '_changeSelectedElement').and.callThrough();

			const testResultItems = createResultItems(5);
			testResultItems.forEach((child) => element.shadowRoot.querySelector('div').appendChild(child));

			// we set the flag-class manually to indicate a currently selected resultItem
			element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl')[4].classList.add('ba-key-nav-item_select');

			const selectResult3Spy = jasmine.createSpy('selectResult_3');

			element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl')[4].highlightResult = jasmine.createSpy();
			element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl')[3].highlightResult = jasmine.createSpy();
			element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl')[3].selectResult = selectResult3Spy;

			document.dispatchEvent(getKeyEvent(keyCodes.ArrowUp));
			document.dispatchEvent(getKeyEvent(keyCodes.Enter));

			const resultItems = element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl');

			expect(arrowDownSpy).toHaveBeenCalledTimes(1);
			expect(enterSpy).toHaveBeenCalledTimes(1);
			expect(changeSelectedElementSpy).toHaveBeenCalledWith(resultItems[4], resultItems[3]);
			expect(selectResult3Spy).toHaveBeenCalled();
		});
	});
});
