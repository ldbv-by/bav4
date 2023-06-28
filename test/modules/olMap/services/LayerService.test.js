import { $injector } from '../../../../src/injection';
import {
	AggregateGeoResource,
	GeoResourceAuthenticationType,
	GeoResourceFuture,
	VectorGeoResource,
	VectorSourceType,
	VTGeoResource,
	WmsGeoResource,
	XyzGeoResource
} from '../../../../src/domain/geoResources';
import { LayerService } from '../../../../src/modules/olMap/services/LayerService';
import { Map } from 'ol';
import VectorLayer from 'ol/layer/Vector';
import { TestUtils } from '../../../test-utils';
import { getBvvBaaImageLoadFunction } from '../../../../src/modules/olMap/utils/baaImageLoadFunction.provider';
import MapLibreLayer from '@geoblocks/ol-maplibre-layer';
import { createXYZ } from 'ol/tilegrid';
import { AdvWmtsTileGrid } from '../../../../src/modules/olMap/ol/tileGrid/AdvWmtsTileGrid';
import supported from 'mapbox-gl-supported';

describe('LayerService', () => {
	const vectorLayerService = {
		createVectorLayer: () => {}
	};
	const georesourceService = {
		byId: () => {}
	};
	const baaCredentialService = {
		get: () => {}
	};

	const setup = (baaImageLoadFunctionProvider) => {
		return new LayerService(baaImageLoadFunctionProvider);
	};

	beforeEach(() => {
		TestUtils.setupStoreAndDi({});
		$injector
			.registerSingleton('VectorLayerService', vectorLayerService)
			.registerSingleton('GeoResourceService', georesourceService)
			.registerSingleton('BaaCredentialService', baaCredentialService);
	});

	describe('constructor', () => {
		it('initializes the service with default providers', () => {
			const instanceUnderTest = new LayerService();
			expect(instanceUnderTest._baaImageLoadFunctionProvider).toEqual(getBvvBaaImageLoadFunction);
		});

		it('initializes the service with custom provider', () => {
			const getBvvBaaImageLoadFunctionCustomProvider = () => {};
			const instanceUnderTest = setup(getBvvBaaImageLoadFunctionCustomProvider);
			expect(instanceUnderTest._baaImageLoadFunctionProvider).toEqual(getBvvBaaImageLoadFunctionCustomProvider);
		});
	});

	describe('toOlLayer', () => {
		describe('GeoResourceFuture', () => {
			it('converts a GeoResourceFuture to a placeholder olLayer', () => {
				const instanceUnderTest = setup();
				const id = 'id';
				const geoResourceId = 'geoResourceId';
				const wmsGeoresource = new GeoResourceFuture(geoResourceId, () => {});

				const placeholderOlLayer = instanceUnderTest.toOlLayer(id, wmsGeoresource);

				expect(placeholderOlLayer.get('id')).toBe(id);
				expect(placeholderOlLayer.get('geoResourceId')).toBe(geoResourceId);
				expect(placeholderOlLayer.get('placeholder')).toBeTrue();
				expect(placeholderOlLayer.getSource()).toBeNull();
				expect(placeholderOlLayer.render()).toBeUndefined();
				expect(placeholderOlLayer.constructor.name).toBe('Layer');
			});
		});

		describe('VectorGeoresource', () => {
			it('calls the VectorLayerService', () => {
				const instanceUnderTest = setup();
				const id = 'id';
				const olMap = new Map();
				const olLayer = new VectorLayer();
				const vectorGeoresource = new VectorGeoResource('geoResourceId', 'label', VectorSourceType.KML);
				const vectorSourceForUrlSpy = spyOn(vectorLayerService, 'createVectorLayer').and.returnValue(olLayer);

				instanceUnderTest.toOlLayer(id, vectorGeoresource, olMap);

				expect(vectorSourceForUrlSpy).toHaveBeenCalledWith(id, vectorGeoresource, olMap);
			});
		});

		describe('WmsGeoresource', () => {
			it('converts a WmsGeoresource to a olLayer', () => {
				const instanceUnderTest = setup();
				const id = 'id';
				const geoResourceId = 'geoResourceId';
				const wmsGeoresource = new WmsGeoResource(geoResourceId, 'label', 'https://some.url', 'layer', 'image/png');

				const wmsOlLayer = instanceUnderTest.toOlLayer(id, wmsGeoresource);

				expect(wmsOlLayer.get('id')).toBe(id);
				expect(wmsOlLayer.get('geoResourceId')).toBe(geoResourceId);
				expect(wmsOlLayer.getMinZoom()).toBeNegativeInfinity();
				expect(wmsOlLayer.getMaxZoom()).toBePositiveInfinity();
				expect(wmsOlLayer.get('onPrerenderFunctionKey')).toBeDefined();
				expect(wmsOlLayer.constructor.name).toBe('ImageLayer');
				const wmsSource = wmsOlLayer.getSource();
				expect(wmsSource.constructor.name).toBe('LimitedImageWMS');
				expect(wmsSource.getUrl()).toBe('https://some.url');
				expect(wmsSource.ratio_).toBe(1);
				expect(wmsSource.getParams().LAYERS).toBe('layer');
				expect(wmsSource.getParams().FORMAT).toBe('image/png');
				expect(wmsSource.getParams().VERSION).toBe('1.1.1');
			});

			it('converts a WmsGeoresource containing optional properties to a olLayer', () => {
				const instanceUnderTest = setup();
				const id = 'id';
				const geoResourceId = 'geoResourceId';
				const wmsGeoresource = new WmsGeoResource(geoResourceId, 'label', 'https://some.url', 'layer', 'image/png')
					.setOpacity(0.5)
					.setMinZoom(5)
					.setMaxZoom(19)
					.setExtraParams({ STYLES: 'some' });

				const wmsOlLayer = instanceUnderTest.toOlLayer(id, wmsGeoresource);

				expect(wmsOlLayer.get('id')).toBe(id);
				expect(wmsOlLayer.get('geoResourceId')).toBe(geoResourceId);
				expect(wmsOlLayer.getOpacity()).toBe(0.5);
				expect(wmsOlLayer.getMinZoom()).toBe(5);
				expect(wmsOlLayer.getMaxZoom()).toBe(19);
				expect(wmsOlLayer.constructor.name).toBe('ImageLayer');
				expect(wmsOlLayer.get('onPrerenderFunctionKey')).toBeDefined();
				const wmsSource = wmsOlLayer.getSource();
				expect(wmsSource.constructor.name).toBe('LimitedImageWMS');
				expect(wmsSource.getUrl()).toBe('https://some.url');
				expect(wmsSource.getParams().LAYERS).toBe('layer');
				expect(wmsSource.getParams().FORMAT).toBe('image/png');
				expect(wmsSource.getParams().VERSION).toBe('1.1.1');
				expect(wmsSource.getParams().STYLES).toBe('some');
			});

			describe('BAA Authentication', () => {
				it('handles authentication type BAA', () => {
					const url = 'https://some.url';
					const credential = { username: 'u', password: 'p' };
					const mockImageLoadFunction = () => {};
					const providerSpy = jasmine.createSpy().withArgs(credential).and.returnValue(mockImageLoadFunction);
					spyOn(baaCredentialService, 'get').withArgs(url).and.returnValue(credential);

					const instanceUnderTest = setup(providerSpy);
					const id = 'id';
					const wmsGeoresource = new WmsGeoResource('geoResourceId', 'label', url, 'layer', 'image/png').setAuthenticationType(
						GeoResourceAuthenticationType.BAA
					);

					const wmsOlLayer = instanceUnderTest.toOlLayer(id, wmsGeoresource);

					expect(providerSpy).toHaveBeenCalledWith(credential);
					expect(wmsOlLayer.getSource().getImageLoadFunction()).toBe(mockImageLoadFunction);
				});

				it('logs an error statement when credential is not available', () => {
					const url = 'https://some.url';
					const credential = null;
					const mockImageLoadFunction = () => {};
					const providerSpy = jasmine.createSpy().withArgs(credential).and.returnValue(mockImageLoadFunction);
					spyOn(baaCredentialService, 'get').withArgs(url).and.returnValue(credential);

					const instanceUnderTest = setup(providerSpy);
					const id = 'id';
					const wmsGeoresource = new WmsGeoResource('geoResourceId', 'label', url, 'layer', 'image/png').setAuthenticationType(
						GeoResourceAuthenticationType.BAA
					);

					expect(providerSpy).not.toHaveBeenCalledWith(credential);
					expect(() => {
						instanceUnderTest.toOlLayer(id, wmsGeoresource);
					}).toThrowError(`No credential available for GeoResource with id '${wmsGeoresource.id}' and url '${wmsGeoresource.url}'`);
				});
			});
		});

		describe('XyzGeoresource', () => {
			it('converts a XyzGeoresource to a olLayer', () => {
				const instanceUnderTest = setup();
				const id = 'id';
				const geoResourceId = 'geoResourceId';
				const xyzGeoresource = new XyzGeoResource(geoResourceId, 'label', 'https://some{1-2}/layer/{z}/{x}/{y}');

				const xyzOlLayer = instanceUnderTest.toOlLayer(id, xyzGeoresource);

				expect(xyzOlLayer.get('id')).toBe(id);
				expect(xyzOlLayer.get('geoResourceId')).toBe(geoResourceId);
				expect(xyzOlLayer.getPreload()).toBe(3);
				expect(xyzOlLayer.getMinZoom()).toBeNegativeInfinity();
				expect(xyzOlLayer.getMaxZoom()).toBePositiveInfinity();
				const xyzSource = xyzOlLayer.getSource();
				expect(xyzOlLayer.constructor.name).toBe('TileLayer');
				expect(xyzSource.constructor.name).toBe('XYZ');
				expect(xyzSource.getUrls()).toEqual(['https://some1/layer/{z}/{x}/{y}', 'https://some2/layer/{z}/{x}/{y}']);
			});

			it('converts a XyzGeoresource to a olLayer containing an array of urls', () => {
				const instanceUnderTest = setup();
				const id = 'id';
				const geoResourceId = 'geoResourceId';
				const xyzGeoresource = new XyzGeoResource(geoResourceId, 'label', ['https://some1/layer/{z}/{x}/{y}', 'https://some2/layer/{z}/{x}/{y}']);

				const xyzOlLayer = instanceUnderTest.toOlLayer(id, xyzGeoresource);

				expect(xyzOlLayer.get('id')).toBe(id);
				expect(xyzOlLayer.get('geoResourceId')).toBe(geoResourceId);
				expect(xyzOlLayer.getPreload()).toBe(3);
				expect(xyzOlLayer.getMinZoom()).toBeNegativeInfinity();
				expect(xyzOlLayer.getMaxZoom()).toBePositiveInfinity();
				const xyzSource = xyzOlLayer.getSource();
				expect(xyzOlLayer.constructor.name).toBe('TileLayer');
				expect(xyzSource.constructor.name).toBe('XYZ');
				expect(xyzSource.getUrls()).toEqual(['https://some1/layer/{z}/{x}/{y}', 'https://some2/layer/{z}/{x}/{y}']);
			});

			it('converts a XyzGeoresource containing optional properties to a olLayer', () => {
				const instanceUnderTest = setup();
				const id = 'id';
				const geoResourceId = 'geoResourceId';
				const xyzGeoresource = new XyzGeoResource(geoResourceId, 'label', 'https://some{1-2}/layer/{z}/{x}/{y}')
					.setOpacity(0.5)
					.setMinZoom(5)
					.setMaxZoom(19);

				const xyzOlLayer = instanceUnderTest.toOlLayer(id, xyzGeoresource);

				expect(xyzOlLayer.get('id')).toBe(id);
				expect(xyzOlLayer.get('geoResourceId')).toBe(geoResourceId);
				expect(xyzOlLayer.getPreload()).toBe(3);
				expect(xyzOlLayer.getOpacity()).toBe(0.5);
				expect(xyzOlLayer.getMinZoom()).toBe(5);
				expect(xyzOlLayer.getMaxZoom()).toBe(19);
				const xyzSource = xyzOlLayer.getSource();
				expect(xyzOlLayer.constructor.name).toBe('TileLayer');
				expect(xyzSource.constructor.name).toBe('XYZ');
				expect(xyzSource.getUrls()).toEqual(['https://some1/layer/{z}/{x}/{y}', 'https://some2/layer/{z}/{x}/{y}']);
			});

			it('sets a XYZ source containing the default TileGrid', () => {
				const instanceUnderTest = setup();
				const id = 'id';
				const xyzGeoresource = new XyzGeoResource('geoResourceId', 'Label', 'https://some{1-2}/layer/{z}/{x}/{y}');

				const xyzOlLayer = instanceUnderTest.toOlLayer(id, xyzGeoresource);

				const xyzSource = xyzOlLayer.getSource();
				expect(xyzSource.getTileGrid()).toEqual(createXYZ());
				expect(xyzSource.getProjection().getCode()).toBe('EPSG:3857');
			});

			it('sets a XYZ source containing the ADV WMTS TileGrid', () => {
				const instanceUnderTest = setup();
				const id = 'id';
				const xyzGeoresource = new XyzGeoResource('geoResourceId', 'Label', 'https://some{1-2}/layer/{z}/{x}/{y}').setTileGridId('adv_wmts');

				const xyzOlLayer = instanceUnderTest.toOlLayer(id, xyzGeoresource);

				const xyzSource = xyzOlLayer.getSource();
				expect(xyzSource.getTileGrid()).toEqual(new AdvWmtsTileGrid());
				expect(xyzSource.getProjection().getCode()).toBe('EPSG:25832');
			});
		});

		describe('VTGeoresource', () => {
			it('converts a VTGeoresource to a olLayer', () => {
				// FF currently throws a WebGL error when running in headless mode, so we first check if it does make sense to perform the test, otherwise, we skip them
				// See https://bugzilla.mozilla.org/show_bug.cgi?id=1375585#c27 for more information
				if (supported()) {
					const instanceUnderTest = setup();
					const id = 'id';
					const geoResourceId = 'geoResourceId';
					const vtGeoresource = new VTGeoResource(geoResourceId, 'label', null);

					const vtOlLayer = instanceUnderTest.toOlLayer(id, vtGeoresource);

					expect(vtOlLayer.get('id')).toBe(id);
					expect(vtOlLayer.get('geoResourceId')).toBe(geoResourceId);
					expect(vtOlLayer.getMinZoom()).toBeNegativeInfinity();
					expect(vtOlLayer.getMaxZoom()).toBePositiveInfinity();
					// Todo: currently we have no simple possibility to check the correctness of the styleUrl, so we just check for the expected ol layer class
					expect(vtOlLayer instanceof MapLibreLayer).toBeTrue();
				}
			});

			it('converts a VTGeoresource containing optional properties to a olLayer', () => {
				// FF currently throws a WebGL error when running in headless mode, so we first check if it does make sense to perform the test, otherwise, we skip them
				// See https://bugzilla.mozilla.org/show_bug.cgi?id=1375585#c27 for more information
				if (supported()) {
					const instanceUnderTest = setup();
					const id = 'id';
					const geoResourceId = 'geoResourceId';
					const vtGeoresource = new VTGeoResource(geoResourceId, 'label', null).setOpacity(0.5).setMinZoom(5).setMaxZoom(19);

					const vtOlLayer = instanceUnderTest.toOlLayer(id, vtGeoresource);
					expect(vtOlLayer.get('id')).toBe(id);
					expect(vtOlLayer.get('geoResourceId')).toBe(geoResourceId);
					expect(vtOlLayer.getOpacity()).toBe(0.5);
					expect(vtOlLayer.getMinZoom()).toBe(5);
					expect(vtOlLayer.getMaxZoom()).toBe(19);
					// Todo: currently we have no simple possibility to check the correctness of the styleUrl, so we just check for the expected ol layer class
					expect(vtOlLayer instanceof MapLibreLayer).toBeTrue();
				}
			});
		});

		it('converts a AggregateGeoresource to a olLayer(Group)', () => {
			const instanceUnderTest = setup();
			const id = 'id';
			const xyzGeoresource = new XyzGeoResource('geoResourceId1', 'label', 'https://some{1-2}/layer/{z}/{x}/{y}');
			const wmsGeoresource = new WmsGeoResource('geoResourceId2', 'label', 'https://some.url', 'layer', 'image/png');
			spyOn(georesourceService, 'byId').and.callFake((id) => {
				switch (id) {
					case xyzGeoresource.id:
						return xyzGeoresource;
					case wmsGeoresource.id:
						return wmsGeoresource;
				}
			});
			const aggreggateGeoResource = new AggregateGeoResource('geoResourceId0', 'label', [xyzGeoresource.id, xyzGeoresource.id]);

			const olLayerGroup = instanceUnderTest.toOlLayer(id, aggreggateGeoResource);

			expect(olLayerGroup.get('id')).toBe(id);
			expect(olLayerGroup.getMinZoom()).toBeNegativeInfinity();
			expect(olLayerGroup.getMaxZoom()).toBePositiveInfinity();
			expect(olLayerGroup.constructor.name).toBe('LayerGroup');
			const layers = olLayerGroup.getLayers();
			expect(layers.item(0).get('id')).toBe(xyzGeoresource.id);
			expect(layers.item(1).get('id')).toBe(xyzGeoresource.id);
		});

		it('converts a AggregateGeoresource containing optional properties to a olLayer(Group)', () => {
			const instanceUnderTest = setup();
			const id = 'id';
			const xyzGeoresource = new XyzGeoResource('geoResourceId1', 'label', 'https://some{1-2}/layer/{z}/{x}/{y}');
			const wmsGeoresource = new WmsGeoResource('geoResourceId2', 'label', 'https://some.url', 'layer', 'image/png');
			spyOn(georesourceService, 'byId').and.callFake((id) => {
				switch (id) {
					case xyzGeoresource.id:
						return xyzGeoresource;
					case wmsGeoresource.id:
						return wmsGeoresource;
				}
			});
			const aggreggateGeoResource = new AggregateGeoResource('geoResourceId0', 'label', [xyzGeoresource.id, xyzGeoresource.id])
				.setOpacity(0.5)
				.setMinZoom(5)
				.setMaxZoom(19);

			const olLayerGroup = instanceUnderTest.toOlLayer(id, aggreggateGeoResource);

			expect(olLayerGroup.get('id')).toBe(id);
			expect(olLayerGroup.getOpacity()).toBe(0.5);
			expect(olLayerGroup.getMinZoom()).toBe(5);
			expect(olLayerGroup.getMaxZoom()).toBe(19);
			expect(olLayerGroup.constructor.name).toBe('LayerGroup');
			const layers = olLayerGroup.getLayers();
			expect(layers.item(0).get('id')).toBe(xyzGeoresource.id);
			expect(layers.item(1).get('id')).toBe(xyzGeoresource.id);
		});

		it('throws an error when georesource type is not supported', () => {
			const instanceUnderTest = setup();
			const id = 'id';
			expect(() => {
				instanceUnderTest.toOlLayer(id, {
					getType() {
						return 'Unknown';
					}
				});
			}).toThrowError(/Unknown currently not supported/);
		});
	});
});
