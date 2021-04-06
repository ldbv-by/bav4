import { $injector } from '../../../../src/injection';
import { BaseLayerSwitcher } from '../../../../src/modules/baseLayer/components/switcher/BaseLayerSwitcher';
import { defaultLayerProperties, layersReducer } from '../../../../src/modules/map/store/layers.reducer';
import { topicsReducer } from '../../../../src/modules/topics/store/topics.reducer';
import { setCurrent } from '../../../../src/modules/topics/store/topics.action';
import { TestUtils } from '../../../test-utils.js';
import { Topic } from '../../../../src/services/domain/topic';
import { WMTSGeoResource } from '../../../../src/services/domain/geoResources';

window.customElements.define(BaseLayerSwitcher.tag, BaseLayerSwitcher);


describe('BaseLayerSwitcher', () => {

	let store;

	const geoResourceServiceMock = {
		async init() { },
		all() { },
		byId() { }
	};
	const topicsServiceMock = {
		default() { },
		byId() { }
	};

	const setup = async (state = {}) => {

		store = TestUtils.setupStoreAndDi(state, { layers: layersReducer, topics: topicsReducer });

		$injector
			.registerSingleton('GeoResourceService', geoResourceServiceMock)
			.registerSingleton('TopicsService', topicsServiceMock);

		return TestUtils.render(BaseLayerSwitcher.tag);
	};

	describe('when initialized ', () => {

		it('renders nothing when topics not yet loaded', async () => {
			const element = await setup();
			expect(element.shadowRoot.children.length).toBe(0);
		});

		it('renders two buttons', async () => {

			const topicsId = 'topicId';
			const activeGeoResoureceId = 'geoRsId1';
			const activeLayer = {
				...defaultLayerProperties,
				id: activeGeoResoureceId
			};
			const state = {
				topics: {
					current: topicsId
				},
				layers: {
					active: [activeLayer]
				}
			};
			spyOn(topicsServiceMock, 'byId').and.returnValue(new Topic(topicsId, 'label', 'description', ['geoRsId0', activeGeoResoureceId]));
			spyOn(geoResourceServiceMock, 'byId').and.callFake((id) => {
				switch (id) {
					case 'geoRsId0':
						return new WMTSGeoResource('geoRsId0', 'someLabel0', 'someUrl0');
					case activeGeoResoureceId:
						return new WMTSGeoResource(activeGeoResoureceId, 'someLabel1', 'someUrl1');
				}
			});

			const element = await setup(state);

			const container = element.shadowRoot.querySelector('.container');
			expect(container).toBeTruthy();
			const buttons = element.shadowRoot.querySelectorAll('ba-button');
			expect(buttons.length).toBe(2);
			expect(buttons[0].getAttribute('label')).toBe('someLabel0');
			expect(buttons[0].getAttribute('type')).toBe('secondary');
			expect(buttons[1].getAttribute('label')).toBe('someLabel1');
			expect(buttons[1].getAttribute('type')).toBe('primary');
		});
	});

	describe('when topic changed ', () => {

		it('updates the view', async () => {

			const topicsId = 'topicId';
			const activeGeoResoureceId = 'geoRsId1';
			const activeLayer = {
				...defaultLayerProperties,
				id: activeGeoResoureceId
			};
			const state = {
				layers: {
					active: [activeLayer]
				}
			};
			spyOn(topicsServiceMock, 'byId').and.returnValue(new Topic(topicsId, 'label', 'description', ['geoRsId0', activeGeoResoureceId]));
			spyOn(geoResourceServiceMock, 'byId').and.callFake((id) => {
				switch (id) {
					case 'geoRsId0':
						return new WMTSGeoResource('geoRsId0', 'someLabel0', 'someUrl0');
					case activeGeoResoureceId:
						return new WMTSGeoResource(activeGeoResoureceId, 'someLabel1', 'someUrl1');
				}
			});

			const element = await setup(state);

			expect(element.shadowRoot.children.length).toBe(0);

			setCurrent(topicsId);

			const container = element.shadowRoot.querySelector('.container');
			expect(container).toBeTruthy();
			const buttons = element.shadowRoot.querySelectorAll('ba-button');
			expect(buttons.length).toBe(2);
			expect(buttons[0].getAttribute('label')).toBe('someLabel0');
			expect(buttons[0].getAttribute('type')).toBe('secondary');
			expect(buttons[1].getAttribute('label')).toBe('someLabel1');
			expect(buttons[1].getAttribute('type')).toBe('primary');
		});
	});

	describe('when element clicked ', () => {

		it('it removes the current and adds the new layer', async () => {

			const topicsId = 'topicId';
			const inActiveGeoResoureceId = 'geoRsId0';
			const activeGeoResoureceId = 'geoRsId1';
			const activeLayer = {
				...defaultLayerProperties,
				id: activeGeoResoureceId
			};
			const state = {
				topics: {
					current: topicsId
				},
				layers: {
					active: [activeLayer]
				}
			};
			spyOn(topicsServiceMock, 'byId').and.returnValue(new Topic(topicsId, 'label', 'description', [inActiveGeoResoureceId, activeGeoResoureceId]));
			spyOn(geoResourceServiceMock, 'byId').and.callFake((id) => {
				return new WMTSGeoResource(id, 'someLabel', 'someUrl');
			});
			const element = await setup(state);
			const buttons = element.shadowRoot.querySelectorAll('ba-button');

			buttons[0].click();

			expect(store.getState().layers.active.length).toBe(1);
			expect(store.getState().layers.active[0].id).toBe(inActiveGeoResoureceId);
		});
	});
});
