import { $injector } from '../../../../src/injection';
import { getNextPort, isNextPortAvailable, RtVectorLayerService } from '../../../../src/modules/olMap/services/RtVectorLayerService';
import { layersReducer } from '../../../../src/store/layers/layers.reducer';
import { TestUtils } from '../../../test-utils';
import { VectorSourceType } from '../../../../src/domain/geoResources';
import { Server as WebsocketMockServer } from 'mock-socket';
describe('RtVectorLayerService', () => {
	const mapService = {
		getSrid: () => {}
	};

	const styleService = {
		addStyle: () => {},
		removeStyle: () => {},
		updateStyle: () => {},
		isStyleRequired: () => {},
		addClusterStyle: () => {},
		sanitizeStyle: () => {}
	};

	beforeEach(() => {
		$injector.registerSingleton('MapService', mapService).registerSingleton('StyleService', styleService);
	});

	afterEach(() => {
		$injector.reset();
	});

	describe('utils', () => {
		describe('isNextPortAvailable', () => {
			it('checks the ports for availability', () => {
				expect(isNextPortAvailable(1, [1])).toBeFalse();
				expect(isNextPortAvailable(1, [1, 2])).toBeTrue();
				expect(isNextPortAvailable(2, [1, 2])).toBeFalse();
				expect(isNextPortAvailable(null, [1, 2])).toBeTrue();
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
			$injector.registerSingleton('MapService', mapService).registerSingleton('StyleService', styleService);
			instanceUnderTest = new RtVectorLayerService();
		};
		describe('createVectorLayer', () => {
			it('returns an ol vector layer for a websocket based RtVectorGeoResource', () => {
				setup();
				const wsUrl = 'ws:// localhost:8080';
				const mockServer = new WebsocketMockServer(wsUrl);

				const id = 'id';
				const geoResourceId = 'geoResourceId';
				const geoResourceLabel = 'geoResourceLabel';
				const olMap = new Map();

				const vectorGeoresource = { id: geoResourceId, label: geoResourceLabel, sourceType: VectorSourceType.KML, url: wsUrl, srid: 4326 };
				const olVectorLayer = instanceUnderTest.createVectorLayer(id, vectorGeoresource, olMap);

				expect(olVectorLayer.get('id')).toBe(id);
				expect(olVectorLayer.get('geoResourceId')).toBe(geoResourceId);
				expect(olVectorLayer.getMinZoom()).toBeNegativeInfinity();
				expect(olVectorLayer.getMaxZoom()).toBePositiveInfinity();

				expect(olVectorLayer.constructor.name).toBe('VectorLayer');
				expect(mockServer.clients()).toHaveSize(1);
			});
		});
	});
});
