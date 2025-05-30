import { createNoInitialStateMainMenuReducer } from '../../../../../../../src/store/mainMenu/mainMenu.reducer';
import { LocationResultItem } from '../../../../../../../src/modules/search/components/menu/types/location/LocationResultItem';
import { LocationSearchResult, LocationSearchResultCategory } from '../../../../../../../src/modules/search/services/domain/searchResult';
import { highlightReducer } from '../../../../../../../src/store/highlight/highlight.reducer';
import { createNoInitialStateMediaReducer } from '../../../../../../../src/store/media/media.reducer';
import { positionReducer } from '../../../../../../../src/store/position/position.reducer';
import { TestUtils } from '../../../../../../test-utils.js';
import { $injector } from '../../../../../../../src/injection';
import { notificationReducer } from '../../../../../../../src/store/notifications/notifications.reducer';
import { Icon } from '../../../../../../../src/modules/commons/components/icon/Icon';
import { LevelTypes } from '../../../../../../../src/store/notifications/notifications.action';
import {
	SEARCH_RESULT_HIGHLIGHT_FEATURE_CATEGORY,
	SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_CATEGORY
} from '../../../../../../../src/plugins/HighlightPlugin';
import { HighlightFeatureType } from '../../../../../../../src/domain/highlightFeature.js';
import { AbstractResultItem, Highlight_Item_Class } from '../../../../../../../src/modules/search/components/menu/AbstractResultItem.js';
window.customElements.define(LocationResultItem.tag, LocationResultItem);

describe('LocationResultItem', () => {
	const shareServiceMock = {
		copyToClipboard() {}
	};
	const translationServiceMock = {
		translate: (key) => key
	};

	let store;

	const setup = (state = {}) => {
		const initialState = {
			media: {
				portrait: false
			},
			...state
		};

		store = TestUtils.setupStoreAndDi(initialState, {
			highlight: highlightReducer,
			position: positionReducer,
			mainMenu: createNoInitialStateMainMenuReducer(),
			media: createNoInitialStateMediaReducer(),
			notifications: notificationReducer
		});

		$injector.registerSingleton('ShareService', shareServiceMock).registerSingleton('TranslationService', translationServiceMock);

		return TestUtils.render(LocationResultItem.tag);
	};

	describe('class', () => {
		it('inherits from AbstractResultItem', async () => {
			const element = await setup();

			expect(element instanceof AbstractResultItem).toBeTrue();
			expect(element.selectResult).toEqual(jasmine.any(Function));
			expect(element.highlightResult).toEqual(jasmine.any(Function));
		});
	});

	describe('static properties', () => {
		it('_maxZoomValue', async () => {
			expect(LocationResultItem._maxZoomLevel).toBe(19);
		});
	});

	describe('when initialized', () => {
		it('renders nothing when no data available', async () => {
			const element = await setup();

			expect(element.shadowRoot.children.length).toBe(0);
		});

		it('renders the view', async () => {
			const data = new LocationSearchResult('label', 'labelFormatted');
			const element = await setup();

			element.data = data;

			expect(element.shadowRoot.querySelector('.ba-list-item__text').innerText).toBe('labelFormatted');
			expect(element.shadowRoot.querySelectorAll('.ba-list-item__icon')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.ba-list-item__icon')[0].title).toBe('search_result_item_category_title_default');
			expect(element.shadowRoot.querySelectorAll('.copy-button')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.copy-button')[0].title).toBe('search_result_item_copy');
		});

		it('renders the view containing an category icon', async () => {
			const data = new LocationSearchResult('label', 'labelFormatted').setCategory(LocationSearchResultCategory.School);
			const element = await setup();

			element.data = data;

			expect(element.shadowRoot.querySelector('.ba-list-item__text').innerText).toBe('labelFormatted');
			expect(element.shadowRoot.querySelectorAll(`.ba-list-item__icon.${LocationSearchResultCategory.School}`)).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.ba-list-item__icon')[0].title).toBe(
				`search_result_item_category_title_${LocationSearchResultCategory.School}`
			);
			expect(element.shadowRoot.querySelectorAll('.copy-button')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.copy-button')[0].title).toBe('search_result_item_copy');
		});
	});

	describe('events', () => {
		describe('on mouse enter', () => {
			it('sets a temporary highlight feature', async () => {
				const coordinate = [21, 42];
				const data = new LocationSearchResult('label', 'labelFormatted', coordinate);
				const element = await setup();
				element.data = data;

				const target = element.shadowRoot.querySelector('li');
				target.dispatchEvent(new Event('mouseenter'));

				expect(store.getState().highlight.features).toHaveSize(1);
				expect(store.getState().highlight.features[0].data).toEqual(coordinate);
				expect(store.getState().highlight.features[0].type).toBe(HighlightFeatureType.MARKER_TMP);
				expect(store.getState().highlight.features[0].category).toBe(SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_CATEGORY);
				expect(store.getState().highlight.features[0].id).toBeInstanceOf(String);
				expect(element.classList.contains(Highlight_Item_Class)).toBeTrue();
			});
		});

		describe('on mouse leave', () => {
			it('removes a temporary highlight feature', async () => {
				const coordinate = [21, 42];
				const data = new LocationSearchResult('label', 'labelFormatted', coordinate);
				const element = await setup({
					highlight: {
						features: [{ category: SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_CATEGORY, data: coordinate }]
					}
				});
				element.data = data;
				element.classList.add(Highlight_Item_Class);

				const target = element.shadowRoot.querySelector('li');
				target.dispatchEvent(new Event('mouseleave'));

				expect(store.getState().highlight.features).toHaveSize(0);
				expect(element.classList.contains(Highlight_Item_Class)).toBeFalse();
			});
		});

		it('copies a location to the clipboard', async () => {
			const coordinate = [21, 42];
			const data = new LocationSearchResult('label', 'labelFormatted', coordinate);
			const copyToClipboardMock = spyOn(shareServiceMock, 'copyToClipboard').and.returnValue(Promise.resolve());
			const element = await setup();

			element.data = data;

			const copyIcon = element.shadowRoot.querySelector(Icon.tag);
			copyIcon.click();

			expect(copyToClipboardMock).toHaveBeenCalledWith('label');
			await TestUtils.timeout();
			//check notification
			expect(store.getState().notifications.latest.payload.content).toBe(`"${'label'}" search_result_item_clipboard_success`);
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
		});

		describe('Clipboard API is not available', () => {
			it('fires a notification and logs a warn statement', async () => {
				const coordinate = [21, 42];
				const data = new LocationSearchResult('label', 'labelFormatted', coordinate);
				spyOn(shareServiceMock, 'copyToClipboard').and.returnValue(Promise.reject(new Error('something got wrong')));
				const warnSpy = spyOn(console, 'warn');
				const element = await setup();

				element.data = data;

				const copyIcon = element.shadowRoot.querySelector(Icon.tag);

				copyIcon.click();

				await TestUtils.timeout();
				expect(store.getState().notifications.latest.payload.content).toBe('search_result_item_clipboard_error');
				expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
				expect(warnSpy).toHaveBeenCalledWith('Clipboard API not available');
			});
		});

		describe('on click', () => {
			const previousCoordinate = [1, 2];
			const coordinate = [21, 42];
			const extent = [0, 1, 2, 3];

			const setupOnClickTests = async (portraitOrientation, extent = null) => {
				const data = new LocationSearchResult('label', 'labelFormatted', coordinate, extent);
				const element = await setup({
					highlight: {
						features: [
							{ category: SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_CATEGORY, data: previousCoordinate },
							{ category: SEARCH_RESULT_HIGHLIGHT_FEATURE_CATEGORY, data: previousCoordinate }
						]
					},
					mainMenu: {
						open: true
					},
					media: {
						portrait: portraitOrientation
					}
				});
				element.data = data;
				return element;
			};

			describe('result has NO extent', () => {
				it('removes both an existing and temporary highlight feature and set the permanent highlight feature', async () => {
					const element = await setupOnClickTests();

					const target = element.shadowRoot.querySelector('li');
					target.click();

					expect(store.getState().highlight.features).toHaveSize(1);
					expect(store.getState().highlight.features[0].category).toEqual(SEARCH_RESULT_HIGHLIGHT_FEATURE_CATEGORY);
					expect(store.getState().highlight.features[0].data).toEqual(coordinate);
					expect(store.getState().highlight.features[0].type).toBe(HighlightFeatureType.MARKER);
					expect(store.getState().highlight.features[0].label).toBe('label');
					expect(store.getState().highlight.features[0].id).toBeInstanceOf(String);
				});

				it('fits the map by a coordinate', async () => {
					const element = await setupOnClickTests();

					const target = element.shadowRoot.querySelector('li');
					target.click();

					expect(store.getState().position.fitRequest.payload.extent).toEqual([...coordinate, ...coordinate]);
					expect(store.getState().position.fitRequest.payload.options.maxZoom).toBe(LocationResultItem._maxZoomLevel);
				});
			});

			describe('result has an extent', () => {
				it('removes both an existing and temporary highlight feature and sets NO highlight feature when we have an extent', async () => {
					const element = await setupOnClickTests(false, extent);

					const target = element.shadowRoot.querySelector('li');
					target.click();

					expect(store.getState().highlight.features).toHaveSize(0);
				});

				it('fits the map by an extent', async () => {
					const element = await setupOnClickTests(false, extent);

					const target = element.shadowRoot.querySelector('li');
					target.click();

					expect(store.getState().position.fitRequest.payload.extent).toEqual(extent);
					expect(store.getState().position.fitRequest.payload.options.maxZoom).toBe(LocationResultItem._maxZoomLevel);
				});
			});

			it('closes the main menu in portrait orientation', async () => {
				const element = await setupOnClickTests(true);

				const target = element.shadowRoot.querySelector('li');
				target.click();

				expect(store.getState().mainMenu.open).toBeFalse();
			});
		});
	});
});
