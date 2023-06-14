import { $injector } from '../../../src/injection';
import { MediaType } from '../../../src/domain/mediaTypes';
import { GeneralFeedback, MapFeedback } from '../../../src/services/FeedbackService';
import {
	bvvMapFeedbackCategoriesProvider,
	bvvFeedbackStorageProvider,
	bvvMapFeedbackOverlayGeoResourceProvider,
	bvvGeneralFeedbackCategoriesProvider
} from '../../../src/services/provider/feedback.provider';

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
		const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
		const mapFeedback = new MapFeedback('state', 'category', 'description', 'geometryId', 'email');
		const httpServiceSpy = spyOn(httpService, 'post')
			.withArgs(backendUrl + 'feedback/tim/message', JSON.stringify(mapFeedback), MediaType.JSON, { timeout: 2000 })
			.and.resolveTo(new Response());

		const result = await bvvFeedbackStorageProvider(mapFeedback);

		expect(result).toBeTrue();
		expect(configServiceSpy).toHaveBeenCalled();
		expect(httpServiceSpy).toHaveBeenCalled();
	});

	it('stores a GeneralFeedback', async () => {
		const backendUrl = 'https://backend.url/';
		const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
		const mapFeedback = new GeneralFeedback('description', 'email', 5);
		const httpServiceSpy = spyOn(httpService, 'post')
			.withArgs(backendUrl + 'feedback/general/message', JSON.stringify(mapFeedback), MediaType.JSON, { timeout: 2000 })
			.and.resolveTo(new Response());

		const result = await bvvFeedbackStorageProvider(mapFeedback);

		expect(result).toBeTrue();
		expect(configServiceSpy).toHaveBeenCalled();
		expect(httpServiceSpy).toHaveBeenCalled();
	});

	it('throws an Error when status code != 200', async () => {
		const backendUrl = 'https://backend.url/';
		spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
		const statusCode = 400;
		const mapFeedback = new MapFeedback('state', 'category', 'description', 'geometryId', 'email');
		spyOn(httpService, 'post')
			.withArgs(backendUrl + 'feedback/tim/message', JSON.stringify(mapFeedback), MediaType.JSON, { timeout: 2000 })
			.and.resolveTo(new Response(null, { status: statusCode }));

		await expectAsync(bvvFeedbackStorageProvider(mapFeedback)).toBeRejectedWithError(`Feedback could not be stored: Http-Status ${statusCode}`);
	});

	it('throws an Error when feedback class is unknown', async () => {
		const backendUrl = 'https://backend.url/';
		spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
		const statusCode = 400;
		const mapFeedback = { foo: 'bar' };
		spyOn(httpService, 'post')
			.withArgs(backendUrl + 'feedback/tim/message', JSON.stringify(mapFeedback), MediaType.JSON, { timeout: 2000 })
			.and.resolveTo(new Response(null, { status: statusCode }));

		await expectAsync(bvvFeedbackStorageProvider(mapFeedback)).toBeRejectedWithError(`Feedback could not be stored: Unknown feedback class`);
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
		const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
		const categories = ['foo', 'bar'];
		const httpServiceSpy = spyOn(httpService, 'get')
			.withArgs(backendUrl + 'feedback/tim/categories')
			.and.resolveTo(new Response(JSON.stringify(categories)));

		const result = await bvvMapFeedbackCategoriesProvider();

		expect(result).toEqual(categories);
		expect(configServiceSpy).toHaveBeenCalled();
		expect(httpServiceSpy).toHaveBeenCalled();
	});

	it('throws an Error when status code != 200', async () => {
		const backendUrl = 'https://backend.url/';
		spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
		const statusCode = 400;

		spyOn(httpService, 'get')
			.withArgs(backendUrl + 'feedback/tim/categories')
			.and.resolveTo(new Response(null, { status: statusCode }));

		await expectAsync(bvvMapFeedbackCategoriesProvider()).toBeRejectedWithError(
			`MapFeedback categories could not be loaded: Http-Status ${statusCode}`
		);
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
		const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
		const categories = ['foo', 'bar'];
		const httpServiceSpy = spyOn(httpService, 'get')
			.withArgs(backendUrl + 'feedback/general/categories')
			.and.resolveTo(new Response(JSON.stringify(categories)));

		const result = await bvvGeneralFeedbackCategoriesProvider();

		expect(result).toEqual(categories);
		expect(configServiceSpy).toHaveBeenCalled();
		expect(httpServiceSpy).toHaveBeenCalled();
	});

	it('throws an Error when status code != 200', async () => {
		const backendUrl = 'https://backend.url/';
		spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
		const statusCode = 400;

		spyOn(httpService, 'get')
			.withArgs(backendUrl + 'feedback/general/categories')
			.and.resolveTo(new Response(null, { status: statusCode }));

		await expectAsync(bvvGeneralFeedbackCategoriesProvider()).toBeRejectedWithError(
			`MapFeedback categories could not be loaded: Http-Status ${statusCode}`
		);
	});
});

describe('bvvMapFeedbackOverlayGeoResourceProvider', () => {
	it('returns an id of a GeoResource', () => {
		const result = bvvMapFeedbackOverlayGeoResourceProvider();

		expect(result).toBe('tim');
	});
});
