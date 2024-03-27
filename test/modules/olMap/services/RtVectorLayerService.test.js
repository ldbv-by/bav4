import { $injector } from '../../../../src/injection';
import { getNextPort, isNextPortAvailable, RtVectorLayerService } from '../../../../src/modules/olMap/services/RtVectorLayerService';
import { layersReducer } from '../../../../src/store/layers/layers.reducer';
import { TestUtils } from '../../../test-utils';
import { VectorSourceType } from '../../../../src/domain/geoResources';
import { Server as WebsocketMockServer } from 'mock-socket';
import VectorLayer from 'ol/layer/Vector';
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
		let instanceUnderTest;
		const setup = (state = {}) => {
			TestUtils.setupStoreAndDi(state, {
				layers: layersReducer
			});
			$injector.registerSingleton('MapService', mapService).registerSingleton('VectorLayerService', vectorLayerService);
			instanceUnderTest = new RtVectorLayerService();
		};

		describe('_addPortToUrl', () => {
			it('adds a port to the url', () => {
				setup();
				expect(instanceUnderTest._addPortToUrl('ws://url.to', 80)).toBe('ws://url.to:80');
				expect(instanceUnderTest._addPortToUrl('ws://url.with.path.to/segment/', 42)).toBe('ws://url.with.path.to:42/segment/');
			});
		});

		describe('createVectorLayer', () => {
			const wsUrl = 'ws://localhost';
			const kmlData =
				'<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Placemark id="draw_line_1620710146878"><Style><LineStyle><color>ff0000ff</color><width>3</width></LineStyle><PolyStyle><color>660000ff</color></PolyStyle></Style><ExtendedData><Data name="area"/><Data name="measurement"/><Data name="partitions"/></ExtendedData><Polygon><outerBoundaryIs><LinearRing><coordinates>10.66758401,50.09310529 11.77182103,50.08964948 10.57062661,49.66616988 10.66758401,50.09310529</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></kml>';

			const rtVectorGeoResource = {
				id: 'geoResourceId',
				label: 'geoResourceLabel',
				sourceType: VectorSourceType.KML,
				url: wsUrl,
				srid: 4326,
				isClustered: () => false
			};

			let mockServer;
			beforeEach(() => {
				mockServer = new WebsocketMockServer(wsUrl);
			});
			afterEach(() => {
				mockServer.close();
			});

			it('returns an ol vector layer for a websocket based RtVectorGeoResource', () => {
				setup();
				const id = 'id';
				const olMap = new Map();

				const olVectorLayer = instanceUnderTest.createLayer(id, rtVectorGeoResource, olMap);

				expect(olVectorLayer.get('id')).toBe(id);
				expect(olVectorLayer.get('geoResourceId')).toBe('geoResourceId');
				expect(olVectorLayer.getMinZoom()).toBeNegativeInfinity();
				expect(olVectorLayer.getMaxZoom()).toBePositiveInfinity();
				expect(olVectorLayer.constructor.name).toBe('VectorLayer');
				expect(mockServer.clients()).toHaveSize(1);
			});

			it('updates vector layer features, after server sends a message', () => {
				setup();
				const id = 'id';
				const olMap = new Map();

				const olVectorLayer = instanceUnderTest.createLayer(id, rtVectorGeoResource, olMap);
				const processSpy = spyOn(instanceUnderTest, '_processMessage').and.callThrough();
				const sanitizeStyleSpy = spyOn(vectorLayerService, 'sanitizeStyles').and.callFake(() => {});
				const applyStyleSpy = spyOn(vectorLayerService, 'applyStyles')
					.withArgs(olVectorLayer, olMap)
					.and.callFake(() => {});
				expect(olVectorLayer.getSource().getFeatures().length).toBe(0);

				mockServer.emit('message', kmlData);

				expect(olVectorLayer.getSource().getFeatures().length).toBe(1);
				expect(processSpy).toHaveBeenCalled();
				expect(sanitizeStyleSpy).toHaveBeenCalled();
				expect(applyStyleSpy).toHaveBeenCalled();
			});

			it('updates clustered vector layer features, after server sends a message', () => {
				setup();
				const id = 'id';
				const olMap = new Map();
				const clusteredRtGeoResource = { ...rtVectorGeoResource, isClustered: () => true };

				const olVectorLayer = instanceUnderTest.createLayer(id, clusteredRtGeoResource, olMap);
				const processSpy = spyOn(instanceUnderTest, '_processMessage').and.callThrough();
				const sanitizeStyleSpy = spyOn(vectorLayerService, 'sanitizeStyles').and.callFake(() => {});
				const applyStyleSpy = spyOn(vectorLayerService, 'applyClusterStyle')
					.withArgs(olVectorLayer)
					.and.callFake(() => {});
				expect(olVectorLayer.getSource().getFeatures().length).toBe(0);

				mockServer.emit('message', kmlData);

				expect(olVectorLayer.getSource().getFeatures().length).toBe(1);
				expect(processSpy).toHaveBeenCalled();
				expect(sanitizeStyleSpy).toHaveBeenCalled();
				expect(applyStyleSpy).toHaveBeenCalled();
			});

			it('does nothing, after server sends a keep-alive message', () => {
				setup();
				const id = 'id';
				const olMap = new Map();

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
				expect(processSpy).toHaveBeenCalledTimes(3);
			});

			describe('when the connection get lost (websocket.onclose)', () => {
				it('cascades available ports', () => {
					setup();
					const id = 'id';
					const olMap = new Map();

					const startWebSocket = spyOn(instanceUnderTest, '_startWebSocket')
						.withArgs(jasmine.any(Object), jasmine.any(VectorLayer), olMap)
						.and.callThrough()
						.withArgs(jasmine.any(Object), jasmine.any(VectorLayer), olMap, 443)
						.and.callThrough();
					instanceUnderTest.createLayer(id, rtVectorGeoResource, olMap);

					mockServer.close({ code: 1006, reason: 'Foo', wasClean: false });
					expect(startWebSocket).toHaveBeenCalledTimes(2);
				});

				/* HINT: to throw an UnavailableGeoResourceError is currently not testable
				it('throws an error', () => {
					setup();
					const vectorLayer = { getSource: () => {} };
					const olMap = new Map();
					const port = 443;

					mockServer.on('connection', (socket) => {
						socket.close({ code: 1006, reason: 'Foo1', wasClean: false });
						socket.close({ code: 1006, reason: 'Foo2', wasClean: false });
					});

					instanceUnderTest._startWebSocket(vectorGeoresource, vectorLayer, olMap, port);
					.
					.
					.
				}); */
			});
		});
	});
});
