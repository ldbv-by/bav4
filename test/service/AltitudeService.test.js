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
	});

});