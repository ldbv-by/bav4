import TileLayer from 'ol/layer/Tile.js';
import { UnavailableGeoResourceError } from '../../../../src/domain/errors.js';
import { $injector } from '../../../../src/injection/index.js';
import {
	bvvTileLoadFailureCounterProvider,
	getBvvBaaImageLoadFunction,
	getBvvTileLoadFunction
} from '../../../../src/modules/olMap/utils/olLoadFunction.provider';
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

		beforeAll(() => {
			TestUtils.setupStoreAndDi();
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
			it('rejects with an UnavailableGeoResourceError when http status is not 200', async () => {
				const geoResourceId = 'geoResourceId';
				const fakeImageWrapper = getFakeImageWrapperInstance();
				const src = 'http://foo.var?WIDTH=2000&HEIGHT=2000';
				const credential = { username: 'username', password: 'password' };
				spyOn(httpService, 'get').and.resolveTo(new Response(null, { status: 404 }));
				const imageLoadFunction = getBvvBaaImageLoadFunction(geoResourceId, credential, null);

				try {
					await imageLoadFunction(fakeImageWrapper, src);
					throw new Error('Promise should not be resolved');
				} catch (error) {
					expect(error).toBeInstanceOf(UnavailableGeoResourceError);
					expect(error.message).toBe('Unexpected network status');
					expect(error.geoResourceId).toBe(geoResourceId);
					expect(error.httpStatus).toBe(404);
				}
			});

			it('rejects with an UnavailableGeoResourceError when a request was aborted', async () => {
				const geoResourceId = 'geoResourceId';
				const fakeImageWrapper = getFakeImageWrapperInstance();
				const src = 'http://foo.var?WIDTH=2000&HEIGHT=2000';
				const credential = { username: 'username', password: 'password' };
				spyOn(httpService, 'get').and.rejectWith(new DOMException('aborted'));
				const imageLoadFunction = getBvvBaaImageLoadFunction(geoResourceId, credential, null);

				await expectAsync(imageLoadFunction(fakeImageWrapper, src)).toBeRejectedWith(new UnavailableGeoResourceError(`aborted`, geoResourceId));
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
							timeout: 30_000,
							headers: new Headers({
								Authorization: `Basic ${btoa(`${credential.username}:${credential.password}`)}`
							})
						})
						.and.resolveTo(new Response(base64ImageData));
					const imageLoadFunction = getBvvBaaImageLoadFunction(geoResourceId, credential, null);

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
							timeout: 30_000,
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
					const revokeObjectUrlSpy = spyOn(URL, 'revokeObjectURL').and.callThrough();
					const imageLoadFunction = getBvvBaaImageLoadFunction(geoResourceId, credential);

					await imageLoadFunction(fakeImageWrapper, src);

					expect(mockTempImage.crossOrigin).toBe('anonymous');
					expect(mockTempImage.src).toMatch('blob:http://');
					mockTempImage.onload();
					expect(mockCanvas.width).toBe(2001);
					expect(mockCanvas.height).toBe(2000);
					expect(fakeImageWrapper.getImage().src).toBe(mockCanvasDataURL);
					expect(drawImageSpy).toHaveBeenCalledWith(mockTempImage, 0, 0, 2001, 2000);
					expect(revokeObjectUrlSpy).toHaveBeenCalled();
				});
			});
		});

		describe('BAA is NOT required', () => {
			it('rejects with an UnavailableGeoResourceError when http status is not 200', async () => {
				const geoResourceId = 'geoResourceId';
				const fakeImageWrapper = getFakeImageWrapperInstance();
				const src = 'http://foo.var?WIDTH=2000&HEIGHT=2000';
				spyOn(httpService, 'get').and.resolveTo(new Response(null, { status: 404 }));
				const imageLoadFunction = getBvvBaaImageLoadFunction(geoResourceId);

				try {
					await imageLoadFunction(fakeImageWrapper, src);
					throw new Error('Promise should not be resolved');
				} catch (error) {
					expect(error).toBeInstanceOf(UnavailableGeoResourceError);
					expect(error.message).toBe('Unexpected network status');
					expect(error.geoResourceId).toBe(geoResourceId);
					expect(error.httpStatus).toBe(404);
				}
			});

			it('rejects with an UnavailableGeoResourceError when a request was aborted', async () => {
				const geoResourceId = 'geoResourceId';
				const fakeImageWrapper = getFakeImageWrapperInstance();
				const src = 'http://foo.var?WIDTH=2000&HEIGHT=2000';
				spyOn(httpService, 'get').and.rejectWith(new DOMException('aborted'));
				const imageLoadFunction = getBvvBaaImageLoadFunction(geoResourceId);

				await expectAsync(imageLoadFunction(fakeImageWrapper, src)).toBeRejectedWith(new UnavailableGeoResourceError(`aborted`, geoResourceId));
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
								timeout: 30_000
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
								timeout: 30_000
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
					const revokeObjectUrlSpy = spyOn(URL, 'revokeObjectURL').and.callThrough();
					const imageLoadFunction = getBvvBaaImageLoadFunction(geoResourceId, null, [1000, 1000]);

					await imageLoadFunction(fakeImageWrapper, src);

					expect(mockTempImage.crossOrigin).toBe('anonymous');
					expect(mockTempImage.src).toMatch('blob:http://');
					mockTempImage.onload();
					expect(mockCanvas.width).toBe(1000);
					expect(mockCanvas.height).toBe(1001);
					expect(fakeImageWrapper.getImage().src).toBe(mockCanvasDataURL);
					expect(drawImageSpy).toHaveBeenCalledWith(mockTempImage, 0, 0, 1000, 1001);
					expect(revokeObjectUrlSpy).toHaveBeenCalled();
				});
			});
		});
	});

	describe('bvvTileLoadFailureCounterProvider', () => {
		it('return a correctly configured FailureCounter instance', async () => {
			const geoResourceId = 'geoResourceId';
			const failureCounter = bvvTileLoadFailureCounterProvider(geoResourceId);
			const onFailure = failureCounter.onFailureFn;

			expect(failureCounter.interval).toBe(10);
			expect(failureCounter.threshold).toBe(0.5);
			await expectAsync(onFailure()).toBeRejectedWithError(UnavailableGeoResourceError, 'Unexpected network status', geoResourceId);
		});
	});

	describe('getBvvTileLoadFunction', () => {
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

		beforeEach(() => {
			TestUtils.setupStoreAndDi();
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

		it('calls the failureCounterProvider', async () => {
			const geoResourceId = 'geoResourceId';
			const failureCounter = {
				indicateFailure: () => {}
			};
			const failureCounterProviderSpy = jasmine.createSpy().and.returnValue(failureCounter);

			getBvvTileLoadFunction(geoResourceId, new TileLayer(), failureCounterProviderSpy);

			expect(failureCounterProviderSpy).toHaveBeenCalledOnceWith(geoResourceId);
		});

		it('updated the tile state and the failure counter when http status is other than 200 and 400', async () => {
			const geoResourceId = 'geoResourceId';
			const fakeTileWrapper = getFakeTileWrapperInstance();
			const src = 'http://foo.var/some/11/1089/710';
			const response = new Response(null, { status: 404 });
			spyOn(httpService, 'get').and.resolveTo(response);
			const failureCounter = {
				indicateFailure: () => {}
			};
			const failureCounterSpy = spyOn(failureCounter, 'indicateFailure');
			const failureCounterProvider = () => failureCounter;
			const tileLoadFunction = getBvvTileLoadFunction(geoResourceId, new TileLayer(), failureCounterProvider);

			await tileLoadFunction(fakeTileWrapper, src);

			expect(fakeTileWrapper.state).toBe(TileState.ERROR);
			expect(failureCounterSpy).toHaveBeenCalledTimes(1);
		});

		it('rejects with an UnavailableGeoResourceError when a request was aborted', async () => {
			const geoResourceId = 'geoResourceId';
			const fakeTileWrapper = getFakeTileWrapperInstance();
			const src = 'http://foo.var/some/11/1089/710';
			spyOn(httpService, 'get').and.rejectWith(new DOMException());
			const failureCounter = {
				indicateFailure: () => {}
			};
			const failureCounterSpy = spyOn(failureCounter, 'indicateFailure');
			const failureCounterProvider = () => failureCounter;
			const tileLoadFunction = getBvvTileLoadFunction(geoResourceId, new TileLayer(), failureCounterProvider);

			await tileLoadFunction(fakeTileWrapper, src);

			expect(fakeTileWrapper.state).toBe(TileState.ERROR);
			expect(failureCounterSpy).toHaveBeenCalledTimes(1);
		});

		it('sets the TileState when http status is 400', async () => {
			const geoResourceId = 'geoResourceId';
			const fakeTileWrapper = getFakeTileWrapperInstance();
			const src = 'http://foo.var/some/11/1089/710';
			spyOn(httpService, 'get').and.resolveTo(new Response(null, { status: 400 }));
			const tileLoadFunction = getBvvTileLoadFunction(geoResourceId, new TileLayer());

			await tileLoadFunction(fakeTileWrapper, src);

			expect(fakeTileWrapper.state).toBe(TileState.ERROR);
			expect(fakeTileWrapper.getImage().src).toBeNull();
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
						timeout: 10_000
					},
					{ response: [responseInterceptor] }
				)
				.and.resolveTo(new Response(base64ImageData));
			const revokeObjectUrlSpy = spyOn(URL, 'revokeObjectURL').and.callThrough();
			const tileLoadFunction = getBvvTileLoadFunction(geoResourceId, new TileLayer());

			await tileLoadFunction(fakeImageWrapper, src);

			expect(fakeImageWrapper.getImage().src).toMatch('blob:http://');
			expect(geoResourceServiceSpy).toHaveBeenCalledOnceWith(geoResourceId);

			fakeImageWrapper.getImage().onload();

			expect(revokeObjectUrlSpy).toHaveBeenCalled();
		});

		it('provides a image load function that loads an image including a timestamp query parameter', async () => {
			const geoResourceId = 'geoResourceId';
			const base64ImageData =
				'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAApJREFUCNdjYAAAAAIAAeIhvDMAAAAASUVORK5CYII=';
			const fakeImageWrapper = getFakeTileWrapperInstance();
			const src = 'http://foo.var/some/11/1089/710';
			const tileLayer = new TileLayer({ properties: { timestamp: '20001231' } });
			const expectedUrl = src + '?t=20001231';
			spyOn(geoResourceService, 'getAuthResponseInterceptorForGeoResource').and.returnValue(responseInterceptor);
			const httpsServiceSpy = spyOn(httpService, 'get').and.resolveTo(new Response(base64ImageData));
			const tileLoadFunction = getBvvTileLoadFunction(geoResourceId, tileLayer);

			await tileLoadFunction(fakeImageWrapper, src);

			expect(httpsServiceSpy).toHaveBeenCalledWith(
				expectedUrl,
				{
					timeout: 10_000
				},
				{ response: [responseInterceptor] }
			);
		});
	});
});
