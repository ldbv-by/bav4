import { LayerItem } from '../../../../src/modules/layerManager/components/LayerItem';
import { layersReducer, createDefaultLayerProperties, createDefaultLayersConstraints } from '../../../../src/store/layers/layers.reducer';
import { layerSwipeReducer } from '../../../../src/store/layerSwipe/layerSwipe.reducer';
import { TestUtils } from '../../../test-utils';
import { $injector } from '../../../../src/injection';
import { modalReducer } from '../../../../src/store/modal/modal.reducer';
import { isTemplateResult } from '../../../../src/utils/checks';
import { TEST_ID_ATTRIBUTE_NAME } from '../../../../src/utils/markup';
import { EventLike } from '../../../../src/utils/storeUtils';
import { positionReducer } from '../../../../src/store/position/position.reducer';
import {
	GeoResourceFuture,
	GeoResourceTypes,
	OafGeoResource,
	VectorGeoResource,
	VectorSourceType,
	WmsGeoResource,
	XyzGeoResource
} from '../../../../src/domain/geoResources';
import { Spinner } from '../../../../src/modules/commons/components/spinner/Spinner';
import { timeTravelReducer } from '../../../../src/store/timeTravel/timeTravel.reducer.js';
import { GeoResourceInfoPanel } from '../../../../src/modules/geoResourceInfo/components/GeoResourceInfoPanel';
import cloneSvg from '../../../../src/modules/layerManager/components/assets/clone.svg';
import zoomToExtentSvg from '../../../../src/modules/layerManager/components/assets/zoomToExtent.svg';
import settingsSvg from '../../../../src/modules/layerManager/components/assets/settings_small.svg';
import infoSvg from '../../../../src/assets/icons/info.svg';
import oafSettingsSvg from '../../../../src/modules/layerManager/components/assets/oafSetting.svg';
import oafSettingsActiveSvg from '../../../../src/modules/layerManager/components/assets/oafSettingActive.svg';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer';
import { LayerState, SwipeAlignment } from '../../../../src/store/layers/layers.action.js';
import { toolsReducer } from '../../../../src/store/tools/tools.reducer';
import { LevelTypes } from '../../../../src/store/notifications/notifications.action';
import { notificationReducer } from '../../../../src/store/notifications/notifications.reducer';

window.customElements.define(LayerItem.tag, LayerItem);

describe('LayerItem', () => {
	const environmentService = {
		isTouch: () => false
	};
	const geoResourceService = { byId: () => {}, addOrReplace: () => {}, getKeywords: () => [] };
	const fileStorageService = { isAdminId: () => false };
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

	let store;

	const setup = async (layer = null, collapsed = true, layerSwipeActive) => {
		store = TestUtils.setupStoreAndDi(
			{
				layers: {
					active: layer ? [layer] : []
				},
				media: {
					portrait: false
				},
				layerSwipe: {
					active: layerSwipeActive
				}
			},
			{
				layers: layersReducer,
				modal: modalReducer,
				media: createNoInitialStateMediaReducer(),
				timeTravel: timeTravelReducer,
				layerSwipe: layerSwipeReducer,
				tools: toolsReducer,
				notifications: notificationReducer
			}
		);
		$injector
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('GeoResourceService', geoResourceService)
			.registerSingleton('FileStorageService', fileStorageService)
			.registerSingleton('EnvironmentService', environmentService);

		const element = await TestUtils.render(LayerItem.tag, { layerId: layer?.id, collapsed: collapsed });
		return element;
	};

	describe('_showZoomToExtentMenuItem', () => {
		it('returns a list of zoom-to-extent capable GeoResources', async () => {
			expect(LayerItem._getZoomToExtentCapableGeoResources()).toEqual([GeoResourceTypes.VECTOR, GeoResourceTypes.RT_VECTOR, GeoResourceTypes.OAF]);
		});
	});

	describe('when layer item is rendered', () => {
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

		it('displays GeoResource keywords as badge', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			spyOn(geoResourceService, 'getKeywords')
				.withArgs('geoResourceId0')
				.and.returnValue([
					{ name: 'keyword0', description: 'description0' },
					{ name: 'keyword1', description: null }
				]);

			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 0,
				opacity: 1
			};
			const element = await setup(layer);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.ba-list-item-badges')).display).toBe('flex');
			const badges = element.shadowRoot.querySelectorAll('.ba-list-item-badges ba-badge');

			const badgeWithDescription = Array.from(badges).find((b) => b.label === 'keyword0');

			expect(badgeWithDescription.color).toBe('var(--text5)');
			expect(badgeWithDescription.background).toBe('var(--roles-keyword0, var(--secondary-color))');
			expect(badgeWithDescription).toBeTruthy();
			expect(badgeWithDescription.title).toBe('description0');

			const badgeWithoutDescription = Array.from(badges).find((b) => b.label === 'keyword1');

			expect(badgeWithoutDescription).toBeTruthy();
			expect(badgeWithoutDescription.title).toBe('');

			//check notification
			badgeWithDescription.click();
			expect(store.getState().notifications.latest.payload.content).toBe('description0');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);

			badgeWithoutDescription.click();
			expect(store.getState().notifications.latest.payload.content).toBe('description0');
		});

		it('displays interval badge for layers with active interval', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new OafGeoResource('geoResourceId0', 'label0').setUpdateInterval(420));
			spyOn(geoResourceService, 'getKeywords')
				.withArgs('geoResourceId0')
				.and.returnValue([{ name: 'keyword0', description: 'description0' }]);

			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 0,
				opacity: 1
			};
			const element = await setup(layer);
			expect(element.shadowRoot.querySelectorAll('.ba-list-item-badges .interval-icon')).toHaveSize(1);
			const intervalBadge = element.shadowRoot.querySelector('.ba-list-item-badges .interval-icon');

			intervalBadge.click();
			expect(store.getState().layers.activeSettingsUI).toBe('id0');
		});

		it('displays baseColor as background style', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.GEOJSON).setStyle({ baseColor: '#ff4200' }));

			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 0,
				opacity: 1
			};
			const element = await setup(layer);

			expect(window.getComputedStyle(element.shadowRoot.querySelector('.layer-item')).getPropertyValue('--base-color')).toBe('#ff4200');
		});

		it('displays the layer.state for INCOMPLETE_DATA by a notify-icon', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			spyOn(geoResourceService, 'getKeywords')
				.withArgs('geoResourceId0')
				.and.returnValue([{ name: 'keyword0', description: 'description0' }]);

			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 0,
				opacity: 1,
				state: LayerState.INCOMPLETE_DATA
			};
			const element = await setup(layer);
			const iconElement = element.shadowRoot.querySelector('ba-icon.layer-state-icon.' + LayerState.INCOMPLETE_DATA);

			expect(iconElement.title).toBe('layerManager_title_layerState_incomplete_data');
			expect(iconElement.color).toBe('var(--warning-color)');

			const event = new Event('click');
			const preventDefaultSpy = spyOn(event, 'preventDefault');
			const stopPropagationSpy = spyOn(event, 'stopPropagation');

			iconElement.dispatchEvent(event);

			expect(preventDefaultSpy).toHaveBeenCalled();
			expect(stopPropagationSpy).toHaveBeenCalled();
			//check notification
			expect(store.getState().notifications.latest.payload.content).toBe(iconElement.title);
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
		});

		it('displays the layer.state for ERROR by a notify-icon', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			spyOn(geoResourceService, 'getKeywords')
				.withArgs('geoResourceId0')
				.and.returnValue([{ name: 'keyword0', description: 'description0' }]);

			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 0,
				opacity: 1,
				state: LayerState.ERROR
			};
			const element = await setup(layer);
			const iconElement = element.shadowRoot.querySelector('ba-icon.layer-state-icon.' + LayerState.ERROR);

			expect(iconElement.title).toBe('layerManager_title_layerState_error');
			expect(iconElement.color).toBe('var(--error-color)');

			const event = new Event('click');
			const preventDefaultSpy = spyOn(event, 'preventDefault');
			const stopPropagationSpy = spyOn(event, 'stopPropagation');

			iconElement.dispatchEvent(event);

			expect(preventDefaultSpy).toHaveBeenCalled();
			expect(stopPropagationSpy).toHaveBeenCalled();
			//check notification
			expect(store.getState().notifications.latest.payload.content).toBe(iconElement.title);
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.ERROR);
		});

		it('displays the layer.state for LOADING by a notify-icon', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			spyOn(geoResourceService, 'getKeywords')
				.withArgs('geoResourceId0')
				.and.returnValue([{ name: 'keyword0', description: 'description0' }]);

			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 0,
				opacity: 1,
				state: LayerState.LOADING
			};
			const element = await setup(layer);
			const iconElement = element.shadowRoot.querySelector('ba-icon.layer-state-icon.' + LayerState.LOADING);

			expect(iconElement.title).toBe('layerManager_title_layerState_loading');
			expect(iconElement.color).toBe('var(--secondary-color)');

			const event = new Event('click');
			const preventDefaultSpy = spyOn(event, 'preventDefault');
			const stopPropagationSpy = spyOn(event, 'stopPropagation');

			iconElement.dispatchEvent(event);

			expect(preventDefaultSpy).toHaveBeenCalled();
			expect(stopPropagationSpy).toHaveBeenCalled();
			//check notification
			expect(store.getState().notifications.latest.payload.content).toBe(iconElement.title);
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
		});

		it('does NOT displays the layer.state for LayerState.OK by a notify-icon', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			spyOn(geoResourceService, 'getKeywords')
				.withArgs('geoResourceId0')
				.and.returnValue([{ name: 'keyword0', description: 'description0' }]);

			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 0,
				opacity: 1,
				state: LayerState.OK
			};
			const element = await setup(layer);
			const iconElement = element.shadowRoot.querySelector('ba-icon.layer-state-icon.' + LayerState.OK);

			expect(iconElement).toBeNull();
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
				opacity: 1
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
				opacity: 0.55
			};
			const element = await setup(layer);

			const slider = element.shadowRoot.querySelector('.opacity-slider');
			expect(slider.type).toBe('range');
			expect(slider.min).toBe('0');
			expect(slider.max).toBe('100');
			expect(slider.title).toBe('layerManager_opacity');
			expect(slider.draggable).toBe(true);

			expect(slider.value).toBe('55');
		});

		it('use layer.opacity-property in badge ', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 0,
				opacity: 0.55
			};
			const element = await setup(layer);

			const badge = element.shadowRoot.querySelector('.slider-container ba-badge');
			expect(badge.label).toBe(55);
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
				opacity: 1
			};
			const element = await setup(layer);
			const toggle = element.shadowRoot.querySelector('ba-checkbox');

			expect(toggle.checked).toBe(false);
		});

		it('use layer.timestamps-property to render the timestamp component ', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceIdWithTimestamps')
				.and.returnValue(new XyzGeoResource('geoResourceIdWithTimestamps', 'someLabel0', 'someUrl0').setTimestamps(['2000', '2024']));
			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'geoResourceIdWithTimestamps',
				visible: false,
				zIndex: 0,
				opacity: 1
			};

			const element = await setup(layer);
			const timestampElements = element.shadowRoot.querySelectorAll('ba-value-select');

			expect(timestampElements).toHaveSize(1);

			expect(timestampElements[0].values).toHaveSize(2);
			expect(timestampElements[0].title).toBe('layerManager_time_travel_hint');
		});

		it('use layer.timestamps-property to skip render the timestamp component ', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId_Without_Timestamp')
				.and.returnValue(new XyzGeoResource('geoResourceId_Without_Timestamp', 'someLabel1', 'someUrl1'));
			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'geoResourceId_Without_Timestamp',
				visible: false,
				zIndex: 0,
				opacity: 1
			};

			const element = await setup(layer);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.ba-list-item-badges')).display).toBe('none');
			const timestampElements = element.shadowRoot.querySelectorAll('ba-value-select');

			expect(timestampElements).toHaveSize(0);
		});

		it('click on timestamp icon opens the time travel slider ', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceIdWithTimestamps')
				.and.returnValue(new XyzGeoResource('geoResourceIdWithTimestamps', 'someLabel0', 'someUrl0').setTimestamps(['2000', '2024']));
			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'geoResourceIdWithTimestamps',
				visible: true,
				zIndex: 0,
				opacity: 1
			};
			const element = await setup(layer);
			const timestampIcon = element.shadowRoot.querySelector('.time-travel-icon ba-icon');

			expect(element.shadowRoot.querySelectorAll('.time-travel-icon')).toHaveSize(1);

			timestampIcon.click();

			expect(store.getState().timeTravel.active).toBeTrue();
		});

		it('click on timestamp component modifies the layer ', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceIdWithTimestamps')
				.and.returnValue(new XyzGeoResource('geoResourceIdWithTimestamps', 'someLabel0', 'someUrl0').setTimestamps(['2000', '2024']));
			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'geoResourceIdWithTimestamps',
				visible: false,
				zIndex: 0,
				opacity: 1
			};
			const element = await setup(layer);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.ba-list-item-badges')).display).toBe('flex');
			const timestampSelect = element.shadowRoot.querySelector('.ba-list-item-badges ba-value-select');
			timestampSelect.dispatchEvent(
				new CustomEvent('select', {
					detail: {
						selected: '2024'
					}
				})
			);

			expect(store.getState().layers.active[0].timestamp).toBe('2024');
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
				opacity: 1
			};
			const element = await setup(layer, false);
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
				opacity: 1
			};
			const element = await setup(layer, false);

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

		it('checks the type of the georesource to determine whether the settings icon should be displayed', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('oafGeoResource')
				.and.returnValue(new OafGeoResource('oafGeoResource', 'someLabel0', 'someUrl0', 'someCollectionId', 3857).setFilter('cql'));
			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'oafGeoResource',
				visible: true,
				zIndex: 0,
				opacity: 1
			};

			const element = await setup(layer);
			const oafSettingsElement = element.shadowRoot.querySelectorAll('.oaf-settings-icon ba-icon');

			expect(oafSettingsElement).toHaveSize(1);

			expect(oafSettingsElement[0].title).toBe('layerManager_oaf_settings');
		});

		it('displays filled filter icon while cql query is active', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('oafGeoResource')
				.and.returnValue(new OafGeoResource('oafGeoResource', 'someLabel0', 'someUrl0', 'someCollectionId', 3857).setFilter('cql'));
			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'oafGeoResource',
				visible: true,
				zIndex: 0,
				opacity: 1
			};
			layer.constraints.filter = 'cql';

			const element = await setup(layer);
			const oafSettingsElement = element.shadowRoot.querySelectorAll('.oaf-settings-icon ba-icon');

			expect(oafSettingsElement).toHaveSize(1);

			expect(oafSettingsElement[0].title).toBe('layerManager_oaf_settings');
			expect(oafSettingsElement[0].icon).toEqual(oafSettingsActiveSvg);
		});

		it('displays hollow filter icon while cql query is not active', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('oafGeoResource')
				.and.returnValue(new OafGeoResource('oafGeoResource', 'someLabel0', 'someUrl0', 'someCollectionId', 3857).setFilter('cql'));
			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'oafGeoResource',
				visible: true,
				zIndex: 0,
				opacity: 1
			};
			layer.constraints.filter = null;

			const element = await setup(layer);
			const oafSettingsElement = element.shadowRoot.querySelectorAll('.oaf-settings-icon ba-icon');

			expect(oafSettingsElement).toHaveSize(1);

			expect(oafSettingsElement[0].title).toBe('layerManager_oaf_settings');
			expect(oafSettingsElement[0].icon).toEqual(oafSettingsSvg);
		});

		it('opens the Layer-Filter-UI', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('oafGeoResource')
				.and.returnValue(new OafGeoResource('oafGeoResource', 'someLabel0', 'someUrl0', 'someCollectionId', 3857).setFilter('cql'));
			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'oafGeoResource',
				visible: true,
				zIndex: 0,
				opacity: 1
			};
			const element = await setup(layer);
			const oafSettingsElement = element.shadowRoot.querySelectorAll('.oaf-settings-icon ba-icon');

			oafSettingsElement[0].click();

			expect(store.getState().layers.activeFilterUI).toBe('id0');
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
				opacity: 1
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
				opacity: 1
			};
			const element = await setup(layer);

			const infoButton = element.shadowRoot.querySelector('#info');

			expect(infoButton).not.toBeNull();
			expect(infoButton.title).toEqual('layerManager_info');
			expect(infoButton.click).toEqual(jasmine.any(Function));
			expect(infoButton.disabled).toBeFalse();
			expect(infoButton.icon).toBe(infoSvg);
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
				constraints: { metaData: false }
			};
			const element = await setup(layer);

			const infoButton = element.shadowRoot.querySelector('#info');

			expect(infoButton).not.toBeNull();
			expect(infoButton.title).toBe('layerManager_info');
			expect(infoButton.click).toEqual(jasmine.any(Function));
			expect(infoButton.disabled).toBeTrue();
			expect(infoButton.icon).toEqual(infoSvg);
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
				opacity: 1
			};
			const element = await setup(layer);

			const menu = element.shadowRoot.querySelector('ba-overflow-menu');
			const copyMenuItem = menu.items.find((item) => item.label === 'layerManager_to_copy');

			expect(copyMenuItem).not.toBeNull();
			expect(copyMenuItem.label).toEqual('layerManager_to_copy');
			expect(copyMenuItem.action).toEqual(jasmine.any(Function));
			expect(copyMenuItem.disabled).toBeFalse();
			expect(copyMenuItem.icon).toEqual(cloneSvg);
		});

		it('contains a disabled menu-item for copy', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			const layer = {
				...createDefaultLayerProperties(),
				constraints: { ...createDefaultLayersConstraints(), cloneable: false },
				id: 'id0',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 0,
				opacity: 1
			};
			const element = await setup(layer);

			const menu = element.shadowRoot.querySelector('ba-overflow-menu');
			const copyMenuItem = menu.items.find((item) => item.label === 'layerManager_to_copy');

			expect(copyMenuItem).not.toBeNull();
			expect(copyMenuItem.label).toEqual('layerManager_to_copy');
			expect(copyMenuItem.action).toEqual(jasmine.any(Function));
			expect(copyMenuItem.disabled).toBeTrue();
			expect(copyMenuItem.icon).toEqual(cloneSvg);
		});

		it('contains a menu-item for zoomToExtent to a VectorGeoResource', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 0,
				opacity: 1
			};
			const element = await setup(layer);

			const menu = element.shadowRoot.querySelector('ba-overflow-menu');
			const zoomToExtentMenuItem = menu.items.find((item) => item.label === 'layerManager_zoom_to_extent');

			expect(zoomToExtentMenuItem).not.toBeNull();
			expect(zoomToExtentMenuItem.label).toEqual('layerManager_zoom_to_extent');
			expect(zoomToExtentMenuItem.action).toEqual(jasmine.any(Function));
			expect(zoomToExtentMenuItem.disabled).toBeFalse();
			expect(zoomToExtentMenuItem.icon).toBe(zoomToExtentSvg);
		});

		it('contains a disabled menu-item for zoomToExtent', async () => {
			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 0,
				opacity: 1
			};
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new WmsGeoResource('geoResourceId0', 'id0', '', [], ''));
			const element = await setup(layer);

			const menu = element.shadowRoot.querySelector('ba-overflow-menu');
			const zoomToExtentMenuItem = menu.items.find((item) => item.label === 'layerManager_zoom_to_extent');

			expect(zoomToExtentMenuItem).not.toBeNull();
			expect(zoomToExtentMenuItem.label).toEqual('layerManager_zoom_to_extent');
			expect(zoomToExtentMenuItem.action).toEqual(jasmine.any(Function));
			expect(zoomToExtentMenuItem.disabled).toBeTrue();
			expect(zoomToExtentMenuItem.icon).toBe(zoomToExtentSvg);
		});

		it('contains a menu-item for settings ', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 0,
				opacity: 1
			};
			const element = await setup(layer);

			const menu = element.shadowRoot.querySelector('ba-overflow-menu');
			const settingsMenuItem = menu.items.find((item) => item.label === 'layerManager_open_settings');

			expect(settingsMenuItem).not.toBeNull();
			expect(settingsMenuItem.label).toEqual('layerManager_open_settings');
			expect(settingsMenuItem.action).toEqual(jasmine.any(Function));
			expect(settingsMenuItem.disabled).toBeFalse();
			expect(settingsMenuItem.icon).toBe(settingsSvg);
		});

		it('contains a disabled menu-item for settings', async () => {
			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 0,
				opacity: 1
			};
			const wmsGeoResource = new WmsGeoResource('geoResourceId0', 'id0', '', [], '');
			spyOn(wmsGeoResource, 'isUpdatableByInterval').and.returnValue(false);
			spyOn(geoResourceService, 'byId').withArgs('geoResourceId0').and.returnValue(wmsGeoResource);
			const element = await setup(layer);

			const menu = element.shadowRoot.querySelector('ba-overflow-menu');
			const openSettingsMenuItem = menu.items.find((item) => item.label === 'layerManager_open_settings');

			expect(openSettingsMenuItem).not.toBeNull();
			expect(openSettingsMenuItem.label).toEqual('layerManager_open_settings');
			expect(openSettingsMenuItem.action).toEqual(jasmine.any(Function));
			expect(openSettingsMenuItem.disabled).toBeTrue();
			expect(openSettingsMenuItem.icon).toBe(settingsSvg);
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
				opacity: 1
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
				opacity: 1
			};
			const element = await setup(layer);

			const infoButton = element.shadowRoot.querySelector('#info');
			infoButton.click();

			expect(store.getState().modal.data.title).toBe('label0');
			const wrapperElement = TestUtils.renderTemplateResult(store.getState().modal.data.content);
			expect(wrapperElement.querySelectorAll(GeoResourceInfoPanel.tag)).toHaveSize(1);
			expect(wrapperElement.querySelector(GeoResourceInfoPanel.tag).geoResourceId).toBe('geoResourceId0');
		});

		it('does not show a loading hint for Non-GeoResourceFutures', async () => {
			const geoResourceId = 'geoResourceId0';
			spyOn(geoResourceService, 'byId')
				.withArgs(geoResourceId)
				.and.returnValue(new VectorGeoResource(geoResourceId, 'label0', VectorSourceType.KML));
			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: geoResourceId,
				visible: true,
				zIndex: 0,
				opacity: 1
			};
			const element = await setup(layer);

			expect(element.shadowRoot.querySelectorAll(Spinner.tag)).toHaveSize(0);
		});

		it('shows a loading hint for GeoResourceFutures', async () => {
			const geoResourceId = 'geoResourceId0';
			const resolvedGeoResource = new VectorGeoResource(geoResourceId, 'label0', VectorSourceType.KML);
			const geoResFuture = new GeoResourceFuture(geoResourceId, async () => resolvedGeoResource);
			spyOn(geoResourceService, 'addOrReplace').withArgs(resolvedGeoResource).and.returnValue(resolvedGeoResource);
			spyOn(geoResourceService, 'byId').withArgs('geoResourceId0').and.returnValue(geoResFuture);

			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: geoResourceId,
				visible: true,
				zIndex: 0,
				opacity: 1
			};
			const element = await setup(layer);

			expect(element.shadowRoot.querySelectorAll(Spinner.tag)).toHaveSize(1);
			expect(element.shadowRoot.querySelector(Spinner.tag).label).toBe('layerManager_loading_hint');

			await geoResFuture.get(); // resolve future

			expect(element.shadowRoot.querySelectorAll(Spinner.tag)).toHaveSize(0);
			expect(element.shadowRoot.querySelector('.ba-list-item__text').innerText).toBe('label0');
		});

		it('shows a badge with the number of the features', async () => {
			const geoResourceId = 'geoResourceId0';
			spyOn(geoResourceService, 'byId')
				.withArgs(geoResourceId)
				.and.returnValue(new VectorGeoResource(geoResourceId, 'label0', VectorSourceType.KML));
			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: geoResourceId,
				visible: true,
				zIndex: 0,
				opacity: 1,
				props: {
					featureCount: 10
				}
			};
			const element = await setup(layer);

			expect(element.shadowRoot.querySelectorAll(Spinner.tag)).toHaveSize(0);

			expect(window.getComputedStyle(element.shadowRoot.querySelector('.ba-list-item-badges')).display).toBe('flex');
			const badge = element.shadowRoot.querySelectorAll('.ba-list-item-badges ba-badge.feature-count-badge');
			expect(badge).toHaveSize(1);
			expect(badge[0].label).toBe(10);
			expect(badge[0].title).toBe('layerManager_feature_count');
			expect(badge[0].color).toBe('var(--text5)');
			expect(badge[0].background).toBe('var(--secondary-color)');
		});

		it('shows a badge with the number of the features when featureCount is 0', async () => {
			const geoResourceId = 'geoResourceId0';
			spyOn(geoResourceService, 'byId')
				.withArgs(geoResourceId)
				.and.returnValue(new VectorGeoResource(geoResourceId, 'label0', VectorSourceType.KML));
			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: geoResourceId,
				visible: true,
				zIndex: 0,
				opacity: 1,
				props: {
					featureCount: 0
				}
			};
			const element = await setup(layer);
			expect(element.shadowRoot.querySelectorAll('ba-badge.feature-count-badge')).toHaveSize(1);
			const badge = element.shadowRoot.querySelectorAll('ba-badge.feature-count-badge');
			expect(badge).toHaveSize(1);
			expect(badge[0].label).toBe(0);
		});

		it('shows no feature count badge because featureCount is undefined', async () => {
			const geoResourceId = 'geoResourceId0';
			spyOn(geoResourceService, 'byId')
				.withArgs(geoResourceId)
				.and.returnValue(new VectorGeoResource(geoResourceId, 'label0', VectorSourceType.KML));
			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: geoResourceId,
				visible: true,
				zIndex: 0,
				opacity: 1,
				props: {}
			};
			const element = await setup(layer);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.ba-list-item-badges')).display).toBe('none');
			expect(element.shadowRoot.querySelectorAll('ba-badge.feature-count-badge')).toHaveSize(0);
		});

		it('shows no feature count badge while LayerState is loading', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			spyOn(geoResourceService, 'getKeywords')
				.withArgs('geoResourceId0')
				.and.returnValue([{ name: 'keyword0', description: 'description0' }]);

			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 0,
				opacity: 1,
				state: LayerState.LOADING,
				props: {
					featureCount: 10
				}
			};
			const element = await setup(layer);
			expect(element.shadowRoot.querySelectorAll('ba-icon.layer-state-icon.' + LayerState.LOADING)).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.ba-list-item-badges')).display).toBe('flex');
			expect(element.shadowRoot.querySelectorAll('ba-badge.feature-count-badge')).toHaveSize(0);
		});

		it('contains no layerSwipe buttons', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 0,
				opacity: 1
			};
			const element = await setup(layer, true, false);

			expect(store.getState().layerSwipe.active).toBe(false);

			expect(element.shadowRoot.querySelectorAll('.compare')).toHaveSize(0);
		});

		it('contains three layerSwipe buttons', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 0,
				opacity: 1
			};
			const element = await setup(layer, true, true);
			const bar = element.shadowRoot.querySelector('.bar');

			expect(store.getState().layerSwipe.active).toBe(true);

			expect(element.shadowRoot.querySelectorAll('.compare')).toHaveSize(1);
			const swipeButtons = element.shadowRoot.querySelectorAll('.compare ba-button');
			expect(swipeButtons).toHaveSize(3);
			expect(swipeButtons[0].classList.contains('active')).toBeFalse();
			expect(swipeButtons[1].classList.contains('active')).toBeTrue();
			expect(swipeButtons[2].classList.contains('active')).toBeFalse();
			expect(bar.classList.contains('left')).toBeFalse();
			expect(bar.classList.contains('both')).toBeTrue();
			expect(bar.classList.contains('right')).toBeFalse();
		});

		it('click on layerSwipe buttons changes the SwipeAlignment of the layer', async () => {
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0',
				geoResourceId: 'geoResourceId0',
				visible: true,
				zIndex: 0,
				opacity: 1
			};
			const element = await setup(layer, true, true);

			expect(store.getState().layerSwipe.active).toBe(true);

			expect(element.shadowRoot.querySelectorAll('.compare')).toHaveSize(1);
			const swipeButtons = element.shadowRoot.querySelectorAll('.compare ba-button');
			const bar = element.shadowRoot.querySelector('.bar');
			expect(swipeButtons).toHaveSize(3);

			expect(store.getState().layers.active[0].constraints.swipeAlignment).toBe(SwipeAlignment.NOT_SET);

			expect(swipeButtons[0].label).toBe('layerManager_compare_left');
			expect(swipeButtons[0].title).toBe('layerManager_compare_left_title');
			expect(swipeButtons[1].label).toBe('layerManager_compare_both');
			expect(swipeButtons[1].title).toBe('layerManager_compare_both_title');
			expect(swipeButtons[2].label).toBe('layerManager_compare_right');
			expect(swipeButtons[2].title).toBe('layerManager_compare_right_title');
			expect(swipeButtons[0].classList.contains('active')).toBeFalse();
			expect(swipeButtons[1].classList.contains('active')).toBeTrue();
			expect(swipeButtons[2].classList.contains('active')).toBeFalse();
			expect(bar.classList.contains('left')).toBeFalse();
			expect(bar.classList.contains('both')).toBeTrue();
			expect(bar.classList.contains('right')).toBeFalse();

			const leftButtons = element.shadowRoot.querySelector('#left');
			leftButtons.click();

			expect(store.getState().layers.active[0].constraints.swipeAlignment).toBe(SwipeAlignment.LEFT);

			element.layerId = { ...store.getState().layers.active[0].id };

			expect(swipeButtons[0].classList.contains('active')).toBeTrue();
			expect(swipeButtons[1].classList.contains('active')).toBeFalse();
			expect(swipeButtons[2].classList.contains('active')).toBeFalse();
			expect(bar.classList.contains('left')).toBeTrue();
			expect(bar.classList.contains('both')).toBeFalse();
			expect(bar.classList.contains('right')).toBeFalse();

			const rightButtons = element.shadowRoot.querySelector('#right');
			rightButtons.click();

			expect(store.getState().layers.active[0].constraints.swipeAlignment).toBe(SwipeAlignment.RIGHT);

			element.layerId = { ...store.getState().layers.active[0].id };

			expect(swipeButtons[0].classList.contains('active')).toBeFalse();
			expect(swipeButtons[1].classList.contains('active')).toBeFalse();
			expect(swipeButtons[2].classList.contains('active')).toBeTrue();
			expect(bar.classList.contains('left')).toBeFalse();
			expect(bar.classList.contains('both')).toBeFalse();
			expect(bar.classList.contains('right')).toBeTrue();

			const bothButtons = element.shadowRoot.querySelector('#both');
			bothButtons.click();

			expect(store.getState().layers.active[0].constraints.swipeAlignment).toBe(SwipeAlignment.NOT_SET);

			element.layerId = { ...store.getState().layers.active[0].id };

			expect(swipeButtons[0].classList.contains('active')).toBeFalse();
			expect(swipeButtons[1].classList.contains('active')).toBeTrue();
			expect(swipeButtons[2].classList.contains('active')).toBeFalse();
			expect(bar.classList.contains('left')).toBeFalse();
			expect(bar.classList.contains('both')).toBeTrue();
			expect(bar.classList.contains('right')).toBeFalse();
		});
	});

	describe('when user interacts with layer item', () => {
		const layer = {
			...createDefaultLayerProperties(),
			id: 'id0',
			geoResourceId: 'geoResourceId0',
			visible: true,
			zIndex: 0,
			opacity: 1
		};

		const setupStore = () => {
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
				position: positionReducer,
				layerSwipe: layerSwipeReducer
			});
			$injector
				.registerSingleton('TranslationService', { translate: (key) => key })
				.registerSingleton('GeoResourceService', geoResourceService)
				.registerSingleton('FileStorageService', fileStorageService);
			return store;
		};

		it('click on layer toggle change state in store', async () => {
			const store = setupStore();
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			const element = await TestUtils.render(LayerItem.tag);
			element.layerId = layer.id;

			const checkbox = element.shadowRoot.querySelector('ba-checkbox');

			checkbox.dispatchEvent(new CustomEvent('toggle', { detail: { checked: false } }));
			const actualLayer = store.getState().layers.active[0];
			expect(actualLayer.visible).toBeFalse();
		});

		it('click on opacity slider change state in store', async () => {
			const store = setupStore();
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			const element = await TestUtils.render(LayerItem.tag);
			element.layerId = layer.id;

			const slider = element.shadowRoot.querySelector('.opacity-slider');
			slider.value = 66;
			slider.dispatchEvent(new Event('input'));

			const actualLayer = store.getState().layers.active[0];
			expect(actualLayer.opacity).toBe(0.66);
		});

		it('click on opacity slider change style-property', async () => {
			setupStore();
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			const element = await TestUtils.render(LayerItem.tag);
			element.layerId = layer.id;

			// explicit call to fake/step over render-phase
			element.onAfterRender(true);
			const slider = element.shadowRoot.querySelector('.opacity-slider');
			slider.value = 66;
			const propertySpy = spyOn(slider.style, 'setProperty').withArgs('--track-fill', `${slider.value}%`).and.callThrough();

			slider.dispatchEvent(new Event('input'));

			expect(propertySpy).toHaveBeenCalled();
		});

		it("click on opacity slider without 'max'-attribute change style-property", async () => {
			setupStore();
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			const element = await TestUtils.render(LayerItem.tag);
			element.layerId = layer.id;

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
			setupStore();
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			const element = await TestUtils.render(LayerItem.tag);
			element.layerId = layer.id;

			const collapseButton = element.shadowRoot.querySelector('button');
			collapseButton.click();

			expect(element.getModel().layerItemProperties.collapsed).toBeFalse();
		});

		it('click on info icon show georesourceinfo panel as modal', async () => {
			const store = setupStore();
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			const element = await TestUtils.render(LayerItem.tag);
			element.layerId = layer.id;

			const infoButton = element.shadowRoot.querySelector('#info');
			infoButton.click();

			expect(store.getState().modal.data.title).toBe('label0');
			expect(isTemplateResult(store.getState().modal.data.content)).toBeTrue();
		});

		it('click on zoomToExtent icon changes state in store', async () => {
			const store = setupStore();
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			const element = await TestUtils.render(LayerItem.tag);
			element.layerId = layer.id;

			const menu = element.shadowRoot.querySelector('ba-overflow-menu');
			const zoomToExtentMenuItem = menu.items.find((item) => item.label === 'layerManager_zoom_to_extent');
			zoomToExtentMenuItem.action();

			expect(store.getState().position.fitLayerRequest.payload.id).toEqual('id0');
		});

		it('click on settings icon changes state in store', async () => {
			const store = setupStore();
			spyOn(geoResourceService, 'byId')
				.withArgs('geoResourceId0')
				.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));
			const element = await TestUtils.render(LayerItem.tag);
			element.layerId = layer.id;

			const menu = element.shadowRoot.querySelector('ba-overflow-menu');
			const settingsMenuItem = menu.items.find((item) => item.label === 'layerManager_open_settings');

			settingsMenuItem.action();

			expect(store.getState().layers.activeSettingsUI).toEqual(layer.id);
		});

		describe('when user change order of layer in group', () => {
			let store;
			const setupStore = (state) => {
				store = TestUtils.setupStoreAndDi(state, { layers: layersReducer, layerSwipe: layerSwipeReducer });
				$injector
					.registerSingleton('TranslationService', { translate: (key) => key })
					.registerSingleton('GeoResourceService', geoResourceService)
					.registerSingleton('FileStorageService', fileStorageService);
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
				const store = setupStore(state);
				const element = await TestUtils.render(LayerItem.tag);
				element.layerId = layer0.id;

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
				const store = setupStore(state);
				const element = await TestUtils.render(LayerItem.tag);
				element.layerId = layer2.id;

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
				const store = setupStore(state);
				const element = await TestUtils.render(LayerItem.tag);
				element.layerId = layer0.id;

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
				const store = setupStore(state);
				const element = await TestUtils.render(LayerItem.tag);
				element.layerId = layer0.id;

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
				const store = setupStore(state);
				const element = await TestUtils.render(LayerItem.tag);
				element.layerId = layer0.id;

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

			const setup = (state) => {
				const store = TestUtils.setupStoreAndDi(state, {
					layers: layersReducer,
					modal: modalReducer,
					layerSwipe: layerSwipeReducer
				});
				$injector
					.registerSingleton('TranslationService', { translate: (key) => key })
					.registerSingleton('GeoResourceService', geoResourceService)
					.registerSingleton('FileStorageService', fileStorageService);
				return store;
			};

			describe('on collapse', () => {
				it('fires a "collapse" event', async () => {
					const state = {
						layers: {
							active: [layer],
							background: 'bg0'
						}
					};

					setup(state);
					spyOn(geoResourceService, 'byId')
						.withArgs('geoResourceId0')
						.and.returnValue(new VectorGeoResource('geoResourceId0', 'label0', VectorSourceType.KML));

					const element = await TestUtils.render(LayerItem.tag);

					element.layerId = layer.id; // collapsed = true is initialized
					element.onCollapse = jasmine.createSpy();
					const collapseButton = element.shadowRoot.querySelector('button');
					const spy = jasmine.createSpy();
					element.addEventListener('collapse', spy);

					collapseButton.click();

					expect(spy).toHaveBeenCalledOnceWith(
						jasmine.objectContaining({
							detail: {
								layerId: layer.id,
								collapsed: false
							}
						})
					);
					expect(element.getModel().layerItemProperties.collapsed).toBeFalse();
				});
			});
		});
	});
});
