import { $injector } from '@src/injection';
import { ElevationService } from '@src/services/ElevationService';
import { loadBvvElevation } from '@src/services/provider/elevation.provider';
import { getBvvProfile } from '@src/services/provider/profile.provider';
import { elevationProfileReducer } from '@src/store/elevationProfile/elevationProfile.reducer';
import { hashCode } from '@src/utils/hashCode';
import { TestUtils } from '@test/test-utils';

describe('ElevationService', () => {
	const environmentService = {
		isStandalone: () => false
	};

	let store;

	const setup = (elevationProvider = loadBvvElevation, profileProvider = getBvvProfile) => {
		store = TestUtils.setupStoreAndDi(
			{},
			{
				elevationProfile: elevationProfileReducer
			}
		);
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
		it('provides an elevation', async () => {
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

			await expect(instanceUnderTest.getElevation(mockCoordinate)).rejects.toEqual(
				expect.objectContaining({
					message: 'Could not load an elevation from provider',
					cause: providerError
				})
			);
		});

		it('rejects when argument is not a coordinate', async () => {
			const instanceUnderTest = setup();

			await expect(instanceUnderTest.getElevation('invalid input')).rejects.toEqual(
				new TypeError("Parameter 'coordinate3857' must be a CoordinateLike type")
			);
		});

		describe('in standalone mode', () => {
			it('provides a mocked elevation', async () => {
				const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

				vi.spyOn(environmentService, 'isStandalone').mockReturnValue(true);
				const instanceUnderTest = setup();

				const result = await instanceUnderTest.getElevation([0, 0]);

				expect(result).toBeGreaterThanOrEqual(500);
				expect(warnSpy).toHaveBeenCalledWith('Could not fetch an elevation from backend. Returning a mocked value ...');
			});
		});
	});

	describe('_prepareProfile', () => {
		it('provides a profile', async () => {
			const id = 'id';
			const mockProfile = { result: 42 };
			const instanceUnderTest = setup(null, async () => {
				return mockProfile;
			});
			const mockCoordinates = [
				[0, 1],
				[2, 3]
			];

			const result = await instanceUnderTest._prepareProfile(id, mockCoordinates);

			expect(result).toEqual(mockProfile);
			// results should be always a deep copy
			expect(result === mockProfile).toBe(false);
		});

		it('provides a profile from cache', async () => {
			const id = 'id';
			const mockProfile = { result: 42 };

			const providerSpy = vi.fn().mockResolvedValue(mockProfile);

			const instanceUnderTest = setup(null, providerSpy);
			const mockCoordinates = [
				[0, 1],
				[2, 3]
			];

			const result0 = await instanceUnderTest._prepareProfile(id, mockCoordinates);
			const result1 = await instanceUnderTest._prepareProfile(id, mockCoordinates);

			expect(result0).toEqual(mockProfile);
			expect(result1).toEqual(mockProfile);
			expect(providerSpy).toHaveBeenCalledTimes(1);
			// results should be always a deep copy
			expect(result0 === result1).toBe(false);
		});

		it('clears the cache', async () => {
			const id = 'id';
			const otherId = 'otherId';
			const mockProfile = { result: 42 };

			const providerSpy = vi.fn().mockResolvedValue(mockProfile);

			const instanceUnderTest = setup(null, providerSpy);
			const mockCoordinates = [
				[0, 1],
				[2, 3]
			];
			const otherMockCoordinates = [
				[4, 5],
				[6, 7]
			];

			await instanceUnderTest._prepareProfile(id, mockCoordinates);
			await instanceUnderTest._prepareProfile(otherId, otherMockCoordinates);
			await instanceUnderTest._prepareProfile(id, mockCoordinates);

			expect(providerSpy).toHaveBeenCalledTimes(3);
		});

		describe('in standalone mode', () => {
			it('provides a mocked profile', async () => {
				const id = 'id';
				const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
				vi.spyOn(environmentService, 'isStandalone').mockReturnValue(true);
				const instanceUnderTest = setup();
				const mockCoordinates = [
					[0, 1],
					[2, 3],
					[4, 5]
				];

				const { elevations, stats, attrs } = await instanceUnderTest._prepareProfile(id, mockCoordinates);

				expect(elevations).toHaveLength(3);
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
				expect(attrs).toHaveLength(0);
				expect(warnSpy).toHaveBeenCalledWith('Could not fetch an elevation profile from backend. Returning a mocked profile ...');
			});
		});
	});

	describe('requestProfile', () => {
		it('rejects when backend is not available', async () => {
			const providerError = new Error('Something got wrong');
			const instanceUnderTest = setup(null, async () => {
				throw providerError;
			});
			const mockCoordinates = [
				[0, 1],
				[2, 3]
			];

			await expect(instanceUnderTest.requestProfile(mockCoordinates)).rejects.toEqual(
				expect.objectContaining({
					message: 'Could not load an elevation profile from provider',
					cause: providerError
				})
			);
		});

		it('rejects when argument is not an Array or does not contain at least two coordinates', async () => {
			const instanceUnderTest = setup();

			await expect(instanceUnderTest.requestProfile('foo')).rejects.toEqual(
				new TypeError("Parameter 'coordinates3857' must be an array containing at least two coordinates")
			);
			await expect(instanceUnderTest.requestProfile([[0, 1]])).rejects.toEqual(
				new TypeError("Parameter 'coordinates3857' must be an array containing at least two coordinates")
			);
		});

		it('rejects when argument contains not only coordinated', async () => {
			const instanceUnderTest = setup();

			await expect(instanceUnderTest.requestProfile([[0, 1], 'foo'])).rejects.toEqual(
				new TypeError("Parameter 'coordinates3857' contains invalid coordinates")
			);
		});

		it('calls _prepareProfile and updates the elevationProfile s-o-s', async () => {
			const mockProfile = { result: 42 };
			const instanceUnderTest = setup(null, async () => {
				return mockProfile;
			});
			const mockCoordinates = [
				[0, 1],
				[2, 3]
			];
			const id = `${hashCode(mockCoordinates)}`;
			const prepareProfileSpy = vi.spyOn(instanceUnderTest, '_prepareProfile').mockResolvedValue(mockProfile);

			const result = await instanceUnderTest.requestProfile(mockCoordinates);

			expect(result).toEqual(mockProfile);
			expect(store.getState().elevationProfile.id).toBe(id);
			expect(prepareProfileSpy).toHaveBeenCalledWith(id, mockCoordinates);
		});
	});

	describe('fetchProfile', () => {
		it('returns an existing profile result', async () => {
			const id = 'id';
			const mockProfile = { result: 42 };
			const instanceUnderTest = setup(null, async () => {
				return mockProfile;
			});
			const mockCoordinates = [
				[0, 1],
				[2, 3]
			];
			// cache the profile
			await instanceUnderTest._prepareProfile(id, mockCoordinates);

			const result = instanceUnderTest.fetchProfile(id);

			expect(result).toEqual(mockProfile);
			// results should be always a deep copy
			expect(result === mockProfile).toBe(false);
		});

		it('returns NULL when not available', async () => {
			const id = 'id';
			const instanceUnderTest = setup();

			const result = instanceUnderTest.fetchProfile(id);

			expect(result).toBeNull();
		});
	});
});
