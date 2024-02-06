import { $injector } from '../../../src/injection';
import { MediaType } from '../../../src/domain/mediaTypes';
import { bvvSignInProvider } from '../../../src/services/provider/auth.provider';

describe('bvvSignInProvider', () => {
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

	describe('credentials are valid', () => {
		it('returns the roles for this user', async () => {
			const backendUrl = 'https://backend.url/';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const credential = { username: 'u', password: 'p' };
			const roles = ['test'];
			const httpServiceSpy = spyOn(httpService, 'post')
				.withArgs(backendUrl + 'auth/signin', JSON.stringify(credential), MediaType.JSON)
				.and.resolveTo(new Response(JSON.stringify(roles)));

			const result = await bvvSignInProvider(credential);

			expect(result).toEqual(roles);
			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
		});
	});

	describe('credentials are NOT valid', () => {
		it('returns an empty array as roles', async () => {
			const backendUrl = 'https://backend.url/';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const credential = { username: 'u', password: 'p' };
			const httpServiceSpy = spyOn(httpService, 'post')
				.withArgs(backendUrl + 'auth/signin', JSON.stringify(credential), MediaType.JSON)
				.and.resolveTo(new Response(null, { status: 400 }));

			const result = await bvvSignInProvider(credential);

			expect(result).toEqual([]);
			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
		});
	});

	describe('backend return any other status code', () => {
		it('throws an Error', async () => {
			const statusCode = 500;
			const backendUrl = 'https://backend.url/';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const credential = { username: 'u', password: 'p' };
			const httpServiceSpy = spyOn(httpService, 'post')
				.withArgs(backendUrl + 'auth/signin', JSON.stringify(credential), MediaType.JSON)
				.and.resolveTo(new Response(null, { status: statusCode }));

			await expectAsync(bvvSignInProvider(credential)).toBeRejectedWithError(`Sign in not possible: Http-Status ${statusCode}`);
			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
		});
	});
});
