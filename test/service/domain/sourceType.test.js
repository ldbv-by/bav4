import { SourceType } from '../../../src/services/domain/sourceType';

describe('SourceType', () => {

	it('provides getter for properties', () => {

		const sourceType = new SourceType('name', 'version');

		expect(sourceType.name).toBe('name');
		expect(sourceType.version).toBe('version');
	});

	it('provides default properties', () => {

		const sourceType = new SourceType('name', undefined);

		expect(sourceType.name).toBe('name');
		expect(sourceType.version).toBeNull();
	});
});
