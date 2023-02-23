import { TestUtils } from '../test-utils.js';
import { $injector } from '../../src/injection/index.js';
import { QueryParameters } from '../../src/domain/queryParameters.js';
import { searchReducer } from '../../src/store/search/search.reducer.js';
import { SearchPlugin } from '../../src/plugins/SearchPlugin.js';

describe('SearchPlugin', () => {
	const windowMock = {
		location: {
			get search() {
				return null;
			}
		}
	};

	const securityService = {
		sanitizeHtml: () => {}
	};

	const setup = (state) => {
		const initialState = {
			search: {
				query: null
			},
			...state
		};

		const store = TestUtils.setupStoreAndDi(initialState, {
			search: searchReducer
		});
		$injector.registerSingleton('EnvironmentService', { getWindow: () => windowMock }).registerSingleton('SecurityService', securityService);
		return store;
	};

	describe('register', () => {
		describe('query parameter available', () => {
			it('puts the requested query term to the store', async () => {
				const term = 'foo';
				const queryParam = `${QueryParameters.QUERY}=${term}`;
				spyOnProperty(windowMock.location, 'search').and.returnValue(queryParam);
				const store = setup();
				spyOn(securityService, 'sanitizeHtml').withArgs(term).and.returnValue(term);
				const instanceUnderTest = new SearchPlugin();

				await instanceUnderTest.register();

				expect(store.getState().search.query.payload).toBe(term);
			});

			it('does nothing when term is not available', async () => {
				const term = '';
				const queryParam = `${QueryParameters.QUERY}=${term}`;
				spyOnProperty(windowMock.location, 'search').and.returnValue(queryParam);
				const store = setup();
				const securityServiceSpy = spyOn(securityService, 'sanitizeHtml');
				const instanceUnderTest = new SearchPlugin();

				await instanceUnderTest.register();

				expect(store.getState().search.query).toBeNull();
				expect(securityServiceSpy).not.toHaveBeenCalled();
			});
		});
	});
});
