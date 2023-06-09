import { createDefaultLayer, layersReducer } from '../../../../../../../src/store/layers/layers.reducer';
import { createNoInitialStateMainMenuReducer } from '../../../../../../../src/store/mainMenu/mainMenu.reducer';
import {
	GeoResourceResultItem,
	LOADING_PREVIEW_DELAY_MS
} from '../../../../../../../src/modules/search/components/menu/types/geoResource/GeoResourceResultItem';
import { GeoResourceSearchResult } from '../../../../../../../src/modules/search/services/domain/searchResult';
import { TestUtils } from '../../../../../../test-utils.js';
import { createNoInitialStateMediaReducer } from '../../../../../../../src/store/media/media.reducer';
import { TabIds } from '../../../../../../../src/domain/mainMenu';
import { $injector } from '../../../../../../../src/injection';
import { positionReducer } from '../../../../../../../src/store/position/position.reducer';
import { Spinner } from '../../../../../../../src/modules/commons/components/spinner/Spinner';
import { GeoResourceFuture } from '../../../../../../../src/domain/geoResources';

window.customElements.define(GeoResourceResultItem.tag, GeoResourceResultItem);

describe('LAYER_ADDING_DELAY_MS', () => {
	it('exports a const defining amount of time waiting before adding a layer', async () => {
		expect(LOADING_PREVIEW_DELAY_MS).toBe(500);
	});
});

describe('GeoResourceResultItem', () => {
	const geoResourceService = {
		byId: () => {},
		addOrReplace: () => {}
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
			layers: layersReducer,
			mainMenu: createNoInitialStateMainMenuReducer(),
			media: createNoInitialStateMediaReducer(),
			position: positionReducer
		});

		$injector.registerSingleton('GeoResourceService', geoResourceService);

		return TestUtils.render(GeoResourceResultItem.tag);
	};

	describe('static methods', () => {
		it('generates an id for a temporary layer', async () => {
			expect(GeoResourceResultItem._tmpLayerId('foo')).toBe('tmp_GeoResourceResultItem_foo');
		});
	});

	describe('when initialized', () => {
		it('renders nothing when no data available', async () => {
			const element = await setup();

			expect(element.shadowRoot.children.length).toBe(0);
		});

		it('renders the view', async () => {
			const data = new GeoResourceSearchResult('id', 'label', 'labelFormatted');
			const element = await setup();

			element.data = data;

			expect(element.shadowRoot.querySelector('li').innerText).toBe('labelFormatted');
		});
	});

	describe('events', () => {
		beforeEach(() => {
			jasmine.clock().install();
		});

		afterEach(() => {
			jasmine.clock().uninstall();
		});

		describe('on mouse enter', () => {
			it('adds a preview layer', async () => {
				const geoResourceId = 'geoResourceId';
				const data = new GeoResourceSearchResult(geoResourceId, 'label', 'labelFormatted');
				const element = await setup();
				element.data = data;

				const target = element.shadowRoot.querySelector('li');
				target.dispatchEvent(new Event('mouseenter'));
				expect(element._timeoutId).not.toBeNull();
				jasmine.clock().tick(LOADING_PREVIEW_DELAY_MS + 100);

				expect(element._timeoutId).toBeNull();
				expect(store.getState().layers.active.length).toBe(1);
				expect(store.getState().layers.active[0].id).toBe(GeoResourceResultItem._tmpLayerId(geoResourceId));
				expect(store.getState().layers.active[0].constraints.hidden).toBeTrue();
				expect(store.getState().layers.active[0].geoResourceId).toBe(geoResourceId);
				expect(store.getState().position.fitLayerRequest.payload).not.toBeNull();
				expect(element.shadowRoot.querySelectorAll(Spinner.tag)).toHaveSize(0);
				expect(target.classList.contains('loading')).toBeFalse();
			});

			it('shows and hides a loading hint for a GeoResourceFuture', async () => {
				const geoResFuture = new GeoResourceFuture('geoResourceId0', async () => ({ label: 'updatedLabel' }));
				const geoResourceId = 'geoResourceId';
				const data = new GeoResourceSearchResult(geoResourceId, 'label', 'labelFormatted');
				const element = await setup();
				spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(geoResFuture);
				element.data = data;

				const target = element.shadowRoot.querySelector('li');
				target.dispatchEvent(new Event('mouseenter'));
				jasmine.clock().tick(LOADING_PREVIEW_DELAY_MS + 100);

				expect(store.getState().layers.active.length).toBe(1);
				expect(store.getState().layers.active[0].id).toBe(GeoResourceResultItem._tmpLayerId(geoResourceId));
				expect(store.getState().layers.active[0].geoResourceId).toBe(geoResourceId);
				expect(store.getState().position.fitLayerRequest.payload).not.toBeNull();
				expect(element.shadowRoot.querySelectorAll(Spinner.tag)).toHaveSize(1);
				expect(element.shadowRoot.querySelector(Spinner.tag).label).toBe('labelFormatted');
				expect(target.classList.contains('loading')).toBeTrue();

				await geoResFuture.get();

				expect(element.shadowRoot.querySelectorAll(Spinner.tag)).toHaveSize(0);
				expect(target.classList.contains('loading')).toBeFalse();
				expect(element.shadowRoot.querySelector('li').innerText).toBe('labelFormatted');
			});
		});

		describe('on mouse leave', () => {
			it('removes the preview layer', async () => {
				const geoResourceId = 'geoResourceId';
				const previewLayer = createDefaultLayer(GeoResourceResultItem._tmpLayerId(geoResourceId), geoResourceId);
				const data = new GeoResourceSearchResult(geoResourceId, 'label', 'labelFormatted');
				const element = await setup({
					layers: {
						active: [previewLayer]
					}
				});
				element.data = data;

				const target = element.shadowRoot.querySelector('li');
				target.dispatchEvent(new Event('mouseleave'));

				expect(store.getState().layers.active.length).toBe(0);
			});

			it('clears a GeoResourceFuture timeout function', async () => {
				const geoResFuture = new GeoResourceFuture('geoResourceId0', async () => ({ label: 'updatedLabel' }));
				const geoResourceId = 'geoResourceId';
				const data = new GeoResourceSearchResult(geoResourceId, 'label', 'labelFormatted');
				const element = await setup();
				spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(geoResFuture);
				element.data = data;
				const target = element.shadowRoot.querySelector('li');

				target.dispatchEvent(new Event('mouseenter'));
				expect(element.__timeoutId).not.toBeNull();

				target.dispatchEvent(new Event('mouseleave'));

				expect(element._timeoutId).toBeNull();
			});
		});

		describe('on click', () => {
			const geoResourceId = 'geoResourceId';
			// const layerId = 'layerId';

			const setupOnClickTests = async (portraitOrientation) => {
				const previewLayer = createDefaultLayer(GeoResourceResultItem._tmpLayerId(geoResourceId), geoResourceId);
				const data = new GeoResourceSearchResult(geoResourceId, 'label', 'labelFormatted');
				const element = await setup({
					layers: {
						active: [previewLayer]
					},
					mainMenu: {
						tab: TabIds.SEARCH,
						open: true
					},
					media: {
						portrait: portraitOrientation
					}
				});
				element.data = data;

				return element;
			};

			it('removes the preview layer and adds the real layer', async () => {
				const element = await setupOnClickTests();
				const target = element.shadowRoot.querySelector('li');

				target.click();

				expect(store.getState().layers.active.length).toBe(1);
				expect(store.getState().layers.active[0].id).toContain(geoResourceId);
			});

			it('opens the "maps" tab of the main menu in landscape orientation', async () => {
				const element = await setupOnClickTests(false);

				const target = element.shadowRoot.querySelector('li');
				target.click();

				expect(store.getState().mainMenu.tab).toBe(TabIds.MAPS);
				expect(store.getState().mainMenu.open).toBeTrue();
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
