import { createDefaultLayer, layersReducer } from '../../../../../../../src/store/layers/layers.reducer';
import { createNoInitialStateMainMenuReducer } from '../../../../../../../src/store/mainMenu/mainMenu.reducer';
import { GeoResourceResultItem, LAYER_ADDING_DELAY_MS } from '../../../../../../../src/modules/search/components/menu/types/geoResource/GeoResourceResultItem';
import { SearchResult, SearchResultTypes } from '../../../../../../../src/modules/search/services/domain/searchResult';
import { TestUtils } from '../../../../../../test-utils.js';
import { createNoInitialStateMediaReducer } from '../../../../../../../src/store/media/media.reducer';
import { TabId } from '../../../../../../../src/store/mainMenu/mainMenu.action';
import { $injector } from '../../../../../../../src/injection';
window.customElements.define(GeoResourceResultItem.tag, GeoResourceResultItem);


describe('LAYER_ADDING_DELAY_MS', () => {

	it('exports a const defining amount of time waiting before adding a layer', async () => {

		expect(LAYER_ADDING_DELAY_MS).toBe(500);
	});
});

describe('GeoResourceResultItem', () => {

	const geoResourceService = {
		byId: () => { }
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
			media: createNoInitialStateMediaReducer()
		});

		$injector
			.registerSingleton('GeoResourceService', geoResourceService);

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
			const data = new SearchResult('id', 'label', 'labelFormated', SearchResultTypes.GEORESOURCE);
			const element = await setup();

			element.data = data;

			expect(element.shadowRoot.querySelector('li').innerText).toBe('labelFormated');
		});
	});

	describe('events', () => {

		describe('on mouse enter', () => {

			it('adds a preview layer', async () => {
				const geoResourceId = 'geoResourceId';
				const layerId = 'layerId';
				const data = new SearchResult(geoResourceId, 'label', 'labelFormated', SearchResultTypes.GEORESOURCE, null, null, layerId);
				const element = await setup();
				element.data = data;

				const target = element.shadowRoot.querySelector('li');
				target.dispatchEvent(new Event('mouseenter'));

				expect(store.getState().layers.active.length).toBe(1);
				expect(store.getState().layers.active[0].id).toBe(GeoResourceResultItem._tmpLayerId(layerId));
			});
		});

		describe('on mouse leave', () => {

			it('removes the preview layer', async () => {
				const geoResourceId = 'geoResourceId';
				const layerId = 'layerId';
				const previewLayer = createDefaultLayer(GeoResourceResultItem._tmpLayerId(layerId), geoResourceId);
				const data = new SearchResult(geoResourceId, 'label', 'labelFormated', SearchResultTypes.GEORESOURCE, null, null, layerId);
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
		});

		describe('on click', () => {

			beforeEach(() => {
				jasmine.clock().install();
			});

			afterEach(() => {
				jasmine.clock().uninstall();
			});

			const geoResourceId = 'geoResourceId';
			const layerId = 'layerId';

			const setupOnClickTests = async (portraitOrientation) => {

				const previewLayer = createDefaultLayer(GeoResourceResultItem._tmpLayerId(layerId), geoResourceId);
				const data = new SearchResult(geoResourceId, 'label', 'labelFormated', SearchResultTypes.GEORESOURCE, null, null, layerId);
				const element = await setup({
					layers: {
						active: [previewLayer]
					},
					mainMenu: {
						tab: TabId.SEARCH,
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
				jasmine.clock().tick(LAYER_ADDING_DELAY_MS + 100);

				expect(store.getState().layers.active.length).toBe(1);
				expect(store.getState().layers.active[0].id).toBe(layerId);
				expect(store.getState().layers.active[0].label).toBe('label');
			});

			it('optionally updates the real layers label', async () => {
				spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue({ label: 'updatedLabel' });
				const element = await setupOnClickTests();
				const target = element.shadowRoot.querySelector('li');

				target.click();
				jasmine.clock().tick(LAYER_ADDING_DELAY_MS + 100);

				expect(store.getState().layers.active.length).toBe(1);
				expect(store.getState().layers.active[0].id).toBe(layerId);
				expect(store.getState().layers.active[0].label).toBe('updatedLabel');
			});

			it('opens the "maps" tab of the main menu in landscape orientation', async () => {
				const element = await setupOnClickTests(false);

				const target = element.shadowRoot.querySelector('li');
				target.click();

				expect(store.getState().mainMenu.tab).toBe(TabId.MAPS);
				expect(store.getState().mainMenu.open).toBeTrue;
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
