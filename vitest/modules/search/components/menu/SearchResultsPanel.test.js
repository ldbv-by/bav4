import { GeoResourceResultsPanel } from '@src/modules/search/components/menu/types/geoResource/GeoResourceResultsPanel';
import { LocationResultsPanel } from '@src/modules/search/components/menu/types/location/LocationResultsPanel';
import { SearchResultsPanel } from '@src/modules/search/components/menu/SearchResultsPanel';
import { TestUtils } from '@test/test-utils.js';
import { AbstractMvuContentPanel } from '@src/modules/menu/components/mainMenu/content/AbstractMvuContentPanel';
import { CpResultsPanel } from '@src/modules/search/components/menu/types/cp/CpResultsPanel';
import { AbstractResultItem, Highlight_Item_Class, Selected_Item_Class } from '@src/modules/search/components/menu/AbstractResultItem.js';
import { html } from 'lit-html';
import { TabIds } from '@src/domain/mainMenu.js';
import { createNoInitialStateMainMenuReducer } from '@src/store/mainMenu/mainMenu.reducer.js';
import { setQuery } from '@src/store/search/search.action.js';
import { EventLike } from '@src/utils/storeUtils.js';
import { searchReducer } from '@src/store/search/search.reducer.js';
window.customElements.define(SearchResultsPanel.tag, SearchResultsPanel);

class AbstractResultItemImpl extends AbstractResultItem {
	createView() {
		return html`<div></div>`;
	}

	/**
	 * @override
	 */
	selectResult() {
		this.classList.add(Selected_Item_Class);
	}

	/**
	 * @override
	 */
	highlightResult(highlighted) {
		if (highlighted) {
			this.classList.add(Highlight_Item_Class);
		} else {
			this.classList.remove(Highlight_Item_Class);
		}
	}

	static get tag() {
		return 'ba-test-abstract-result-item-impl';
	}
}
window.customElements.define(AbstractResultItemImpl.tag, AbstractResultItemImpl);

describe.skip('SearchResultsPanel', () => {
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

			expect(element instanceof AbstractMvuContentPanel).toBe(true);
		});
	});

	describe('when initialized', () => {
		const getKeyEvent = (key, options = {}) => {
			return new KeyboardEvent('keyup', { key: key, ...options });
		};

		it('renders the view', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelector('.search-results-panel')).toBeTruthy();
			expect(element.shadowRoot.querySelector(LocationResultsPanel.tag)).toBeTruthy();
			expect(element.shadowRoot.querySelector(GeoResourceResultsPanel.tag)).toBeTruthy();
			expect(element.shadowRoot.querySelector(CpResultsPanel.tag)).toBeTruthy();
		});

		it('activates key mappings', async () => {
			const keyActionMapperSpy = vi.spyOn(document, 'addEventListener');

			const element = await setup();
			const arrowDownSpy = vi.spyOn(element, '_arrowDown').mockImplementation(() => {});
			const arrowUpSpy = vi.spyOn(element, '_arrowUp').mockImplementation(() => {});
			const enterSpy = vi.spyOn(element, '_enter').mockImplementation(() => {});

			document.dispatchEvent(getKeyEvent(keyCodes.ArrowDown));
			document.dispatchEvent(getKeyEvent(keyCodes.ArrowUp));
			document.dispatchEvent(getKeyEvent(keyCodes.Enter));

			expect(arrowDownSpy).toHaveBeenCalled();
			expect(arrowUpSpy).toHaveBeenCalled();
			expect(enterSpy).toHaveBeenCalled();

			// KeyActionMapper is activated
			expect(keyActionMapperSpy).toHaveBeenCalledWith('keyup', expect.any(Function));
			expect(keyActionMapperSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
		});

		it('resets the key navigation when store changes', async () => {
			const element = await setup();
			element.resultItemClasses = [AbstractResultItemImpl];
			const resetSpy = vi.spyOn(element, '_reset');

			const testResultItems = createResultItems(5);
			testResultItems.forEach((child) => element.shadowRoot.querySelector('div').appendChild(child));

			const resultElements = element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl');
			const highlightResult0Spy = vi.spyOn(resultElements[0], 'highlightResult');
			const highlightResult1Spy = vi.spyOn(resultElements[1], 'highlightResult');
			const highlightResult2Spy = vi.spyOn(resultElements[2], 'highlightResult');

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
			expect(highlightResult0Spy).toHaveBeenCalledTimes(10);
			expect(highlightResult1Spy).toHaveBeenCalledTimes(9);
			expect(highlightResult2Spy).toHaveBeenCalledTimes(6);
			expect(highlightResult0Spy).toHaveBeenCalledWith(expect.any(Boolean));
			expect(highlightResult1Spy).toHaveBeenCalledWith(expect.any(Boolean));
			expect(highlightResult2Spy).toHaveBeenCalledWith(false);
		});

		it('highlights the next resultItem for "arrowDown" when keyup event is fired', async () => {
			const element = await setup();
			element.resultItemClasses = [AbstractResultItemImpl];
			const arrowDownSpy = vi.spyOn(element, '_arrowDown');
			const changeSelectedElementSpy = vi.spyOn(element, '_changeSelectedElement');

			const testResultItems = createResultItems(5);
			testResultItems.forEach((child) => element.shadowRoot.querySelector('div').appendChild(child));

			const resultElements = element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl');
			const highlightResult0Spy = vi.spyOn(resultElements[0], 'highlightResult');
			const highlightResult1Spy = vi.spyOn(resultElements[1], 'highlightResult');
			const scrollIntoView0Spy = vi.spyOn(resultElements[0], 'scrollIntoView');
			const scrollIntoView1Spy = vi.spyOn(resultElements[1], 'scrollIntoView');

			document.dispatchEvent(getKeyEvent(keyCodes.ArrowDown));
			document.dispatchEvent(getKeyEvent(keyCodes.ArrowDown));

			const resultItems = [...element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl')];

			expect(arrowDownSpy).toHaveBeenCalledTimes(2);
			expect(changeSelectedElementSpy).toHaveBeenCalledWith(-1, 0, resultItems);
			expect(changeSelectedElementSpy).toHaveBeenCalledWith(0, 1, resultItems);
			expect(highlightResult0Spy).toHaveBeenCalledTimes(2);
			expect(highlightResult1Spy).toHaveBeenCalledTimes(2);

			expect(scrollIntoView0Spy).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'auto', block: 'nearest', inline: 'start' }));
			expect(scrollIntoView1Spy).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'auto', block: 'nearest', inline: 'start' }));
		});

		it('does NOT highlight the next resultItem for "arrowDown" when keyup event along with ShiftKey is fired', async () => {
			const element = await setup();
			element.resultItemClasses = [AbstractResultItemImpl];
			const arrowDownSpy = vi.spyOn(element, '_arrowDown');
			const changeSelectedElementSpy = vi.spyOn(element, '_changeSelectedElement');

			const testResultItems = createResultItems(5);
			testResultItems.forEach((child) => element.shadowRoot.querySelector('div').appendChild(child));

			const resultElements = element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl');
			const highlightResult0Spy = vi.spyOn(resultElements[0], 'highlightResult');
			const highlightResult1Spy = vi.spyOn(resultElements[1], 'highlightResult');

			document.dispatchEvent(getKeyEvent(keyCodes.ArrowDown, { shiftKey: true }));
			document.dispatchEvent(getKeyEvent(keyCodes.ArrowDown, { shiftKey: true }));

			expect(arrowDownSpy).toHaveBeenCalledTimes(2);
			expect(changeSelectedElementSpy).not.toHaveBeenCalled();
			expect(highlightResult0Spy).not.toHaveBeenCalled();
			expect(highlightResult1Spy).not.toHaveBeenCalled();
		});

		it('highlights the last resultItem for "arrowDown" when keyup event is fired', async () => {
			const element = await setup();
			element.resultItemClasses = [AbstractResultItemImpl];
			const arrowDownSpy = vi.spyOn(element, '_arrowDown');
			const changeSelectedElementSpy = vi.spyOn(element, '_changeSelectedElement');

			const testResultItems = createResultItems(5);
			testResultItems.forEach((child) => element.shadowRoot.querySelector('div').appendChild(child));

			const resultElements = element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl');
			// we set the flag-class manually to indicate a currently selected resultItem
			resultElements[3].highlightResult(true);
			const highlightResult3Spy = vi.spyOn(resultElements[3], 'highlightResult');
			const highlightResult4Spy = vi.spyOn(resultElements[4], 'highlightResult');

			const scrollIntoView4Spy = vi.spyOn(resultElements[4], 'scrollIntoView');

			document.dispatchEvent(getKeyEvent(keyCodes.ArrowDown)); // 3 -> 4
			document.dispatchEvent(getKeyEvent(keyCodes.ArrowDown)); // 4 -> 4

			const resultItems = [...element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl')];

			expect(arrowDownSpy).toHaveBeenCalledTimes(2);
			expect(changeSelectedElementSpy).toHaveBeenCalledWith(3, 4, resultItems);
			expect(changeSelectedElementSpy).toHaveBeenCalledWith(4, 4, resultItems);
			expect(highlightResult3Spy).toHaveBeenCalledTimes(1); // [next] + [previous]
			expect(highlightResult4Spy).toHaveBeenCalledTimes(2); // [next] + [previous]

			expect(scrollIntoView4Spy).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'auto', block: 'nearest', inline: 'start' }));
		});

		it('highlights the next resultItem for "arrowUp" when keyup event is fired', async () => {
			const element = await setup();
			element.resultItemClasses = [AbstractResultItemImpl];
			const arrowDownSpy = vi.spyOn(element, '_arrowUp');
			const changeSelectedElementSpy = vi.spyOn(element, '_changeSelectedElement');

			const testResultItems = createResultItems(5);
			testResultItems.forEach((child) => element.shadowRoot.querySelector('div').appendChild(child));

			const resultElements = element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl');
			// we set the flag-class manually to indicate a currently selected resultItem
			resultElements[4].highlightResult(true);

			const highlightResult4Spy = vi.spyOn(resultElements[4], 'highlightResult');
			const highlightResult3Spy = vi.spyOn(resultElements[3], 'highlightResult');
			const highlightResult2Spy = vi.spyOn(resultElements[2], 'highlightResult');

			document.dispatchEvent(getKeyEvent(keyCodes.ArrowUp));
			document.dispatchEvent(getKeyEvent(keyCodes.ArrowUp));

			const resultItems = [...element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl')];

			expect(arrowDownSpy).toHaveBeenCalledTimes(2);
			expect(changeSelectedElementSpy).toHaveBeenCalledWith(4, 3, resultItems);
			expect(changeSelectedElementSpy).toHaveBeenCalledWith(3, 2, resultItems);
			expect(highlightResult4Spy).toHaveBeenCalledTimes(2);
			expect(highlightResult3Spy).toHaveBeenCalledTimes(3);
			expect(highlightResult2Spy).toHaveBeenCalledTimes(3);
		});

		it('does NOT highlight the next resultItem for "arrowUp" when keyup event along with ShiftKey is fired', async () => {
			const element = await setup();
			element.resultItemClasses = [AbstractResultItemImpl];
			const arrowDownSpy = vi.spyOn(element, '_arrowUp');
			const changeSelectedElementSpy = vi.spyOn(element, '_changeSelectedElement');

			const testResultItems = createResultItems(5);
			testResultItems.forEach((child) => element.shadowRoot.querySelector('div').appendChild(child));

			const resultElements = element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl');
			// we set the flag-class manually to indicate a currently selected resultItem
			resultElements[4].highlightResult(true);

			const highlightResult4Spy = vi.spyOn(resultElements[4], 'highlightResult');
			const highlightResult3Spy = vi.spyOn(resultElements[3], 'highlightResult');
			const highlightResult2Spy = vi.spyOn(resultElements[2], 'highlightResult');

			document.dispatchEvent(getKeyEvent(keyCodes.ArrowUp, { shiftKey: true }));
			document.dispatchEvent(getKeyEvent(keyCodes.ArrowUp, { shiftKey: true }));

			expect(arrowDownSpy).toHaveBeenCalledTimes(2);
			expect(changeSelectedElementSpy).not.toHaveBeenCalled();
			expect(highlightResult4Spy).not.toHaveBeenCalled();
			expect(highlightResult3Spy).not.toHaveBeenCalled();
			expect(highlightResult2Spy).not.toHaveBeenCalled();
		});
		describe('when resultItem is selected by mouse', () => {
			it('highlights the next resultItem for "arrowUp" when keyup event is fired', async () => {
				const element = await setup();
				element.resultItemClasses = [AbstractResultItemImpl];
				const arrowDownSpy = vi.spyOn(element, '_arrowUp');
				const changeSelectedElementSpy = vi.spyOn(element, '_changeSelectedElement');

				const testResultItems = createResultItems(5);
				testResultItems.forEach((child) => element.shadowRoot.querySelector('div').appendChild(child));

				const resultElements = element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl');
				// we set the flag-class manually to indicate a currently selected resultItem
				resultElements[4].highlightResult(true);

				document.dispatchEvent(getKeyEvent(keyCodes.ArrowUp));
				document.dispatchEvent(getKeyEvent(keyCodes.ArrowUp));

				resultElements[4].selectResult();

				document.dispatchEvent(getKeyEvent(keyCodes.ArrowUp));
				document.dispatchEvent(getKeyEvent(keyCodes.ArrowUp));

				const resultItems = [...element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl')];

				expect(arrowDownSpy).toHaveBeenCalledTimes(4);
				expect(changeSelectedElementSpy).toHaveBeenCalledWith(4, 3, resultItems);
				expect(changeSelectedElementSpy).toHaveBeenCalledWith(3, 2, resultItems);
				expect(changeSelectedElementSpy).toHaveBeenCalledWith(4, 3, resultItems);
				expect(changeSelectedElementSpy).toHaveBeenCalledWith(3, 2, resultItems);

				expect(changeSelectedElementSpy).not.toHaveBeenCalledWith(2, 1, resultItems);
				expect(changeSelectedElementSpy).not.toHaveBeenCalledWith(1, 0, resultItems);
			});

			it('highlights the next resultItem for "arrowDown" when keyup event is fired', async () => {
				const element = await setup();
				element.resultItemClasses = [AbstractResultItemImpl];
				const arrowDownSpy = vi.spyOn(element, '_arrowDown');
				const changeSelectedElementSpy = vi.spyOn(element, '_changeSelectedElement');

				const testResultItems = createResultItems(5);
				testResultItems.forEach((child) => element.shadowRoot.querySelector('div').appendChild(child));

				const resultElements = element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl');
				// we set the flag-class manually to indicate a currently selected resultItem
				resultElements[0].highlightResult(true);

				document.dispatchEvent(getKeyEvent(keyCodes.ArrowDown));
				document.dispatchEvent(getKeyEvent(keyCodes.ArrowDown));

				resultElements[0].selectResult();

				document.dispatchEvent(getKeyEvent(keyCodes.ArrowDown));
				document.dispatchEvent(getKeyEvent(keyCodes.ArrowDown));

				const resultItems = [...element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl')];

				expect(arrowDownSpy).toHaveBeenCalledTimes(4);
				expect(changeSelectedElementSpy).toHaveBeenCalledWith(0, 1, resultItems);
				expect(changeSelectedElementSpy).toHaveBeenCalledWith(1, 2, resultItems);
				expect(changeSelectedElementSpy).toHaveBeenCalledWith(0, 1, resultItems);
				expect(changeSelectedElementSpy).toHaveBeenCalledWith(1, 2, resultItems);

				expect(changeSelectedElementSpy).not.toHaveBeenCalledWith(2, 3, resultItems);
				expect(changeSelectedElementSpy).not.toHaveBeenCalledWith(3, 4, resultItems);
			});
		});

		describe('when mouse and key events mixed', () => {
			it.only('highlights the next resultItem for "arrowUp" when keyup event is fired', async () => {
				const element = await setup();
				element.resultItemClasses = [AbstractResultItemImpl];
				const arrowUpSpy = vi.spyOn(element, '_arrowUp');
				const changeSelectedElementSpy = vi.spyOn(element, '_changeSelectedElement');

				const testResultItems = createResultItems(5);
				testResultItems.forEach((child) => element.shadowRoot.querySelector('div').appendChild(child));

				const resultElements = element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl');
				// we set the flag-class manually to indicate a currently selected resultItem
				resultElements[4].highlightResult(true);

				document.dispatchEvent(getKeyEvent(keyCodes.ArrowUp));
				document.dispatchEvent(getKeyEvent(keyCodes.ArrowUp));

				resultElements[2].highlightResult(true);

				const matchesCallThrough = resultElements[4].matches;
				vi.spyOn(resultElements[4], 'matches').mockImplementation((arg) => {
					switch (arg) {
						case ':is(:hover)':
							return true;
						case '.ba-key-nav-item_highlight':
							return true;
						case ':is(ba-test-abstract-result-item-impl)':
							return resultElements[4].matches(arg);
						case '.ba-mouse-nav-item_select':
							return resultElements[4].matches(arg);
						default:
							return undefined;
					}
				});

				document.dispatchEvent(getKeyEvent(keyCodes.ArrowUp));
				document.dispatchEvent(getKeyEvent(keyCodes.ArrowUp));

				const resultItems = [...element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl')];

				expect(arrowUpSpy).toHaveBeenCalledTimes(4);
				expect(changeSelectedElementSpy).toHaveBeenCalledWith(4, 3, resultItems);
				expect(changeSelectedElementSpy).toHaveBeenCalledWith(3, 2, resultItems);
				expect(changeSelectedElementSpy).toHaveBeenCalledWith(2, 1, resultItems);
				expect(changeSelectedElementSpy).toHaveBeenCalledWith(1, 0, resultItems);
			});

			it.only('highlights the next resultItem for "arrowDown" when keyup event is fired', async () => {
				const element = await setup();
				element.resultItemClasses = [AbstractResultItemImpl];
				const arrowDownSpy = vi.spyOn(element, '_arrowDown');
				const changeSelectedElementSpy = vi.spyOn(element, '_changeSelectedElement');

				const testResultItems = createResultItems(5);
				testResultItems.forEach((child) => element.shadowRoot.querySelector('div').appendChild(child));

				const resultElements = element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl');
				// we set the flag-class manually to indicate a currently selected resultItem
				resultElements[0].highlightResult(true);

				document.dispatchEvent(getKeyEvent(keyCodes.ArrowDown));
				document.dispatchEvent(getKeyEvent(keyCodes.ArrowDown));

				resultElements[2].highlightResult(true);

				// used to manually mimic hover pseudo-class for mouse/pointer interactions
				vi.spyOn(resultElements[0], 'matches').mockImplementation(function (arg) {
					switch (arg) {
						case ':is(:hover)':
							return true;
						case '.ba-key-nav-item_highlight':
							return true;
						case ':is(ba-test-abstract-result-item-impl)':
							return true;
						case '.ba-mouse-nav-item_select':
							return false;
						default:
							return undefined;
					}
				});

				document.dispatchEvent(getKeyEvent(keyCodes.ArrowDown));
				document.dispatchEvent(getKeyEvent(keyCodes.ArrowDown));

				const resultItems = [...element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl')];

				expect(arrowDownSpy).toHaveBeenCalledTimes(4);
				expect(changeSelectedElementSpy).toHaveBeenCalledWith(0, 1, resultItems);
				expect(changeSelectedElementSpy).toHaveBeenCalledWith(1, 2, resultItems);
				expect(changeSelectedElementSpy).toHaveBeenCalledWith(2, 3, resultItems);
				expect(changeSelectedElementSpy).toHaveBeenCalledWith(3, 4, resultItems);
			});
		});

		it('focuses the search after "arrowUp" when keyup event is fired', async () => {
			const element = await setup();
			element.resultItemClasses = [AbstractResultItemImpl];
			const arrowDownSpy = vi.spyOn(element, '_arrowUp');
			const changeSelectedElementSpy = vi.spyOn(element, '_changeSelectedElement');

			const testResultItems = createResultItems(5);
			testResultItems.forEach((child) => element.shadowRoot.querySelector('div').appendChild(child));

			const resultElements = element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl');
			// we set the flag-class manually to indicate a currently selected resultItem
			resultElements[1].highlightResult(true);
			const highlightResult1Spy = vi.spyOn(resultElements[1], 'highlightResult');
			const highlightResult0Spy = vi.spyOn(resultElements[0], 'highlightResult');

			document.dispatchEvent(getKeyEvent(keyCodes.ArrowUp));
			document.dispatchEvent(getKeyEvent(keyCodes.ArrowUp));

			const resultItems = [...element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl')];

			expect(arrowDownSpy).toHaveBeenCalledTimes(2);
			expect(changeSelectedElementSpy).toHaveBeenCalledWith(1, 0, resultItems);
			expect(changeSelectedElementSpy).toHaveBeenCalledWith(0, -1, resultItems);
			expect(highlightResult1Spy).toHaveBeenCalledTimes(2); // [previous]
			expect(highlightResult0Spy).toHaveBeenCalledTimes(3); // [next] + [previous]
			expect(store.getState().mainMenu.focusSearchField).not.toBeNull();
		});

		it('selects the next resultItem for "enter" when keyup event is fired', async () => {
			const element = await setup();
			element.resultItemClasses = [AbstractResultItemImpl];
			const arrowUpSpy = vi.spyOn(element, '_arrowUp');
			const enterSpy = vi.spyOn(element, '_enter');
			const changeSelectedElementSpy = vi.spyOn(element, '_changeSelectedElement');

			const testResultItems = createResultItems(5);
			testResultItems.forEach((child) => element.shadowRoot.querySelector('div').appendChild(child));

			const resultElements = element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl');
			// we set the flag-class manually to indicate a currently selected resultItem
			resultElements[4].highlightResult(true);
			const selectResult3Spy = vi.spyOn(resultElements[3], 'selectResult');

			document.dispatchEvent(getKeyEvent(keyCodes.ArrowUp));
			document.dispatchEvent(getKeyEvent(keyCodes.Enter));

			const resultItems = [...element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl')];

			expect(arrowUpSpy).toHaveBeenCalledTimes(1);
			expect(enterSpy).toHaveBeenCalledTimes(1);
			expect(changeSelectedElementSpy).toHaveBeenCalledWith(4, 3, resultItems);
			expect(selectResult3Spy).toHaveBeenCalled();
		});

		it('selects the second resultItem for "enter" when keyup event is fired', async () => {
			const element = await setup();
			element.resultItemClasses = [AbstractResultItemImpl];
			const arrowDownSpy = vi.spyOn(element, '_arrowDown');
			const enterSpy = vi.spyOn(element, '_enter');
			const changeSelectedElementSpy = vi.spyOn(element, '_changeSelectedElement');

			const testResultItems = createResultItems(5);
			testResultItems.forEach((child) => element.shadowRoot.querySelector('div').appendChild(child));

			const resultElements = element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl');
			const selectResultSpy = vi.spyOn(resultElements[1], 'selectResult');

			document.dispatchEvent(getKeyEvent(keyCodes.ArrowDown));
			document.dispatchEvent(getKeyEvent(keyCodes.ArrowDown));
			document.dispatchEvent(getKeyEvent(keyCodes.Enter));

			const resultItems = [...element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl')];

			expect(resultItems.length).toBe(5);
			expect(arrowDownSpy).toHaveBeenCalledTimes(2);
			expect(enterSpy).toHaveBeenCalledTimes(1);
			expect(changeSelectedElementSpy).toHaveBeenCalledWith(-1, 0, resultItems);
			expect(changeSelectedElementSpy).toHaveBeenCalledWith(0, 1, resultItems);
			expect(selectResultSpy).toHaveBeenCalled();
		});

		it('does NOT select the next resultItem for "enter" when keyup event is fired', async () => {
			const element = await setup();
			element.resultItemClasses = [AbstractResultItemImpl];
			const arrowUpSpy = vi.spyOn(element, '_arrowUp');
			const enterSpy = vi.spyOn(element, '_enter');
			const changeSelectedElementSpy = vi.spyOn(element, '_changeSelectedElement');

			const testResultItems = createResultItems(5);
			testResultItems.forEach((child) => element.shadowRoot.querySelector('div').appendChild(child));

			const selectResultSpy = vi.fn().mockName('selectResult');

			element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl').forEach((element) => (element.selectResult = selectResultSpy));

			document.dispatchEvent(getKeyEvent(keyCodes.ArrowUp));
			document.dispatchEvent(getKeyEvent(keyCodes.Enter));

			const resultItems = [...element.shadowRoot.querySelectorAll('ba-test-abstract-result-item-impl')];

			expect(resultItems.length).toBe(5);
			expect(arrowUpSpy).toHaveBeenCalledTimes(1);
			expect(enterSpy).toHaveBeenCalledTimes(1);
			expect(changeSelectedElementSpy).toHaveBeenCalledWith(-1, -1, resultItems);
			expect(selectResultSpy).not.toHaveBeenCalled();
		});

		const getKeyUpEvent = (keyCode, target) => {
			const event = new KeyboardEvent('keyup', { code: keyCode, key: keyCode });
			vi.spyOn(event, 'target', 'get').mockReturnValue(target);
			return event;
		};

		it('does nothing when keyup event is fired on other element then specified', async () => {
			const element = await setup();

			const otherElement = TestUtils.renderTemplateResult(html`<ba-foo>$</ba-foo>`).querySelector('ba-foo');
			const headerElement = TestUtils.renderTemplateResult(html`<ba-header>$</ba-header>`).querySelector('ba-header');
			const mainMenuElement = TestUtils.renderTemplateResult(html`<ba-main-menu>$</ba-main-menu>`).querySelector('ba-main-menu');

			const arrowDownSpy = vi.spyOn(element, '_arrowDown').mockImplementation(() => {});
			const arrowUpSpy = vi.spyOn(element, '_arrowUp').mockImplementation(() => {});
			const enterSpy = vi.spyOn(element, '_enter').mockImplementation(() => {});

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
