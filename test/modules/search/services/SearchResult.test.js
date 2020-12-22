import { SearchResult } from '../../../../src/modules/search/services/SearchResult';

describe('Unit tests for class SearchResult', () => {

	it('test constructor and getters', () => {
		const searchResult = new SearchResult('label', 'labelFormated', 'type', [0, 0]);

		expect(searchResult.label).toBe('label');
		expect(searchResult.labelFormated).toBe('labelFormated');
		expect(searchResult.type).toBe('type');
		expect(searchResult.center).toEqual([0, 0]);
		expect(searchResult.extent).toEqual([]);


		const searchResult2 = new SearchResult('label', 'labelFormated', 'type', [0, 0], [0, 0, 1, 1,]);
		expect(searchResult2.extent).toEqual([0, 0, 1, 1]);
	});
});
