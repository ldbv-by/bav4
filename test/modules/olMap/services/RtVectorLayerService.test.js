import { $injector } from '../../../../src/injection';
import { getNextPort, isNextPortAvailable, RtVectorLayerService } from '../../../../src/modules/olMap/services/RtVectorLayerService';
import { createDefaultLayerProperties, layersReducer } from '../../../../src/store/layers/layers.reducer';
import { TestUtils } from '../../../test-utils';
import { RtVectorGeoResource, VectorSourceType } from '../../../../src/domain/geoResources';
import { Server as WebsocketMockServer } from 'mock-socket';
import VectorLayer from 'ol/layer/Vector';
import { UnavailableGeoResourceError } from '../../../../src/domain/errors';
import { positionReducer } from '../../../../src/store/position/position.reducer';
import { modifyLayer, removeLayer } from '../../../../src/store/layers/layers.action';

describe('RtVectorLayerService', () => {
	const mapService = {
		getSrid: () => 3857
	};

	const vectorLayerService = {
		applyStyles: () => {},
		applyClusterStyle: () => {},
		sanitizeStyles: () => {}
	};

	describe('utils', () => {
		describe('isNextPortAvailable', () => {
			it('checks the ports for availability', () => {
				expect(isNextPortAvailable([1], 1)).toBeFalse();
				expect(isNextPortAvailable([1, 2], 1)).toBeTrue();
				expect(isNextPortAvailable([1, 2], 2)).toBeFalse();
				expect(isNextPortAvailable([1, 2], null)).toBeTrue();
				expect(isNextPortAvailable(null, null)).toBeFalse();
			});
		});

		describe('getNextPort', () => {
			it('returns the next port from the array', () => {
				const ports = [80, 90, 100];

				expect(getNextPort(ports, null)).toBeUndefined();
				expect(getNextPort(ports, undefined)).toBe(90);
				expect(getNextPort(ports, 80)).toBe(90);
				expect(getNextPort(ports, 90)).toBe(100);
				expect(getNextPort(ports, 100)).toBeUndefined();
			});
		});
	});

	describe('service methods', () => {
		const kmlData =
			'<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Placemark id="draw_line_1620710146878"><Style><LineStyle><color>ff0000ff</color><width>3</width></LineStyle><PolyStyle><color>660000ff</color></PolyStyle></Style><ExtendedData><Data name="area"/><Data name="measurement"/><Data name="partitions"/></ExtendedData><Polygon><outerBoundaryIs><LinearRing><coordinates>10.66758401,50.09310529 11.77182103,50.08964948 10.57062661,49.66616988 10.66758401,50.09310529</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></kml>';
		const eWktData = 'SRID=4326;POINT(21 42)';

		let instanceUnderTest;
		const setup = (state = {}) => {
			const store = TestUtils.setupStoreAndDi(state, {
				layers: layersReducer,
				position: positionReducer
			});
			$injector.registerSingleton('MapService', mapService).registerSingleton('VectorLayerService', vectorLayerService);
			instanceUnderTest = new RtVectorLayerService();
			return store;
		};

		describe('_addPortToUrl', () => {
			it('adds a port to the url', () => {
				setup();
				expect(instanceUnderTest._addPortToUrl('ws://url.to', 80)).toBe('ws://url.to:80');
				expect(instanceUnderTest._addPortToUrl('ws://url.with.path.to/segment/', 42)).toBe('ws://url.with.path.to:42/segment/');
			});
		});

		describe('_getFeatureReader', () => {
			it('reads features in supported kml format', () => {
				setup();
				const kmlFeatureReader = instanceUnderTest._getFeatureReader({ sourceType: VectorSourceType.KML });

				expect(kmlFeatureReader(kmlData)).toHaveSize(1);
			});

			it('reads features in supported ewkt format', () => {
				setup();
				const eWktFeatureReader = instanceUnderTest._getFeatureReader({ sourceType: VectorSourceType.EWKT });

				expect(eWktFeatureReader(eWktData)).toHaveSize(1);
			});
		});

		describe('_cascadingPorts', () => {
			it('cascades through the available ports with failed port 80', () => {
				const failedPort = 80;
				const geoResourceId = 'foo';
				setup();

				const nextPortCallback = jasmine.createSpy();

				instanceUnderTest._cascadingPorts(failedPort, nextPortCallback, geoResourceId);

				expect(nextPortCallback).toHaveBeenCalledWith(443);
			});

			it('cascades through the available ports with failed port undefined', () => {
				const failedPort = undefined;
				const geoResourceId = 'foo';
				setup();

				const nextPortCallback = jasmine.createSpy();

				instanceUnderTest._cascadingPorts(failedPort, nextPortCallback, geoResourceId);

				expect(nextPortCallback).toHaveBeenCalledWith(443);
			});

			it('throws an error while last failed port is 443', () => {
				const failedPort = 443;
				const geoResourceId = 'foo';
				setup();

				const nextPortCallback = jasmine.createSpy();

				expect(() => instanceUnderTest._cascadingPorts(failedPort, nextPortCallback, geoResourceId)).toThrowMatching((t) => {
					return (
						t.message === 'Realtime-data cannot be displayed for technical reasons.' &&
						t instanceof UnavailableGeoResourceError &&
						t.geoResourceId === geoResourceId
					);
				});
			});
		});

		describe('createVectorLayer', () => {
			const wsUrl = 'ws://localhost';

			const rtVectorGeoResource = new RtVectorGeoResource('geoResourceId', 'geoResourceLabel', wsUrl, VectorSourceType.KML);
			const clusteredRtVectorGeoResource = new RtVectorGeoResource('geoResourceId', 'geoResourceLabel', wsUrl, VectorSourceType.KML).setClusterParams(
				{ foo: 'bar' }
			);

			let mockServer;
			beforeEach(() => {
				mockServer = new WebsocketMockServer(wsUrl);
			});
			afterEach(() => {
				mockServer.close();
			});

			it('returns an ol vector layer for a websocket based RtVectorGeoResource', () => {
				const layer = { ...createDefaultLayerProperties(), id: 'id0', geoResourceId: 'geoResourceId0' };
				const state = {
					layers: {
						active: [layer]
					}
				};
				setup(state);
				const id = 'id0';
				const olMap = { getView: () => {} };

				const olVectorLayer = instanceUnderTest.createLayer(id, rtVectorGeoResource, olMap);

				expect(olVectorLayer.get('id')).toBe(id);
				expect(olVectorLayer.get('geoResourceId')).toBe('geoResourceId');
				expect(olVectorLayer.getMinZoom()).toBeNegativeInfinity();
				expect(olVectorLayer.getMaxZoom()).toBePositiveInfinity();
				expect(olVectorLayer.constructor.name).toBe('VectorLayer');
				expect(mockServer.clients()).toHaveSize(1);
			});

			it('updates vector layer features, after server sends a message', () => {
				const layer = { ...createDefaultLayerProperties(), id: 'id0', geoResourceId: 'geoResourceId0' };
				const state = {
					layers: {
						active: [layer]
					}
				};
				const store = setup(state);
				const id = 'id0';
				const olMap = { getView: () => {} };

				const olVectorLayer = instanceUnderTest.createLayer(id, rtVectorGeoResource, olMap);
				spyOn(olMap, 'getView').and.returnValue({ calculateExtent: () => [] });
				const processSpy = spyOn(instanceUnderTest, '_processMessage').and.callThrough();
				const sanitizeStyleSpy = spyOn(vectorLayerService, 'sanitizeStyles').and.callFake(() => {});
				const applyStyleSpy = spyOn(vectorLayerService, 'applyStyles')
					.withArgs(olVectorLayer, olMap)
					.and.callFake(() => {});
				const fitViewSpy = spyOn(instanceUnderTest, '_centerViewOptionally').and.callThrough();
				expect(olVectorLayer.getSource().getFeatures().length).toBe(0);

				mockServer.emit('message', kmlData);

				expect(olVectorLayer.getSource().getFeatures().length).toBe(1);
				expect(olVectorLayer.getSource().getFeatures()[0].get('showPointNames')).toBeTrue();
				expect(processSpy).toHaveBeenCalled();
				expect(sanitizeStyleSpy).toHaveBeenCalled();
				expect(applyStyleSpy).toHaveBeenCalled();
				expect(fitViewSpy).toHaveBeenCalled();
				expect(store.getState().position.fitRequest.payload.extent).toEqual(olVectorLayer.getSource().getExtent());
			});

			it('updates clustered vector layer features, after server sends a message', () => {
				const layer = { ...createDefaultLayerProperties(), id: 'id0', geoResourceId: 'geoResourceId0' };
				const state = {
					layers: {
						active: [layer]
					}
				};

				const store = setup(state);
				const id = 'id0';
				const olMap = { getView: () => {} };
				const viewMock = { calculateExtent: () => [] };

				const olVectorLayer = instanceUnderTest.createLayer(id, clusteredRtVectorGeoResource, olMap);
				const processSpy = spyOn(instanceUnderTest, '_processMessage').and.callThrough();
				spyOn(olMap, 'getView').and.callFake(() => viewMock);
				const sanitizeStyleSpy = spyOn(vectorLayerService, 'sanitizeStyles').and.callFake(() => {});

				const applyStyleSpy = spyOn(vectorLayerService, 'applyClusterStyle')
					.withArgs(olVectorLayer)
					.and.callFake(() => {});
				const fitViewSpy = spyOn(instanceUnderTest, '_centerViewOptionally').and.callThrough();
				expect(olVectorLayer.getSource().getFeatures().length).toBe(0);

				mockServer.emit('message', kmlData);

				expect(olVectorLayer.getSource().getFeatures().length).toBe(1);
				expect(olVectorLayer.getSource().getFeatures()[0].get('showPointNames')).toBeTrue();
				expect(processSpy).toHaveBeenCalled();
				expect(sanitizeStyleSpy).toHaveBeenCalled();
				expect(applyStyleSpy).toHaveBeenCalled();
				expect(fitViewSpy).toHaveBeenCalled();
				expect(store.getState().position.fitRequest.payload.extent).toEqual(olVectorLayer.getSource().getExtent());
			});

			it('makes a fit request for the first features only', () => {
				const layer = { ...createDefaultLayerProperties(), id: 'id0', geoResourceId: 'geoResourceId0' };
				const state = {
					layers: {
						active: [layer]
					}
				};
				const store = setup(state);
				const id = 'id0';
				const initialCenter = store.getState().position.center;
				const olMap = { getView: () => {} };
				const viewMock = { calculateExtent: () => [] };

				const olVectorLayer = instanceUnderTest.createLayer(id, rtVectorGeoResource, olMap);
				spyOn(olMap, 'getView').and.returnValue(viewMock);
				spyOn(instanceUnderTest, '_processMessage').and.callThrough();
				spyOn(vectorLayerService, 'sanitizeStyles').and.callFake(() => {});
				spyOn(vectorLayerService, 'applyStyles')
					.withArgs(olVectorLayer, olMap)
					.and.callFake(() => {});
				const fitViewSpy = spyOn(instanceUnderTest, '_centerViewOptionally')
					.withArgs(olVectorLayer, olMap, true)
					.and.callThrough()
					.withArgs(olVectorLayer, olMap, false)
					.and.callThrough()
					.withArgs(olVectorLayer, olMap, false)
					.and.callThrough();
				expect(olVectorLayer.getSource().getFeatures().length).toBe(0);
				expect(store.getState().position.fitRequest.payload).toBeNull();

				mockServer.emit('message', kmlData);
				mockServer.emit('message', kmlData);
				mockServer.emit('message', kmlData);

				expect(olVectorLayer.getSource().getFeatures().length).toBe(1);
				expect(fitViewSpy).toHaveBeenCalledTimes(3);
				expect(store.getState().position.fitRequest.payload.extent).toEqual(olVectorLayer.getSource().getExtent());
				expect(store.getState().position.center).not.toEqual(initialCenter);
			});

			it('does NOT makes a fit request for already containing extent in the view', () => {
				const layer = { ...createDefaultLayerProperties(), id: 'id0', geoResourceId: 'geoResourceId0' };
				const state = {
					layers: {
						active: [layer]
					}
				};
				const store = setup(state);
				const id = 'id0';
				const olMap = { getView: () => {} };
				const olVectorLayer = instanceUnderTest.createLayer(id, rtVectorGeoResource, olMap);
				const viewMock = { calculateExtent: () => olVectorLayer.getSource().getExtent() };

				spyOn(olMap, 'getView').and.returnValue(viewMock);
				spyOn(instanceUnderTest, '_processMessage').and.callThrough();
				spyOn(vectorLayerService, 'sanitizeStyles').and.callFake(() => {});
				spyOn(vectorLayerService, 'applyStyles')
					.withArgs(olVectorLayer, olMap)
					.and.callFake(() => {});
				const fitViewSpy = spyOn(instanceUnderTest, '_centerViewOptionally').and.callThrough();
				expect(olVectorLayer.getSource().getFeatures().length).toBe(0);
				expect(store.getState().position.fitRequest.payload).toBeNull();

				mockServer.emit('message', kmlData);
				mockServer.emit('message', kmlData);
				mockServer.emit('message', kmlData);

				expect(olVectorLayer.getSource().getFeatures().length).toBe(1);
				expect(fitViewSpy).toHaveBeenCalledTimes(3);
				expect(store.getState().position.fitRequest.payload).toBeNull();
			});

			it('does nothing, after server sends a keep-alive message', () => {
				const layer = { ...createDefaultLayerProperties(), id: 'id0', geoResourceId: 'geoResourceId0' };
				const state = {
					layers: {
						active: [layer]
					}
				};
				setup(state);
				const id = 'id0';
				const olMap = { getView: () => {} };

				const olVectorLayer = instanceUnderTest.createLayer(id, rtVectorGeoResource, olMap);
				const vectorSource = olVectorLayer.getSource();
				const vectorSourceSpy = spyOn(vectorSource, 'clear').and.callThrough();
				const processSpy = spyOn(instanceUnderTest, '_processMessage').and.callThrough();
				expect(vectorSource.getFeatures().length).toBe(0);

				mockServer.emit('message', 'keep-alive');
				mockServer.emit('message', 'keep-alive');
				mockServer.emit('message', 'keep-alive');

				expect(vectorSource.getFeatures().length).toBe(0);
				expect(vectorSourceSpy).not.toHaveBeenCalled();
				expect(processSpy).toHaveBeenCalledTimes(0);
			});

			describe('when the connection get lost (websocket.onclose)', () => {
				it('cascades available ports', () => {
					const layer = { ...createDefaultLayerProperties(), id: 'id0', geoResourceId: 'geoResourceId0' };
					const state = {
						layers: {
							active: [layer]
						}
					};
					setup(state);
					const id = 'id0';
					const olMap = { getView: () => {} };

					const startWebSocketSpy = spyOn(instanceUnderTest, '_startWebSocket')
						.withArgs(jasmine.any(Object), jasmine.any(VectorLayer), olMap)
						.and.callThrough()
						.withArgs(jasmine.any(Object), jasmine.any(VectorLayer), olMap, 443)
						.and.callThrough();

					const cascadingPortsSpy = spyOn(instanceUnderTest, '_cascadingPorts').and.callThrough();
					instanceUnderTest.createLayer(id, rtVectorGeoResource, olMap);

					mockServer.close({ code: 1006, reason: 'Foo', wasClean: false });
					expect(startWebSocketSpy).toHaveBeenCalledTimes(2);
					expect(cascadingPortsSpy).toHaveBeenCalledTimes(1);
				});
			});

			describe('when layer visibility changes or layers is removed', () => {
				it('closes websocket connection', () => {
					const layer = { ...createDefaultLayerProperties(), id: 'id0', geoResourceId: 'geoResourceId0' };
					const state = {
						layers: {
							active: [layer]
						}
					};
					setup(state);
					const id = 'id0';
					const olMap = { getView: () => {} };

					const startWebSocketSpy = spyOn(instanceUnderTest, '_startWebSocket').and.callThrough();
					const closeWebSocketSpy = spyOn(instanceUnderTest, '_closeWebSocket').and.callThrough();
					instanceUnderTest.createLayer(id, rtVectorGeoResource, olMap);

					expect(startWebSocketSpy).toHaveBeenCalledTimes(1);
					expect(mockServer.clients().length).toBe(1);

					const webSocket1 = mockServer.clients()[0];
					const closeSpy1 = spyOn(webSocket1, 'close').and.callThrough();
					modifyLayer('id0', { visible: false });

					expect(closeWebSocketSpy).toHaveBeenCalledTimes(1);
					expect(closeSpy1).toHaveBeenCalledTimes(1);

					modifyLayer('id0', { visible: true });

					expect(startWebSocketSpy).toHaveBeenCalledTimes(2);

					const webSocket2 = mockServer.clients()[1];
					const closeSpy2 = spyOn(webSocket2, 'close').and.callThrough();
					removeLayer('id0');

					expect(closeWebSocketSpy).toHaveBeenCalledTimes(2);
					expect(closeSpy2).toHaveBeenCalledTimes(1);
				});

				it('does NOTHING, when visibility did not change', () => {
					const layer = { ...createDefaultLayerProperties(), id: 'id0', geoResourceId: 'geoResourceId0' };
					const state = {
						layers: {
							active: [layer]
						}
					};
					setup(state);
					const id = 'id0';
					const olMap = { getView: () => {} };

					const startWebSocketSpy = spyOn(instanceUnderTest, '_startWebSocket').and.callThrough();
					const closeWebSocketSpy = spyOn(instanceUnderTest, '_closeWebSocket').and.callThrough();
					instanceUnderTest.createLayer(id, rtVectorGeoResource, olMap);

					expect(startWebSocketSpy).toHaveBeenCalledTimes(1);
					expect(mockServer.clients().length).toBe(1);

					modifyLayer('id0', { foo: false });

					expect(closeWebSocketSpy).toHaveBeenCalledTimes(0);
					expect(startWebSocketSpy).toHaveBeenCalledTimes(1);
				});

				it('does NOTHING, when visibility did not change and no websocket exists', () => {
					const layer = { ...createDefaultLayerProperties(), id: 'id0', geoResourceId: 'geoResourceId0', visible: false };
					const state = {
						layers: {
							active: [layer]
						}
					};
					setup(state);
					const id = 'id0';
					const olMap = { getView: () => {} };

					const startWebSocketSpy = spyOn(instanceUnderTest, '_startWebSocket').and.callThrough();
					const closeWebSocketSpy = spyOn(instanceUnderTest, '_closeWebSocket').and.callThrough();
					instanceUnderTest.createLayer(id, rtVectorGeoResource, olMap);

					expect(startWebSocketSpy).toHaveBeenCalledTimes(0);
					expect(mockServer.clients().length).toBe(0);

					modifyLayer('id0', { visible: false, foo: 'bar' });

					expect(closeWebSocketSpy).toHaveBeenCalledTimes(0);
					expect(startWebSocketSpy).toHaveBeenCalledTimes(0);
				});

				it('opens websocket, when visibility change afterwards', () => {
					const layer = { ...createDefaultLayerProperties(), id: 'id0', geoResourceId: 'geoResourceId0', visible: false };
					const state = {
						layers: {
							active: [layer]
						}
					};
					setup(state);
					const id = 'id0';
					const olMap = { getView: () => {} };

					const startWebSocketSpy = spyOn(instanceUnderTest, '_startWebSocket').and.callThrough();
					const closeWebSocketSpy = spyOn(instanceUnderTest, '_closeWebSocket').and.callThrough();
					instanceUnderTest.createLayer(id, rtVectorGeoResource, olMap);

					expect(startWebSocketSpy).toHaveBeenCalledTimes(0);
					expect(mockServer.clients().length).toBe(0);

					modifyLayer('id0', { visible: true, foo: 'bar' });

					expect(closeWebSocketSpy).toHaveBeenCalledTimes(0);
					expect(startWebSocketSpy).toHaveBeenCalledTimes(1);
				});
			});
		});
	});
});
