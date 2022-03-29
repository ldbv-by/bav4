import { $injector } from '../../../../../../src/injection';
import { AggregateGeoResource, GeoResourceFuture, VectorGeoResource, VectorSourceType, WmsGeoResource, WMTSGeoResource } from '../../../../../../src/services/domain/geoResources';
import { LayerService } from '../../../../../../src/modules/map/components/olMap/services/LayerService';
import { Map } from 'ol';
import VectorLayer from 'ol/layer/Vector';
import { TestUtils } from '../../../../../test-utils';


describe('LayerService', () => {

	const vectorLayerService = {
		createVectorLayer: () => { }
	};
	const georesourceService = {
		byId: () => { }
	};

	let instanceUnderTest;


	beforeEach(() => {
		TestUtils.setupStoreAndDi({});
		$injector
			.registerSingleton('VectorLayerService', vectorLayerService)
			.registerSingleton('GeoResourceService', georesourceService);

		instanceUnderTest = new LayerService();
	});

	describe('toOlLayer', () => {

		describe('GeoResourceFuture', () => {

			it('converts a GeoResourceFuture to a placeholder olLayer', () => {
				const id = 'id';
				const wmsGeoresource = new GeoResourceFuture('geoResourceId', () => { });

				const placeholderOlLayer = instanceUnderTest.toOlLayer(id, wmsGeoresource);

				expect(placeholderOlLayer.get('id')).toBe(id);
				expect(placeholderOlLayer.get('placeholder')).toBeTrue();
				expect(placeholderOlLayer.getSource()).toBeNull();
				expect(placeholderOlLayer.render()).toBeUndefined();
				expect(placeholderOlLayer.constructor.name).toBe('Layer');
			});
		});

		describe('VectorGeoresource', () => {

			it('calls the VectorLayerService', () => {
				const id = 'id';
				const olMap = new Map();
				const olLayer = new VectorLayer();
				const vectorGeoresource = new VectorGeoResource('geoResourceId', 'Label', VectorSourceType.KML);
				const vectorSourceForUrlSpy = spyOn(vectorLayerService, 'createVectorLayer').and.returnValue(olLayer);

				instanceUnderTest.toOlLayer(id, vectorGeoresource, olMap);

				expect(vectorSourceForUrlSpy).toHaveBeenCalledWith(id, vectorGeoresource, olMap);
			});
		});

		describe('WmsGeoresource', () => {

			it('converts a WmsGeoresource to a olLayer', () => {
				const id = 'id';
				const wmsGeoresource = new WmsGeoResource('geoResourceId', 'Label', 'https://some.url', 'layer', 'image/png');

				const wmsOlLayer = instanceUnderTest.toOlLayer(id, wmsGeoresource);

				expect(wmsOlLayer.get('id')).toBe(id);
				expect(wmsOlLayer.getMinZoom()).toBeNegativeInfinity();
				expect(wmsOlLayer.getMaxZoom()).toBePositiveInfinity();
				const wmsSource = wmsOlLayer.getSource();
				expect(wmsOlLayer.constructor.name).toBe('ImageLayer');
				expect(wmsSource.constructor.name).toBe('ImageWMS');
				expect(wmsSource.getUrl()).toBe('https://some.url');
				expect(wmsSource.getParams().LAYERS).toBe('layer');
				expect(wmsSource.getParams().FORMAT).toBe('image/png');
				expect(wmsSource.getParams().VERSION).toBe('1.1.1');
			});

			it('converts a WmsGeoresource containing optional properties to a olLayer', () => {
				const id = 'id';
				const wmsGeoresource = new WmsGeoResource('geoResourceId', 'Label', 'https://some.url', 'layer', 'image/png')
					.setOpacity(.5)
					.setMinZoom(5)
					.setMaxZoom(19)
					.setExtraParams({ STYLES: 'some' });

				const wmsOlLayer = instanceUnderTest.toOlLayer(id, wmsGeoresource);

				expect(wmsOlLayer.get('id')).toBe(id);
				expect(wmsOlLayer.getOpacity()).toBe(.5);
				expect(wmsOlLayer.getMinZoom()).toBe(5);
				expect(wmsOlLayer.getMaxZoom()).toBe(19);
				const wmsSource = wmsOlLayer.getSource();
				expect(wmsOlLayer.constructor.name).toBe('ImageLayer');
				expect(wmsSource.constructor.name).toBe('ImageWMS');
				expect(wmsSource.getUrl()).toBe('https://some.url');
				expect(wmsSource.getParams().LAYERS).toBe('layer');
				expect(wmsSource.getParams().FORMAT).toBe('image/png');
				expect(wmsSource.getParams().VERSION).toBe('1.1.1');
				expect(wmsSource.getParams().STYLES).toBe('some');
			});
		});

		describe('WmtsGeoresource', () => {

			it('converts a WmtsGeoresource to a olLayer', () => {
				const id = 'id';
				const wmtsGeoresource = new WMTSGeoResource('geoResourceId', 'Label', 'https://some{1-2}/layer/{z}/{x}/{y}');

				const wmtsOlLayer = instanceUnderTest.toOlLayer(id, wmtsGeoresource);

				expect(wmtsOlLayer.get('id')).toBe(id);
				expect(wmtsOlLayer.getPreload()).toBe(3);
				expect(wmtsOlLayer.getMinZoom()).toBeNegativeInfinity();
				expect(wmtsOlLayer.getMaxZoom()).toBePositiveInfinity();
				const wmtsSource = wmtsOlLayer.getSource();
				expect(wmtsOlLayer.constructor.name).toBe('TileLayer');
				expect(wmtsSource.constructor.name).toBe('XYZ');
				expect(wmtsSource.getUrls()).toEqual(['https://some1/layer/{z}/{x}/{y}', 'https://some2/layer/{z}/{x}/{y}']);
			});

			it('converts a WmtsGeoresource containing optional properties to a olLayer', () => {
				const id = 'id';
				const wmtsGeoresource = new WMTSGeoResource('geoResourceId', 'Label', 'https://some{1-2}/layer/{z}/{x}/{y}')
					.setOpacity(.5)
					.setMinZoom(5)
					.setMaxZoom(19);

				const wmtsOlLayer = instanceUnderTest.toOlLayer(id, wmtsGeoresource);

				expect(wmtsOlLayer.get('id')).toBe(id);
				expect(wmtsOlLayer.getPreload()).toBe(3);
				expect(wmtsOlLayer.getOpacity()).toBe(.5);
				expect(wmtsOlLayer.getMinZoom()).toBe(5);
				expect(wmtsOlLayer.getMaxZoom()).toBe(19);
				const wmtsSource = wmtsOlLayer.getSource();
				expect(wmtsOlLayer.constructor.name).toBe('TileLayer');
				expect(wmtsSource.constructor.name).toBe('XYZ');
				expect(wmtsSource.getUrls()).toEqual(['https://some1/layer/{z}/{x}/{y}', 'https://some2/layer/{z}/{x}/{y}']);
			});
		});

		it('converts a AggregateGeoresource to a olLayer(Group)', () => {
			const id = 'id';
			const wmtsGeoresource = new WMTSGeoResource('geoResourceId1', 'Label', 'https://some{1-2}/layer/{z}/{x}/{y}');
			const wmsGeoresource = new WmsGeoResource('geoResourceId2', 'Label', 'https://some.url', 'layer', 'image/png');
			spyOn(georesourceService, 'byId').and.callFake((id) => {
				switch (id) {
					case wmtsGeoresource.id:
						return wmtsGeoresource;
					case wmsGeoresource.id:
						return wmsGeoresource;
				}
			});
			const aggreggateGeoResource = new AggregateGeoResource('geoResourceId0', 'label', [wmtsGeoresource.id, wmtsGeoresource.id]);

			const olLayerGroup = instanceUnderTest.toOlLayer(id, aggreggateGeoResource);

			expect(olLayerGroup.get('id')).toBe(id);
			expect(olLayerGroup.getMinZoom()).toBeNegativeInfinity();
			expect(olLayerGroup.getMaxZoom()).toBePositiveInfinity();
			expect(olLayerGroup.constructor.name).toBe('LayerGroup');
			const layers = olLayerGroup.getLayers();
			expect(layers.item(0).get('id')).toBe(wmtsGeoresource.id);
			expect(layers.item(1).get('id')).toBe(wmtsGeoresource.id);
		});

		it('converts a AggregateGeoresource containing optional properties to a olLayer(Group)', () => {
			const id = 'id';
			const wmtsGeoresource = new WMTSGeoResource('geoResourceId1', 'Label', 'https://some{1-2}/layer/{z}/{x}/{y}');
			const wmsGeoresource = new WmsGeoResource('geoResourceId2', 'Label', 'https://some.url', 'layer', 'image/png');
			spyOn(georesourceService, 'byId').and.callFake((id) => {
				switch (id) {
					case wmtsGeoresource.id:
						return wmtsGeoresource;
					case wmsGeoresource.id:
						return wmsGeoresource;
				}
			});
			const aggreggateGeoResource = new AggregateGeoResource('geoResourceId0', 'label', [wmtsGeoresource.id, wmtsGeoresource.id])
				.setOpacity(.5)
				.setMinZoom(5)
				.setMaxZoom(19);

			const olLayerGroup = instanceUnderTest.toOlLayer(id, aggreggateGeoResource);

			expect(olLayerGroup.get('id')).toBe(id);
			expect(olLayerGroup.getOpacity()).toBe(.5);
			expect(olLayerGroup.getMinZoom()).toBe(5);
			expect(olLayerGroup.getMaxZoom()).toBe(19);
			expect(olLayerGroup.constructor.name).toBe('LayerGroup');
			const layers = olLayerGroup.getLayers();
			expect(layers.item(0).get('id')).toBe(wmtsGeoresource.id);
			expect(layers.item(1).get('id')).toBe(wmtsGeoresource.id);
		});

		it('throws an error when georesource type is not supported', () => {
			const id = 'id';
			expect(() => {
				instanceUnderTest.toOlLayer(id, {
					getType() {
						return 'Unknown';
					}
				});
			})
				.toThrowError(/Unknown currently not supported/);
		});

	});

});
