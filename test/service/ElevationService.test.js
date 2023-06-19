import { $injector } from '../../src/injection';
import { ElevationService } from '../../src/services/ElevationService';
import { loadBvvElevation } from '../../src/services/provider/elevation.provider';
import { getBvvProfile } from '../../src/services/provider/profile.provider';

describe('ElevationService', () => {
	const environmentService = {
		isStandalone: () => false
	};

	const setup = (elevationProvider = loadBvvElevation, profileProvider = getBvvProfile) => {
		$injector.registerSingleton('EnvironmentService', environmentService);
		return new ElevationService(elevationProvider, profileProvider);
	};

	afterEach(() => {
		$injector.reset();
	});

	describe('constructor', () => {
		it('initializes the service with custom provider', async () => {
			const customElevationProvider = async () => {};
			const customProfileProvider = async () => {};

			const instanceUnderTest = setup(customElevationProvider, customProfileProvider);

			expect(instanceUnderTest._elevationProvider).toBeDefined();
			expect(instanceUnderTest._elevationProvider).toEqual(customElevationProvider);
			expect(instanceUnderTest._profileProvider).toBeDefined();
			expect(instanceUnderTest._profileProvider).toEqual(customProfileProvider);
		});

		it('initializes the service with default provider', async () => {
			setup();
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
			const providerError = new Error('Something got wrong');
			const instanceUnderTest = setup(async () => {
				throw providerError;
			});
			const mockCoordinate = [0, 0];

			await expectAsync(instanceUnderTest.getElevation(mockCoordinate)).toBeRejectedWith(
				jasmine.objectContaining({
					message: 'Could not load an elevation from provider',
					cause: providerError
				})
			);
		});

		it('rejects when argument is not a coordinate', async () => {
			const instanceUnderTest = setup();

			await expectAsync(instanceUnderTest.getElevation('invalid input')).toBeRejectedWithError(
				TypeError,
				"Parameter 'coordinate3857' must be a coordinate"
			);
		});

		describe('in standalone mode', () => {
			it('provides a mocked elevation', async () => {
				const warnSpy = spyOn(console, 'warn');
				spyOn(environmentService, 'isStandalone').and.returnValue(true);
				const instanceUnderTest = setup();

				const result = await instanceUnderTest.getElevation([0, 0]);

				expect(result).toBeGreaterThanOrEqual(500);
				expect(warnSpy).toHaveBeenCalledWith('Could not fetch an elevation from backend. Returning a mocked value ...');
			});
		});
	});

	describe('getProfile', () => {
		it('provides a profile', async () => {
			const mockProfile = { result: 42 };
			const instanceUnderTest = setup(null, async () => {
				return mockProfile;
			});
			const mockCoordinates = [
				[0, 1],
				[2, 3]
			];

			const result = await instanceUnderTest.getProfile(mockCoordinates);

			expect(result).toEqual(mockProfile);
		});

		it('rejects when backend is not available', async () => {
			const providerError = new Error('Something got wrong');
			const instanceUnderTest = setup(null, async () => {
				throw providerError;
			});
			const mockCoordinates = [
				[0, 1],
				[2, 3]
			];

			await expectAsync(instanceUnderTest.getProfile(mockCoordinates)).toBeRejectedWith(
				jasmine.objectContaining({
					message: 'Could not load an elevation profile from provider',
					cause: providerError
				})
			);
		});

		it('rejects when argument is not an Array or does not contain at least two coordinates', async () => {
			const instanceUnderTest = setup();

			await expectAsync(instanceUnderTest.getProfile('foo')).toBeRejectedWithError(
				TypeError,
				"Parameter 'coordinates3857' must be an array containing at least two coordinates"
			);
			await expectAsync(instanceUnderTest.getProfile([[0, 1]])).toBeRejectedWithError(
				TypeError,
				"Parameter 'coordinates3857' must be an array containing at least two coordinates"
			);
		});

		it('rejects when argument contains not only coordinated', async () => {
			const instanceUnderTest = setup();

			await expectAsync(instanceUnderTest.getProfile([[0, 1], 'foo'])).toBeRejectedWithError(
				TypeError,
				"Parameter 'coordinates3857' contains invalid coordinates"
			);
		});

		describe('in standalone mode', () => {
			it('provides a mocked profile', async () => {
				const warnSpy = spyOn(console, 'warn');
				spyOn(environmentService, 'isStandalone').and.returnValue(true);
				const instanceUnderTest = setup();
				const mockCoordinates = [
					[0, 1],
					[2, 3],
					[4, 5]
				];

				const { elevations, stats, attrs } = await instanceUnderTest.getProfile(mockCoordinates);

				expect(elevations).toHaveSize(3);
				elevations.forEach((el, i) => {
					expect(el.dist).toBeGreaterThanOrEqual(0);
					expect(el.z).toBeGreaterThan(500);
					expect([el.e, el.n]).toEqual(mockCoordinates[i]);
				});
				expect(stats).toEqual({
					sumUp: 0,
					sumDown: 0,
					verticalHeight: 0,
					highestPoint: 0,
					lowestPoint: 0,
					linearDistance: 0
				});
				expect(attrs).toHaveSize(0);
				expect(warnSpy).toHaveBeenCalledWith('Could not fetch an elevation profile from backend. Returning a mocked profile ...');
			});
		});
	});
});
