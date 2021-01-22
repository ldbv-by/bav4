import BaseLayer from 'ol/layer/Base';
import { toOlLayer, updateOlLayer } from '../../../../src/modules/map/components/olMapUtils';
import { WmsGeoResource } from '../../../../src/services/domain/geoResources';

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


