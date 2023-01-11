import { ElevationService } from '../../src/services/ElevationService';
import { loadBvvElevation } from '../../src/services/provider/elevation.provider';
import { getBvvProfile } from '../../src/services/provider/profile.provider';

describe('ElevationService', () => {

	const setup = (elevationProvider = loadBvvElevation, profileProvider = getBvvProfile) => {
		return new ElevationService(elevationProvider, profileProvider);
	};

	describe('constructor', () => {

		it('initializes the service with custom provider', async () => {
			const customElevationProvider = async () => { };
			const customProfileProvider = async () => { };

			const instanceUnderTest = setup(customElevationProvider, customProfileProvider);

			expect(instanceUnderTest._elevationProvider).toBeDefined();
			expect(instanceUnderTest._elevationProvider).toEqual(customElevationProvider);
			expect(instanceUnderTest._profileProvider).toBeDefined();
			expect(instanceUnderTest._profileProvider).toEqual(customProfileProvider);
		});

		it('initializes the service with default provider', async () => {
			const instanceUnderTest = new ElevationService();

			expect(instanceUnderTest._elevationProvider).toEqual(loadBvvElevation);
			expect(instanceUnderTest._profileProvider).toEqual(getBvvProfile);
		});
	});

	describe('getElevation', () => {

		it('provides a elevation', async () => {
			const mockElevation = 42;
			const instanceUnderTest = setup(async () => {
				return mockElevation;
			});
			const mockCoordinate = [0, 0];

			const result = await instanceUnderTest.getElevation(mockCoordinate);

			expect(result).toEqual(mockElevation);
		});

		it('rejects when backend is not available', async () => {
			const message = 'Someting got wrong';
			const instanceUnderTest = setup(async () => {
				throw new Error(message);
			});
			const mockCoordinate = [0, 0];

			await expectAsync(instanceUnderTest.getElevation(mockCoordinate)).toBeRejectedWithError(`Could not load elevation from provider: ${message}`);
		});

		it('rejects when argument is not a coordinate', async () => {
			const instanceUnderTest = setup();

			await expectAsync(instanceUnderTest.getElevation('invalid input')).toBeRejectedWithError('Parameter \'coordinate3857\' must be a coordinate');
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
