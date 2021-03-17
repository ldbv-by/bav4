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
			const instanceUnderTest = setup( async () => {
				return administrationMock;
			});

			const mockCoordinate = [0, 0]; 

			instanceUnderTest.getAdministration(mockCoordinate).then((returnValue) => {
				expect(returnValue.gemeinde).toEqual(administrationMock.gemeinde);
				expect(returnValue.gemarkung).toEqual(administrationMock.gemarkung);
			});
		}); 
	}); 

	describe('Error handling', () => { 

		it('rejects when backend is not available', (done) => {
			const instanceUnderTest = setup(async () => {
				throw new Error('Administration Provider error');
			});

			const mockCoordinate = [0, 0]; 

			instanceUnderTest.getAdministration(mockCoordinate).then(() => {
				done(new Error('Promise should not be resolved'));
			}, (reason) => {
				expect(reason.message).toBe('Could not load administration from provider: Administration Provider error');
				done();
			});
		});

		it('rejects when no coordinates are delivered', (done) => {
			const instanceUnderTest = setup();

			instanceUnderTest.getAdministration().then(() => {
				done(new Error('Promise should not be resolved'));
			}, (reason) => {
				expect(reason).toEqual(jasmine.any(TypeError));
				expect(reason.message).toBe('Parameter \'coordinate3857\' must be a coordinate');
				done();
			});
		});

		it('rejects when false coordinates are delivered', (done) => {
			const instanceUnderTest = setup();

			instanceUnderTest.getAdministration('false input').then(() => {
				done(new Error('Promise should not be resolved'));
			}, (reason) => {
				expect(reason).toEqual(jasmine.any(TypeError));
				expect(reason.message).toBe('Parameter \'coordinate3857\' must be a coordinate');
				done();
			});
		});
	});
}); 