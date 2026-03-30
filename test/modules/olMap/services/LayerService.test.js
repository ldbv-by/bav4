import { $injector } from '@src/injection';
import {
	AggregateGeoResource,
	GeoResourceAuthenticationType,
	GeoResourceFuture,
	OafGeoResource,
	RtVectorGeoResource,
	VectorGeoResource,
	VectorSourceType,
	VTGeoResource,
	WmsGeoResource,
	XyzGeoResource
} from '@src/domain/geoResources';
import { LayerService } from '@src/modules/olMap/services/LayerService';
import { Map } from 'ol';
import VectorLayer from 'ol/layer/Vector';
import { TestUtils } from '@test/test-utils';
import { getBvvBaaImageLoadFunction, getBvvTileLoadFunction } from '@src/modules/olMap/utils/olLoadFunction.provider';
// eslint-disable-next-line import/no-unresolved
import { MapLibreLayer } from '@geoblocks/ol-maplibre-layer';
import { createXYZ } from 'ol/tilegrid';
import { AdvWmtsTileGrid } from '@src/modules/olMap/ol/tileGrid/AdvWmtsTileGrid';
import supported from 'mapbox-gl-supported';
import { UnavailableGeoResourceError } from '@src/domain/errors';
import TileLayer from 'ol/layer/Tile';
import { BvvGk4WmtsTileGrid } from '@src/modules/olMap/ol/tileGrid/BvvGk4WmtsTileGrid';
import { Eu25832WmtsTileGrid } from '@src/modules/olMap/ol/tileGrid/Eu25832WmtsTileGrid';
import ImageLayer from 'ol/layer/Image';
import { ImageWMS, Vector } from 'ol/source';
import { DEFAULT_MIN_LAYER_UPDATE_INTERVAL_SECONDS } from '@src/domain/layer';

describe('LayerService', () => {
	const vectorLayerService = {
		createLayer: () => {}
	};
	const rtVectorLayerService = {
		createLayer: () => {}
	};
	const geoResourceService = {
		byId: () => {}
	};
	const baaCredentialService = {
		get: () => {}
	};

	const setup = (imageLoadFunctionProvider, tileLoadFunctionProvider) => {
		return new LayerService(imageLoadFunctionProvider, tileLoadFunctionProvider);
	};

	beforeEach(() => {
		TestUtils.setupStoreAndDi({});
		$injector
			.registerSingleton('VectorLayerService', vectorLayerService)
			.registerSingleton('RtVectorLayerService', rtVectorLayerService)
			.registerSingleton('GeoResourceService', geoResourceService)
			.registerSingleton('BaaCredentialService', baaCredentialService);
	});

	describe('constructor', () => {
		it('initializes the service with default providers', () => {
			const instanceUnderTest = new LayerService();
			expect(instanceUnderTest._imageLoadFunctionProvider).toEqual(getBvvBaaImageLoadFunction);
			expect(instanceUnderTest._tileLoadFunctionProvider).toEqual(getBvvTileLoadFunction);
		});

		it('initializes the service with custom provider', () => {
			const getImageLoadFunctionCustomProvider = () => {};
			const getTileLoadFunctionCustomProvider = () => {};
			const instanceUnderTest = setup(getImageLoadFunctionCustomProvider, getTileLoadFunctionCustomProvider);
			expect(instanceUnderTest._imageLoadFunctionProvider).toEqual(getImageLoadFunctionCustomProvider);
			expect(instanceUnderTest._tileLoadFunctionProvider).toEqual(getTileLoadFunctionCustomProvider);
		});
	});

	describe('toOlLayer', () => {
		describe('GeoResource requires a BAA Authentication', () => {
			it('logs an error statement when credential is not available', () => {
				const url = 'https://some.url';
				const credential = null;
				const mockImageLoadFunction = () => {};
				const providerSpy = vi.fn().mockReturnValue(mockImageLoadFunction);
				const baaCredentialServiceSpy = vi.spyOn(baaCredentialService, 'get').mockReturnValue(credential);
				const instanceUnderTest = setup(providerSpy);
				const id = 'id';
				const geoResourceId = 'geoResourceId';
				const wmsGeoResource = new WmsGeoResource(geoResourceId, 'label', url, 'layer', 'image/png').setAuthenticationType(
					GeoResourceAuthenticationType.BAA
				);

				expect(providerSpy).not.toHaveBeenCalled();
				expect(() => {
					instanceUnderTest.toOlLayer(id, wmsGeoResource);
				}).toThrow(
					new UnavailableGeoResourceError(
						`No credential available for GeoResource with id '${wmsGeoResource.id}' and url '${wmsGeoResource.url}'`,
						geoResourceId
					)
				);
				expect(baaCredentialServiceSpy).toHaveBeenCalledWith(url);
			});
		});

		describe('GeoResourceFuture', () => {
			it('converts a GeoResourceFuture to a placeholder olLayer', () => {
				const instanceUnderTest = setup();
				const id = 'id';
				const geoResourceId = 'geoResourceId';
				const wmsGeoResource = new GeoResourceFuture(geoResourceId, () => {});

				const placeholderOlLayer = instanceUnderTest.toOlLayer(id, wmsGeoResource);

				expect(placeholderOlLayer.get('id')).toBe(id);
				expect(placeholderOlLayer.get('geoResourceId')).toBe(geoResourceId);
				expect(placeholderOlLayer.get('placeholder')).toBe(true);
				expect(placeholderOlLayer.getSource()).toBeNull();
				expect(placeholderOlLayer.render()).toBeUndefined();
				expect(placeholderOlLayer.constructor.name).toBe('Layer');
			});
		});

		describe('VectorGeoResource', () => {
			it('calls the VectorLayerService', () => {
				const instanceUnderTest = setup();
				const id = 'id';
				const olMap = new Map();
				const olLayer = new VectorLayer();
				const vectorGeoResource = new VectorGeoResource('geoResourceId', 'label', VectorSourceType.KML);
				const vectorLayerServiceSpy = vi.spyOn(vectorLayerService, 'createLayer').mockReturnValue(olLayer);

				instanceUnderTest.toOlLayer(id, vectorGeoResource, olMap);

				expect(vectorLayerServiceSpy).toHaveBeenCalledWith(id, vectorGeoResource, olMap);
			});
		});

		describe('OafGeoResource', () => {
			it('calls the VectorLayerService and "_registerUpdateIntervalHandler"', () => {
				const instanceUnderTest = setup();
				const id = 'id';
				const olMap = new Map();
				const olLayer = new VectorLayer();
				const oafGeoResource = new OafGeoResource('geoResourceId', 'label', 'url', 'collectionId');
				const vectorLayerServiceSpy = vi.spyOn(vectorLayerService, 'createLayer').mockReturnValue(olLayer);
				const registerUpdateIntervalHandlerSpy = vi.spyOn(instanceUnderTest, '_registerUpdateIntervalHandler').mockReturnValue(olLayer);

				instanceUnderTest.toOlLayer(id, oafGeoResource, olMap);

				expect(vectorLayerServiceSpy).toHaveBeenCalledWith(id, oafGeoResource, olMap);
				expect(registerUpdateIntervalHandlerSpy).toHaveBeenCalledWith(olLayer, oafGeoResource, olMap);
			});
		});

		describe('RtVectorGeoResource', () => {
			it('calls the RtVectorLayerService', () => {
				const instanceUnderTest = setup();
				const id = 'id';
				const olMap = new Map();
				const olLayer = new VectorLayer();
				const rtVectorGeoResource = new RtVectorGeoResource('geoResourceId', 'label', 'url', VectorSourceType.KML);
				const rtVectorLayerServiceSpy = vi.spyOn(rtVectorLayerService, 'createLayer').mockReturnValue(olLayer);

				instanceUnderTest.toOlLayer(id, rtVectorGeoResource, olMap);

				expect(rtVectorLayerServiceSpy).toHaveBeenCalledWith(id, rtVectorGeoResource, olMap);
			});
		});

		describe('WmsGeoResource', () => {
			it('converts a WmsGeoResource to a olLayer', () => {
				const mockImageLoadFunction = () => {};
				const providerSpy = vi.fn().mockReturnValue(mockImageLoadFunction);
				const instanceUnderTest = setup(providerSpy);
				const id = 'id';
				const geoResourceId = 'geoResourceId';
				const wmsGeoResource = new WmsGeoResource(geoResourceId, 'label', 'https://some.url', 'layer', 'image/png');

				const wmsOlLayer = instanceUnderTest.toOlLayer(id, wmsGeoResource);

				expect(wmsOlLayer.get('id')).toBe(id);
				expect(wmsOlLayer.get('geoResourceId')).toBe(geoResourceId);
				expect(wmsOlLayer.getMinZoom()).toBe(-Infinity);
				expect(wmsOlLayer.getMaxZoom()).toBe(Infinity);
				expect(wmsOlLayer.constructor.name).toBe('ImageLayer');
				const wmsSource = wmsOlLayer.getSource();
				expect(wmsSource.constructor.name).toBe('ImageWMS');
				expect(wmsSource.getUrl()).toBe('https://some.url');
				expect(wmsSource.ratio_).toBe(1);
				expect(wmsSource.getParams().LAYERS).toBe('layer');
				expect(wmsSource.getParams().FORMAT).toBe('image/png');
				expect(wmsSource.getParams().VERSION).toBe('1.1.1');
				expect(providerSpy).toHaveBeenCalledWith(geoResourceId, null, null);
				expect(wmsOlLayer.getSource().getImageLoadFunction()).toBe(mockImageLoadFunction);
			});

			it('converts a WmsGeoResource containing optional properties to a olLayer', () => {
				const mockImageLoadFunction = () => {};
				const providerSpy = vi.fn().mockReturnValue(mockImageLoadFunction);
				const instanceUnderTest = setup(providerSpy);
				const id = 'id';
				const geoResourceId = 'geoResourceId';
				const wmsGeoResource = new WmsGeoResource(geoResourceId, 'label', 'https://some.url', 'layer', 'image/png')
					.setOpacity(0.5)
					.setMinZoom(5)
					.setMaxZoom(19)
					.setExtraParams({ STYLES: 'some' });

				const wmsOlLayer = instanceUnderTest.toOlLayer(id, wmsGeoResource);

				expect(wmsOlLayer.get('id')).toBe(id);
				expect(wmsOlLayer.get('geoResourceId')).toBe(geoResourceId);
				expect(wmsOlLayer.getOpacity()).toBe(0.5);
				expect(wmsOlLayer.getMinZoom()).toBe(5);
				expect(wmsOlLayer.getMaxZoom()).toBe(19);
				expect(wmsOlLayer.constructor.name).toBe('ImageLayer');
				const wmsSource = wmsOlLayer.getSource();
				expect(wmsSource.constructor.name).toBe('ImageWMS');
				expect(wmsSource.getUrl()).toBe('https://some.url');
				expect(wmsSource.getParams().LAYERS).toBe('layer');
				expect(wmsSource.getParams().FORMAT).toBe('image/png');
				expect(wmsSource.getParams().VERSION).toBe('1.1.1');
				expect(wmsSource.getParams().STYLES).toBe('some');
				expect(providerSpy).toHaveBeenCalledWith(geoResourceId, null, null);
				expect(wmsOlLayer.getSource().getImageLoadFunction()).toBe(mockImageLoadFunction);
			});

			it('calls "_registerUpdateIntervalHandler"', () => {
				const mockImageLoadFunction = () => {};
				const providerSpy = vi.fn().mockReturnValue(mockImageLoadFunction);
				const instanceUnderTest = setup(providerSpy);
				const olMap = new Map();
				const id = 'id';
				const geoResourceId = 'geoResourceId';
				const wmsGeoResource = new WmsGeoResource(geoResourceId, 'label', 'https://some.url', 'layer', 'image/png');
				const registerUpdateIntervalHandlerSpy = vi
					.spyOn(instanceUnderTest, '_registerUpdateIntervalHandler')
					.mockImplementation((olLayer) => olLayer);

				instanceUnderTest.toOlLayer(id, wmsGeoResource, olMap);

				expect(registerUpdateIntervalHandlerSpy).toHaveBeenCalledWith(expect.any(ImageLayer), wmsGeoResource, olMap);
			});

			describe('BAA Authentication', () => {
				it('handles authentication type BAA', () => {
					const url = 'https://some.url';
					const credential = { username: 'u', password: 'p' };
					const mockImageLoadFunction = () => {};
					const providerSpy = vi.fn().mockReturnValue(mockImageLoadFunction);
					const baaCredentialServiceSpy = vi.spyOn(baaCredentialService, 'get').mockReturnValue(credential);
					const instanceUnderTest = setup(providerSpy);
					const id = 'id';
					const geoResourceId = 'geoResourceId';
					const wmsGeoResource = new WmsGeoResource(geoResourceId, 'label', url, 'layer', 'image/png').setAuthenticationType(
						GeoResourceAuthenticationType.BAA
					);

					const wmsOlLayer = instanceUnderTest.toOlLayer(id, wmsGeoResource);

					expect(providerSpy).toHaveBeenCalledWith(geoResourceId, credential, null);
					expect(wmsOlLayer.getSource().getImageLoadFunction()).toBe(mockImageLoadFunction);
					expect(baaCredentialServiceSpy).toHaveBeenCalledWith(url);
				});
			});
		});

		describe('XyzGeoResource', () => {
			it('converts a XyzGeoResource to a olLayer', () => {
				const mockImageLoadFunction = () => {};
				const providerSpy = vi.fn().mockReturnValue(mockImageLoadFunction);
				const instanceUnderTest = setup(null, providerSpy);
				const id = 'id';
				const geoResourceId = 'geoResourceId';
				const xyzGeoResource = new XyzGeoResource(geoResourceId, 'label', 'https://some{1-2}/layer/{z}/{x}/{y}');

				const xyzOlLayer = instanceUnderTest.toOlLayer(id, xyzGeoResource);

				expect(xyzOlLayer.get('id')).toBe(id);
				expect(xyzOlLayer.get('geoResourceId')).toBe(geoResourceId);
				expect(xyzOlLayer.getPreload()).toBe(1);
				expect(xyzOlLayer.getMinZoom()).toBe(-Infinity);
				expect(xyzOlLayer.getMaxZoom()).toBe(Infinity);
				const xyzSource = xyzOlLayer.getSource();
				expect(xyzOlLayer.constructor.name).toBe('TileLayer');
				expect(xyzSource.constructor.name).toBe('RefreshableXYZ');
				expect(xyzSource.getUrls()).toEqual(['https://some1/layer/{z}/{x}/{y}', 'https://some2/layer/{z}/{x}/{y}']);
				expect(xyzSource.getTileLoadFunction()).toBe(mockImageLoadFunction);
				expect(providerSpy).toHaveBeenCalledWith(geoResourceId, expect.any(TileLayer));
			});

			it('converts a XyzGeoResource to a olLayer containing an array of urls', () => {
				const mockImageLoadFunction = () => {};
				const providerSpy = vi.fn().mockReturnValue(mockImageLoadFunction);
				const instanceUnderTest = setup(null, providerSpy);
				const id = 'id';
				const geoResourceId = 'geoResourceId';
				const xyzGeoResource = new XyzGeoResource(geoResourceId, 'label', ['https://some1/layer/{z}/{x}/{y}', 'https://some2/layer/{z}/{x}/{y}']);

				const xyzOlLayer = instanceUnderTest.toOlLayer(id, xyzGeoResource);

				expect(xyzOlLayer.get('id')).toBe(id);
				expect(xyzOlLayer.get('geoResourceId')).toBe(geoResourceId);
				expect(xyzOlLayer.getPreload()).toBe(1);
				expect(xyzOlLayer.getMinZoom()).toBe(-Infinity);
				expect(xyzOlLayer.getMaxZoom()).toBe(Infinity);
				const xyzSource = xyzOlLayer.getSource();
				expect(xyzOlLayer.constructor.name).toBe('TileLayer');
				expect(xyzSource.constructor.name).toBe('RefreshableXYZ');
				expect(xyzSource.getUrls()).toEqual(['https://some1/layer/{z}/{x}/{y}', 'https://some2/layer/{z}/{x}/{y}']);
				expect(xyzSource.getTileLoadFunction()).toBe(mockImageLoadFunction);
				expect(providerSpy).toHaveBeenCalledWith(geoResourceId, expect.any(TileLayer));
			});

			it('converts a XyzGeoResource containing optional properties to a olLayer', () => {
				const mockImageLoadFunction = () => {};
				const providerSpy = vi.fn().mockReturnValue(mockImageLoadFunction);
				const instanceUnderTest = setup(null, providerSpy);
				const id = 'id';
				const geoResourceId = 'geoResourceId';
				const xyzGeoResource = new XyzGeoResource(geoResourceId, 'label', 'https://some{1-2}/layer/{z}/{x}/{y}')
					.setOpacity(0.5)
					.setMinZoom(5)
					.setMaxZoom(19);

				const xyzOlLayer = instanceUnderTest.toOlLayer(id, xyzGeoResource);

				expect(xyzOlLayer.get('id')).toBe(id);
				expect(xyzOlLayer.get('geoResourceId')).toBe(geoResourceId);
				expect(xyzOlLayer.getPreload()).toBe(1);
				expect(xyzOlLayer.getOpacity()).toBe(0.5);
				expect(xyzOlLayer.getMinZoom()).toBe(5);
				expect(xyzOlLayer.getMaxZoom()).toBe(19);
				const xyzSource = xyzOlLayer.getSource();
				expect(xyzOlLayer.constructor.name).toBe('TileLayer');
				expect(xyzSource.constructor.name).toBe('RefreshableXYZ');
				expect(xyzSource.getUrls()).toEqual(['https://some1/layer/{z}/{x}/{y}', 'https://some2/layer/{z}/{x}/{y}']);
				expect(xyzSource.getTileLoadFunction()).toBe(mockImageLoadFunction);
				expect(providerSpy).toHaveBeenCalledWith(geoResourceId, expect.any(TileLayer));
			});

			it('sets a XYZ source containing the default TileGrid', () => {
				const mockImageLoadFunction = () => {};
				const providerSpy = vi.fn().mockReturnValue(mockImageLoadFunction);
				const instanceUnderTest = setup(null, providerSpy);
				const id = 'id';
				const xyzGeoResource = new XyzGeoResource('geoResourceId', 'Label', 'https://some{1-2}/layer/{z}/{x}/{y}');

				const xyzOlLayer = instanceUnderTest.toOlLayer(id, xyzGeoResource);

				const xyzSource = xyzOlLayer.getSource();
				expect(xyzSource.getTileGrid()).toEqual(createXYZ());
				expect(xyzSource.getProjection().getCode()).toBe('EPSG:3857');
			});

			it('sets a XYZ source containing the ADV UTM TileGrid', () => {
				const mockImageLoadFunction = () => {};
				const providerSpy = vi.fn().mockReturnValue(mockImageLoadFunction);
				const instanceUnderTest = setup(null, providerSpy);
				const id = 'id';
				const xyzGeoResource = new XyzGeoResource('geoResourceId', 'Label', 'https://some{1-2}/layer/{z}/{x}/{y}').setTileGridId('adv_utm');

				const xyzOlLayer = instanceUnderTest.toOlLayer(id, xyzGeoResource);

				const xyzSource = xyzOlLayer.getSource();
				expect(xyzSource.getTileGrid()).toEqual(new AdvWmtsTileGrid());
				expect(xyzSource.getProjection().getCode()).toBe('EPSG:25832');
			});

			it('sets a XYZ source containing the EU25832 TileGrid', () => {
				const mockImageLoadFunction = () => {};
				const providerSpy = vi.fn().mockReturnValue(mockImageLoadFunction);
				const instanceUnderTest = setup(null, providerSpy);
				const id = 'id';
				const xyzGeoResource = new XyzGeoResource('geoResourceId', 'Label', 'https://some{1-2}/layer/{z}/{x}/{y}').setTileGridId('eu25832');

				const xyzOlLayer = instanceUnderTest.toOlLayer(id, xyzGeoResource);

				const xyzSource = xyzOlLayer.getSource();
				expect(xyzSource.getTileGrid()).toEqual(new Eu25832WmtsTileGrid());
				expect(xyzSource.getProjection().getCode()).toBe('EPSG:25832');
			});

			it('sets a XYZ source containing the BVV GK4 TileGrid', () => {
				const mockImageLoadFunction = () => {};
				const providerSpy = vi.fn().mockReturnValue(mockImageLoadFunction);
				const instanceUnderTest = setup(null, providerSpy);
				const id = 'id';
				const xyzGeoResource = new XyzGeoResource('geoResourceId', 'Label', 'https://some{1-2}/layer/{z}/{x}/{y}').setTileGridId('bvv_gk4');

				const xyzOlLayer = instanceUnderTest.toOlLayer(id, xyzGeoResource);

				const xyzSource = xyzOlLayer.getSource();
				expect(xyzSource.getTileGrid()).toEqual(new BvvGk4WmtsTileGrid());
				expect(xyzSource.getProjection().getCode()).toBe('EPSG:31468');
			});

			it('registers a listener that calls `smoothRefresh` of the underlying source when the timestamp property changes', () => {
				const mockImageLoadFunction = () => {};
				const providerSpy = vi.fn().mockReturnValue(mockImageLoadFunction);
				const instanceUnderTest = setup(null, providerSpy);
				const id = 'id';
				const xyzGeoResource = new XyzGeoResource('geoResourceId', 'Label', 'https://some{1-2}/layer/{z}/{x}/{y}');
				const xyzOlLayer = instanceUnderTest.toOlLayer(id, xyzGeoResource);
				const xyzSource = xyzOlLayer.getSource();
				const xyzSourceSpy = vi.spyOn(xyzSource, 'smoothRefresh').mockImplementation(() => {});

				xyzOlLayer.set('foo', 'bar');

				expect(xyzSourceSpy).not.toHaveBeenCalled();

				xyzOlLayer.set('timestamp', '2000');
				xyzOlLayer.set('timestamp', '2000');

				expect(xyzSourceSpy).toHaveBeenCalledExactlyOnceWith('2000');
			});
		});

		describe('VTGeoResource', () => {
			it('converts a VTGeoResource to a olLayer', () => {
				// FF currently throws a WebGL error when running in headless mode, so we first check if it does make sense to perform the test, otherwise, we skip them
				// See https://bugzilla.mozilla.org/show_bug.cgi?id=1375585#c27 for more information
				if (supported()) {
					const instanceUnderTest = setup();
					const id = 'id';
					const geoResourceId = 'geoResourceId';
					const vtGeoResource = new VTGeoResource(geoResourceId, 'label', null);

					const vtOlLayer = instanceUnderTest.toOlLayer(id, vtGeoResource);

					expect(vtOlLayer.get('id')).toBe(id);
					expect(vtOlLayer.get('geoResourceId')).toBe(geoResourceId);
					expect(vtOlLayer.getMinZoom()).toBe(-Infinity);
					expect(vtOlLayer.getMaxZoom()).toBe(Infinity);
					// Todo: currently we have no simple possibility to check the correctness of the styleUrl, so we just check for the expected ol layer class
					expect(vtOlLayer instanceof MapLibreLayer).toBe(true);
				}
			});

			it('converts a VTGeoResource containing optional properties to a olLayer', () => {
				// FF currently throws a WebGL error when running in headless mode, so we first check if it does make sense to perform the test, otherwise, we skip them
				// See https://bugzilla.mozilla.org/show_bug.cgi?id=1375585#c27 for more information
				if (supported()) {
					const instanceUnderTest = setup();
					const id = 'id';
					const geoResourceId = 'geoResourceId';
					const vtGeoResource = new VTGeoResource(geoResourceId, 'label', null).setOpacity(0.5).setMinZoom(5).setMaxZoom(19);

					const vtOlLayer = instanceUnderTest.toOlLayer(id, vtGeoResource);
					expect(vtOlLayer.get('id')).toBe(id);
					expect(vtOlLayer.get('geoResourceId')).toBe(geoResourceId);
					expect(vtOlLayer.getOpacity()).toBe(0.5);
					expect(vtOlLayer.getMinZoom()).toBe(5);
					expect(vtOlLayer.getMaxZoom()).toBe(19);
					// Todo: currently we have no simple possibility to check the correctness of the styleUrl, so we just check for the expected ol layer class
					expect(vtOlLayer instanceof MapLibreLayer).toBe(true);
				}
			});
		});

		it('converts a AggregateGeoResource to a olLayer(Group)', () => {
			const mockImageLoadFunction = () => {};
			const providerSpy = vi.fn().mockReturnValue(mockImageLoadFunction);
			const instanceUnderTest = setup(null, providerSpy);
			const id = 'id';
			const xyzGeoResource0 = new XyzGeoResource('geoResourceId1', 'label', 'https://some{1-2}/layer/{z}/{x}/{y}');
			const xyzGeoResource1 = new XyzGeoResource('geoResourceId1', 'label', 'https://some{1-2}/layer/{z}/{x}/{y}');
			vi.spyOn(geoResourceService, 'byId').mockImplementation((id) => {
				switch (id) {
					case xyzGeoResource0.id:
						return xyzGeoResource0;
					case xyzGeoResource1.id:
						return xyzGeoResource1;
				}
			});
			const aggregateGeoResource = new AggregateGeoResource('geoResourceId0', 'label', [xyzGeoResource0.id, xyzGeoResource1.id]);

			const olLayerGroup = instanceUnderTest.toOlLayer(id, aggregateGeoResource);

			expect(olLayerGroup.get('id')).toBe(id);
			expect(olLayerGroup.getMinZoom()).toBe(-Infinity);
			expect(olLayerGroup.getMaxZoom()).toBe(Infinity);
			expect(olLayerGroup.constructor.name).toBe('LayerGroup');
			const layers = olLayerGroup.getLayers();
			expect(layers.item(0).get('id')).toBe(xyzGeoResource0.id);
			expect(layers.item(1).get('id')).toBe(xyzGeoResource1.id);
		});

		it('converts a AggregateGeoResource containing optional properties to a olLayer(Group)', () => {
			const mockImageLoadFunction = () => {};
			const providerSpy = vi.fn().mockReturnValue(mockImageLoadFunction);
			const instanceUnderTest = setup(null, providerSpy);
			const id = 'id';
			const xyzGeoResource0 = new XyzGeoResource('geoResourceId0', 'label', 'https://some{1-2}/layer/{z}/{x}/{y}');
			const xyzGeoResource1 = new XyzGeoResource('geoResourceId1', 'label', 'https://some{1-2}/layer/{z}/{x}/{y}');
			vi.spyOn(geoResourceService, 'byId').mockImplementation((id) => {
				switch (id) {
					case xyzGeoResource0.id:
						return xyzGeoResource0;
					case xyzGeoResource1.id:
						return xyzGeoResource1;
				}
			});
			const aggregateGeoResource = new AggregateGeoResource('geoResourceId0', 'label', [xyzGeoResource0.id, xyzGeoResource1.id])
				.setOpacity(0.5)
				.setMinZoom(5)
				.setMaxZoom(19);

			const olLayerGroup = instanceUnderTest.toOlLayer(id, aggregateGeoResource);

			expect(olLayerGroup.get('id')).toBe(id);
			expect(olLayerGroup.getOpacity()).toBe(0.5);
			expect(olLayerGroup.getMinZoom()).toBe(5);
			expect(olLayerGroup.getMaxZoom()).toBe(19);
			expect(olLayerGroup.constructor.name).toBe('LayerGroup');
			const layers = olLayerGroup.getLayers();
			expect(layers.item(0).get('id')).toBe(xyzGeoResource0.id);
			expect(layers.item(1).get('id')).toBe(xyzGeoResource1.id);
		});

		it('registers an opacity change listener in order to synchronize the opacity of a MapLibreLayer', () => {
			// FF currently throws a WebGL error when running in headless mode, so we first check if it does make sense to perform the test, otherwise, we skip them
			// See https://bugzilla.mozilla.org/show_bug.cgi?id=1375585#c27 for more information
			if (supported()) {
				const mockImageLoadFunction = () => {};
				const providerSpy = vi.fn().mockReturnValue(mockImageLoadFunction);
				const instanceUnderTest = setup(null, providerSpy);
				const id = 'id';
				const xyzGeoResource = new XyzGeoResource('geoResourceId1', 'label', 'https://some{1-2}/layer/{z}/{x}/{y}');
				const vtGeoResource = new VTGeoResource('geoResourceId2', 'label', null);
				vi.spyOn(geoResourceService, 'byId').mockImplementation((id) => {
					switch (id) {
						case xyzGeoResource.id:
							return xyzGeoResource;
						case vtGeoResource.id:
							return vtGeoResource;
					}
				});
				const aggregateGeoResource = new AggregateGeoResource('geoResourceId0', 'label', [xyzGeoResource.id, vtGeoResource.id]);
				const olLayerGroup = instanceUnderTest.toOlLayer(id, aggregateGeoResource);
				const layers = olLayerGroup.getLayers();
				const otherOlLayerSetOpacitySpy = vi.spyOn(layers.item(0), 'setOpacity');
				const mapLibreLayerSetOpacitySpy = vi.spyOn(layers.item(1), 'setOpacity');

				olLayerGroup.setOpacity(0.66);

				expect(mapLibreLayerSetOpacitySpy).toHaveBeenCalledExactlyOnceWith(0.66);
				expect(otherOlLayerSetOpacitySpy).not.toHaveBeenCalled();
			}
		});

		it('throws an error when GeoResource type is not supported', () => {
			const instanceUnderTest = setup();
			const id = 'id';
			expect(() => {
				instanceUnderTest.toOlLayer(id, {
					getType() {
						return Symbol.for('Unknown');
					}
				});
			}).toThrowError('GeoResource type "Unknown" currently not supported');
		});
	});

	describe('_registerUpdateIntervalHandler', () => {
		beforeEach(function () {
			vi.useFakeTimers();
		});

		afterEach(function () {
			vi.useRealTimers();
		});

		it('does nothing when the `updateInterval` is beyond the threshold', async () => {
			const instanceUnderTest = setup();
			const updateIntervalInSeconds = 1;
			const layerId = 'layerId';
			const wmsGeoResource = new WmsGeoResource('geoResourceId', 'label', 'https://some.url', 'layer', 'image/png').setUpdateInterval(
				updateIntervalInSeconds
			);
			const params = {};
			const olSource = new ImageWMS();
			const olLayer = new ImageLayer({ id: layerId, source: olSource });
			const olMap = new Map({ layers: [olLayer] });

			vi.spyOn(olSource, 'getParams').mockReturnValue(params);
			const updateParamsSpy = vi.spyOn(olSource, 'updateParams');

			instanceUnderTest._registerUpdateIntervalHandler(olLayer, wmsGeoResource, olMap);

			vi.advanceTimersByTime(DEFAULT_MIN_LAYER_UPDATE_INTERVAL_SECONDS * 1000 + 100);

			expect(updateParamsSpy).not.toHaveBeenCalled();
		});

		describe('WmsGeoResource', () => {
			it('handles an `updateInterval` on GeoResource-level', async () => {
				const instanceUnderTest = setup();
				const layerId = 'layerId';
				const wmsGeoResource = new WmsGeoResource('geoResourceId', 'label', 'https://some.url', 'layer', 'image/png').setUpdateInterval(
					DEFAULT_MIN_LAYER_UPDATE_INTERVAL_SECONDS
				);
				const params = {};
				const olSource = new ImageWMS();
				const olLayer = new ImageLayer({ id: layerId, source: olSource });
				const olMap = new Map({ layers: [olLayer] });

				vi.spyOn(olSource, 'getParams').mockReturnValue(params);
				const updateParamsSpy = vi.spyOn(olSource, 'updateParams');

				instanceUnderTest._registerUpdateIntervalHandler(olLayer, wmsGeoResource, olMap);

				vi.advanceTimersByTime(DEFAULT_MIN_LAYER_UPDATE_INTERVAL_SECONDS * 1000 + 100);

				expect(updateParamsSpy).toHaveBeenCalledExactlyOnceWith(params);

				//we remove the layer to trigger a removal of the interval
				olMap.removeLayer(olLayer);

				vi.advanceTimersByTime(DEFAULT_MIN_LAYER_UPDATE_INTERVAL_SECONDS * 1000 + 100);

				expect(updateParamsSpy).toHaveBeenCalledExactlyOnceWith(params);
			});

			it('handles an `updateInterval` on the Layer-level', async () => {
				const instanceUnderTest = setup();
				const layerId = 'layerId';
				const wmsGeoResource = new WmsGeoResource('geoResourceId', 'label', 'https://some.url', 'layer', 'image/png');
				const params = {};
				const olSource = new ImageWMS();
				const olLayer = new ImageLayer({ id: layerId, source: olSource });
				const olMap = new Map({ layers: [olLayer] });
				vi.spyOn(olSource, 'getParams').mockReturnValue(params);
				const updateParamsSpy = vi.spyOn(olSource, 'updateParams');
				instanceUnderTest._registerUpdateIntervalHandler(olLayer, wmsGeoResource, olMap);

				olLayer.set('updateInterval', DEFAULT_MIN_LAYER_UPDATE_INTERVAL_SECONDS);

				vi.advanceTimersByTime(DEFAULT_MIN_LAYER_UPDATE_INTERVAL_SECONDS * 1000 + 100);

				expect(updateParamsSpy).toHaveBeenCalledExactlyOnceWith(params);

				//we remove the layer to trigger a removal of the interval
				olMap.removeLayer(olLayer);

				vi.advanceTimersByTime(DEFAULT_MIN_LAYER_UPDATE_INTERVAL_SECONDS * 1000 + 100);

				expect(updateParamsSpy).toHaveBeenCalledExactlyOnceWith(params);
			});
		});

		describe('OafGeoResource', () => {
			it('handles an `updateInterval` on GeoResource-level', async () => {
				const instanceUnderTest = setup();
				const layerId = 'layerId';
				const oafGeoResource = new OafGeoResource('geoResourceId', 'label', 'url', 'collectionId').setUpdateInterval(
					DEFAULT_MIN_LAYER_UPDATE_INTERVAL_SECONDS
				);
				const olSource = new Vector();
				const olLayer = new VectorLayer({ id: layerId, source: olSource });
				const olMap = new Map({ layers: [olLayer] });
				const refreshSpy = vi.spyOn(olSource, 'refresh');

				instanceUnderTest._registerUpdateIntervalHandler(olLayer, oafGeoResource, olMap);

				vi.advanceTimersByTime(DEFAULT_MIN_LAYER_UPDATE_INTERVAL_SECONDS * 1000 + 100);

				expect(refreshSpy).toHaveBeenCalledTimes(1);

				//we remove the layer to trigger a removal of the interval
				olMap.removeLayer(olLayer);

				vi.advanceTimersByTime(DEFAULT_MIN_LAYER_UPDATE_INTERVAL_SECONDS * 1000 + 100);

				expect(refreshSpy).toHaveBeenCalledTimes(1);
			});

			it('handles an `updateInterval` on the Layer-level', async () => {
				const instanceUnderTest = setup();
				const layerId = 'layerId';
				const oafGeoResource = new OafGeoResource('geoResourceId', 'label', 'url', 'collectionId');
				const olSource = new Vector();
				const olLayer = new VectorLayer({ id: layerId, source: olSource });
				const olMap = new Map({ layers: [olLayer] });
				const refreshSpy = vi.spyOn(olSource, 'refresh');
				instanceUnderTest._registerUpdateIntervalHandler(olLayer, oafGeoResource, olMap);

				olLayer.set('updateInterval', DEFAULT_MIN_LAYER_UPDATE_INTERVAL_SECONDS);

				vi.advanceTimersByTime(DEFAULT_MIN_LAYER_UPDATE_INTERVAL_SECONDS * 1000 + 100);

				expect(refreshSpy).toHaveBeenCalledTimes(1);

				//we remove the layer to trigger a removal of the interval
				olMap.removeLayer(olLayer);

				vi.advanceTimersByTime(DEFAULT_MIN_LAYER_UPDATE_INTERVAL_SECONDS * 1000 + 100);

				expect(refreshSpy).toHaveBeenCalledTimes(1);
			});
		});
	});
});
