import { $injector } from '../../../../src/injection';
import { BaseLayerSwitcher } from '../../../../src/modules/baseLayer/components/switcher/BaseLayerSwitcher';
import { createDefaultLayer, layersReducer } from '../../../../src/store/layers/layers.reducer';
import { topicsReducer } from '../../../../src/store/topics/topics.reducer';
import { setCurrent } from '../../../../src/store/topics/topics.action';
import { TestUtils } from '../../../test-utils.js';
import { Topic } from '../../../../src/domain/topic';
import { XyzGeoResource } from '../../../../src/domain/geoResources';

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
			.registerSingleton('TopicsService', topicsServiceMock)
			.registerSingleton('TranslationService', { translate: (key) => key });

		return TestUtils.render(BaseLayerSwitcher.tag);
	};

	describe('when instantiated', () => {

		it('has a model containing default values', async () => {
			await setup();
			const model = new BaseLayerSwitcher().getModel();

			expect(model).toEqual({
				currentTopicId: null,
				activeLayers: [],
				layersStoreReady: false
			});
		});
	});

	describe('when initialized ', () => {

		it('renders nothing when layers state not yet set ready', async () => {
			const element = await setup();
			expect(element.shadowRoot.children.length).toBe(0);
		});

		it('renders two buttons', async () => {

			const topicsId = 'topicId';
			const activeGeoResourceId = 'geoRsId1';
			const activeLayer = createDefaultLayer(activeGeoResourceId);
			const state = {
				topics: {
					current: topicsId
				},
				layers: {
					ready: true,
					active: [activeLayer]
				}
			};
			spyOn(topicsServiceMock, 'byId').and.returnValue(new Topic(topicsId, 'label', 'description', ['geoRsId0', activeGeoResourceId]));
			spyOn(geoResourceServiceMock, 'byId').and.callFake((id) => {
				switch (id) {
					case 'geoRsId0':
						return new XyzGeoResource('geoRsId0', 'someLabel0', 'someUrl0');
					case activeGeoResourceId:
						return new XyzGeoResource(activeGeoResourceId, 'someLabel1', 'someUrl1');
				}
			});

			const element = await setup(state);

			const container = element.shadowRoot.querySelector('.baselayer__container');
			expect(container).toBeTruthy();
			const buttons = element.shadowRoot.querySelectorAll('.baselayer__button');
			expect(buttons.length).toBe(2);
			expect(buttons[0].children[0].innerText).toBe('someLabel0');
			expect(buttons[0].getAttribute('type')).toBe('secondary');
			expect(buttons[1].children[0].innerText).toBe('someLabel1');
			expect(buttons[1].getAttribute('type')).toBe('primary');

			expect(element.shadowRoot.querySelector('.title').innerText).toBe('baselayer_switcher_header');
		});
	});

	describe('when topic changed ', () => {

		it('updates the view', async () => {

			const topicsId = 'topicId';
			const activeGeoResourceId = 'geoRsId1';
			const activeLayer = createDefaultLayer(activeGeoResourceId);
			const state = {
				layers: {
					ready: true,
					active: [activeLayer]
				}
			};
			spyOn(topicsServiceMock, 'byId').and.returnValue(new Topic(topicsId, 'label', 'description', ['geoRsId0', activeGeoResourceId]));
			spyOn(geoResourceServiceMock, 'byId').and.callFake((id) => {
				switch (id) {
					case 'geoRsId0':
						return new XyzGeoResource('geoRsId0', 'someLabel0', 'someUrl0');
					case activeGeoResourceId:
						return new XyzGeoResource(activeGeoResourceId, 'someLabel1', 'someUrl1');
				}
			});
			const element = await setup(state);

			setCurrent(topicsId);

			const container = element.shadowRoot.querySelector('.baselayer__container');
			expect(container).toBeTruthy();
			const buttons = element.shadowRoot.querySelectorAll('.baselayer__button');
			expect(buttons.length).toBe(2);
			expect(buttons[0].children[0].innerText).toBe('someLabel0');
			expect(buttons[0].getAttribute('type')).toBe('secondary');
			expect(buttons[1].children[0].innerText).toBe('someLabel1');
			expect(buttons[1].getAttribute('type')).toBe('primary');
		});
	});

	describe('when element clicked ', () => {

		describe('and some layers are active ', () => {

			describe('base layer on index=0', () => {

				it('removes the current base layer on index=0 and adds the new layer on index=0', async () => {

					const topicsId = 'topicId';
					const geoResourceId0 = 'geoRsId0';
					const geoResourceId1 = 'geoRsId1';
					const geoResourceId2 = 'geoRsId2';
					const baseLayer0 = createDefaultLayer(geoResourceId0);
					const otherLayer = createDefaultLayer(geoResourceId1);
					const state = {
						topics: {
							current: topicsId
						},
						layers: {
							ready: true,
							active: [baseLayer0, otherLayer]
						}
					};
					spyOn(topicsServiceMock, 'byId').and.returnValue(new Topic(topicsId, 'label', 'description', [geoResourceId0, geoResourceId2]));
					spyOn(geoResourceServiceMock, 'byId').and.callFake((id) => {
						return new XyzGeoResource(id, `${id}Label`, 'someUrl');
					});
					const element = await setup(state);
					const buttons = element.shadowRoot.querySelectorAll('.baselayer__button');

					//let's add the second baseLayer
					buttons[1].click();

					expect(store.getState().layers.active.length).toBe(2);
					expect(store.getState().layers.active[0].id).toContain(geoResourceId2);
					expect(store.getState().layers.active[0].geoResourceId).toBe(geoResourceId2);
					expect(store.getState().layers.active[0].label).toBe(geoResourceId2 + 'Label');
					expect(store.getState().layers.active[0].zIndex).toBe(0);
				});
			});

			describe('base layer on index > 0', () => {

				it('adds the new layer on index=0', async () => {

					const topicsId = 'topicId';
					const geoResourceId0 = 'geoRsId0';
					const geoResourceId1 = 'geoRsId1';
					const geoResourceId2 = 'geoRsId2';
					const baseLayer0 = createDefaultLayer(geoResourceId0);
					const otherLayer = createDefaultLayer(geoResourceId1);
					const state = {
						topics: {
							current: topicsId
						},
						layers: {
							ready: true,
							active: [otherLayer, baseLayer0]
						}
					};
					spyOn(topicsServiceMock, 'byId').and.returnValue(new Topic(topicsId, 'label', 'description', [geoResourceId0, geoResourceId2]));
					spyOn(geoResourceServiceMock, 'byId').and.callFake((id) => {
						return new XyzGeoResource(id, `${id}Label`, 'someUrl');
					});
					const element = await setup(state);
					const buttons = element.shadowRoot.querySelectorAll('.baselayer__button');

					//let's add the second baseLayer
					buttons[1].click();

					expect(store.getState().layers.active.length).toBe(3);
					expect(store.getState().layers.active[0].id).toContain(geoResourceId2);
					expect(store.getState().layers.active[0].geoResourceId).toBe(geoResourceId2);
					expect(store.getState().layers.active[0].label).toBe(geoResourceId2 + 'Label');
					expect(store.getState().layers.active[0].zIndex).toBe(0);
				});
			});

			it('does nothing when layer is already on map', async () => {

				const topicsId = 'topicId';
				const geoResourceId0 = 'geoRsId0';
				const geoResourceId1 = 'geoRsId1';
				const baseLayer0 = { ...createDefaultLayer(geoResourceId0), customId: 'test' };

				const state = {
					topics: {
						current: topicsId
					},
					layers: {
						ready: true,
						active: [baseLayer0]
					}
				};
				spyOn(topicsServiceMock, 'byId').and.returnValue(new Topic(topicsId, 'label', 'description', [geoResourceId0, geoResourceId1]));
				spyOn(geoResourceServiceMock, 'byId').and.callFake((id) => {
					return new XyzGeoResource(id, 'someLabel', 'someUrl');
				});
				const element = await setup(state);
				const buttons = element.shadowRoot.querySelectorAll('.baselayer__button');

				//let's try to add the first baseLayer again
				buttons[0].click();

				expect(store.getState().layers.active.length).toBe(1);
				expect(store.getState().layers.active[0].id).toBe(geoResourceId0);
				//if we detect the custom id, the state wasn't modified
				expect(store.getState().layers.active[0].customId).toBe('test');
			});
		});

		describe('and no layer is active ', () => {

			it('adds the new layer on index 0', async () => {

				const topicsId = 'topicId';
				const geoResourceId0 = 'geoRsId0';
				const state = {
					topics: {
						current: topicsId
					},
					layers: {
						ready: true,
						active: []
					}
				};
				spyOn(topicsServiceMock, 'byId').and.returnValue(new Topic(topicsId, 'label', 'description', [geoResourceId0]));
				spyOn(geoResourceServiceMock, 'byId').and.callFake((id) => {
					return new XyzGeoResource(id, `${id}Label`, 'someUrl');
				});
				const element = await setup(state);
				const buttons = element.shadowRoot.querySelectorAll('.baselayer__button');

				//let's add a baseLayer
				buttons[0].click();

				expect(store.getState().layers.active.length).toBe(1);
				expect(store.getState().layers.active[0].id).toContain(geoResourceId0);
				expect(store.getState().layers.active[0].geoResourceId).toBe(geoResourceId0);
				expect(store.getState().layers.active[0].label).toBe(geoResourceId0 + 'Label');
				expect(store.getState().layers.active[0].zIndex).toBe(0);
			});
		});
	});
});
