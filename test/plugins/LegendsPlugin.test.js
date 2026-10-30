import { QueryParameters } from '@src/domain/queryParameters';
import { $injector } from '@src/injection';
import { LegendsPlugin } from '@src/plugins/LegendsPlugin';
import { setReady } from '@src/store/layers/layers.action';
import { layersReducer } from '@src/store/layers/layers.reducer';
import { legendsReducer } from '@src/store/legends/legends.reducer';
import { hashCode } from '@src/utils/hashCode';
import { TestUtils } from '@test/test-utils.js';

describe('LegendsPlugin', () => {
	const geoResourceLegendServiceMock = {
		available: async () => []
	};
	const environmentService = {
		getQueryParams: () => new URLSearchParams()
	};

	const setup = (state) => {
		const store = TestUtils.setupStoreAndDi(state, {
			legends: legendsReducer,
			layers: layersReducer
		});
		$injector.registerSingleton('GeoResourceLegendService', geoResourceLegendServiceMock).registerSingleton('EnvironmentService', environmentService);

		return store;
	};

	describe('register', () => {
		it('calls _addLegendsFromQueryParams when layers are ready', async () => {
			const store = setup();
			const instanceUnderTest = new LegendsPlugin();
			const spy = vi.spyOn(instanceUnderTest, '_addLegendsFromQueryParams');
			const result = await instanceUnderTest.register(store);

			setReady();

			expect(result).toBe(true);
			expect(spy).toHaveBeenCalledTimes(1);
		});
	});

	describe('_addLegendsFromQueryParams', () => {
		it('adds available legends to the store', async () => {
			const queryParam = new URLSearchParams({
				[QueryParameters.LEGEND]: `${hashCode('layer@legend02')},${hashCode('layer@legend01')},${hashCode('nolayer@legend03')}`
			});
			const available = ['layer@legend01', 'layer@legend02'];
			vi.spyOn(environmentService, 'getQueryParams').mockReturnValue(queryParam);
			vi.spyOn(geoResourceLegendServiceMock, 'available').mockResolvedValue(available);
			const store = setup();
			const instanceUnderTest = new LegendsPlugin();

			await instanceUnderTest._addLegendsFromQueryParams();

			expect(store.getState().legends.active).toHaveLength(2);
			expect(store.getState().legends.active[0]).toBe('layer@legend02');
			expect(store.getState().legends.active[1]).toBe('layer@legend01');
			expect(store.getState().legends.ready).toBe(true);
		});

		it('does nothing when query parameter is not QueryParameters.LEGEND', async () => {
			const queryParam = new URLSearchParams({
				notLegendParam: 'layer@legend01,layer@legend02, nolayer@legend03'
			});
			const available = ['layer@legend01', 'layer@legend02'];
			const store = setup();
			const instanceUnderTest = new LegendsPlugin();

			await instanceUnderTest._addLegendsFromQueryParams(queryParam, available);

			expect(store.getState().legends.active).toHaveLength(0);
			expect(store.getState().legends.ready).toBe(true);
		});

		it('does nothing when no legend is available', async () => {
			const queryParam = new URLSearchParams({
				[QueryParameters.LEGEND]: 'layer@legend01,layer@legend02, nolayer@legend03'
			});
			const available = [];
			const store = setup();
			const instanceUnderTest = new LegendsPlugin();

			await instanceUnderTest._addLegendsFromQueryParams(queryParam, available);

			expect(store.getState().legends.active).toHaveLength(0);
			expect(store.getState().legends.ready).toBe(true);
		});
	});
});
