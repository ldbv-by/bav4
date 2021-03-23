import { QueryParameters } from '../../../src/services/domain/queryParameters';

describe('QueryParameters', () => {

	it('provides an enum of all valid query parameters', () => {
		expect(Object.keys(QueryParameters).length).toBe(6);
		
		expect(QueryParameters.CENTER).toBe('c');
		expect(QueryParameters.ZOOM).toBe('z');
		expect(QueryParameters.LAYER).toBe('l');
		expect(QueryParameters.LAYER_VISIBILITY).toBe('l_v');
		expect(QueryParameters.LAYER_OPACITY).toBe('l_o');
		expect(QueryParameters.TOPIC).toBe('t');
	});
});