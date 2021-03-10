import { AltitudeService } from '../../src/services/AltitudeService';
import { loadBvvAltitude } from '../../src/services/provider/altitude.provider';

describe('AltitudeService', () => {

	const setup = (provider = loadBvvAltitude) => {
		return new AltitudeService(provider);
	}; 

	describe('init', () => {

		it('initializes the service', async () => {
			const instanceUnderTest = setup();
			expect(instanceUnderTest._altitudeProvider).toBeDefined();
			expect(instanceUnderTest._altitudeProvider).toEqual(loadBvvAltitude);
		});

		it('initializes the service with default provider', async () => {
			const instanceUnderTest = new AltitudeService();
			expect(instanceUnderTest._altitudeProvider).toEqual(loadBvvAltitude);
		});

		it('provides the altitude', async () => {

			const mockAltitude = 42;
			const instanceUnderTest = setup( async () => {
				return mockAltitude;
			});

			const mockCoordinate = [0, 0]; 

			instanceUnderTest.getAltitude(mockCoordinate).then(() => {
				expect(instanceUnderTest._altitude).toEqual(mockAltitude);
			});

		}); 

		it('rejects with no coordinates committed', (done) => {
			const mockAltitude = 42;
			const instanceUnderTest = setup( async () => {
				return mockAltitude;
			});

			const mockCoordinate = null; 

			instanceUnderTest.getAltitude(mockCoordinate).then(() => {
				done(new Error('No coordinates committed: '));
			}, (reason) => {
				expect(instanceUnderTest._altitude).toBeNull();
				expect(reason).toEqual(new Error ('No coordinates committed: ' + mockCoordinate));
				done();
			});
		});

		it('rejects when backend is not available', (done) => {

			const instanceUnderTest = setup(async () => {
				throw new Error('Altitude could not be loaded');
			});

			expect(instanceUnderTest._altitude).toBeNull();
			const mockCoordinate = [0, 0]; 

			instanceUnderTest.getAltitude(mockCoordinate).then(() => {
				done(new Error('Promise should not be resolved'));
			}, (reason) => {
				expect(instanceUnderTest._altitude).toBeNull();
				expect(reason).toBe('AltitudeService could not be loaded: Altitude could not be loaded');
				done();
			});

		});
	});

});