import { $injector } from '@src/injection';
import { MediaType } from '@src/domain/mediaTypes';
import { getBvvProfile } from '@src/services/provider/profile.provider';
import { CoordinateSimplificationTarget } from '@src/services/OlCoordinateService';

describe('profile provider', () => {
	const mockProfileResponse = {
		alts: [
			{
				dist: 0.0,
				alt: 566.2,
				e: 4473088.0,
				n: 5477632.0
			},
			{
				dist: 923.5351,
				alt: 569.0,
				e: 4472871.5,
				n: 5476734.0
			},
			{
				dist: 1847.0936,
				alt: 568.7,
				e: 4472655.0,
				n: 5475836.5
			},
			{
				dist: 2770.6287,
				alt: 553.2,
				e: 4472438.5,
				n: 5474938.5
			},
			{
				dist: 3694.1638,
				alt: 547.6,
				e: 4472222.0,
				n: 5474041.0
			}
		],
		stats: {
			sumUp: 1480.8,
			sumDown: 1668.6,
			linearDistance: 1234.5
		},
		attrs: [
			{
				id: 'slope',
				values: [
					[0, 2, 0.1],
					[3, 4, 0.21]
				]
			},
			{
				id: 'surface',
				values: [
					[0, 2, 'asphalt'],
					[3, 4, 'missing']
				]
			}
		]
	};

	const mockUpdatedProfileResponse = {
		alts: [
			{
				dist: 0.0,
				alt: 566.2,
				e: 4473088.0,
				n: 5477632.0
			},
			{
				dist: 923.5351,
				alt: 569.0,
				e: 4472871.5,
				n: 5476734.0
			},
			{
				dist: 1847.0936,
				alt: 568.7,
				e: 4472655.0,
				n: 5475836.5
			},
			{
				dist: 2770.6287,
				alt: 553.2,
				e: 4472438.5,
				n: 5474938.5
			},
			{
				dist: 3694.1638,
				alt: 547.6,
				e: 4472222.0,
				n: 5474041.0
			}
		],
		stats: {
			sumUp: 1480.8,
			sumDown: 1668.6,
			linearDistance: 42 // changed/updated by profile provider
		},
		attrs: [
			{
				id: 'slope',
				values: [
					[0, 2, 0.1],
					[3, 4, 0.21]
				]
			},
			{
				id: 'surface',
				values: [
					[0, 2, 'asphalt'],
					[3, 4, 'missing']
				]
			}
		]
	};

	describe('getBvvProfile', () => {
		const configService = {
			getValueAsPath() {}
		};

		const httpService = {
			async post() {}
		};
		const coordinateService = {
			simplify() {},
			toCoordinate() {}
		};

		const mapService = {
			calcLength() {}
		};

		beforeEach(() => {
			$injector
				.registerSingleton('ConfigService', configService)
				.registerSingleton('HttpService', httpService)
				.registerSingleton('MapService', mapService)
				.registerSingleton('CoordinateService', coordinateService);
		});
		afterEach(() => {
			$injector.reset();
		});

		it('fetches a profile', async () => {
			const backendUrl = 'https://backend.url';
			const coords = [
				[0, 1],
				[2, 3]
			];
			const expectedPayload = JSON.stringify({
				coords: [
					{ e: 0, n: 1 },
					{ e: 2, n: 3 }
				]
			});
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(`${backendUrl}/`);
			const coordinateServiceSpy0 = vi.spyOn(coordinateService, 'simplify').mockReturnValue(coords);
			const coordinateServiceSpy1 = vi.spyOn(coordinateService, 'toCoordinate').mockReturnValue(coords);
			const mapServiceSpy = vi.spyOn(mapService, 'calcLength').mockReturnValue(42);
			const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response(JSON.stringify(mockProfileResponse)));

			const profile = await getBvvProfile(coords);

			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
			expect(coordinateServiceSpy0).toHaveBeenCalledWith(coords, CoordinateSimplificationTarget.ELEVATION_PROFILE);
			expect(coordinateServiceSpy1).toHaveBeenCalledWith(coords);
			expect(mapServiceSpy).toHaveBeenCalledWith(coords);
			expect(httpServiceSpy).toHaveBeenCalledWith(`${backendUrl}/dem/profile`, expectedPayload, MediaType.JSON);
			expect(profile).toEqual(mockUpdatedProfileResponse);
		});

		it('throws an error when backend request cannot be fulfilled', async () => {
			const backendUrl = 'https://backend.url';
			const coords = [
				[0, 1],
				[2, 3]
			];
			const expectedPayload = JSON.stringify({
				coords: [
					{ e: 0, n: 1 },
					{ e: 2, n: 3 }
				]
			});
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(`${backendUrl}/`);
			const coordinateServiceSpy0 = vi.spyOn(coordinateService, 'simplify').mockReturnValue(coords);
			const coordinateServiceSpy1 = vi.spyOn(coordinateService, 'toCoordinate').mockReturnValue(coords);
			const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response(JSON.stringify({}), { status: 500 }));

			await expect(getBvvProfile(coords)).rejects.toThrow('Profile could not be fetched: Http-Status 500');
			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
			expect(coordinateServiceSpy0).toHaveBeenCalledWith(coords, CoordinateSimplificationTarget.ELEVATION_PROFILE);
			expect(coordinateServiceSpy1).toHaveBeenCalledWith(coords);
			expect(httpServiceSpy).toHaveBeenCalledWith(`${backendUrl}/dem/profile`, expectedPayload, MediaType.JSON);
		});
	});
});
