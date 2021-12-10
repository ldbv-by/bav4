import { AdministrationService } from '../../src/services/AdministrationService';
import { loadBvvAdministration } from '../../src/services/provider/administration.provider';

describe('AdministrationService', () => {

	const setup = (provider = loadBvvAdministration) => {
		return new AdministrationService(provider);
	};

	describe('init', () => {

		it('initializes the service with custom provider', async () => {
			const customProvider = async () => { };
			const instanceUnderTest = setup(customProvider);
			expect(instanceUnderTest._administrationProvider).toBeDefined();
			expect(instanceUnderTest._administrationProvider).toEqual(customProvider);
		});

		it('initializes the service with default provider', async () => {
			const instanceUnderTest = new AdministrationService();
			expect(instanceUnderTest._administrationProvider).toEqual(loadBvvAdministration);
		});

		it('provides the administration values', async () => {
			const administrationMock = { gemeinde: 'LDBV', gemarkung: 'Ref42' };
			const instanceUnderTest = setup(async () => {
				return administrationMock;
			});
			const mockCoordinate = [0, 0];

			const result = await instanceUnderTest.getAdministration(mockCoordinate);

			expect(result.gemeinde).toEqual(administrationMock.gemeinde);
			expect(result.gemarkung).toEqual(administrationMock.gemarkung);
		});
	});

	describe('Error handling', () => {

		it('rejects when backend is not available', async () => {
			const instanceUnderTest = setup(async () => {
				throw new Error('Administration Provider error');
			});

			const mockCoordinate = [0, 0];

			try {
				await instanceUnderTest.getAdministration(mockCoordinate);
				throw new Error('Promise should not be resolved');
			}
			catch (error) {
				expect(error.message).toBe('Could not load administration from provider: Administration Provider error');
			}
		});

		it('rejects when no coordinates are delivered', async () => {
			const instanceUnderTest = setup();

			try {
				await instanceUnderTest.getAdministration();
				throw new Error('Promise should not be resolved');
			}
			catch (error) {
				expect(error).toEqual(jasmine.any(TypeError));
				expect(error.message).toBe('Parameter \'coordinate3857\' must be a coordinate');
			}
		});

		it('rejects when false coordinates are delivered', async () => {
			const instanceUnderTest = setup();

			try {
				await instanceUnderTest.getAdministration('invalid input');
				throw new Error('Promise should not be resolved');
			}
			catch (error) {
				expect(error).toEqual(jasmine.any(TypeError));
				expect(error.message).toBe('Parameter \'coordinate3857\' must be a coordinate');
			}
		});
	});
});
