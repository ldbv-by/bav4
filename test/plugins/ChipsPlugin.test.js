import { ChipsPlugin } from '../../src/plugins/ChipsPlugin';
import { TestUtils } from '../test-utils.js';
import { $injector } from '../../src/injection';
import { chipsReducer } from '../../src/store/chips/chips.reducer';
import { createDefaultLayer, layersReducer } from '../../src/store/layers/layers.reducer.js';
import { setCurrent as setCurrentTopic } from '../../src/store/topics/topics.action.js';
import { QueryParameters } from '../../src/domain/queryParameters';
import { topicsReducer } from '../../src/store/topics/topics.reducer';
import { addLayer } from '../../src/store/layers/layers.action';
import { topicsContentPanelReducer } from '../../src/store/topicsContentPanel/topicsContentPanel.reducer';

describe('ChipsPlugin', () => {

	const chipsConfigurationService = {
		all() { }
	};

	const windowMock = {
		location: {
			get search() {
				return null;
			}
		}
	};

	const setup = (state) => {

		const store = TestUtils.setupStoreAndDi(state, {
			chips: chipsReducer,
			layers: layersReducer,
			topics: topicsReducer,
			topicsContentPanel: topicsContentPanelReducer
		});
		$injector
			.registerSingleton('ChipsConfigurationService', chipsConfigurationService)
			.registerSingleton('EnvironmentService', { getWindow: () => windowMock });

		return store;
	};

	describe('register', () => {

		it('loads all chip configurations and publishes all permanent chips', async () => {
			const mockChips = [{
				'id': 'id0',
				'permanent': true
			}, {
				'id': 'id1',
				'permanent': false
			}];
			const store = setup();
			const instanceUnderTest = new ChipsPlugin();
			spyOn(chipsConfigurationService, 'all').and.resolveTo(mockChips);

			await instanceUnderTest.register(store);

			expect(store.getState().chips.current).toHaveSize(1);
			expect(store.getState().chips.current[0]).toEqual(mockChips[0]);
		});

		it('loads all chip configurations and publishes all chips requested by query parameter', async () => {
			const chipId = 'id1';
			const queryParam = `${QueryParameters.CHIP_ID}=${chipId}`;
			const mockChips = [{
				'id': 'id0',
				'permanent': false
			}, {
				'id': chipId,
				'permanent': false
			}];
			const store = setup();
			const instanceUnderTest = new ChipsPlugin();
			spyOn(chipsConfigurationService, 'all').and.resolveTo(mockChips);
			spyOnProperty(windowMock.location, 'search').and.returnValue(queryParam);

			await instanceUnderTest.register(store);

			expect(store.getState().chips.current).toHaveSize(1);
			expect(store.getState().chips.current[0]).toEqual(mockChips[1]);
		});

		it('publishes all Topic related chips', async () => {
			const topicId = 'topic0';
			const mockChips = [{
				'id': 'id0',
				'permanent': false
			}, {
				'id': 'id1',
				'permanent': false,
				'observer': {
					'geoResources': [
					],
					'topics': [
						topicId
					]
				}
			}];
			const store = setup({
				topics: {
					current: topicId
				},
				topicsContentPanel: {
					index: 1
				}
			});
			const instanceUnderTest = new ChipsPlugin();
			spyOn(chipsConfigurationService, 'all').and.resolveTo(mockChips);

			await instanceUnderTest.register(store);

			expect(store.getState().chips.current).toHaveSize(1);
			expect(store.getState().chips.current[0]).toEqual(mockChips[1]);
		});

		it('publishes all GeoResource related chips', async () => {
			const geoResourceId = 'geoResourceId0';
			const mockChips = [{
				'id': 'id0',
				'permanent': false
			}, {
				'id': 'id1',
				'permanent': false,
				'observer': {
					'geoResources': [
						geoResourceId
					],
					'topics': [
					]
				}
			}];
			const store = setup({
				layers: {
					active: [createDefaultLayer('foo'), createDefaultLayer('bar', geoResourceId)]
				}
			});
			const instanceUnderTest = new ChipsPlugin();
			spyOn(chipsConfigurationService, 'all').and.resolveTo(mockChips);

			await instanceUnderTest.register(store);

			expect(store.getState().chips.current).toHaveSize(1);
			expect(store.getState().chips.current[0]).toEqual(mockChips[1]);
		});

		it('it registes an observer for Topic related chips', async () => {
			const topicId = 'topic0';
			const mockChips = [{
				'id': 'id0',
				'permanent': false
			}, {
				'id': 'id1',
				'permanent': false,
				'observer': {
					'geoResources': [
					],
					'topics': [
						topicId
					]
				}
			}];
			const store = setup({
				topicsContentPanel: {
					index: 1
				}
			});
			const instanceUnderTest = new ChipsPlugin();
			spyOn(chipsConfigurationService, 'all').and.resolveTo(mockChips);
			await instanceUnderTest.register(store);

			expect(store.getState().chips.current).toHaveSize(0);

			setCurrentTopic(topicId);

			expect(store.getState().chips.current).toHaveSize(1);
			expect(store.getState().chips.current[0]).toEqual(mockChips[1]);
		});

		it('it registes an observer for GeoResource related chips', async () => {
			const geoResourceId = 'geoResourceId0';
			const mockChips = [{
				'id': 'id0',
				'permanent': false
			}, {
				'id': 'id1',
				'permanent': false,
				'observer': {
					'geoResources': [
						geoResourceId
					],
					'topics': [
					]
				}
			}];
			const store = setup();
			const instanceUnderTest = new ChipsPlugin();
			spyOn(chipsConfigurationService, 'all').and.resolveTo(mockChips);
			await instanceUnderTest.register(store);

			expect(store.getState().chips.current).toHaveSize(0);

			addLayer('foo', { geoResourceId: geoResourceId });

			expect(store.getState().chips.current).toHaveSize(1);
			expect(store.getState().chips.current[0]).toEqual(mockChips[1]);
		});
	});
});
