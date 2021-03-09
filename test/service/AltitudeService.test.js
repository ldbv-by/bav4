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

		it('rejects when backend is not available', (done) => {

			const instanceUnderTest = setup(async () => {
				throw new Error('Altitude could not be loaded');
			});

			expect(instanceUnderTest._altitude).toEqual(0);
			const mockCoordinate = [0, 0]; 

			instanceUnderTest.getAltitude(mockCoordinate).then(() => {
				done(new Error('Promise should not be resolved'));
			}, (reason) => {
				expect(instanceUnderTest._altitude).toEqual(0);
				expect(reason).toBe('AltitudeService could not be loaded: Altitude could not be loaded');
				done();
			});

		});
	});

});