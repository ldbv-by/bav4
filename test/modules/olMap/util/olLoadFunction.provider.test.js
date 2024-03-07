import { $injector } from '../../../../src/injection/index.js';
import { getBvvBaaImageLoadFunction, getBvvTileLoadFunction } from '../../../../src/modules/olMap/utils/olLoadFunction.provider';
import { LevelTypes } from '../../../../src/store/notifications/notifications.action.js';
import { notificationReducer } from '../../../../src/store/notifications/notifications.reducer.js';
import { TestUtils } from '../../../test-utils.js';
import TileState from 'ol/TileState.js';

describe('olLoadFunction.provider', () => {
	describe('getBvvBaaImageLoadFunction', () => {
		const configService = {
			getValueAsPath: () => {}
		};

		const httpService = {
			get: async () => {}
		};

		const responseInterceptor = () => {};
		const geoResourceService = {
			getAuthResponseInterceptorForGeoResource: () => responseInterceptor
		};

		let store;
		beforeAll(() => {
			store = TestUtils.setupStoreAndDi(
				{},
				{
					notifications: notificationReducer
				}
			);
			$injector
				.registerSingleton('ConfigService', configService)
				.registerSingleton('HttpService', httpService)
				.registerSingleton('GeoResourceService', geoResourceService)
				.registerSingleton('TranslationService', { translate: (key, params = []) => `${key}${params.length ? ` [${params.join(',')}]` : ''}` });
		});

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

		describe('BAA is required', () => {
			it('throws an exception when http status is not 200 and emits a notification', async () => {
				const geoResourceId = 'geoResourceId';
				const fakeImageWrapper = getFakeImageWrapperInstance();
				const src = 'http://foo.var?WIDTH=2000&HEIGHT=2000';
				const credential = { username: 'username', password: 'password' };
				spyOn(httpService, 'get').and.resolveTo(new Response(null, { status: 404 }));
				const errorSpy = spyOn(console, 'error');
				const imageLoadFunction = getBvvBaaImageLoadFunction(geoResourceId, credential);

				await imageLoadFunction(fakeImageWrapper, src);

				expect(errorSpy).toHaveBeenCalledWith('Image could not be fetched', new Error('Unexpected network status 404'));
				expect(store.getState().notifications.latest.payload.content).toBe('global_geoResource_not_available [geoResourceId]');
				expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
			});

			it('throws an exception when http status is 401 and emits a notification', async () => {
				const geoResourceId = 'geoResourceId';
				const fakeImageWrapper = getFakeImageWrapperInstance();
				const src = 'http://foo.var?WIDTH=2000&HEIGHT=2000';
				const credential = { username: 'username', password: 'password' };
				spyOn(httpService, 'get').and.resolveTo(new Response(null, { status: 401 }));
				const errorSpy = spyOn(console, 'error');
				const imageLoadFunction = getBvvBaaImageLoadFunction(geoResourceId, credential);

				await imageLoadFunction(fakeImageWrapper, src);

				expect(errorSpy).toHaveBeenCalledWith('Image could not be fetched', new Error('Unexpected network status 401'));
				expect(store.getState().notifications.latest.payload.content).toBe(
					'global_geoResource_not_available [geoResourceId,global_geoResource_unauthorized]'
				);
				expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
			});

			it('throws an exception when http status is 403 and emits a notification', async () => {
				const geoResourceId = 'geoResourceId';
				const fakeImageWrapper = getFakeImageWrapperInstance();
				const src = 'http://foo.var?WIDTH=2000&HEIGHT=2000';
				const credential = { username: 'username', password: 'password' };
				spyOn(httpService, 'get').and.resolveTo(new Response(null, { status: 403 }));
				const errorSpy = spyOn(console, 'error');
				const imageLoadFunction = getBvvBaaImageLoadFunction(geoResourceId, credential);

				await imageLoadFunction(fakeImageWrapper, src);

				expect(errorSpy).toHaveBeenCalledWith('Image could not be fetched', new Error('Unexpected network status 403'));
				expect(store.getState().notifications.latest.payload.content).toBe(
					'global_geoResource_not_available [geoResourceId,global_geoResource_forbidden]'
				);
				expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
			});

			describe('when NO scaling is needed', () => {
				it('provides a image load function that loads a image including Authorization header', async () => {
					const geoResourceId = 'geoResourceId';
					const base64ImageData =
						'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAApJREFUCNdjYAAAAAIAAeIhvDMAAAAASUVORK5CYII=';
					const fakeImageWrapper = getFakeImageWrapperInstance();

					const src = 'http://foo.var?WIDTH=2000&HEIGHT=2000';
					const backendUrl = 'https://backend.url/';
					spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
					const credential = { username: 'username', password: 'password' };
					const expectedUrl = `${backendUrl}proxy/basicAuth/wms/map/?url=${encodeURIComponent(src)}`;
					spyOn(httpService, 'get')
						.withArgs(expectedUrl, {
							timeout: 10000,
							headers: new Headers({
								Authorization: `Basic ${btoa(`${credential.username}:${credential.password}`)}`
							})
						})
						.and.resolveTo(new Response(base64ImageData));
					const imageLoadFunction = getBvvBaaImageLoadFunction(geoResourceId, credential);

					await imageLoadFunction(fakeImageWrapper, src);

					expect(fakeImageWrapper.getImage().src).toMatch('blob:http://');
				});
			});

			describe('when scaling is needed', () => {
				it('provides a image load function that loads a image including Authorization header and scales the image using a canvas element', async () => {
					const geoResourceId = 'geoResourceId';
					const base64ImageData =
						'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAApJREFUCNdjYAAAAAIAAeIhvDMAAAAASUVORK5CYII=';
					const fakeImageWrapper = getFakeImageWrapperInstance();

					const src = 'http://foo.var?WIDTH=2001&HEIGHT=2000';
					const adjustedUrl = 'http://foo.var?WIDTH=2000&HEIGHT=2000';
					const backendUrl = 'https://backend.url/';
					spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
					const credential = { username: 'username', password: 'password' };
					const expectedUrl = `${backendUrl}proxy/basicAuth/wms/map/?url=${encodeURIComponent(adjustedUrl)}`;
					spyOn(httpService, 'get')
						.withArgs(expectedUrl, {
							timeout: 10000,
							headers: new Headers({
								Authorization: `Basic ${btoa(`${credential.username}:${credential.password}`)}`
							})
						})
						.and.resolveTo(new Response(base64ImageData));
					const mockTempImage = {};
					const mockCanvasDataURL = 'canvasDataUrl';
					const mockCanvasContext = { drawImage: () => {} };
					const drawImageSpy = spyOn(mockCanvasContext, 'drawImage');
					const mockCanvas = { getContext: () => {}, toDataURL: () => {} };
					spyOn(mockCanvas, 'getContext').withArgs('2d').and.returnValue(mockCanvasContext);
					spyOn(mockCanvas, 'toDataURL').and.returnValue(mockCanvasDataURL);
					spyOn(document, 'createElement').and.callFake((tag) => {
						switch (tag) {
							case 'img':
								return mockTempImage;
							case 'canvas':
								return mockCanvas;
						}
					});
					const imageLoadFunction = getBvvBaaImageLoadFunction(geoResourceId, credential);

					await imageLoadFunction(fakeImageWrapper, src);

					expect(mockTempImage.crossOrigin).toBe('anonymous');
					expect(mockTempImage.src).toMatch('blob:http://');
					mockTempImage.onload();
					expect(mockCanvas.width).toBe(2001);
					expect(mockCanvas.height).toBe(2000);
					expect(fakeImageWrapper.getImage().src).toBe(mockCanvasDataURL);
					expect(drawImageSpy).toHaveBeenCalledWith(mockTempImage, 0, 0, 2001, 2000);
				});
			});
		});

		describe('BAA is NOT required', () => {
			it('throws an exception when http status is not 200 and emits a notification', async () => {
				const geoResourceId = 'geoResourceId';
				const fakeImageWrapper = getFakeImageWrapperInstance();
				const src = 'http://foo.var?WIDTH=2000&HEIGHT=2000';
				spyOn(httpService, 'get').and.resolveTo(new Response(null, { status: 404 }));
				const errorSpy = spyOn(console, 'error');
				const imageLoadFunction = getBvvBaaImageLoadFunction(geoResourceId);

				await imageLoadFunction(fakeImageWrapper, src);

				expect(errorSpy).toHaveBeenCalledWith('Image could not be fetched', new Error('Unexpected network status 404'));
				expect(store.getState().notifications.latest.payload.content).toBe('global_geoResource_not_available [geoResourceId]');
				expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
			});

			it('throws an exception when http status is 403 and emits a notification', async () => {
				const geoResourceId = 'geoResourceId';
				const fakeImageWrapper = getFakeImageWrapperInstance();
				const src = 'http://foo.var?WIDTH=2000&HEIGHT=2000';
				spyOn(httpService, 'get').and.resolveTo(new Response(null, { status: 403 }));
				const errorSpy = spyOn(console, 'error');
				const imageLoadFunction = getBvvBaaImageLoadFunction(geoResourceId);

				await imageLoadFunction(fakeImageWrapper, src);

				expect(errorSpy).toHaveBeenCalledWith('Image could not be fetched', new Error('Unexpected network status 403'));
				expect(store.getState().notifications.latest.payload.content).toBe(
					'global_geoResource_not_available [geoResourceId,global_geoResource_forbidden]'
				);
				expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
			});

			describe('when NO scaling is needed', () => {
				it('provides a image load function that loads a image by using the AuthResponseInterceptorForGeoResource', async () => {
					const geoResourceId = 'geoResourceId';
					const base64ImageData =
						'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAApJREFUCNdjYAAAAAIAAeIhvDMAAAAASUVORK5CYII=';
					const fakeImageWrapper = getFakeImageWrapperInstance();
					const src = 'http://foo.var?WIDTH=2000&HEIGHT=2000';
					const geoResourceServiceSpy = spyOn(geoResourceService, 'getAuthResponseInterceptorForGeoResource').and.returnValue(responseInterceptor);
					spyOn(httpService, 'get')
						.withArgs(
							src,
							{
								timeout: 10000
							},
							{ response: [responseInterceptor] }
						)
						.and.resolveTo(new Response(base64ImageData));
					const imageLoadFunction = getBvvBaaImageLoadFunction(geoResourceId);

					await imageLoadFunction(fakeImageWrapper, src);

					expect(fakeImageWrapper.getImage().src).toMatch('blob:http://');
					expect(geoResourceServiceSpy).toHaveBeenCalledOnceWith(geoResourceId);
				});
			});

			describe('when scaling is needed', () => {
				it('scales the image using a canvas element', async () => {
					const geoResourceId = 'geoResourceId';
					const base64ImageData =
						'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAApJREFUCNdjYAAAAAIAAeIhvDMAAAAASUVORK5CYII=';
					const fakeImageWrapper = getFakeImageWrapperInstance();

					const src = 'http://foo.var?WIDTH=1000&HEIGHT=1001';
					const adjustedSrc = 'http://foo.var?WIDTH=1000&HEIGHT=1000';

					spyOn(httpService, 'get')
						.withArgs(
							adjustedSrc,
							{
								timeout: 10000
							},
							{ response: [responseInterceptor] }
						)
						.and.resolveTo(new Response(base64ImageData));
					const mockTempImage = {};
					const mockCanvasDataURL = 'canvasDataUrl';
					const mockCanvasContext = { drawImage: () => {} };
					const drawImageSpy = spyOn(mockCanvasContext, 'drawImage');
					const mockCanvas = { getContext: () => {}, toDataURL: () => {} };
					spyOn(mockCanvas, 'getContext').withArgs('2d').and.returnValue(mockCanvasContext);
					spyOn(mockCanvas, 'toDataURL').and.returnValue(mockCanvasDataURL);
					spyOn(document, 'createElement').and.callFake((tag) => {
						switch (tag) {
							case 'img':
								return mockTempImage;
							case 'canvas':
								return mockCanvas;
						}
					});
					const imageLoadFunction = getBvvBaaImageLoadFunction(geoResourceId, null, [1000, 1000]);

					await imageLoadFunction(fakeImageWrapper, src);

					expect(mockTempImage.crossOrigin).toBe('anonymous');
					expect(mockTempImage.src).toMatch('blob:http://');
					mockTempImage.onload();
					expect(mockCanvas.width).toBe(1000);
					expect(mockCanvas.height).toBe(1001);
					expect(fakeImageWrapper.getImage().src).toBe(mockCanvasDataURL);
					expect(drawImageSpy).toHaveBeenCalledWith(mockTempImage, 0, 0, 1000, 1001);
				});
			});
		});
	});

	describe('getBvvTileLoadFunction', () => {
		const throttleDelay = 3000 + 100;
		const configService = {
			getValueAsPath: () => {}
		};

		const httpService = {
			get: async () => {}
		};

		const responseInterceptor = () => {};
		const geoResourceService = {
			getAuthResponseInterceptorForGeoResource: () => responseInterceptor
		};
		let store;

		beforeAll(() => {
			jasmine.clock().install();
			//throttle is based on Date
			jasmine.clock().mockDate();
		});
		afterAll(() => {
			jasmine.clock().uninstall();
		});
		beforeEach(() => {
			store = TestUtils.setupStoreAndDi(
				{},
				{
					notifications: notificationReducer
				}
			);
			$injector
				.registerSingleton('ConfigService', configService)
				.registerSingleton('HttpService', httpService)
				.registerSingleton('GeoResourceService', geoResourceService)
				.registerSingleton('TranslationService', { translate: (key, params = []) => `${key}${params.length ? ` [${params.join(',')}]` : ''}` });
		});
		afterEach(() => {
			$injector.reset();
		});

		const getFakeTileWrapperInstance = () => {
			const fakeImage = {
				src: null
			};
			return {
				getImage: () => {
					return fakeImage;
				},
				setState(state) {
					this.state = state;
				}
			};
		};

		it('throws an exception when http status is not 200 and emits a notification', async () => {
			const geoResourceId = 'geoResourceId';
			const fakeTileWrapper = getFakeTileWrapperInstance();
			const src = 'http://foo.var/some/11/1089/710';
			spyOn(httpService, 'get').and.resolveTo(new Response(null, { status: 404 }));
			const errorSpy = spyOn(console, 'error');
			const tileLoadFunction = getBvvTileLoadFunction(geoResourceId);
			jasmine.clock().tick(throttleDelay);

			// tile loading causes multiple simultaneously requests, therefore we check the use of the throttle function to keep the notification at a count of 1
			await tileLoadFunction(fakeTileWrapper, src);
			await tileLoadFunction(fakeTileWrapper, src);
			await tileLoadFunction(fakeTileWrapper, src);

			expect(errorSpy).toHaveBeenCalledOnceWith('Tile could not be fetched', new Error('Unexpected network status 404'));
			expect(store.getState().notifications.latest.payload.content).toBe('global_geoResource_not_available [geoResourceId]');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
			expect(fakeTileWrapper.state).toBe(TileState.ERROR);
		});

		it('throws an exception when http status is 403 and emits a notification', async () => {
			const geoResourceId = 'geoResourceId';
			const fakeTileWrapper = getFakeTileWrapperInstance();
			const src = 'http://foo.var/some/11/1089/710';
			spyOn(httpService, 'get').and.resolveTo(new Response(null, { status: 403 }));
			const errorSpy = spyOn(console, 'error');
			const tileLoadFunction = getBvvTileLoadFunction(geoResourceId);
			jasmine.clock().tick(throttleDelay);

			// tile loading causes multiple simultaneously requests, therefore we check the use of the throttle function to keep the notification at a count of 1
			await tileLoadFunction(fakeTileWrapper, src);
			await tileLoadFunction(fakeTileWrapper, src);
			await tileLoadFunction(fakeTileWrapper, src);

			expect(errorSpy).toHaveBeenCalledOnceWith('Tile could not be fetched', new Error('Unexpected network status 403'));
			expect(store.getState().notifications.latest.payload.content).toBe(
				'global_geoResource_not_available [geoResourceId,global_geoResource_forbidden]'
			);
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
			expect(fakeTileWrapper.state).toBe(TileState.ERROR);
		});

		it('provides a image load function that loads an image by using the AuthResponseInterceptorForGeoResource', async () => {
			const geoResourceId = 'geoResourceId';
			const base64ImageData =
				'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAApJREFUCNdjYAAAAAIAAeIhvDMAAAAASUVORK5CYII=';
			const fakeImageWrapper = getFakeTileWrapperInstance();
			const src = 'http://foo.var/some/11/1089/710';
			const geoResourceServiceSpy = spyOn(geoResourceService, 'getAuthResponseInterceptorForGeoResource').and.returnValue(responseInterceptor);
			spyOn(httpService, 'get')
				.withArgs(
					src,
					{
						timeout: 3000
					},
					{ response: [responseInterceptor] }
				)
				.and.resolveTo(new Response(base64ImageData));
			const tileLoadFunction = getBvvTileLoadFunction(geoResourceId);

			await tileLoadFunction(fakeImageWrapper, src);

			expect(fakeImageWrapper.getImage().src).toMatch('blob:http://');
			expect(geoResourceServiceSpy).toHaveBeenCalledOnceWith(geoResourceId);
		});
	});
});
