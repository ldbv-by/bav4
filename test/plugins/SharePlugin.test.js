import { TestUtils } from '../test-utils.js';
import { layersReducer } from '../../src/store/layers/layers.reducer';
import { setCurrentTool } from '../../src/store/tools/tools.action.js';
import { toolsReducer } from '../../src/store/tools/tools.reducer.js';
import { $injector } from '../../src/injection/index.js';
import { SharePlugin } from '../../src/plugins/SharePlugin.js';
import { addLayer } from '../../src/store/layers/layers.action.js';
import { XyzGeoResource } from '../../src/domain/geoResources.js';
import { notificationReducer } from '../../src/store/notifications/notifications.reducer.js';
import { LevelTypes } from '../../src/store/notifications/notifications.action.js';
import { Tools } from '../../src/domain/tools.js';

describe('SharePlugin', () => {
	const geoResourceService = {
		byId() {}
	};

	const translationService = {
		translate: (key) => key
	};

	const setup = (state) => {
		const store = TestUtils.setupStoreAndDi(state, {
			layers: layersReducer,
			tools: toolsReducer,
			notifications: notificationReducer
		});
		$injector.registerSingleton('GeoResourceService', geoResourceService).registerSingleton('TranslationService', translationService);
		return store;
	};

	describe('when toolId changes', () => {
		describe('and we have hidden GeoResources', () => {
			it('emits an notification', async () => {
				const store = setup();
				addLayer('id0');
				addLayer('id1');
				addLayer('id2');
				addLayer('id3', { constraints: { hidden: true } }); //should be filtered out
				spyOn(geoResourceService, 'byId').and.callFake((id) => {
					const gr = new XyzGeoResource(id, id, '');
					if (id === 'id1') {
						return gr;
					}
					return gr.setHidden(true);
				});
				const instanceUnderTest = new SharePlugin();
				await instanceUnderTest.register(store);

				setCurrentTool(Tools.SHARE);

				expect(TestUtils.renderTemplateResult(store.getState().notifications.latest.payload.content).textContent).toContain(
					'global_share_unsupported_geoResource_warning'
				);
				expect(TestUtils.renderTemplateResult(store.getState().notifications.latest.payload.content).textContent).toContain('id0');
				expect(TestUtils.renderTemplateResult(store.getState().notifications.latest.payload.content).textContent).toContain('id2');
				expect(TestUtils.renderTemplateResult(store.getState().notifications.latest.payload.content).textContent).not.toContain('id1');
				expect(store.getState().notifications.latest.payload.level).toBe(LevelTypes.WARN);
			});
		});

		describe('and we have hidden GeoResources and another tool is activated', () => {
			it('emits nothing', async () => {
				const store = setup();
				addLayer('id0');
				addLayer('id1');
				addLayer('id2');
				addLayer('id3', { constraints: { hidden: true } }); //should be filtered out
				spyOn(geoResourceService, 'byId').and.callFake((id) => {
					const gr = new XyzGeoResource(id, id, '');
					if (id === 'id1') {
						return gr;
					}
					return gr.setHidden(true);
				});
				const instanceUnderTest = new SharePlugin();
				await instanceUnderTest.register(store);

				setCurrentTool(Tools.IMPORT);

				expect(store.getState().notifications.latest).toBeNull();
			});
		});

		describe('and we have NO hidden layers', () => {
			it('emits nothing', async () => {
				const store = setup();
				addLayer('id0');
				addLayer('id1');
				addLayer('id2');
				spyOn(geoResourceService, 'byId').and.callFake((id) => new XyzGeoResource(id, id, ''));
				const instanceUnderTest = new SharePlugin();
				await instanceUnderTest.register(store);

				setCurrentTool(Tools.SHARE);

				expect(store.getState().notifications.latest).toBeNull();
			});
		});
	});
});
