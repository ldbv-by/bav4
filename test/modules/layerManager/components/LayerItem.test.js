import { LayerItem } from '../../../../src/modules/layerManager/components/LayerItem';
import { Checkbox } from '../../../../src/modules/commons/components/checkbox/Checkbox';
import { Icon } from '../../../../src/modules/commons/components/icon/Icon';
import { layersReducer, createDefaultLayerProperties } from '../../../../src/store/layers/layers.reducer';
import { TestUtils } from '../../../test-utils';
import { $injector } from '../../../../src/injection';
import { modalReducer } from '../../../../src/store/modal/modal.reducer';
import { isTemplateResult } from '../../../../src/utils/checks';
import { TEST_ID_ATTRIBUTE_NAME } from '../../../../src/utils/markup';
import { EventLike } from '../../../../src/utils/storeUtils';
import { positionReducer } from '../../../../src/store/position/position.reducer';
import { GeoResourceFuture, VectorGeoResource, VectorSourceType, WmsGeoResource } from '../../../../src/domain/geoResources';
import { Spinner } from '../../../../src/modules/commons/components/spinner/Spinner';

window.customElements.define(LayerItem.tag, LayerItem);
window.customElements.define(Checkbox.tag, Checkbox);
window.customElements.define(Icon.tag, Icon);

describe('LayerItem', () => {
	const createNewDataTransfer = () => {
		let data = {};
		return {
			clearData: function (key) {
				if (key === undefined) {
					data = {};
				} else {
					delete data[key];
				}
			},
			getData: function (key) {
				return data[key];
			},
			setData: function (key, value) {
				data[key] = value;
			},
			setDragImage: function () {},
			dropEffect: 'none',
			files: [],
			items: [],
			types: []
			// also effectAllowed
		};
	};

	describe('when layer item is rendered', () => {
		const geoResourceService = { byId: () => {}, addOrReplace: () => {} };

		const setup = async (layer) => {
			TestUtils.setupStoreAndDi(
				{},
				{
					layers: layersReducer
				}
			);
			$injector.registerSingleton('TranslationService', { translate: (key) => key }).registerSingleton('GeoResourceService', geoResourceService);
			const element = await TestUtils.render(LayerItem.tag);
			if (layer) {
				element.layer = layer;
			}
			return element;
		};

		it('displays nothing for null', async () => {
			const element = await setup(null);

			expect(element.innerHTML).toBe('');
		});

		it('displays the GeoResource label as label', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 0,
				opacity: 1,
				collapsed: true
			};
			const element = await setup(layer);
			const label = element.shadowRoot.querySelector('.ba-list-item__text');

			expect(label.innerText).toBe('label0');
		});

		it('use layer.label property in checkbox-title ', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 0,
				opacity: 1,
				collapsed: true
			};
			const element = await setup(layer);
			const toggle = element.shadowRoot.querySelector('ba-checkbox');

			expect(toggle.title).toBe('label0 - layerManager_change_visibility');
		});

		it('use layer.opacity-property in slider ', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 0,
				opacity: 0.55,
				collapsed: true
			};
			const element = await setup(layer);

			const slider = element.shadowRoot.querySelector('.opacity-slider');
			expect(slider.value).toBe('55');
		});

		it('use layer.visible-property in checkbox ', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'geoResourceId0',
				visible: false,
				zIndex: 0,
				opacity: 1,
				collapsed: true
			};
			const element = await setup(layer);
			const toggle = element.shadowRoot.querySelector('ba-checkbox');

			expect(toggle.checked).toBe(false);
		});

		it('use layer.collapsed-property in element style ', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 0,
				opacity: 1,
				collapsed: false
			};
			const element = await setup(layer);
			const layerBody = element.shadowRoot.querySelector('.collapse-content');
			const collapseButton = element.shadowRoot.querySelector('.ba-list-item button');

			expect(layerBody.classList.contains('iscollapse')).toBeFalse();

			element.signal('update_layer_collapsed', true);
			expect(layerBody.classList.contains('iscollapse')).toBeTrue();
			expect(collapseButton.classList.contains('iconexpand')).toBeFalse();
		});

		it('slider-elements stops dragstart-event propagation ', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 0,
				opacity: 1,
				collapsed: false
			};
			const element = await setup(layer);

			const slider = element.shadowRoot.querySelector('.opacity-slider');
			const sliderContainer = element.shadowRoot.querySelector('.slider-container');
			const dragstartContainerSpy = jasmine.createSpy();
			const dragstartSliderSpy = jasmine.createSpy();
			slider.addEventListener('dragstart', dragstartSliderSpy);
			sliderContainer.addEventListener('dragstart', dragstartContainerSpy);

			const dragstartEvt = document.createEvent('MouseEvents');
			dragstartEvt.initMouseEvent('dragstart', true, true, window, 1, 1, 1, 0, 0, false, false, false, false, 0, slider);
			dragstartEvt.dataTransfer = createNewDataTransfer();
			slider.dispatchEvent(dragstartEvt);

			expect(dragstartSliderSpy).toHaveBeenCalled();
			expect(dragstartContainerSpy).not.toHaveBeenCalled();
		});

		it('displays a overflow-menu', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 0,
				opacity: 1,
				collapsed: true
			};
			const element = await setup(layer);

			expect(element.shadowRoot.querySelector('ba-overflow-menu')).toBeTruthy();
		});

		it('contains a menu-item for info', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 0,
				opacity: 1,
				collapsed: true
			};
			const element = await setup(layer);

			const menu = element.shadowRoot.querySelector('ba-overflow-menu');
			const infoMenuItem = menu.items.find((item) => item.label === 'Info');

			expect(infoMenuItem).not.toBeNull();
			expect(infoMenuItem.label).toEqual('Info');
			expect(infoMenuItem.action).toEqual(jasmine.any(Function));
			expect(infoMenuItem.disabled).toBeFalse();
			expect(infoMenuItem.icon).toContain('data:image/svg+xml;base64,PHN2ZyB4bWxuc');
		});

		it('contains a disabled menu-item for info', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 0,
				opacity: 1,
				collapsed: true,
				constraints: { metaData: false }
			};
			const element = await setup(layer);

			const menu = element.shadowRoot.querySelector('ba-overflow-menu');
			const infoMenuItem = menu.items.find((item) => item.label === 'Info');

			expect(infoMenuItem).not.toBeNull();
			expect(infoMenuItem.label).toEqual('Info');
			expect(infoMenuItem.action).toEqual(jasmine.any(Function));
			expect(infoMenuItem.disabled).toBeTrue();
			expect(infoMenuItem.icon).toContain('data:image/svg+xml;base64,PHN2ZyB4bWxuc');
		});

		it('contains a menu-item for copy', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 0,
				opacity: 1,
				collapsed: true
			};
			const element = await setup(layer);

			const menu = element.shadowRoot.querySelector('ba-overflow-menu');
			const copyMenuItem = menu.items.find((item) => item.label === 'layerManager_to_copy');

			expect(copyMenuItem).not.toBeNull();
			expect(copyMenuItem.label).toEqual('layerManager_to_copy');
			expect(copyMenuItem.action).toEqual(jasmine.any(Function));
			expect(copyMenuItem.disabled).toBeFalse();
			expect(copyMenuItem.icon).toContain('data:image/svg+xml;base64,PD94bWwgdmVyc2l');
		});

		it('contains a menu-item for zoomToExtent', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 0,
				opacity: 1,
				collapsed: true
			};
			const element = await setup(layer);

			const menu = element.shadowRoot.querySelector('ba-overflow-menu');
			const zoomToExtentMenuItem = menu.items.find((item) => item.label === 'layerManager_zoom_to_extent');

			expect(zoomToExtentMenuItem).not.toBeNull();
			expect(zoomToExtentMenuItem.label).toEqual('layerManager_zoom_to_extent');
			expect(zoomToExtentMenuItem.action).toEqual(jasmine.any(Function));
			expect(zoomToExtentMenuItem.disabled).toBeFalse();
			expect(zoomToExtentMenuItem.icon).toContain('data:image/svg+xml;base64,PD94bWwgdmVyc2l');
		});

		it('contains a disabled menu-item for zoomToExtent', async () => {
			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 0,
				opacity: 1,
				collapsed: true,
				constraints: { cloneable: false }
			};
			spyOn(geoResourceService, 'byId').withArgs('geoResourceId0').and.returnValue(new WmsGeoResource('geoResourceId0', 'id0', '', [], ''));
			const element = await setup(layer);

			const menu = element.shadowRoot.querySelector('ba-overflow-menu');
			const zoomToExtentMenuItem = menu.items.find((item) => item.label === 'layerManager_zoom_to_extent');

			expect(zoomToExtentMenuItem).not.toBeNull();
			expect(zoomToExtentMenuItem.label).toEqual('layerManager_zoom_to_extent');
			expect(zoomToExtentMenuItem.action).toEqual(jasmine.any(Function));
			expect(zoomToExtentMenuItem.disabled).toBeTrue();
			expect(zoomToExtentMenuItem.icon).toContain('data:image/svg+xml;base64,PD94bWwgdmVyc2l');
		});

		it('contains test-id attributes', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 0,
				opacity: 1,
				collapsed: true
			};
			const element = await setup(layer);

			expect(element.shadowRoot.querySelector('#button-detail').hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();
		});

		it('uses geoResourceId for a InfoPanel ', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 0,
				opacity: 1,
				collapsed: true
			};
			const element = await setup(layer);
			const spy = spyOn(element, '_getInfoPanelFor').and.callThrough();

			const menu = element.shadowRoot.querySelector('ba-overflow-menu');
			const infoMenuItem = menu.items.find((item) => item.label === 'Info');
			infoMenuItem.action();

			expect(spy).toHaveBeenCalledWith(layer.geoResourceId);
		});

		it('does not show a loading hint for Non-GeoResourceFutures', async () => {
			const geoResourceId = 'geoResourceId0';
			spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(new VectorGeoResource(geoResourceId, 'label0', VectorSourceType.KML));
			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: geoResourceId,
				visible: true,
				zIndex: 0,
				opacity: 1,
				collapsed: true
			};
			const element = await setup(layer);

			expect(element.shadowRoot.querySelectorAll(Spinner.tag)).toHaveSize(0);
		});

		it('shows a loading hint for GeoResourceFutures', async () => {
			const geoResourceId = 'geoResourceId0';
			spyOn(geoResourceService, 'byId')
				.withArgs(geoResourceId)
				.and.returnValue(new GeoResourceFuture(geoResourceId, async () => {}));
			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: geoResourceId,
				visible: true,
				zIndex: 0,
				opacity: 1,
				collapsed: true
			};
			const element = await setup(layer);

			expect(element.shadowRoot.querySelectorAll(Spinner.tag)).toHaveSize(1);
			expect(element.shadowRoot.querySelector(Spinner.tag).label).toBe('layerManager_loading_hint');
		});
	});

	describe('when user interacts with layer item', () => {
		const geoResourceService = { byId: () => {} };
		const layer = {
			...createDefaultLayerProperties(),
			id: 'id0',
			geoResourceId: 'geoResourceId0',
			visible: true,
			zIndex: 0,
			opacity: 1
		};

		const setup = () => {
			const state = {
				layers: {
					active: [layer],
					background: 'bg0'
				},
				position: {
					fitRequest: new EventLike(null)
				}
			};
			const store = TestUtils.setupStoreAndDi(state, {
				layers: layersReducer,
				modal: modalReducer,
				position: positionReducer
			});
			$injector.registerSingleton('TranslationService', { translate: (key) => key }).registerSingleton('GeoResourceService', geoResourceService);
			return store;
		};

		it('click on layer toggle change state in store', async () => {
			const store = setup();
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			const element = await TestUtils.render(LayerItem.tag);
			element.layer = { ...layer, collapsed: true };

			const checkbox = element.shadowRoot.querySelector('ba-checkbox');

			checkbox.click();
			const actualLayer = store.getState().layers.active[0];
			expect(actualLayer.visible).toBeFalse();
		});

		it('click on opacity slider change state in store', async () => {
			const store = setup();
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			const element = await TestUtils.render(LayerItem.tag);
			element.layer = { ...layer };

			const slider = element.shadowRoot.querySelector('.opacity-slider');
			slider.value = 66;
			slider.dispatchEvent(new Event('input'));

			const actualLayer = store.getState().layers.active[0];
			expect(actualLayer.opacity).toBe(0.66);
		});

		it('click on opacity slider change style-property', async () => {
			setup();
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			const element = await TestUtils.render(LayerItem.tag);
			element.layer = { ...layer };

			// explicit call to fake/step over render-phase
			element.onAfterRender(true);
			const slider = element.shadowRoot.querySelector('.opacity-slider');
			slider.value = 66;
			const propertySpy = spyOn(slider.style, 'setProperty').withArgs('--track-fill', `${slider.value}%`).and.callThrough();

			slider.dispatchEvent(new Event('input'));

			expect(propertySpy).toHaveBeenCalled();
		});

		it("click on opacity slider without 'max'-attribute change style-property", async () => {
			setup();
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			const element = await TestUtils.render(LayerItem.tag);
			element.layer = { ...layer };

			// explicit call to fake/step over render-phase
			element.onAfterRender(true);
			const slider = element.shadowRoot.querySelector('.opacity-slider');
			slider.value = 66;
			spyOn(slider, 'getAttribute').withArgs('max').and.returnValue(null);
			const propertySpy = spyOn(slider.style, 'setProperty').withArgs('--track-fill', `${slider.value}%`).and.callThrough();

			slider.dispatchEvent(new Event('input'));

			expect(propertySpy).toHaveBeenCalled();
		});

		it('click on layer collapse button change collapsed property', async () => {
			setup();
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			const element = await TestUtils.render(LayerItem.tag);
			element.layer = { ...layer, collapsed: true };

			const collapseButton = element.shadowRoot.querySelector('button');
			collapseButton.click();

			expect(element.getModel().layer.collapsed).toBeFalse();
		});

		it('click on info icon show georesourceinfo panel as modal', async () => {
			const store = setup();
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			const element = await TestUtils.render(LayerItem.tag);
			element.layer = { ...layer };

			const menu = element.shadowRoot.querySelector('ba-overflow-menu');
			const infoMenuItem = menu.items.find((item) => item.label === 'Info');
			infoMenuItem.action();

			expect(store.getState().modal.data.title).toBe('label0');
			expect(isTemplateResult(store.getState().modal.data.content)).toBeTrue();
		});

		it('click on zoomToExtent icon changes state in store', async () => {
			const store = setup();
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			const element = await TestUtils.render(LayerItem.tag);
			element.layer = { ...layer };

			const menu = element.shadowRoot.querySelector('ba-overflow-menu');
			const zoomToExtentMenuItem = menu.items.find((item) => item.label === 'layerManager_zoom_to_extent');
			zoomToExtentMenuItem.action();

			expect(store.getState().position.fitLayerRequest.payload.id).toEqual('id0');
		});
	});

	describe('when user change order of layer in group', () => {
		const geoResourceService = { byId: () => {} };
		let store;
		const setup = (state) => {
			store = TestUtils.setupStoreAndDi(state, { layers: layersReducer });
			$injector.registerSingleton('TranslationService', { translate: (key) => key }).registerSingleton('GeoResourceService', geoResourceService);
			return store;
		};

		it('click on increase-button change state in store', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			const layer0 = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 0,
				opacity: 1
			};
			const layer1 = {
				...createDefaultLayerProperties(),
				id: 'id1',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 1,
				opacity: 1
			};
			const layer2 = {
				...createDefaultLayerProperties(),
				id: 'id2',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 2,
				opacity: 1
			};
			const state = {
				layers: {
					active: [layer0, layer1, layer2],
					background: 'bg0'
				}
			};
			const store = setup(state);
			const element = await TestUtils.render(LayerItem.tag);
			element.layer = { ...layer0 };

			expect(store.getState().layers.active[0].id).toBe('id0');
			expect(store.getState().layers.active[1].id).toBe('id1');
			expect(store.getState().layers.active[2].id).toBe('id2');
			const increaseButton = element.shadowRoot.querySelector('#increase');
			increaseButton.click();

			expect(store.getState().layers.active[0].id).toBe('id1');
			expect(store.getState().layers.active[1].id).toBe('id0');
			expect(store.getState().layers.active[2].id).toBe('id2');
		});

		it('click on decrease-button change state in store', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			const layer0 = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 0,
				opacity: 1
			};
			const layer1 = {
				...createDefaultLayerProperties(),
				id: 'id1',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 1,
				opacity: 1
			};
			const layer2 = {
				...createDefaultLayerProperties(),
				id: 'id2',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 2,
				opacity: 1
			};
			const state = {
				layers: {
					active: [layer0, layer1, layer2],
					background: 'bg0'
				}
			};
			const store = setup(state);
			const element = await TestUtils.render(LayerItem.tag);
			element.layer = { ...layer2 };

			expect(store.getState().layers.active[0].id).toBe('id0');
			expect(store.getState().layers.active[1].id).toBe('id1');
			expect(store.getState().layers.active[2].id).toBe('id2');
			const decreaseButton = element.shadowRoot.querySelector('#decrease');
			decreaseButton.click();
			expect(store.getState().layers.active.length).toBe(3);
			expect(store.getState().layers.active[0].id).toBe('id0');
			expect(store.getState().layers.active[1].id).toBe('id2');
			expect(store.getState().layers.active[2].id).toBe('id1');
		});

		it('click on decrease-button for first layer change not state in store', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			const layer0 = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 0,
				opacity: 1
			};
			const layer1 = {
				...createDefaultLayerProperties(),
				id: 'id1',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 1,
				opacity: 1
			};
			const layer2 = {
				...createDefaultLayerProperties(),
				id: 'id2',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 2,
				opacity: 1
			};
			const state = {
				layers: {
					active: [layer0, layer1, layer2],
					background: 'bg0'
				}
			};
			const store = setup(state);
			const element = await TestUtils.render(LayerItem.tag);
			element.layer = { ...layer0 };

			expect(store.getState().layers.active[0].id).toBe('id0');
			expect(store.getState().layers.active[1].id).toBe('id1');
			expect(store.getState().layers.active[2].id).toBe('id2');
			const decreaseButton = element.shadowRoot.querySelector('#decrease');
			decreaseButton.click();
			expect(store.getState().layers.active.length).toBe(3);
			expect(store.getState().layers.active[0].id).toBe('id0');
			expect(store.getState().layers.active[1].id).toBe('id1');
			expect(store.getState().layers.active[2].id).toBe('id2');
		});

		it("click on 'copy' icon adds a layer copy", async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			const layer0 = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 0,
				opacity: 1
			};

			const state = {
				layers: {
					active: [layer0],
					background: 'bg0'
				}
			};
			const store = setup(state);
			const element = await TestUtils.render(LayerItem.tag);
			element.layer = { ...layer0 };

			expect(store.getState().layers.active[0].id).toBe('id0');

			const menu = element.shadowRoot.querySelector('ba-overflow-menu');
			const copyMenuItem = menu.items.find((item) => item.label === 'layerManager_to_copy');
			copyMenuItem.action();

			expect(store.getState().layers.active[0].id).toBe(layer0.id);
			expect(store.getState().layers.active[1].id.startsWith('geoResourceId0_')).toBeTrue();
			expect(store.getState().layers.active[1].geoResourceId).toBe(layer0.geoResourceId);
		});

		it('click on remove-button change state in store', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			const layer0 = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 0,
				opacity: 1
			};
			const layer1 = {
				...createDefaultLayerProperties(),
				id: 'id1',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 1,
				opacity: 1
			};
			const layer2 = {
				...createDefaultLayerProperties(),
				id: 'id2',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 2,
				opacity: 1
			};
			const state = {
				layers: {
					active: [layer0, layer1, layer2],
					background: 'bg0'
				}
			};
			const store = setup(state);
			const element = await TestUtils.render(LayerItem.tag);
			element.layer = { ...layer0 };

			expect(store.getState().layers.active[0].id).toBe('id0');
			expect(store.getState().layers.active[1].id).toBe('id1');
			expect(store.getState().layers.active[2].id).toBe('id2');
			const decreaseButton = element.shadowRoot.querySelector('#remove');
			decreaseButton.click();
			expect(store.getState().layers.active.length).toBe(2);
			expect(store.getState().layers.active[0].id).toBe('id1');
			expect(store.getState().layers.active[1].id).toBe('id2');
		});
	});

	describe('event handling', () => {
		const layer = {
			...createDefaultLayerProperties(),
			id: 'id0',
			geoResourceId: 'geoResourceId0',
			visible: true,
			zIndex: 0,
			opacity: 1,
			collapsed: true
		};
		const geoResourceService = { byId: () => {} };

		const setup = () => {
			const store = TestUtils.setupStoreAndDi({}, { layers: layersReducer, modal: modalReducer });
			$injector.registerSingleton('TranslationService', { translate: (key) => key }).registerSingleton('GeoResourceService', geoResourceService);
			return store;
		};
		describe('on collapse', () => {
			it('calls the onCollapse callback via property callback', async () => {
				setup();
				spyOn(geoResourceService, 'byId')
					.withArgs('geoResourceId0')
					.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
				const element = await TestUtils.render(LayerItem.tag);

				element.layer = { ...layer }; // collapsed = true is initialized
				element.onCollapse = jasmine.createSpy();
				const collapseButton = element.shadowRoot.querySelector('button');

				collapseButton.click();

				expect(element.getModel().layer.collapsed).toBeFalse();

				collapseButton.click();

				expect(element.getModel().layer.collapsed).toBeTrue();
				expect(element._onCollapse).toHaveBeenCalledTimes(2);
			});
		});
	});
});
