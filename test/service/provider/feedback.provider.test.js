import { $injector } from '../../../src/injection';
import { MediaType } from '../../../src/services/HttpService';
import { bvvMapFeedbackCategoriesProvider, bvvFeedbackStorageProvider } from '../../../src/services/provider/feedback.provider';

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
		const mapFeedback = {
			state: 'http://foo.bar',
			category: 'cat',
			description: 'desc',
			fileId: 'fileId'
		};
		const httpServiceSpy = spyOn(httpService, 'post')
			.withArgs(backendUrl + 'tim/message', JSON.stringify(mapFeedback), MediaType.JSON, { timeout: 2000 })
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
		const mapFeedback = {
			state: 'http://foo.bar',
			category: 'cat',
			description: 'desc',
			fileId: 'fileId'
		};
		spyOn(httpService, 'post')
			.withArgs(backendUrl + 'tim/message', JSON.stringify(mapFeedback), MediaType.JSON, { timeout: 2000 })
			.and.resolveTo(new Response(null, { status: statusCode }));

		await expectAsync(bvvFeedbackStorageProvider(mapFeedback)).toBeRejectedWithError(`MapFeedback could not be stored: Http-Status ${statusCode}`);
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
			.withArgs(backendUrl + 'tim/categories')
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
			.withArgs(backendUrl + 'tim/categories')
			.and.resolveTo(new Response(null, { status: statusCode }));

		await expectAsync(bvvMapFeedbackCategoriesProvider()).toBeRejectedWithError(
			`MapFeedback categories could not be loaded: Http-Status ${statusCode}`
		);
	});
});
