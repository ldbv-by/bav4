import BaseLayer from 'ol/layer/Base';
import { mapVectorSourceTypeToFormat, toOlLayer, updateOlLayer } from '../../../../src/modules/map/components/olMapUtils';
import { VectorGeoResource, VectorSourceType, WmsGeoResource, WMTSGeoResource } from '../../../../src/services/domain/geoResources';

describe('olMapUtils', () => {

	it('it maps vectorSourceType to olFormats', () => {

		expect(mapVectorSourceTypeToFormat(VectorSourceType.KML).constructor.name).toBe('KML');
		expect(mapVectorSourceTypeToFormat(VectorSourceType.GPX).constructor.name).toBe('GPX');
		expect(mapVectorSourceTypeToFormat(VectorSourceType.GEOJSON).constructor.name).toBe('GeoJSON');
		expect(() => {
			mapVectorSourceTypeToFormat('unknown');
		})
			.toThrowError(/unknown currently not supported/);
	});

	describe('toOlLayer', () => {

		it('it converts a WmsGeoresource to a olLayer', () => {
			const wmsGeoresource = new WmsGeoResource('someId', 'Label', 'https://some.url', 'layer', 'image/png');

			const wmsOlLayer = toOlLayer(wmsGeoresource);
			expect(wmsOlLayer.get('id')).toBe('someId');

			const wmsSource = wmsOlLayer.getSource();
			expect(wmsOlLayer.constructor.name).toBe('ImageLayer');
			expect(wmsSource.constructor.name).toBe('ImageWMS');
			expect(wmsSource.getUrl()).toBe('https://some.url');
			expect(wmsSource.getParams().LAYERS).toBe('layer');
			expect(wmsSource.getParams().FORMAT).toBe('image/png');
			expect(wmsSource.getParams().VERSION).toBe('1.1.1');
		});

		it('it converts a WmtsGeoresource to a olLayer', () => {
			const wmtsGeoresource = new WMTSGeoResource('someId', 'Label', 'https://some{1-2}/layer/{z}/{x}/{y}');

			const wmtsOlLayer = toOlLayer(wmtsGeoresource);
			expect(wmtsOlLayer.get('id')).toBe('someId');

			const wmtsSource = wmtsOlLayer.getSource();
			expect(wmtsOlLayer.constructor.name).toBe('TileLayer');
			expect(wmtsSource.constructor.name).toBe('XYZ');
			expect(wmtsSource.getUrls()).toEqual(['https://some1/layer/{z}/{x}/{y}', 'https://some2/layer/{z}/{x}/{y}']);
		});

		it('it converts a VectorGeoresource to a olLayer', () => {
			const vectorGeoresource = new VectorGeoResource('someId', 'Label', 'https://some.url', VectorSourceType.KML);

			const vectorOlLayer = toOlLayer(vectorGeoresource);
			expect(vectorOlLayer.get('id')).toBe('someId');

			const vectorSource = vectorOlLayer.getSource();
			expect(vectorOlLayer.constructor.name).toBe('VectorLayer');
			expect(vectorSource.constructor.name).toBe('VectorSource');
			expect(vectorSource.getUrl()).toBe('https://some.url');
			expect(vectorSource.getFormat().constructor.name).toBe('KML');
		});


		it('it throws an error when georesource type is not supported', () => {

			expect(() => {
				toOlLayer({
					getType() {
						return 'Unknown';
					}
				});
			})
				.toThrowError(/Unknown currently not supported/);
		});

	});

	describe('updateOlLayer', () => {
		it('it updates the properties of a olLayer', () => {

			let olLayer = new BaseLayer({});
			const layer = { visible: false, opacity: .5 };

			updateOlLayer(olLayer, layer);

			expect(olLayer.getVisible()).toBeFalse();
			expect(olLayer.getOpacity()).toBe(.5);
		});
	});
});


