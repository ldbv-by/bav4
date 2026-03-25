import { $injector } from '@src/injection';
import { getNextPort, isNextPortAvailable, RtVectorLayerService } from '@src/modules/olMap/services/RtVectorLayerService';
import { createDefaultLayerProperties, layersReducer } from '@src/store/layers/layers.reducer';
import { TestUtils } from '@test/test-utils';
import { RtVectorGeoResource, VectorSourceType } from '@src/domain/geoResources';
import { Server as WebsocketMockServer } from 'mock-socket';
import VectorLayer from 'ol/layer/Vector';
import { UnavailableGeoResourceError } from '@src/domain/errors';
import { positionReducer } from '@src/store/position/position.reducer';
import { modifyLayer, removeLayer } from '@src/store/layers/layers.action';
import { asInternalProperty } from '@src/utils/propertyUtils';

describe('RtVectorLayerService', () => {
	const mapService = {
		getSrid: () => 3857
	};

	const styleService = {
		applyStyle: () => {}
	};

	describe('utils', () => {
		describe('isNextPortAvailable', () => {
			it('checks the ports for availability', () => {
				expect(isNextPortAvailable([1], 1)).toBe(false);
				expect(isNextPortAvailable([1, 2], 1)).toBe(true);
				expect(isNextPortAvailable([1, 2], 2)).toBe(false);
				expect(isNextPortAvailable([1, 2], null)).toBe(true);
				expect(isNextPortAvailable(null, null)).toBe(false);
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
			$injector.registerSingleton('MapService', mapService).registerSingleton('StyleService', styleService);
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

				expect(kmlFeatureReader(kmlData)).toHaveLength(1);
			});

			it('reads features in supported ewkt format', () => {
				setup();
				const eWktFeatureReader = instanceUnderTest._getFeatureReader({ sourceType: VectorSourceType.EWKT });

				expect(eWktFeatureReader(eWktData)).toHaveLength(1);
			});
		});

		describe('_cascadingPorts', () => {
			it('cascades through the available ports with failed port 80', () => {
				const failedPort = 80;
				const geoResourceId = 'foo';
				setup();

				const nextPortCallback = vi.fn();

				instanceUnderTest._cascadingPorts(failedPort, nextPortCallback, geoResourceId);

				expect(nextPortCallback).toHaveBeenCalledWith(443);
			});

			it('cascades through the available ports with failed port undefined', () => {
				const failedPort = undefined;
				const geoResourceId = 'foo';
				setup();

				const nextPortCallback = vi.fn();

				instanceUnderTest._cascadingPorts(failedPort, nextPortCallback, geoResourceId);

				expect(nextPortCallback).toHaveBeenCalledWith(443);
			});

			it('throws an error while last failed port is 443', () => {
				const failedPort = 443;
				const geoResourceId = 'foo';
				setup();

				const nextPortCallback = vi.fn();

				expect(() => instanceUnderTest._cascadingPorts(failedPort, nextPortCallback, geoResourceId)).toThrow(
					new UnavailableGeoResourceError('Realtime-data cannot be displayed for technical reasons.', geoResourceId)
				);
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
				expect(olVectorLayer.getMinZoom()).toBe(-Infinity);
				expect(olVectorLayer.getMaxZoom()).toBe(Infinity);
				expect(olVectorLayer.constructor.name).toBe('VectorLayer');
				expect(mockServer.clients()).toHaveLength(1);
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
				vi.spyOn(olMap, 'getView').mockReturnValue({ calculateExtent: () => [] });
				const processSpy = vi.spyOn(instanceUnderTest, '_processMessage');
				const applyStyleSpy = vi.spyOn(styleService, 'applyStyle').mockImplementation(() => {});
				const fitViewSpy = vi.spyOn(instanceUnderTest, '_centerViewOptionally');
				expect(olVectorLayer.getSource().getFeatures().length).toBe(0);

				mockServer.emit('message', kmlData);

				expect(olVectorLayer.getSource().getFeatures().length).toBe(1);
				expect(olVectorLayer.getSource().getFeatures()[0].get(asInternalProperty('displayFeatureLabels'))).toBe(true);
				expect(processSpy).toHaveBeenCalled();
				expect(applyStyleSpy).toHaveBeenCalledWith(olVectorLayer, olMap, rtVectorGeoResource);
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
				const processSpy = vi.spyOn(instanceUnderTest, '_processMessage');
				vi.spyOn(olMap, 'getView').mockImplementation(() => viewMock);

				const applyStyleSpy = vi.spyOn(styleService, 'applyStyle').mockImplementation(() => {});
				const fitViewSpy = vi.spyOn(instanceUnderTest, '_centerViewOptionally');
				expect(olVectorLayer.getSource().getFeatures().length).toBe(0);

				mockServer.emit('message', kmlData);

				expect(olVectorLayer.getSource().getFeatures().length).toBe(1);
				expect(olVectorLayer.getSource().getFeatures()[0].get(asInternalProperty('displayFeatureLabels'))).toBe(true);
				expect(processSpy).toHaveBeenCalled();
				expect(applyStyleSpy).toHaveBeenCalledWith(olVectorLayer, olMap, clusteredRtVectorGeoResource);
				expect(fitViewSpy).toHaveBeenCalled();
				expect(store.getState().position.fitRequest.payload.extent).toEqual(olVectorLayer.getSource().getExtent());
			});

			it('fires a fit request for the first features only', () => {
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
				vi.spyOn(olMap, 'getView').mockReturnValue(viewMock);
				vi.spyOn(instanceUnderTest, '_processMessage');
				vi.spyOn(styleService, 'applyStyle').mockImplementation(() => {});
				const fitViewSpy = vi.spyOn(instanceUnderTest, '_centerViewOptionally');

				expect(olVectorLayer.getSource().getFeatures().length).toBe(0);
				expect(store.getState().position.fitRequest.payload).toBeNull();

				mockServer.emit('message', kmlData);
				mockServer.emit('message', kmlData);
				mockServer.emit('message', kmlData);

				expect(olVectorLayer.getSource().getFeatures().length).toBe(1);
				expect(fitViewSpy).toHaveBeenCalledTimes(3);
				expect(fitViewSpy.mock.calls[0]).toEqual([olVectorLayer, olMap, true]);
				expect(fitViewSpy.mock.calls[1]).toEqual([olVectorLayer, olMap, false]);
				expect(fitViewSpy.mock.calls[2]).toEqual([olVectorLayer, olMap, false]);
				expect(store.getState().position.fitRequest.payload.extent).toEqual(olVectorLayer.getSource().getExtent());
				expect(store.getState().position.center).not.toEqual(initialCenter);
			});

			it('does NOT fire a fit request for already containing extent in the view', () => {
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

				vi.spyOn(olMap, 'getView').mockReturnValue(viewMock);
				vi.spyOn(instanceUnderTest, '_processMessage');
				vi.spyOn(styleService, 'applyStyle').mockImplementation(() => {});
				const fitViewSpy = vi.spyOn(instanceUnderTest, '_centerViewOptionally');
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
				const vectorSourceSpy = vi.spyOn(vectorSource, 'clear');
				const processSpy = vi.spyOn(instanceUnderTest, '_processMessage');
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

					const startWebSocketSpy = vi.spyOn(instanceUnderTest, '_startWebSocket');
					const cascadingPortsSpy = vi.spyOn(instanceUnderTest, '_cascadingPorts');
					instanceUnderTest.createLayer(id, rtVectorGeoResource, olMap);

					mockServer.close({ code: 1006, reason: 'Foo', wasClean: false });
					expect(startWebSocketSpy).toHaveBeenCalledTimes(2);
					expect(startWebSocketSpy.mock.calls[0]).toEqual([expect.any(Object), expect.any(VectorLayer), olMap]);
					expect(startWebSocketSpy.mock.calls[1]).toEqual([expect.any(Object), expect.any(VectorLayer), olMap, 443]);
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

					const startWebSocketSpy = vi.spyOn(instanceUnderTest, '_startWebSocket');
					const closeWebSocketSpy = vi.spyOn(instanceUnderTest, '_closeWebSocket');
					instanceUnderTest.createLayer(id, rtVectorGeoResource, olMap);

					expect(startWebSocketSpy).toHaveBeenCalledTimes(1);
					expect(mockServer.clients().length).toBe(1);

					const webSocket1 = mockServer.clients()[0];
					const closeSpy1 = vi.spyOn(webSocket1, 'close');
					modifyLayer('id0', { visible: false });

					expect(closeWebSocketSpy).toHaveBeenCalledTimes(1);
					expect(closeSpy1).toHaveBeenCalledTimes(1);

					modifyLayer('id0', { visible: true });

					expect(startWebSocketSpy).toHaveBeenCalledTimes(2);

					const webSocket2 = mockServer.clients()[1];
					const closeSpy2 = vi.spyOn(webSocket2, 'close');
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

					const startWebSocketSpy = vi.spyOn(instanceUnderTest, '_startWebSocket');
					const closeWebSocketSpy = vi.spyOn(instanceUnderTest, '_closeWebSocket');
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

					const startWebSocketSpy = vi.spyOn(instanceUnderTest, '_startWebSocket');
					const closeWebSocketSpy = vi.spyOn(instanceUnderTest, '_closeWebSocket');
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

					const startWebSocketSpy = vi.spyOn(instanceUnderTest, '_startWebSocket');
					const closeWebSocketSpy = vi.spyOn(instanceUnderTest, '_closeWebSocket');
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
