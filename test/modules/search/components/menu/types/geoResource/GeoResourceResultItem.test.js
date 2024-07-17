import { GeoResourceFuture, VectorGeoResource } from '../../../../../../../src/domain/geoResources';
import { $injector } from '../../../../../../../src/injection';
import { Spinner } from '../../../../../../../src/modules/commons/components/spinner/Spinner';
import {
	GeoResourceResultItem,
	LOADING_PREVIEW_DELAY_MS
} from '../../../../../../../src/modules/search/components/menu/types/geoResource/GeoResourceResultItem';
import { GeoResourceSearchResult } from '../../../../../../../src/modules/search/services/domain/searchResult';
import { createDefaultLayer, layersReducer } from '../../../../../../../src/store/layers/layers.reducer';
import { positionReducer } from '../../../../../../../src/store/position/position.reducer';
import { TestUtils } from '../../../../../../test-utils.js';
import { GeoResourceInfoPanel } from '../../../../../../../src/modules/geoResourceInfo/components/GeoResourceInfoPanel';
import { modalReducer } from '../../../../../../../src/store/modal/modal.reducer';

window.customElements.define(GeoResourceResultItem.tag, GeoResourceResultItem);

describe('LAYER_ADDING_DELAY_MS', () => {
	it('exports a const defining amount of time waiting before adding a layer', async () => {
		expect(LOADING_PREVIEW_DELAY_MS).toBe(500);
	});
});

describe('GeoResourceResultItem', () => {
	const geoResourceService = {
		byId: () => {},
		addOrReplace: () => {},
		getKeywords: () => [],
		isAllowed: () => true
	};

	let store;
	const setup = (state = {}) => {
		store = TestUtils.setupStoreAndDi(state, {
			layers: layersReducer,
			position: positionReducer,
			modal: modalReducer
		});

		$injector.registerSingleton('GeoResourceService', geoResourceService);
		$injector.registerSingleton('TranslationService', { translate: (key) => key });

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

			expect(element.shadowRoot.querySelector('li .ba-list-item__text').innerText).toBe('labelFormatted');
			expect(element.shadowRoot.querySelectorAll('ba-badge')).toHaveSize(0); // no badge, due to empty keyword-array
			//info button
			expect(element.shadowRoot.querySelectorAll('ba-icon')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.ba-list-item__after')).toHaveSize(1);
		});

		it('renders the view containing keyword badges', async () => {
			const data = new GeoResourceSearchResult('id', 'label', 'labelFormatted');
			spyOn(geoResourceService, 'getKeywords').withArgs('id').and.returnValue(['Foo', 'Bar']);
			const element = await setup();

			element.data = data;

			expect(element.shadowRoot.querySelector('li .ba-list-item__text').innerText).toBe('labelFormatted');
			expect(element.shadowRoot.querySelectorAll('ba-badge')).toHaveSize(2);
			expect(element.shadowRoot.querySelectorAll('ba-badge')[0].label).toBe('Foo');
			expect(element.shadowRoot.querySelectorAll('ba-badge')[1].label).toBe('Bar');
			//info button
			expect(element.shadowRoot.querySelectorAll('ba-icon')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.ba-list-item__after')).toHaveSize(1);
		});

		it('renders a zoom to extent Button for a VectorGeoResource', async () => {
			const geoResVector = new VectorGeoResource('geoResourceId0', async () => ({ label: 'updatedLabel' }));
			const geoResourceId = 'geoResourceId';
			const data = new GeoResourceSearchResult(geoResourceId, 'label', 'labelFormatted');
			const element = await setup();
			spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(geoResVector);
			element.data = data;

			// info and zoom to extent
			expect(element.shadowRoot.querySelectorAll('ba-icon')).toHaveSize(2);
			expect(element.shadowRoot.querySelectorAll('.ba-list-item__after')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.separator')).toHaveSize(1);

			const button = element.shadowRoot.querySelector('ba-icon');
			expect(button.title).toBe('search_result_item_zoom_to_extent');
			expect(button.size).toBe(2);
			expect(button.color).toBe('var(--primary-color)');
			expect(button.color_hover).toBe('var(--text3)');
		});

		it('renders no zoom to extent Button for a NOT Allowed VectorGeoResource', async () => {
			const geoResVector = new VectorGeoResource('geoResourceId0', async () => ({ label: 'updatedLabel' }));
			const geoResourceId = 'geoResourceId';
			const data = new GeoResourceSearchResult(geoResourceId, 'label', 'labelFormatted');
			spyOn(geoResourceService, 'isAllowed').withArgs(geoResourceId).and.returnValue(false);
			spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(geoResVector);
			const element = await setup();
			element.data = data;

			//info Icon
			expect(element.shadowRoot.querySelectorAll('ba-icon')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.ba-list-item__after')).toHaveSize(1);
		});

		it('checkbox is not checked if layer not active', async () => {
			const geoResourceId = 'geoResourceId';
			const data = new GeoResourceSearchResult(geoResourceId, 'label', 'labelFormatted');
			const element = await setup();
			element.data = data;

			const checkbox = element.shadowRoot.querySelector('#toggle_layer');

			expect(checkbox.checked).toBeFalse();
		});

		it('checkbox is checked if layer already active', async () => {
			const geoResourceId = 'geoResourceId';
			const layer = createDefaultLayer('id1', geoResourceId);
			const data = new GeoResourceSearchResult(geoResourceId, 'label', 'labelFormatted');
			const element = await setup({
				layers: {
					active: [layer]
				}
			});
			element.data = data;

			const checkbox = element.shadowRoot.querySelector('#toggle_layer');

			expect(checkbox.checked).toBeTrue();
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
			describe('GeoResource is allowed to access', () => {
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
					expect(element.shadowRoot.querySelectorAll(Spinner.tag)).toHaveSize(0);
					expect(target.classList.contains('loading')).toBeFalse();
				});
			});
			describe('GeoResource is NOT allowed to access', () => {
				it('does nothing', async () => {
					const geoResourceId = 'geoResourceId';
					const data = new GeoResourceSearchResult(geoResourceId, 'label', 'labelFormatted');
					spyOn(geoResourceService, 'isAllowed').withArgs(geoResourceId).and.returnValue(false);
					const element = await setup();
					element.data = data;

					const target = element.shadowRoot.querySelector('li');
					target.dispatchEvent(new Event('mouseenter'));
					expect(element._timeoutId).toBeNull();
					jasmine.clock().tick(LOADING_PREVIEW_DELAY_MS + 100);

					expect(element._timeoutId).toBeNull();
					expect(store.getState().layers.active.length).toBe(0);
					expect(store.getState().position.fitLayerRequest.payload).toBeNull();
				});
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
				expect(element.shadowRoot.querySelectorAll(Spinner.tag)).toHaveSize(1);
				expect(element.shadowRoot.querySelector(Spinner.tag).label).toBe('labelFormatted');
				expect(target.classList.contains('loading')).toBeTrue();

				await geoResFuture.get();

				expect(element.shadowRoot.querySelectorAll(Spinner.tag)).toHaveSize(0);
				expect(target.classList.contains('loading')).toBeFalse();
				expect(element.shadowRoot.querySelector('li .ba-list-item__text').innerText).toBe('labelFormatted');
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

		describe('the user clicks the result item', () => {
			const geoResourceId = 'geoResourceId';
			const setupOnClickTests = async (state = {}) => {
				const previewLayer = createDefaultLayer(GeoResourceResultItem._tmpLayerId(geoResourceId), geoResourceId);
				const data = new GeoResourceSearchResult(geoResourceId, 'label', 'labelFormatted');
				const element = await setup({
					layers: {
						active: [previewLayer]
					},
					...state
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

			it('does not add a layer when GeoResource id is unknown', async () => {
				const element = await setupOnClickTests({ layers: { active: [] } });
				const target = element.shadowRoot.querySelector('li');
				spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(null);

				target.click();

				expect(store.getState().layers.active.length).toBe(0);
			});

			it('sets the opacity to the the correct value', async () => {
				const element = await setupOnClickTests();
				spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue({ opacity: 0.5 });

				const checkbox = element.shadowRoot.querySelector('#toggle_layer');

				checkbox.dispatchEvent(
					new CustomEvent('toggle', {
						detail: { checked: true }
					})
				);

				expect(store.getState().layers.active[0].opacity).toBe(0.5);
			});
		});

		describe('when GeoResource id is already active', () => {
			const layerId0 = 'layerId0';
			const layerId1 = 'layerId1';
			const geoResourceId = 'geoResourceId';

			const layer0 = createDefaultLayer(layerId0, geoResourceId);
			const layer1 = createDefaultLayer(layerId1, geoResourceId);

			describe('on mouse enter', () => {
				it('does not add a preview layer', async () => {
					const data = new GeoResourceSearchResult(geoResourceId, 'label', 'labelFormatted');
					const state = {
						layers: {
							active: [layer0],
							background: 'bg0'
						}
					};
					const element = await setup(state);
					element.data = data;

					const target = element.shadowRoot.querySelector('li');
					target.dispatchEvent(new Event('mouseenter'));
					expect(element._timeoutId).toBeNull();
					jasmine.clock().tick(LOADING_PREVIEW_DELAY_MS + 100);

					expect(element._timeoutId).toBeNull();
					expect(store.getState().layers.active.length).toBe(1);
					expect(store.getState().layers.active[0].id).toBe(layerId0);
				});
			});

			describe('on click', () => {
				const setupOnClickTests = async () => {
					const data = new GeoResourceSearchResult(geoResourceId, 'label', 'labelFormatted');
					const state = {
						layers: {
							active: [layer0, layer1]
						}
					};
					const element = await setup(state);
					element.data = data;

					return element;
				};

				it('removes all layers with this geoResourceId', async () => {
					const element = await setupOnClickTests();
					const checkbox = element.shadowRoot.querySelector('#toggle_layer');

					checkbox.dispatchEvent(
						new CustomEvent('toggle', {
							detail: { checked: true }
						})
					);

					expect(store.getState().layers.active.length).toBe(0);
				});
			});
		});

		describe('the user clicks the zoom-to-extent button', () => {
			describe('when GeoResource id is already active', () => {
				it('zooms to the extent of the already existing layer', async () => {
					const geoResourceId0 = 'geoResourceId0';
					const layerId0 = 'layerId0';
					const layer0 = createDefaultLayer(layerId0, geoResourceId0);
					const geoResVector = new VectorGeoResource(geoResourceId0, async () => ({ label: 'updatedLabel' }));
					const data = new GeoResourceSearchResult(geoResourceId0, 'label', 'labelFormatted');
					const state = {
						layers: {
							active: [layer0]
						}
					};
					const element = await setup(state);
					spyOn(geoResourceService, 'byId').withArgs(geoResourceId0).and.returnValue(geoResVector);
					element.data = data;

					const button = element.shadowRoot.querySelector('ba-icon');
					button.click();

					expect(store.getState().position.fitLayerRequest.payload.id).toBe(layerId0);
				});
			});

			describe('when GeoResource id is not active', () => {
				it('zooms to the extent of the temp layer', async () => {
					const geoResourceId0 = 'geoResourceId0';
					const geoResVector = new VectorGeoResource(geoResourceId0, async () => ({ label: 'updatedLabel' }));
					const data = new GeoResourceSearchResult(geoResourceId0, 'label', 'labelFormatted');
					const element = await setup();
					spyOn(geoResourceService, 'byId').withArgs(geoResourceId0).and.returnValue(geoResVector);
					element.data = data;

					const button = element.shadowRoot.querySelector('ba-icon');
					button.click();

					expect(store.getState().position.fitLayerRequest.payload.id).toContain(geoResourceId0);
				});
			});
		});

		describe('the user clicks the info button ', () => {
			it('shows the GeoResource info panel as modal', async () => {
				const geoResVector = new VectorGeoResource('geoResourceId0', async () => ({ label: 'updatedLabel' }));
				const geoResourceId = 'geoResourceId';
				const data = new GeoResourceSearchResult(geoResourceId, 'label', 'labelFormatted');
				const element = await setup();
				spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(geoResVector);
				element.data = data;

				const infoButton = element.shadowRoot.querySelector('.info-button');
				infoButton.click();

				expect(store.getState().modal.data.title).toBe('labelFormatted');
				const wrapperElement = TestUtils.renderTemplateResult(store.getState().modal.data.content);
				expect(wrapperElement.querySelectorAll(GeoResourceInfoPanel.tag)).toHaveSize(1);
				expect(wrapperElement.querySelector(GeoResourceInfoPanel.tag).geoResourceId).toBe('geoResourceId');
			});
		});
	});
});
