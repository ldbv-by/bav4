import { $injector } from '@src/injection';
import { QueryParameters } from '@src/domain/queryParameters';
import { LegendsPlugin } from '@src/plugins/LegendsPlugin';
import { TestUtils } from '@test/test-utils.js';
import { legendsReducer } from '@src/store/legends/legends.reducer';
import { hashCode } from '@src/utils/hashCode';

describe('LegendsPlugin', () => {
	const geoResourceLegendServiceMock = {
		available: () => []
	};
	const environmentService = {
		getQueryParams: () => new URLSearchParams()
	};

	const setup = (state) => {
		const store = TestUtils.setupStoreAndDi(state, {
			legends: legendsReducer
		});
		$injector.registerSingleton('GeoResourceLegendService', geoResourceLegendServiceMock).registerSingleton('EnvironmentService', environmentService);

		return store;
	};

	describe('register', () => {
		it('calls #_init and awaits its completion', async () => {
			const store = setup();
			const instanceUnderTest = new LegendsPlugin();
			const spy = vi.spyOn(instanceUnderTest, '_init').mockResolvedValue(true);

			const result = await instanceUnderTest.register(store);

			expect(result).toBe(true);
			expect(spy).toHaveBeenCalledTimes(1);
		});
	});

	describe('_init', () => {
		it('initializes the GeoResourceLegendService and calls #_addLegendsFromQueryParams', async () => {
			const store = setup();
			const instanceUnderTest = new LegendsPlugin();
			const paramSpy = vi.spyOn(instanceUnderTest, '_addLegendsFromQueryParams').mockImplementation(() => {});
			const geoResourceLegendServiceSpy = vi.spyOn(geoResourceLegendServiceMock, 'available').mockImplementation(() => []);

			await instanceUnderTest._init(store);

			expect(geoResourceLegendServiceSpy).toHaveBeenCalledTimes(1);
			expect(paramSpy).toHaveBeenCalledTimes(1);
		});

		describe('_addLegendsFromQueryParams', () => {
			it('adds available legends to the store', () => {
				const queryParam = new URLSearchParams({
					[QueryParameters.LEGEND]: `${hashCode('layer@legend02')},${hashCode('layer@legend01')},${hashCode('nolayer@legend03')}`
				});
				const available = ['layer@legend01', 'layer@legend02'];
				const store = setup();
				const instanceUnderTest = new LegendsPlugin();
				instanceUnderTest._addLegendsFromQueryParams(queryParam, available);
				console.log(store.getState().legends.active);
				expect(store.getState().legends.active).toHaveLength(2);
				expect(store.getState().legends.active[0]).toBe('layer@legend02');
				expect(store.getState().legends.active[1]).toBe('layer@legend01');
			});

			it('does nothing when query parameter is not QueryParameters.LEGEND', () => {
				const queryParam = new URLSearchParams({
					notLegendParam: 'layer@legend01,layer@legend02, nolayer@legend03'
				});
				const available = ['layer@legend01', 'layer@legend02'];
				const store = setup();
				const instanceUnderTest = new LegendsPlugin();
				instanceUnderTest._addLegendsFromQueryParams(queryParam, available);

				expect(store.getState().legends.active).toHaveLength(0);
			});

			it('does nothing when no legend is available', () => {
				const queryParam = new URLSearchParams({
					[QueryParameters.LEGEND]: 'layer@legend01,layer@legend02, nolayer@legend03'
				});
				const available = [];
				const store = setup();
				const instanceUnderTest = new LegendsPlugin();
				instanceUnderTest._addLegendsFromQueryParams(queryParam, available);

				expect(store.getState().legends.active).toHaveLength(0);
			});
		});
	});
});
