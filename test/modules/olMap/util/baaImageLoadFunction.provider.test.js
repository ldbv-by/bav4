import { $injector } from '../../../../src/injection';
import { getBvvBaaImageLoadFunction } from '../../../../src/modules/olMap/utils/baaImageLoadFunction.provider';


describe('imageLoadFunction.provider', () => {

	describe('getBvvBaaImageLoadFunction', () => {
		const configService = {
			getValueAsPath: () => { }
		};

		const httpService = {
			get: async () => { }
		};

		beforeAll(() => {
			$injector
				.registerSingleton('ConfigService', configService)
				.registerSingleton('HttpService', httpService);
		});

		const getMockImageAsBlob = async () => {
			const base64Data = 'aGV5IHRoZXJl';
			const base64Response = await fetch(base64Data);
			return base64Response.blob();
		};

		const getFakeImageWrapperInstance = () => {
			const fakeImage = {
				src: null
			};
			return {
				getImage: () => {
					return fakeImage;
				}
			};
		};

		it('provides a image load function that loads a image including Authorization header', async () => {
			const fakeImageWrapper = getFakeImageWrapperInstance();
			const src = 'http://foo.bar/something.png';
			const backendUrl = 'https://backend.url/';
			spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const credential = { username: 'username', password: 'password' };
			const expectedUrl = `${backendUrl}proxy/basicAuth/wms/map/?url=${encodeURIComponent(src)}`;
			const blob = await getMockImageAsBlob();
			spyOn(httpService, 'get').withArgs(expectedUrl, {
				timeout: 10000,
				headers: new Headers({
					'Authorization': `Basic ${btoa(`${credential.username}:${credential.password}`)}`
				})
			}).and.resolveTo(new Response(blob));
			const imageLoadFunction = getBvvBaaImageLoadFunction(credential);

			await imageLoadFunction(fakeImageWrapper, src);

			expect(fakeImageWrapper.getImage().src).toBeDefined();
		});

		it('throws an exception when http status is not 200', async () => {
			const fakeImageWrapper = getFakeImageWrapperInstance();
			const src = 'http://foo.bar/something.png';
			const backendUrl = 'https://backend.url/';
			spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const credential = { username: 'username', password: 'password' };
			const expectedUrl = `${backendUrl}proxy/basicAuth/wms/map/?url=${encodeURIComponent(src)}`;
			spyOn(httpService, 'get').withArgs(expectedUrl, {
				timeout: 10000,
				headers: new Headers({
					'Authorization': `Basic ${btoa(`${credential.username}:${credential.password}`)}`
				})
			}).and.resolveTo(new Response(null, { status: 404 }));
			const errorSpy = spyOn(console, 'error');
			//we have to bind the mocked vector source
			const imageLoadFunction = getBvvBaaImageLoadFunction(credential);

			await imageLoadFunction(fakeImageWrapper, src);

			expect(errorSpy).toHaveBeenCalledWith('Image could not be fetched', new Error('Unexpected network status 404'));
		});
	});
});
