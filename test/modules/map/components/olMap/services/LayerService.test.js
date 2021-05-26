import { $injector } from '../../../../../../src/injection';
import { AggregateGeoResource, VectorGeoResource, VectorSourceType, WmsGeoResource, WMTSGeoResource } from '../../../../../../src/services/domain/geoResources';
import VectorSource from 'ol/source/Vector';
import { LayerService } from '../../../../../../src/modules/map/components/olMap/services/LayerService';


describe('LayerService', () => {

	const vectorImportService = {
		vectorSourceFromInternalData: () => { },
		vectorSourceFromExternalData: () => { }
	};
	const georesourceService = {
		byId: () => { }
	};

	let instanceUnderTest;
	

	beforeAll(() => {
		$injector
			.registerSingleton('VectorImportService', vectorImportService)
			.registerSingleton('GeoResourceService', georesourceService);
	});

	beforeEach(() => {
		instanceUnderTest = new LayerService();
	});

	describe('toOlLayer', () => {

		describe('VectorGeoresource', () => {

			it('converts an external VectorGeoresource to an olLayer by calling #vectorSourceFromExternalData', () => {
				const spy = spyOn(vectorImportService, 'vectorSourceFromExternalData').and.returnValue(new VectorSource());
				const vectorGeoresource = new VectorGeoResource('someId', 'Label', VectorSourceType.KML).setUrl('https://some.url');

				const vectorOlLayer = instanceUnderTest.toOlLayer(vectorGeoresource);

				expect(vectorOlLayer.get('id')).toBe('someId');
				expect(vectorOlLayer.constructor.name).toBe('VectorLayer');
				expect(vectorOlLayer.getSource().constructor.name).toBe('VectorSource');
				expect(spy).toHaveBeenCalledWith(vectorGeoresource);
			});

			it('converts an internal VectorGeoresource to an olLayer by calling #vectorSourceFromInternalData', () => {
				const spy = spyOn(vectorImportService, 'vectorSourceFromInternalData').and.returnValue(new VectorSource());
				const vectorGeoresource = new VectorGeoResource('someId', 'geoResourceLabel', VectorSourceType.KML).setSource('<kml></kml>', 4326);

				const vectorOlLayer =  instanceUnderTest.toOlLayer(vectorGeoresource);

				expect(vectorOlLayer.get('id')).toBe('someId');
				expect(vectorOlLayer.constructor.name).toBe('VectorLayer');
				expect(vectorOlLayer.getSource().constructor.name).toBe('VectorSource');
				expect(spy).toHaveBeenCalledWith(vectorGeoresource);
			});
		});


		it('converts a WmsGeoresource to a olLayer', () => {
			const wmsGeoresource = new WmsGeoResource('someId', 'Label', 'https://some.url', 'layer', 'image/png');

			const wmsOlLayer =  instanceUnderTest.toOlLayer(wmsGeoresource);

			expect(wmsOlLayer.get('id')).toBe('someId');
			const wmsSource = wmsOlLayer.getSource();
			expect(wmsOlLayer.constructor.name).toBe('ImageLayer');
			expect(wmsSource.constructor.name).toBe('ImageWMS');
			expect(wmsSource.getUrl()).toBe('https://some.url');
			expect(wmsSource.getParams().LAYERS).toBe('layer');
			expect(wmsSource.getParams().FORMAT).toBe('image/png');
			expect(wmsSource.getParams().VERSION).toBe('1.1.1');
		});

		it('converts a WmtsGeoresource to a olLayer', () => {
			const wmtsGeoresource = new WMTSGeoResource('someId', 'Label', 'https://some{1-2}/layer/{z}/{x}/{y}');

			const wmtsOlLayer =  instanceUnderTest.toOlLayer(wmtsGeoresource);

			expect(wmtsOlLayer.get('id')).toBe('someId');
			const wmtsSource = wmtsOlLayer.getSource();
			expect(wmtsOlLayer.constructor.name).toBe('TileLayer');
			expect(wmtsSource.constructor.name).toBe('XYZ');
			expect(wmtsSource.getUrls()).toEqual(['https://some1/layer/{z}/{x}/{y}', 'https://some2/layer/{z}/{x}/{y}']);
		});


		it('converts a AggregateGeoresource to a olLayer(Group)', () => {

			const wmtsGeoresource = new WMTSGeoResource('wmtsId', 'Label', 'https://some{1-2}/layer/{z}/{x}/{y}');
			const wmsGeoresource = new WmsGeoResource('wmsId', 'Label', 'https://some.url', 'layer', 'image/png');
			spyOn(georesourceService, 'byId').and.callFake((id) => {
				switch (id) {
					case wmtsGeoresource.id:
						return wmtsGeoresource;
					case wmsGeoresource.id:
						return wmsGeoresource;
				}
			});
			const aggreggateGeoResource = new AggregateGeoResource('someId', 'label', [wmtsGeoresource.id, wmtsGeoresource.id]);

			const olLayerGroup =  instanceUnderTest.toOlLayer(aggreggateGeoResource);

			expect(olLayerGroup.get('id')).toBe('someId');
			expect(olLayerGroup.constructor.name).toBe('LayerGroup');
			const layers = olLayerGroup.getLayers();
			expect(layers.item(0).get('id')).toBe(wmtsGeoresource.id);
			expect(layers.item(1).get('id')).toBe(wmtsGeoresource.id);
		});


		it('throws an error when georesource type is not supported', () => {

			expect(() => {
				instanceUnderTest.toOlLayer({
					getType() {
						return 'Unknown';
					}
				});
			})
				.toThrowError(/Unknown currently not supported/);
		});

	});

});
