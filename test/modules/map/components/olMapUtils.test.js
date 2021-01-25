import BaseLayer from 'ol/layer/Base';
import { toOlLayer, updateOlLayer } from '../../../../src/modules/map/components/olMapUtils';
import { WmsGeoResource, WMTSGeoResource } from '../../../../src/services/domain/geoResources';

describe('olMapUtils', () => {
	describe('toOlLayer', () => {

		it('it converts a wmsGeoresource to a olLayer', () => {
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

		it('it converts a wmtsGeoresource to a olLayer', () => {
			const wmtsGeoresource = new WMTSGeoResource('someId', 'Label', 'https://some{1-2}/layer/{z}/{x}/{y}');

			const wmtsOlLayer = toOlLayer(wmtsGeoresource);
			expect(wmtsOlLayer.get('id')).toBe('someId');

			const wmsSource = wmtsOlLayer.getSource();
			expect(wmtsOlLayer.constructor.name).toBe('TileLayer');
			expect(wmsSource.constructor.name).toBe('XYZ');
			expect(wmsSource.getUrls()).toEqual(['https://some1/layer/{z}/{x}/{y}', 'https://some2/layer/{z}/{x}/{y}']);
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


