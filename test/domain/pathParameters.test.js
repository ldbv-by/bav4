import { PathParameters } from '../../src/domain/pathParameters';

describe('PathParameters', () => {
	it('provides an enum of all valid path parameters', () => {
		expect(Object.keys(PathParameters).length).toBe(1);

		expect(PathParameters.EMBED).toBe('embed.html');
	});
});
