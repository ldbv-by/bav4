import { GeoResourceResultsPanel } from '../../../../../src/modules/search/components/menu/types/geoResource/GeoResourceResultsPanel';
import { LocationResultsPanel } from '../../../../../src/modules/search/components/menu/types/location/LocationResultsPanel';
import { SearchResultsPanel } from '../../../../../src/modules/search/components/menu/SearchResultsPanel';
import { TestUtils } from '../../../../test-utils.js';
import { AbstractMvuContentPanel } from '../../../../../src/modules/menu/components/mainMenu/content/AbstractMvuContentPanel';
import { CpResultsPanel } from '../../../../../src/modules/search/components/menu/types/cp/CpResultsPanel';
import { AbstractResultItem } from '../../../../../src/modules/search/components/menu/AbstractResultItem.js';
import { html } from 'lit-html';
import { TabIds } from '../../../../../src/domain/mainMenu.js';
import { createNoInitialStateMainMenuReducer } from '../../../../../src/store/mainMenu/mainMenu.reducer.js';
import { setQuery } from '../../../../../src/store/search/search.action.js';
import { EventLike } from '../../../../../src/utils/storeUtils.js';
import { searchReducer } from '../../../../../src/store/search/search.reducer.js';
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
	let store;
	const setup = () => {
		const initialState = {
			mainMenu: {
				open: true,
				tab: TabIds.TOPICS
			},
			search: {
				query: new EventLike(null)
			}
		};
		store = TestUtils.setupStoreAndDi(initialState, { mainMenu: createNoInitialStateMainMenuReducer(), search: searchReducer });
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
			const keyActionMapperSpy = spyOn(document, 'addEventListener').and.callThrough();

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

			// KeyActionMapper is activated
			expect(keyActionMapperSpy).toHaveBeenCalledWith('keyup', jasmine.any(Function));
			expect(keyActionMapperSpy).toHaveBeenCalledWith('keydown', jasmine.any(Function));
		});

		it('resets the key navigation when store changes', async () => {
			const element = await setup();
			element.resultItemClasses = [AbstractResultItemImpl];
			const resetSpy = spyOn(element, '_reset').and.callThrough();

			const testResultItems = createResultItems(5);
			testResultItems.forEach((child) => element.shadowRoot.querySelector('div').appendChild(child));

			const highlightResult0Spy = jasmine.createSpy('highlightResult_0');
			const highlightResult1Spy = jasmine.createSpy('highlightResult_1');
			const highlightResult2Spy = jasmine.createSpy('highlightResult_2');

			element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl')[0].highlightResult = highlightResult0Spy;
			element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl')[1].highlightResult = highlightResult1Spy;
			element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl')[2].highlightResult = highlightResult2Spy;

			document.dispatchEvent(getKeyEvent(keyCodes.ArrowDown));
			document.dispatchEvent(getKeyEvent(keyCodes.ArrowDown));

			setQuery('f');
			document.dispatchEvent(getKeyEvent(keyCodes.ArrowDown));
			document.dispatchEvent(getKeyEvent(keyCodes.ArrowDown));
			setQuery('fo');
			document.dispatchEvent(getKeyEvent(keyCodes.ArrowDown));
			document.dispatchEvent(getKeyEvent(keyCodes.ArrowDown));
			setQuery('foo');
			document.dispatchEvent(getKeyEvent(keyCodes.ArrowDown));
			document.dispatchEvent(getKeyEvent(keyCodes.ArrowDown));

			expect(resetSpy).toHaveBeenCalledTimes(3);
			expect(highlightResult0Spy).toHaveBeenCalledTimes(8); // 4*[next] + 4*[previous]
			expect(highlightResult1Spy).toHaveBeenCalledTimes(7); // 4*[next] + 3*[reset]
			expect(highlightResult2Spy).not.toHaveBeenCalled(); // --
		});

		it('resets the key navigation when mouse enters element', async () => {
			const keyActionMapperSpy = spyOn(document, 'removeEventListener').and.callThrough();
			const element = await setup();
			const resetSpy = spyOn(element, '_reset').and.callThrough();

			element.shadowRoot.querySelector('div').dispatchEvent(new Event('mouseenter'));

			expect(resetSpy).toHaveBeenCalled();
			// KeyActionMapper is deactivated
			expect(keyActionMapperSpy).toHaveBeenCalledWith('keyup', jasmine.any(Function));
			expect(keyActionMapperSpy).toHaveBeenCalledWith('keydown', jasmine.any(Function));
		});

		it('reactivates the key navigation when mouse leaves element', async () => {
			const keyActionMapperSpy = spyOn(document, 'addEventListener').and.callThrough();

			const element = await setup();

			element.shadowRoot.querySelector('div').dispatchEvent(new Event('mouseleave'));

			// KeyActionMapper is activated
			expect(keyActionMapperSpy).toHaveBeenCalledWith('keyup', jasmine.any(Function));
			expect(keyActionMapperSpy).toHaveBeenCalledWith('keydown', jasmine.any(Function));
		});

		it('highlights the next resultItem for "arrowDown" when keyup event is fired', async () => {
			const element = await setup();
			element.resultItemClasses = [AbstractResultItemImpl];
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

		it('highlights the last resultItem for "arrowDown" when keyup event is fired', async () => {
			const element = await setup();
			element.resultItemClasses = [AbstractResultItemImpl];
			const arrowDownSpy = spyOn(element, '_arrowDown').and.callThrough();
			const changeSelectedElementSpy = spyOn(element, '_changeSelectedElement').and.callThrough();

			const testResultItems = createResultItems(5);
			testResultItems.forEach((child) => element.shadowRoot.querySelector('div').appendChild(child));

			// we set the flag-class manually to indicate a currently selected resultItem
			element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl')[3].classList.add('ba-key-nav-item_select');
			const highlightResult3Spy = jasmine.createSpy('highlightResult_3');
			const highlightResult4Spy = jasmine.createSpy('highlightResult_4');

			element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl')[3].highlightResult = highlightResult3Spy;
			element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl')[4].highlightResult = highlightResult4Spy;

			document.dispatchEvent(getKeyEvent(keyCodes.ArrowDown)); // 3 -> 4
			document.dispatchEvent(getKeyEvent(keyCodes.ArrowDown)); // 4 -> 4

			const resultItems = element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl');

			expect(arrowDownSpy).toHaveBeenCalledTimes(2);
			expect(changeSelectedElementSpy).toHaveBeenCalledWith(resultItems[3], resultItems[4]);
			expect(changeSelectedElementSpy).toHaveBeenCalledWith(resultItems[4], resultItems[4]);
			expect(highlightResult3Spy).toHaveBeenCalledTimes(1); // [next] + [previous]
			expect(highlightResult4Spy).toHaveBeenCalledTimes(1); // [next] + [previous]
		});

		it('highlights the next resultItem for "arrowUp" when keyup event is fired', async () => {
			const element = await setup();
			element.resultItemClasses = [AbstractResultItemImpl];
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

		it('focuses the search after "arrowUp" when keyup event is fired', async () => {
			const element = await setup();
			element.resultItemClasses = [AbstractResultItemImpl];
			const arrowDownSpy = spyOn(element, '_arrowUp').and.callThrough();
			const changeSelectedElementSpy = spyOn(element, '_changeSelectedElement').and.callThrough();

			const testResultItems = createResultItems(5);
			testResultItems.forEach((child) => element.shadowRoot.querySelector('div').appendChild(child));

			// we set the flag-class manually to indicate a currently selected resultItem
			element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl')[1].classList.add('ba-key-nav-item_select');
			const highlightResult1Spy = jasmine.createSpy('highlightResult_1');
			const highlightResult0Spy = jasmine.createSpy('highlightResult_0');

			element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl')[1].highlightResult = highlightResult1Spy;
			element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl')[0].highlightResult = highlightResult0Spy;

			document.dispatchEvent(getKeyEvent(keyCodes.ArrowUp));
			document.dispatchEvent(getKeyEvent(keyCodes.ArrowUp));

			const resultItems = element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl');

			expect(arrowDownSpy).toHaveBeenCalledTimes(2);
			expect(changeSelectedElementSpy).toHaveBeenCalledWith(resultItems[1], resultItems[0]);
			expect(changeSelectedElementSpy).toHaveBeenCalledWith(resultItems[0], undefined);
			expect(highlightResult1Spy).toHaveBeenCalledTimes(1); // [previous]
			expect(highlightResult0Spy).toHaveBeenCalledTimes(2); // [next] + [previous]
			expect(store.getState().mainMenu.focusSearchField).not.toBeNull();
		});

		it('selects the next resultItem for "enter" when keyup event is fired', async () => {
			const element = await setup();
			element.resultItemClasses = [AbstractResultItemImpl];
			const arrowUpSpy = spyOn(element, '_arrowUp').and.callThrough();
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

			expect(arrowUpSpy).toHaveBeenCalledTimes(1);
			expect(enterSpy).toHaveBeenCalledTimes(1);
			expect(changeSelectedElementSpy).toHaveBeenCalledWith(resultItems[4], resultItems[3]);
			expect(selectResult3Spy).toHaveBeenCalled();
		});

		it('selects the second resultItem for "enter" when keyup event is fired', async () => {
			const element = await setup();
			element.resultItemClasses = [AbstractResultItemImpl];
			const arrowDownSpy = spyOn(element, '_arrowDown').and.callThrough();
			const enterSpy = spyOn(element, '_enter').and.callThrough();
			const changeSelectedElementSpy = spyOn(element, '_changeSelectedElement').and.callThrough();

			const testResultItems = createResultItems(5);
			testResultItems.forEach((child) => element.shadowRoot.querySelector('div').appendChild(child));

			const selectResultSpy = jasmine.createSpy('selectResult');

			element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl')[0].highlightResult = jasmine.createSpy();
			element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl')[1].highlightResult = jasmine.createSpy();
			element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl')[1].selectResult = selectResultSpy;

			document.dispatchEvent(getKeyEvent(keyCodes.ArrowDown));
			document.dispatchEvent(getKeyEvent(keyCodes.ArrowDown));
			document.dispatchEvent(getKeyEvent(keyCodes.Enter));

			const resultItems = element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl');

			expect(resultItems.length).toBe(5);
			expect(arrowDownSpy).toHaveBeenCalledTimes(2);
			expect(enterSpy).toHaveBeenCalledTimes(1);
			expect(changeSelectedElementSpy).toHaveBeenCalledWith(undefined, resultItems[0]);
			expect(changeSelectedElementSpy).toHaveBeenCalledWith(resultItems[0], resultItems[1]);
			expect(selectResultSpy).toHaveBeenCalled();
		});

		it('does NOT select the next resultItem for "enter" when keyup event is fired', async () => {
			const element = await setup();
			element.resultItemClasses = [AbstractResultItemImpl];
			const arrowUpSpy = spyOn(element, '_arrowUp').and.callThrough();
			const enterSpy = spyOn(element, '_enter').and.callThrough();
			const changeSelectedElementSpy = spyOn(element, '_changeSelectedElement').and.callThrough();

			const testResultItems = createResultItems(5);
			testResultItems.forEach((child) => element.shadowRoot.querySelector('div').appendChild(child));

			const selectResultSpy = jasmine.createSpy('selectResult');

			element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl').forEach((element) => (element.selectResult = selectResultSpy));

			document.dispatchEvent(getKeyEvent(keyCodes.ArrowUp));
			document.dispatchEvent(getKeyEvent(keyCodes.Enter));

			const resultItems = element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl');

			expect(resultItems.length).toBe(5);
			expect(arrowUpSpy).toHaveBeenCalledTimes(1);
			expect(enterSpy).toHaveBeenCalledTimes(1);
			expect(changeSelectedElementSpy).toHaveBeenCalledWith(undefined, undefined);
			expect(selectResultSpy).not.toHaveBeenCalled();
		});

		const getKeyUpEvent = (keyCode, target) => {
			const event = new KeyboardEvent('keyup', { code: keyCode, key: keyCode });
			spyOnProperty(event, 'target', 'get').and.returnValue(target);
			return event;
		};

		it('does nothing when keyup event is fired on other element then specified', async () => {
			const element = await setup();

			const otherElement = TestUtils.renderTemplateResult(html`<ba-foo>$</ba-foo>`).querySelector('ba-foo');
			const headerElement = TestUtils.renderTemplateResult(html`<ba-header>$</ba-header>`).querySelector('ba-header');
			const mainMenuElement = TestUtils.renderTemplateResult(html`<ba-main-menu>$</ba-main-menu>`).querySelector('ba-main-menu');

			const arrowDownSpy = spyOn(element, '_arrowDown').and.callFake(() => {});
			const arrowUpSpy = spyOn(element, '_arrowUp').and.callFake(() => {});
			const enterSpy = spyOn(element, '_enter').and.callFake(() => {});

			document.dispatchEvent(getKeyUpEvent(keyCodes.ArrowDown, otherElement));
			document.dispatchEvent(getKeyUpEvent(keyCodes.ArrowUp, otherElement));
			document.dispatchEvent(getKeyUpEvent(keyCodes.Enter, otherElement));

			expect(arrowDownSpy).not.toHaveBeenCalled();
			expect(arrowUpSpy).not.toHaveBeenCalled();
			expect(enterSpy).not.toHaveBeenCalled();

			document.dispatchEvent(getKeyUpEvent(keyCodes.ArrowDown, element));
			document.dispatchEvent(getKeyUpEvent(keyCodes.ArrowUp, element));
			document.dispatchEvent(getKeyUpEvent(keyCodes.Enter, element));

			expect(arrowDownSpy).toHaveBeenCalledTimes(1);
			expect(arrowUpSpy).toHaveBeenCalledTimes(1);
			expect(enterSpy).toHaveBeenCalledTimes(1);

			document.dispatchEvent(getKeyUpEvent(keyCodes.ArrowDown, element.parentElement));
			document.dispatchEvent(getKeyUpEvent(keyCodes.ArrowUp, element.parentElement));
			document.dispatchEvent(getKeyUpEvent(keyCodes.Enter, element.parentElement));

			expect(arrowDownSpy).toHaveBeenCalledTimes(2);
			expect(arrowUpSpy).toHaveBeenCalledTimes(2);
			expect(enterSpy).toHaveBeenCalledTimes(2);

			document.dispatchEvent(getKeyUpEvent(keyCodes.ArrowDown, document));
			document.dispatchEvent(getKeyUpEvent(keyCodes.ArrowUp, document));
			document.dispatchEvent(getKeyUpEvent(keyCodes.Enter, document));

			expect(arrowDownSpy).toHaveBeenCalledTimes(3);
			expect(arrowUpSpy).toHaveBeenCalledTimes(3);
			expect(enterSpy).toHaveBeenCalledTimes(3);

			document.dispatchEvent(getKeyUpEvent(keyCodes.ArrowDown, headerElement));
			document.dispatchEvent(getKeyUpEvent(keyCodes.ArrowUp, headerElement));
			document.dispatchEvent(getKeyUpEvent(keyCodes.Enter, headerElement));

			expect(arrowDownSpy).toHaveBeenCalledTimes(4);
			expect(arrowUpSpy).toHaveBeenCalledTimes(4);
			expect(enterSpy).toHaveBeenCalledTimes(4);

			document.dispatchEvent(getKeyUpEvent(keyCodes.ArrowDown, mainMenuElement));
			document.dispatchEvent(getKeyUpEvent(keyCodes.ArrowUp, mainMenuElement));
			document.dispatchEvent(getKeyUpEvent(keyCodes.Enter, mainMenuElement));

			expect(arrowDownSpy).toHaveBeenCalledTimes(5);
			expect(arrowUpSpy).toHaveBeenCalledTimes(5);
			expect(enterSpy).toHaveBeenCalledTimes(5);
		});
	});
});
