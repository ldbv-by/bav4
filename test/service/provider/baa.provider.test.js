import { $injector } from '../../../src/injection';
import { MediaType } from '../../../src/services/HttpService';
import { baaCredentialFromUI, bvvBaaCredentialVerify } from '../../../src/services/provider/baa.provider';

describe('baa provider', () => {

	describe('baaCredentialFromUI provider', () => {

		it('return a always rejects', async () => {

			const url = 'http://foo.bar';

			try {
				await baaCredentialFromUI(url);
				throw new Error('Promise should not be resolved');
			}
			catch (reason) {
				expect(reason).toBe('not yet implemented');
			}
		});
	});

	describe('bvvBaaCredentialVerify provider', () => {

		const configService = {
			getValueAsPath: () => { }
		};

		const httpService = {
			post: async () => { }
		};

		beforeAll(() => {
			$injector
				.registerSingleton('ConfigService', configService)
				.registerSingleton('HttpService', httpService);
		});

		it('returns credentials after successful verification', async () => {

			const backendUrl = 'https://backend.url/';
			const credential = { username: 'username', password: 'password' };
			const url = 'http://foo.bar';
			const expectedRequestPayload = JSON.stringify({
				...credential,
				url: url
			});
			spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			spyOn(httpService, 'post')
				.withArgs(`${backendUrl}verifyCredential`, expectedRequestPayload, MediaType.JSON, { timeout: 2000 })
				.and.resolveTo(
					new Response(null, {
						status: 200
					})
				);

			const response = await bvvBaaCredentialVerify(url, credential);

			expect(response).toEqual(credential);
		});

		it('returns http status code after unsuccessful verification', async () => {

			const backendUrl = 'https://backend.url/';
			const credential = { username: 'username', password: 'password' };
			const url = 'http://foo.bar';
			const expectedRequestPayload = JSON.stringify({
				...credential,
				url: url
			});
			const httpStatus = 401;
			spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			spyOn(httpService, 'post')
				.withArgs(`${backendUrl}verifyCredential`, expectedRequestPayload, MediaType.JSON, { timeout: 2000 })
				.and.resolveTo(new Response(null, { status: httpStatus }));


			try {
				await await bvvBaaCredentialVerify(url, credential);
				throw new Error('Promise should not be resolved');
			}
			catch (reason) {
				expect(reason).toBe(httpStatus);
			}
		});
	});
});
