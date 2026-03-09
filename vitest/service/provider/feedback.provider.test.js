import { $injector } from '@src/injection';
import { MediaType } from '@src/domain/mediaTypes';
import { GeneralFeedback, MapFeedback } from '@src/services/FeedbackService';
import {
	bvvMapFeedbackCategoriesProvider,
	bvvFeedbackStorageProvider,
	bvvMapFeedbackOverlayGeoResourceProvider,
	bvvGeneralFeedbackCategoriesProvider
} from '@src/services/provider/feedback.provider';

describe('bvvFeedbackStorageProvider', () => {
	const configService = {
		getValueAsPath: () => {}
	};

	const httpService = {
		post: async () => {}
	};

	beforeEach(() => {
		$injector.registerSingleton('ConfigService', configService).registerSingleton('HttpService', httpService);
	});

	afterEach(() => {
		$injector.reset();
	});

	it('stores a MapFeedback', async () => {
		const backendUrl = 'https://backend.url/';
		const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
		const mapFeedback = new MapFeedback('state', 'category', 'description', 'geometryId', 'email');
		const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response());

		const result = await bvvFeedbackStorageProvider(mapFeedback);

		expect(result).toBe(true);
		expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
		expect(httpServiceSpy).toHaveBeenCalledWith(backendUrl + 'feedback/tim/message', JSON.stringify(mapFeedback), MediaType.JSON);
	});

	it('stores a GeneralFeedback', async () => {
		const backendUrl = 'https://backend.url/';
		const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
		const mapFeedback = new GeneralFeedback('description', 'email', 5);
		const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response());

		const result = await bvvFeedbackStorageProvider(mapFeedback);

		expect(result).toBe(true);
		expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
		expect(httpServiceSpy).toHaveBeenCalledWith(backendUrl + 'feedback/general/message', JSON.stringify(mapFeedback), MediaType.JSON);
	});

	it('throws an Error when status code != 200', () => {
		const backendUrl = 'https://backend.url/';
		vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
		const statusCode = 400;
		const mapFeedback = new MapFeedback('state', 'category', 'description', 'geometryId', 'email');
		const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response(null, { status: statusCode }));

		expect(bvvFeedbackStorageProvider(mapFeedback)).rejects.toThrow(`Feedback could not be stored: Http-Status ${statusCode}`);
		expect(httpServiceSpy).toHaveBeenCalledWith(backendUrl + 'feedback/tim/message', JSON.stringify(mapFeedback), MediaType.JSON);
	});

	it('throws an Error when feedback class is unknown', () => {
		const backendUrl = 'https://backend.url/';
		vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
		const mapFeedback = { foo: 'bar' };
		const httpServiceSpy = vi.spyOn(httpService, 'post');

		expect(bvvFeedbackStorageProvider(mapFeedback)).rejects.toThrow(`Feedback could not be stored: Unknown feedback class`);
		expect(httpServiceSpy).not.toHaveBeenCalled();
	});
});

describe('bvvMapFeedbackCategoriesProvider', () => {
	const configService = {
		getValueAsPath: () => {}
	};

	const httpService = {
		get: async () => {}
	};

	beforeEach(() => {
		$injector.registerSingleton('ConfigService', configService).registerSingleton('HttpService', httpService);
	});

	afterEach(() => {
		$injector.reset();
	});

	it('loads feedback categories', async () => {
		const backendUrl = 'https://backend.url/';
		const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
		const categories = ['foo', 'bar'];
		const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(new Response(JSON.stringify(categories)));

		const result = await bvvMapFeedbackCategoriesProvider();

		expect(result).toEqual(categories);
		expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
		expect(httpServiceSpy).toHaveBeenCalledWith(backendUrl + 'feedback/tim/categories');
	});

	it('throws an Error when status code != 200', () => {
		const backendUrl = 'https://backend.url/';
		vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
		const statusCode = 400;
		const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(new Response(null, { status: statusCode }));

		expect(bvvMapFeedbackCategoriesProvider()).rejects.toThrow(`MapFeedback categories could not be loaded: Http-Status ${statusCode}`);
		expect(httpServiceSpy).toHaveBeenCalledWith(backendUrl + 'feedback/tim/categories');
	});
});

describe('bvvGeneralFeedbackCategoriesProvider', () => {
	const configService = {
		getValueAsPath: () => {}
	};

	const httpService = {
		get: async () => {}
	};

	beforeEach(() => {
		$injector.registerSingleton('ConfigService', configService).registerSingleton('HttpService', httpService);
	});

	afterEach(() => {
		$injector.reset();
	});

	it('loads feedback categories', async () => {
		const backendUrl = 'https://backend.url/';
		const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
		const categories = ['foo', 'bar'];
		const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(new Response(JSON.stringify(categories)));

		const result = await bvvGeneralFeedbackCategoriesProvider();

		expect(result).toEqual(categories);
		expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
		expect(httpServiceSpy).toHaveBeenCalledWith(backendUrl + 'feedback/general/categories');
	});

	it('throws an Error when status code != 200', () => {
		const backendUrl = 'https://backend.url/';
		vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
		const statusCode = 400;
		const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(new Response(null, { status: statusCode }));

		expect(bvvGeneralFeedbackCategoriesProvider()).rejects.toThrow(`MapFeedback categories could not be loaded: Http-Status ${statusCode}`);
		expect(httpServiceSpy).toHaveBeenCalledWith(backendUrl + 'feedback/general/categories');
	});
});

describe('bvvMapFeedbackOverlayGeoResourceProvider', () => {
	it('returns an id of a GeoResource', () => {
		const result = bvvMapFeedbackOverlayGeoResourceProvider();

		expect(result).toBe('tim');
	});
});
