
import { Point } from 'ol/geom';
import { $injector } from '../../../../src/injection';
import { Mfp3Encoder } from '../../../../src/modules/olMap/formats/Mfp3Encoder';

import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';


describe('Mfp3Encoder', () => {


	const mapMock = { getSize: () => [100, 100], getCoordinateFromPixel: (p) => p };

	const mapServiceMock = {
		getDefaultMapExtent() { },
		getDefaultGeodeticSrid: () => 25832,
		getSrid: () => 3857
	};

	const defaultProperties = {
		layoutId: 'foo',
		scale: 1,
		dpi: 42,
		rotation: null
	};

	$injector.registerSingleton('MapService', mapServiceMock);
	proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu');
	register(proj4);

	describe('encode', () => {

		it('returns NULL for invalid properties', () => {
			const baseProps = { dpi: 42, rotation: null, mapCenter: new Point([42, 21]), mapExtent: [0, 0, 42, 21] };
			expect(Mfp3Encoder.encode(mapMock, { ...baseProps, layoutId: null, scale: 1 })).toBeNull();
			expect(Mfp3Encoder.encode(mapMock, { ...baseProps, layoutId: 'bar', scale: null })).toBeNull();
			expect(Mfp3Encoder.encode(mapMock, { ...baseProps, layoutId: 'bar', scale: 0 })).toBeNull();
		});

		it('returns a spec for valid properties', () => {
			const specs = Mfp3Encoder.encode(mapMock, defaultProperties);

			expect(specs).not.toBeNull();
			expect(specs).toEqual(jasmine.objectContaining({ layout: 'foo' }));
			expect(specs.attributes.map).not.toBeNull();
			expect(specs.attributes.map).toEqual(jasmine.objectContaining({ scale: 1, dpi: 42, rotation: 0 }));
		});

	});
});
