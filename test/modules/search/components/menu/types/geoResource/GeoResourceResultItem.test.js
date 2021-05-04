import { $injector } from '../../../../../../../src/injection';
import { addLayer } from '../../../../../../../src/modules/map/store/layers.action';
import { layersReducer } from '../../../../../../../src/modules/map/store/layers.reducer';
import { MainMenuTabIndex } from '../../../../../../../src/modules/menu/components/mainMenu/MainMenu';
import { mainMenuReducer } from '../../../../../../../src/modules/menu/store/mainMenu.reducer';
import { GeoResourceResultItem } from '../../../../../../../src/modules/search/components/menu/types/geoResource/GeoResourceResultItem';
import { SearchResult, SearchResultTypes } from '../../../../../../../src/modules/search/services/domain/searchResult';
import { TestUtils } from '../../../../../../test-utils.js';
window.customElements.define(GeoResourceResultItem.tag, GeoResourceResultItem);


describe('GeoResourceResultItem', () => {

	const windowMock = {
		matchMedia() { }
	};


	let store;
	const setup = (portraitOrientation = false) => {

		spyOn(windowMock, 'matchMedia')
			.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(portraitOrientation));

		store = TestUtils.setupStoreAndDi({}, {
			layers: layersReducer,
			mainMenu: mainMenuReducer,
		});
		$injector.registerSingleton('EnvironmentService', {
			getWindow: () => windowMock
		});
		return TestUtils.render(GeoResourceResultItem.tag);
	};

	describe('methods', () => {

		it('generates an id for a temporary layer', async () => {
			const element = await setup();

			expect(element._tmpLayerId('foo')).toBe('tmp_GeoResourceResultItem_foo');
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
				const id = 'id';
				const data = new SearchResult(id, 'label', 'labelFormated', SearchResultTypes.GEORESOURCE);
				const element = await setup();
				element.data = data;

				const target = element.shadowRoot.querySelector('li');
				target.dispatchEvent(new Event('mouseenter'));

				expect(store.getState().layers.active.length).toBe(1);
				expect(store.getState().layers.active[0].id).toBe(element._tmpLayerId(id));
			});
		});

		describe('on mouse leave', () => {

			it('removes the preview layer', async () => {
				const id = 'id';
				const data = new SearchResult(id, 'label', 'labelFormated', SearchResultTypes.GEORESOURCE);
				const element = await setup();
				element.data = data;
				addLayer(element._tmpLayerId(id));

				expect(store.getState().layers.active.length).toBe(1);

				const target = element.shadowRoot.querySelector('li');
				target.dispatchEvent(new Event('mouseleave'));

				expect(store.getState().layers.active.length).toBe(0);
			});
		});

		describe('on click', () => {

			const id = 'id';

			const setUpOnClickTests = async (portraitOrientation) => {
				
				const data = new SearchResult(id, 'label', 'labelFormated', SearchResultTypes.GEORESOURCE);
				const element = await setup(portraitOrientation);
				element.data = data;
				addLayer(element._tmpLayerId(id));

				expect(store.getState().layers.active.length).toBe(1);
				expect(store.getState().mainMenu.tabIndex).toBe(0);
				expect(store.getState().mainMenu.open).toBeTrue();
				return element;
			};

			it('removes the preview layer and adds the real layer', async () => {
				const element = await setUpOnClickTests();

				const target = element.shadowRoot.querySelector('li');
				target.click();

				expect(store.getState().layers.active.length).toBe(1);
				expect(store.getState().layers.active[0].id).toBe(id);
			});

			it('opens the "maps" tab of the main menu in landscape orientation', async () => {
				const element = await setUpOnClickTests(false);

				const target = element.shadowRoot.querySelector('li');
				target.click();

				expect(store.getState().mainMenu.tabIndex).toBe(MainMenuTabIndex.MAPS.id);
				expect(store.getState().mainMenu.open).toBeTrue;
			});

			it('closes the main menu in portrait orientation', async () => {
				const element = await setUpOnClickTests(true);

				const target = element.shadowRoot.querySelector('li');
				target.click();

				expect(store.getState().mainMenu.tabIndex).toBe(0);
				expect(store.getState().mainMenu.open).toBeFalse();
			});
		});
	});
});
