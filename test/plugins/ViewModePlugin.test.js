import { QueryParameters } from '@src/domain/queryParameters';
import { ViewMode } from '@src/domain/view';
import { $injector } from '@src/injection';
import { ViewModePlugin } from '@src/plugins/ViewModePlugin';
import { viewReducer } from '@src/store/view/view.reducer';
import { TestUtils } from '@test/test-utils';

describe('ObserveStateForEncodingPlugin', () => {
	const environmentService = {
		getQueryParams: () => new URLSearchParams()
	};

	const setup = () => {
		const store = TestUtils.setupStoreAndDi(
			{},
			{
				view: viewReducer
			}
		);
		$injector.registerSingleton('EnvironmentService', environmentService);
		return store;
	};

	describe('no suitable query-param available', () => {
		it('sets `ViewMode.D2` as default mode', async () => {
			const store = setup();
			const instanceUnderTest = new ViewModePlugin();

			await instanceUnderTest.register(store);

			expect(store.getState().view.mode).toBe(ViewMode.D2);
		});
	});

	describe('query-param is unknown', () => {
		it('sets `D2` as view mode', async () => {
			const store = setup();
			const queryParam = new URLSearchParams(`${QueryParameters.VIEW_MODE}=foo`);
			vi.spyOn(environmentService, 'getQueryParams').mockReturnValue(queryParam);
			const instanceUnderTest = new ViewModePlugin();

			await instanceUnderTest.register(store);

			expect(store.getState().view.mode).toBe(ViewMode.D2);
		});
	});

	describe('query-param is `2d`', () => {
		it('sets `D2` as view mode', async () => {
			const store = setup();
			const queryParam = new URLSearchParams(`${QueryParameters.VIEW_MODE}=${ViewMode.D2}`);
			vi.spyOn(environmentService, 'getQueryParams').mockReturnValue(queryParam);
			const instanceUnderTest = new ViewModePlugin();

			await instanceUnderTest.register(store);

			expect(store.getState().view.mode).toBe(ViewMode.D2);
		});
	});
	describe('query-param is `3d`', () => {
		it('sets `D3` as view mode', async () => {
			const queryParam = new URLSearchParams(`${QueryParameters.VIEW_MODE}=${ViewMode.D3}`);
			const store = setup();
			vi.spyOn(environmentService, 'getQueryParams').mockReturnValue(queryParam);
			const instanceUnderTest = new ViewModePlugin();

			await instanceUnderTest.register(store);

			expect(store.getState().view.mode).toBe(ViewMode.D3);
		});
	});
});
