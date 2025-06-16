import TileLayer from 'ol/layer/Tile.js';
import { UnavailableGeoResourceError } from '../../../../src/domain/errors.js';
import { $injector } from '../../../../src/injection/index.js';
import {
	bvvTileLoadFailureCounterProvider,
	getBvvBaaImageLoadFunction,
	getBvvOafLoadFunction,
	getBvvTileLoadFunction
} from '../../../../src/modules/olMap/utils/olLoadFunction.provider';
import { TestUtils } from '../../../test-utils.js';
import TileState from 'ol/TileState.js';
import VectorLayer from 'ol/layer/Vector.js';
import Projection from 'ol/proj/Projection.js';
import VectorSource from 'ol/source/Vector.js';
import { OafGeoResource } from '../../../../src/domain/geoResources.js';
import { networkReducer } from '../../../../src/store/network/network.reducer.js';
import { observe } from '../../../../src/utils/storeUtils.js';
import { layersReducer } from '../../../../src/store/layers/layers.reducer.js';
import { addLayer, LayerState } from '../../../../src/store/layers/layers.action.js';

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

	describe('getBvvOafLoadFunction', () => {
		let store;
		const httpService = {
			get: async () => {}
		};

		const responseInterceptor = () => {};

		const geoResourceService = {
			getAuthResponseInterceptorForGeoResource: () => responseInterceptor,
			byId: () => {}
		};

		beforeEach(() => {
			store = TestUtils.setupStoreAndDi({}, { network: networkReducer, layers: layersReducer });
			$injector.registerSingleton('HttpService', httpService).registerSingleton('GeoResourceService', geoResourceService);
		});
		afterEach(() => {
			$injector.reset();
		});
		// Note: The id of the fist feature is explicitly set to en empty string
		const mockResponsePayload = `{"type":"FeatureCollection","numberReturned":10,"numberMatched":1000,"timeStamp":"2025-04-28T16:05:04Z","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[13.7753984,48.8278005]},"properties":{"node_id":11967522304,"name":"Gasthof Pension Strohmaier","strasse":"Nebelhornstraße 16","plz":"81247","ort":"München","outdoor_seating":false,"open":"11:30:00","close":"21:30:00"},"id":""},{"type":"Feature","geometry":{"type":"Point","coordinates":[13.6072725,48.7139666]},"properties":{"node_id":4360236409,"name":"Haller-Alm","strasse":"Jamnitzerstraße 5","plz":"81247","ort":"München","outdoor_seating":false,"open":"09:30:00","close":"22:00:00"},"id":2},{"type":"Feature","geometry":{"type":"Point","coordinates":[13.4656242,48.9258759]},"properties":{"node_id":3248029033,"name":"Am Guldensteig","strasse":"Lusenstraße 48","plz":"94556","ort":"Neuschönau","outdoor_seating":false,"open":"10:30:00","close":"22:30:00"},"id":3},{"type":"Feature","geometry":{"type":"Point","coordinates":[13.4257844,48.9549047]},"properties":{"node_id":573609734,"name":"Racheldiensthütte","strasse":"Nawiaskystraße 18","plz":"81247","ort":"München","outdoor_seating":false,"open":"10:00:00","close":"21:30:00"},"id":4},{"type":"Feature","geometry":{"type":"Point","coordinates":[13.1955355,49.0909754]},"properties":{"node_id":4248151958,"name":"Baggerloch","strasse":"Tegernseer Platz 12","plz":"81247","ort":"München","outdoor_seating":false,"open":"09:30:00","close":"21:30:00"},"id":5},{"type":"Feature","geometry":{"type":"Point","coordinates":[13.3310682,48.7215136]},"properties":{"node_id":6232769394,"name":"Gasthof zur Post","strasse":"Abacostraße 11","plz":"81247","ort":"München","outdoor_seating":false,"open":"09:00:00","close":"20:00:00"},"id":6},{"type":"Feature","geometry":{"type":"Point","coordinates":[13.4708263,48.8140697]},"properties":{"node_id":1056815204,"name":"Dorfbiergarten Stark","strasse":"Dorfstraße 22","plz":"94160","ort":"Ringelai","outdoor_seating":true,"open":"11:00:00","close":"23:00:00"},"id":7},{"type":"Feature","geometry":{"type":"Point","coordinates":[13.4601728,48.7874714]},"properties":{"node_id":454981390,"name":"Waldheim","strasse":"Tegelbergstraße 2","plz":"81247","ort":"München","outdoor_seating":false,"open":"09:00:00","close":"23:30:00"},"id":8},{"type":"Feature","geometry":{"type":"Point","coordinates":[13.4832899,48.6180897]},"properties":{"node_id":456024788,"name":"Lutzgarten","strasse":"Aberlestraße 15","plz":"81247","ort":"München","outdoor_seating":false,"open":"09:30:00","close":"20:00:00"},"id":9},{"type":"Feature","geometry":{"type":"Point","coordinates":[13.4730729,48.5702767]},"properties":{"node_id":6288301886,"name":"Zur Schnecke","strasse":"Jakob-Klar-Straße 1","plz":"81247","ort":"München","outdoor_seating":false,"open":"11:00:00","close":"23:30:00"},"id":10}],"links":[{"href":"http://geotest3.bvv.bayern.de:7080/biergarten/collections/biergarten/items?f=json","rel":"self","type":"application/geo+json","title":"This document"},{"href":"http://geotest3.bvv.bayern.de:7080/biergarten/collections/biergarten/items?f=html","rel":"alternate","type":"text/html","title":"This document as HTML"},{"href":"http://geotest3.bvv.bayern.de:7080/biergarten/collections/biergarten/items?f=json&offset=10","rel":"next","type":"application/geo+json","title":"Next page"},{"href":"http://www.opengis.net/def/profile/ogc/0/rel-as-link","rel":"profile","title":"Profile used in the response"}]}`;
		const mockResponsePayload_AllFeatures = `{"type":"FeatureCollection","numberReturned":1000,"numberMatched":1000,"timeStamp":"2025-04-28T16:05:04Z","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[13.7753984,48.8278005]},"properties":{"node_id":11967522304,"name":"Gasthof Pension Strohmaier","strasse":"Nebelhornstraße 16","plz":"81247","ort":"München","outdoor_seating":false,"open":"11:30:00","close":"21:30:00"},"id":""},{"type":"Feature","geometry":{"type":"Point","coordinates":[13.6072725,48.7139666]},"properties":{"node_id":4360236409,"name":"Haller-Alm","strasse":"Jamnitzerstraße 5","plz":"81247","ort":"München","outdoor_seating":false,"open":"09:30:00","close":"22:00:00"},"id":2},{"type":"Feature","geometry":{"type":"Point","coordinates":[13.4656242,48.9258759]},"properties":{"node_id":3248029033,"name":"Am Guldensteig","strasse":"Lusenstraße 48","plz":"94556","ort":"Neuschönau","outdoor_seating":false,"open":"10:30:00","close":"22:30:00"},"id":3},{"type":"Feature","geometry":{"type":"Point","coordinates":[13.4257844,48.9549047]},"properties":{"node_id":573609734,"name":"Racheldiensthütte","strasse":"Nawiaskystraße 18","plz":"81247","ort":"München","outdoor_seating":false,"open":"10:00:00","close":"21:30:00"},"id":4},{"type":"Feature","geometry":{"type":"Point","coordinates":[13.1955355,49.0909754]},"properties":{"node_id":4248151958,"name":"Baggerloch","strasse":"Tegernseer Platz 12","plz":"81247","ort":"München","outdoor_seating":false,"open":"09:30:00","close":"21:30:00"},"id":5},{"type":"Feature","geometry":{"type":"Point","coordinates":[13.3310682,48.7215136]},"properties":{"node_id":6232769394,"name":"Gasthof zur Post","strasse":"Abacostraße 11","plz":"81247","ort":"München","outdoor_seating":false,"open":"09:00:00","close":"20:00:00"},"id":6},{"type":"Feature","geometry":{"type":"Point","coordinates":[13.4708263,48.8140697]},"properties":{"node_id":1056815204,"name":"Dorfbiergarten Stark","strasse":"Dorfstraße 22","plz":"94160","ort":"Ringelai","outdoor_seating":true,"open":"11:00:00","close":"23:00:00"},"id":7},{"type":"Feature","geometry":{"type":"Point","coordinates":[13.4601728,48.7874714]},"properties":{"node_id":454981390,"name":"Waldheim","strasse":"Tegelbergstraße 2","plz":"81247","ort":"München","outdoor_seating":false,"open":"09:00:00","close":"23:30:00"},"id":8},{"type":"Feature","geometry":{"type":"Point","coordinates":[13.4832899,48.6180897]},"properties":{"node_id":456024788,"name":"Lutzgarten","strasse":"Aberlestraße 15","plz":"81247","ort":"München","outdoor_seating":false,"open":"09:30:00","close":"20:00:00"},"id":9},{"type":"Feature","geometry":{"type":"Point","coordinates":[13.4730729,48.5702767]},"properties":{"node_id":6288301886,"name":"Zur Schnecke","strasse":"Jakob-Klar-Straße 1","plz":"81247","ort":"München","outdoor_seating":false,"open":"11:00:00","close":"23:30:00"},"id":10}],"links":[{"href":"http://geotest3.bvv.bayern.de:7080/biergarten/collections/biergarten/items?f=json","rel":"self","type":"application/geo+json","title":"This document"},{"href":"http://geotest3.bvv.bayern.de:7080/biergarten/collections/biergarten/items?f=html","rel":"alternate","type":"text/html","title":"This document as HTML"},{"href":"http://geotest3.bvv.bayern.de:7080/biergarten/collections/biergarten/items?f=json&offset=10","rel":"next","type":"application/geo+json","title":"Next page"},{"href":"http://www.opengis.net/def/profile/ogc/0/rel-as-link","rel":"profile","title":"Profile used in the response"}]}`;

		it('adds the features to the source and updates the `state` property of the layer and the `fetching` property of the network s-o-s', async () => {
			const geoResourceId = 'geoResourceId';
			const olSource = new VectorSource();
			const layerId = 'layerId';
			const olLayer = new VectorLayer({ id: layerId, source: olSource });
			addLayer(layerId, { geoResourceId });
			const extent = [0, 1, 2, 3];
			const resolution = 42.42;
			const projection = new Projection({ code: 'EPSG:3857' });
			const response = new Response(mockResponsePayload);
			const expectedUrl = `https://url.de/collections/collectionId/items?${new URLSearchParams(`f=json&crs=http://www.opengis.net/def/crs/EPSG/0/3857&bbox=0,1,2,3&bbox-crs=http://www.opengis.net/def/crs/EPSG/0/3857`).toString()}`;
			const successCbSpy = jasmine.createSpy();
			const failureCbSpy = jasmine.createSpy();
			const geoResource = new OafGeoResource('id', 'label', 'https://url.de/', 'collectionId', 4326);
			spyOn(geoResourceService, 'byId').and.returnValue(geoResource);
			spyOn(httpService, 'get')
				.withArgs(
					expectedUrl,
					{
						timeout: 15_000
					},
					{ response: [responseInterceptor] }
				)
				.and.resolveTo(response);
			const oafLoadFunction = getBvvOafLoadFunction(geoResourceId, olLayer)./*Usually done by the ol.source */ bind(olSource);
			const fetchingSpy = jasmine.createSpy();
			observe(store, (state) => state.network.fetching, fetchingSpy);

			const promise = oafLoadFunction(extent, resolution, projection, successCbSpy, failureCbSpy);
			expect(store.getState().layers.active[0].state).toBe(LayerState.LOADING);

			await promise;

			expect(store.getState().layers.active[0].state).not.toBe(LayerState.LOADING);
			expect(successCbSpy).toHaveBeenCalled();
			expect(failureCbSpy).not.toHaveBeenCalled();
			expect(olSource.getFeatures()).toHaveSize(10);
			expect(fetchingSpy).toHaveBeenCalledTimes(2);
			expect(fetchingSpy.calls.all()[0].args[0]).toBe(true);
			expect(fetchingSpy.calls.all()[1].args[0]).toBe(false);
			olSource.getFeatures().forEach((f) => {
				expect(f.getId()).not.toBe('');
			});
		});

		it('updates the `state` property of the corresponding layers', async () => {
			const geoResourceId = 'geoResourceId';
			const olSource = new VectorSource();
			const layerId = 'layerId';
			const olLayer = new VectorLayer({ id: layerId, source: olSource });
			addLayer(layerId, { geoResourceId });
			const extent = [0, 1, 2, 3];
			const resolution = 42.42;
			const projection = new Projection({ code: 'EPSG:3857' });
			const geoResource = new OafGeoResource('id', 'label', 'https://url.de/', 'collectionId', 4326);
			spyOn(geoResourceService, 'byId').and.returnValue(geoResource);
			const oafLoadFunction = getBvvOafLoadFunction(geoResourceId, olLayer)./*Usually done by the ol.source */ bind(olSource);
			spyOn(httpService, 'get').and.returnValues(
				Promise.resolve(new Response(mockResponsePayload)),
				Promise.resolve(new Response(mockResponsePayload_AllFeatures))
			);

			await oafLoadFunction(extent, resolution, projection, jasmine.createSpy(), jasmine.createSpy());

			expect(store.getState().layers.active[0].state).toBe(LayerState.INCOMPLETE_DATA);
			expect(olSource.get('incomplete_data')).toBeTrue();

			await oafLoadFunction(extent, resolution, projection, jasmine.createSpy(), jasmine.createSpy());

			expect(store.getState().layers.active[0].state).toBe(LayerState.OK);
			expect(olSource.get('incomplete_data')).not.toBeDefined();
		});

		it('includes the `limit` query parameter if requested', async () => {
			const geoResourceId = 'geoResourceId';
			const olSource = new VectorSource();
			const olLayer = new VectorLayer({ source: olSource });
			const extent = [0, 1, 2, 3];
			const resolution = 42.42;
			const projection = new Projection({ code: 'EPSG:3857' });
			const response = new Response(mockResponsePayload);
			const expectedUrl = `https://url.de/collections/collectionId/items?${new URLSearchParams(`f=json&crs=http://www.opengis.net/def/crs/EPSG/0/3857&limit=10&bbox=0,1,2,3&bbox-crs=http://www.opengis.net/def/crs/EPSG/0/3857`).toString()}`;
			const successCbSpy = jasmine.createSpy();
			const failureCbSpy = jasmine.createSpy();
			const geoResource = new OafGeoResource('id', 'label', 'https://url.de', 'collectionId', 4326).setLimit(10);
			spyOn(geoResourceService, 'byId').and.returnValue(geoResource);
			spyOn(httpService, 'get')
				.withArgs(
					expectedUrl,
					{
						timeout: 15_000
					},
					{ response: [responseInterceptor] }
				)
				.and.resolveTo(response);
			const oafLoadFunction = getBvvOafLoadFunction(geoResourceId, olLayer)./*Usually done by the ol.source */ bind(olSource);

			await oafLoadFunction(extent, resolution, projection, successCbSpy, failureCbSpy);

			expect(olSource.getFeatures()).toHaveSize(10);
		});

		it('includes the `filter` query parameter of the OafGeoResource', async () => {
			const geoResourceId = 'geoResourceId';
			const olSource = new VectorSource();
			const olLayer = new VectorLayer({ source: olSource });
			const extent = [0, 1, 2, 3];
			const resolution = 42.42;
			const projection = new Projection({ code: 'EPSG:3857' });
			const response = new Response(mockResponsePayload);
			const filterExpr = "(((name LIKE '%Foo%')))";
			const expectedUrl = `https://url.de/collections/collectionId/items?${new URLSearchParams(`f=json&crs=http://www.opengis.net/def/crs/EPSG/0/3857&bbox=0,1,2,3&bbox-crs=http://www.opengis.net/def/crs/EPSG/0/3857&filter=${filterExpr}`).toString()}`;
			const successCbSpy = jasmine.createSpy();
			const failureCbSpy = jasmine.createSpy();
			const geoResource = new OafGeoResource('id', 'label', 'https://url.de', 'collectionId', 4326).setFilter(filterExpr);
			spyOn(geoResourceService, 'byId').and.returnValue(geoResource);
			spyOn(httpService, 'get')
				.withArgs(
					expectedUrl,
					{
						timeout: 15_000
					},
					{ response: [responseInterceptor] }
				)
				.and.resolveTo(response);
			const oafLoadFunction = getBvvOafLoadFunction(geoResourceId, olLayer)./*Usually done by the ol.source */ bind(olSource);

			await oafLoadFunction(extent, resolution, projection, successCbSpy, failureCbSpy);

			expect(olSource.getFeatures()).toHaveSize(10);
		});

		it('includes the `filter` query parameter of the olLayer', async () => {
			const geoResourceId = 'geoResourceId';
			const olSource = new VectorSource();
			const filterExpr = "(((name LIKE '%Foo%')))";
			const olLayer = new VectorLayer({ source: olSource, properties: { filter: filterExpr } });
			const extent = [0, 1, 2, 3];
			const resolution = 42.42;
			const projection = new Projection({ code: 'EPSG:3857' });
			const response = new Response(mockResponsePayload);
			const expectedUrl = `https://url.de/collections/collectionId/items?${new URLSearchParams(`f=json&crs=http://www.opengis.net/def/crs/EPSG/0/3857&bbox=0,1,2,3&bbox-crs=http://www.opengis.net/def/crs/EPSG/0/3857&filter=${filterExpr}`).toString()}`;
			const successCbSpy = jasmine.createSpy();
			const failureCbSpy = jasmine.createSpy();
			const geoResource = new OafGeoResource('id', 'label', 'https://url.de', 'collectionId', 4326).setFilter('filterExprFromGeoResource');
			spyOn(geoResourceService, 'byId').and.returnValue(geoResource);
			spyOn(httpService, 'get')
				.withArgs(
					expectedUrl,
					{
						timeout: 15_000
					},
					{ response: [responseInterceptor] }
				)
				.and.resolveTo(response);
			const oafLoadFunction = getBvvOafLoadFunction(geoResourceId, olLayer)./*Usually done by the ol.source */ bind(olSource);

			await oafLoadFunction(extent, resolution, projection, successCbSpy, failureCbSpy);

			expect(olSource.getFeatures()).toHaveSize(10);
		});

		it('calls the failureCallback when http status is other than 200', async () => {
			const geoResourceId = 'geoResourceId';
			const olSource = new VectorSource();
			const layerId = 'layerId';
			const olLayer = new VectorLayer({ id: layerId, source: olSource });
			addLayer(layerId, { geoResourceId });
			const removeLoadedExtentSpy = spyOn(olSource, 'removeLoadedExtent');
			const extent = [0, 1, 2, 3];
			const resolution = 42.42;
			const projection = new Projection({ code: 'EPSG:3857' });
			const response = new Response(null, { status: 404 });
			const successCbSpy = jasmine.createSpy();
			const failureCbSpy = jasmine.createSpy();
			const geoResource = new OafGeoResource('id', 'label', 'https://url.de', 'collectionId', 4326);
			spyOn(geoResourceService, 'byId').and.returnValue(geoResource);
			spyOn(httpService, 'get').and.resolveTo(response);
			const oafLoadFunction = getBvvOafLoadFunction(geoResourceId, olLayer)./*Usually done by the ol.source */ bind(olSource);
			const fetchingSpy = jasmine.createSpy();
			observe(store, (state) => state.network.fetching, fetchingSpy);

			await expectAsync(oafLoadFunction(extent, resolution, projection, successCbSpy, failureCbSpy)).toBeRejectedWith(
				new UnavailableGeoResourceError(`Unexpected network status`, geoResourceId, 404)
			);

			expect(store.getState().layers.active[0].state).toBe(LayerState.ERROR);
			expect(successCbSpy).not.toHaveBeenCalled();
			expect(failureCbSpy).toHaveBeenCalled();
			expect(removeLoadedExtentSpy).toHaveBeenCalledWith(extent);
			expect(fetchingSpy).toHaveBeenCalledTimes(2);
			expect(fetchingSpy.calls.all()[0].args[0]).toBe(true);
			expect(fetchingSpy.calls.all()[1].args[0]).toBe(false);
		});

		it('rejects with an UnavailableGeoResourceError when a request was aborted', async () => {
			const geoResourceId = 'geoResourceId';
			const olSource = new VectorSource();
			const layerId = 'layerId';
			const olLayer = new VectorLayer({ id: layerId, source: olSource });
			addLayer(layerId, { geoResourceId });
			const removeLoadedExtentSpy = spyOn(olSource, 'removeLoadedExtent');
			const extent = [0, 1, 2, 3];
			const resolution = 42.42;
			const projection = new Projection({ code: 'EPSG:3857' });
			const successCbSpy = jasmine.createSpy();
			const failureCbSpy = jasmine.createSpy();
			const geoResource = new OafGeoResource('id', 'label', 'https://url.de', 'collectionId', 4326);
			spyOn(geoResourceService, 'byId').and.returnValue(geoResource);
			spyOn(httpService, 'get').and.rejectWith(new DOMException('aborted'));
			const oafLoadFunction = getBvvOafLoadFunction(geoResourceId, olLayer)./*Usually done by the ol.source */ bind(olSource);

			await expectAsync(oafLoadFunction(extent, resolution, projection, successCbSpy, failureCbSpy)).toBeRejectedWith(
				new UnavailableGeoResourceError(`aborted`, geoResourceId)
			);

			expect(store.getState().layers.active[0].state).toBe(LayerState.ERROR);
			expect(successCbSpy).not.toHaveBeenCalled();
			expect(failureCbSpy).toHaveBeenCalled();
			expect(removeLoadedExtentSpy).not.toHaveBeenCalledWith(extent);
		});

		describe('BAA is required', () => {
			it('adds the features to the source', async () => {
				const geoResourceId = 'geoResourceId';
				const olSource = new VectorSource();
				const olLayer = new VectorLayer({ source: olSource });
				const extent = [0, 1, 2, 3];
				const resolution = 42.42;
				const projection = new Projection({ code: 'EPSG:3857' });
				const response = new Response(mockResponsePayload);
				const expectedUrl = `https://url.de/collections/collectionId/items?${new URLSearchParams(`f=json&crs=http://www.opengis.net/def/crs/EPSG/0/3857&bbox=0,1,2,3&bbox-crs=http://www.opengis.net/def/crs/EPSG/0/3857`).toString()}`;
				const successCbSpy = jasmine.createSpy();
				const failureCbSpy = jasmine.createSpy();
				const geoResource = new OafGeoResource('id', 'label', 'https://url.de/', 'collectionId', 4326);
				const credential = { username: 'username', password: 'password' };
				spyOn(geoResourceService, 'byId').and.returnValue(geoResource);
				spyOn(httpService, 'get')
					.withArgs(expectedUrl, {
						timeout: 15_000,
						headers: new Headers({
							Authorization: `Basic ${btoa(`${credential.username}:${credential.password}`)}`
						})
					})
					.and.resolveTo(response);
				const oafLoadFunction = getBvvOafLoadFunction(geoResourceId, olLayer, credential)./*Usually done by the ol.source */ bind(olSource);

				await oafLoadFunction(extent, resolution, projection, successCbSpy, failureCbSpy);

				expect(successCbSpy).toHaveBeenCalled();
				expect(failureCbSpy).not.toHaveBeenCalled();
				expect(olSource.getFeatures()).toHaveSize(10);

				olSource.getFeatures().forEach((f) => {
					expect(f.getId()).not.toBe('');
				});
			});
		});
	});
});
