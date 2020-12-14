import { BvvSearchService } from '../../../../../../src/components/toolbox/search/autocomplete/service/BvvSearchService';
import { $injector } from '../../../../../../src/injection';


describe('tests for BvvSearchService', () => {


	const mockResponse = { 'results': [{ 'attrs': { 'bbox': [10.268321055918932, 48.441788353957236, 10.271912282332778, 48.450982798822224], 'x': 10.270116669125855, 'y': 48.44638557638974, 'label': '<b>Wasserburger</b> <b>Weg</b>, Günzburg' } }, { 'attrs': { 'bbox': [10.256737181916833, 48.43567497096956, 10.258241482079029, 48.436685535125434], 'x': 10.257489331997931, 'y': 48.436180253047496, 'label': '<b>Wasserburger</b> <b>Weg</b>, Bubesheim' } }, { 'attrs': { 'bbox': [10.279701417312026, 48.409654651768506, 10.280982004478574, 48.4118413226679], 'x': 10.2803417108953, 'y': 48.4107479872182, 'label': '<b>Wasserburger</b> <b>Weg</b>, Kötz - Großkötz' } }], 'otherDocs': 0 };
	const mockHttpService = {
		fetch: () => {}
	};
	beforeAll(() => {
		$injector
			.registerSingleton('ConfigService', { getValue: () => '' })
			.registerSingleton('HttpService', mockHttpService);
	});

	describe('getData()', () => {

		it('provides an array of search results', async () => {
			const searchService = new BvvSearchService();
			const mockServiceSpy = spyOn(mockHttpService, 'fetch').and.returnValue(Promise.resolve({
				json: () => {
					return mockResponse;
				}
			}));

			const results = await searchService.getData('something');

			expect(mockServiceSpy).toHaveBeenCalled();
			expect(results.length).toBe(3);
		});

		it('provides an empy array if backend request cannot be fulfilled', async () => {
			const searchService = new BvvSearchService();
			const mockServiceSpy = spyOn(mockHttpService, 'fetch').and.returnValue(Promise.reject({
				message: 'Something got wrong'
			}));

			const results = await searchService.getData('something');

			expect(mockServiceSpy).toHaveBeenCalled();
			expect(results.length).toBe(0);
		});
	});
});