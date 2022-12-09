import { AltitudeService } from '../../src/services/AltitudeService';
import { loadBvvAltitude } from '../../src/services/provider/altitude.provider';
import { getBvvProfile } from '../../src/services/provider/profile.provider';

describe('AltitudeService', () => {

	const setup = (altitudeProvider = loadBvvAltitude, profileProvider = getBvvProfile) => {
		return new AltitudeService(altitudeProvider, profileProvider);
	};

	describe('init', () => {

		it('initializes the service with custom provider', async () => {
			const customAltitudeProvider = async () => { };
			const customProfileProvider = async () => { };

			const instanceUnderTest = setup(customAltitudeProvider, customProfileProvider);

			expect(instanceUnderTest._altitudeProvider).toBeDefined();
			expect(instanceUnderTest._altitudeProvider).toEqual(customAltitudeProvider);
			expect(instanceUnderTest._profileProvider).toBeDefined();
			expect(instanceUnderTest._profileProvider).toEqual(customProfileProvider);
		});

		it('initializes the service with default provider', async () => {
			const instanceUnderTest = new AltitudeService();

			expect(instanceUnderTest._altitudeProvider).toEqual(loadBvvAltitude);
			expect(instanceUnderTest._profileProvider).toEqual(getBvvProfile);
		});
	});

	describe('getAltitude', () => {

		it('provides a altitude', async () => {
			const mockAltitude = 42;
			const instanceUnderTest = setup(async () => {
				return mockAltitude;
			});
			const mockCoordinate = [0, 0];

			const result = await instanceUnderTest.getAltitude(mockCoordinate);

			expect(result).toEqual(mockAltitude);
		});

		it('rejects when backend is not available', async () => {
			const message = 'Someting got wrong';
			const instanceUnderTest = setup(async () => {
				throw new Error(message);
			});
			const mockCoordinate = [0, 0];

			await expectAsync(instanceUnderTest.getAltitude(mockCoordinate)).toBeRejectedWithError(`Could not load altitude from provider: ${message}`);
		});

		it('rejects when argument is not a coordinate', async () => {
			const instanceUnderTest = setup();

			await expectAsync(instanceUnderTest.getAltitude('invalid input')).toBeRejectedWithError('Parameter \'coordinate3857\' must be a coordinate');
		});
	});

	describe('getProfile', () => {

		it('provides a profile', async () => {
			const mockProfile = { result: 42 };
			const instanceUnderTest = setup(null, async () => {
				return mockProfile;
			});
			const mockCoordinates = [[0, 1], [2, 3]];

			const result = await instanceUnderTest.getProfile(mockCoordinates);

			expect(result).toEqual(mockProfile);
		});

		it('rejects when backend is not available', async () => {
			const message = 'Someting got wrong';
			const instanceUnderTest = setup(null, async () => {
				throw new Error(message);
			});
			const mockCoordinates = [[0, 1], [2, 3]];

			await expectAsync(instanceUnderTest.getProfile(mockCoordinates)).toBeRejectedWithError(`Could not load altitude from provider: ${message}`);
		});

		it('rejects when argument is not an Array or does not contain at least two coordinates', async () => {
			const instanceUnderTest = setup();

			await expectAsync(instanceUnderTest.getProfile('foo')).toBeRejectedWithError('Parameter \'coordinates3857\' must be an array containing at least two coordinates');
			await expectAsync(instanceUnderTest.getProfile([[0, 1]])).toBeRejectedWithError('Parameter \'coordinates3857\' must be an array containing at least two coordinates');
		});

		it('rejects when argument contains not only coordinated', async () => {
			const instanceUnderTest = setup();

			await expectAsync(instanceUnderTest.getProfile([[0, 1], 'foo'])).toBeRejectedWithError('Parameter \'coordinates3857\' contains invalid coordinates');
		});
	});
});
