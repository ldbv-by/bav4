import { AltitudeService } from '../../src/services/AltitudeService';
import { loadBvvAltitude } from '../../src/services/provider/altitude.provider';

describe('AltitudeService', () => {

	const setup = (provider = loadBvvAltitude) => {
		return new AltitudeService(provider);
	};

	describe('init', () => {

		it('initializes the service with custom provider', async () => {
			const customProvider = async () => { };
			const instanceUnderTest = setup(customProvider);
			expect(instanceUnderTest._altitudeProvider).toBeDefined();
			expect(instanceUnderTest._altitudeProvider).toEqual(customProvider);
		});

		it('initializes the service with default provider', async () => {
			const instanceUnderTest = new AltitudeService();
			expect(instanceUnderTest._altitudeProvider).toEqual(loadBvvAltitude);
		});

		it('provides the altitude', async () => {
			const mockAltitude = 42;
			const instanceUnderTest = setup(async () => {
				return mockAltitude;
			});
			const mockCoordinate = [0, 0];

			const result = await instanceUnderTest.getAltitude(mockCoordinate);

			expect(result).toEqual(mockAltitude);
		});
	});

	describe('Error handling', () => {

		it('rejects when backend is not available', async () => {
			const instanceUnderTest = setup(async () => {
				throw new Error('Altitude Provider error');
			});
			const mockCoordinate = [0, 0];

			try {
				await instanceUnderTest.getAltitude(mockCoordinate);
				throw new Error('Promise should not be resolved');
			}
			catch (error) {
				expect(error.message).toBe('Could not load altitude from provider: Altitude Provider error');
			}
		});

		it('rejects when argument is not a coordinate', async () => {
			const instanceUnderTest = setup();

			try {
				await instanceUnderTest.getAltitude('invalid input');
				throw new Error('Promise should not be resolved');
			}
			catch (error) {
				expect(error).toEqual(jasmine.any(TypeError));
				expect(error.message).toBe('Parameter \'coordinate3857\' must be a coordinate');
			}
		});
	});
});
