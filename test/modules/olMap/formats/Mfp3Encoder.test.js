
import { Point } from 'ol/geom';
import { $injector } from '../../../../src/injection';
import { Mfp3Encoder } from '../../../../src/modules/olMap/formats/Mfp3Encoder';

import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';


describe('Mfp3Encoder', () => {

	// const viewMock = { getCenter: () => new Point([50, 50]), calculateExtent: () => [0, 0, 100, 100], getResolution: () => 10 };
	// const mapMock = {
	// 	getSize: () => [100, 100], getCoordinateFromPixel: (p) => p, getView: () => viewMock, getLayers: () => {
	// 		return { getArray: () => [] };
	// 	}
	// };

	const geoResourceServiceMock = { byId: () => { } };

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

	$injector.registerSingleton('MapService', mapServiceMock)
		.registerSingleton('GeoResourceService', geoResourceServiceMock);
	proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu');
	register(proj4);

	describe('constructor', () => {
		it('initialize with default properties', () => {
			const classUnderTest = new Mfp3Encoder(defaultProperties);

			expect(classUnderTest).toBeInstanceOf(Mfp3Encoder);
			expect(classUnderTest._mapService).toBeTruthy();
			expect(classUnderTest._geoResourceService).toBeTruthy();
			expect(classUnderTest._mfpProperties).toBe(defaultProperties);
			expect(classUnderTest._mapProjection).toBe('EPSG:3857');
			expect(classUnderTest._mfpProjection).toBe('EPSG:25832');
		});

		it('fails to initialize for invalid properties', () => {
			const baseProps = { dpi: 42, rotation: null, mapCenter: new Point([42, 21]), mapExtent: [0, 0, 42, 21] };

			expect(() => new Mfp3Encoder({ ...baseProps, layoutId: null, scale: 1 })).toThrowError();
			expect(() => new Mfp3Encoder({ ...baseProps, layoutId: 'bar', scale: null })).toThrowError();
			expect(() => new Mfp3Encoder({ ...baseProps, layoutId: 'bar', scale: 0 })).toThrowError();
		});
	});

	describe('encodeDimensions', () => {

		it('encodes dimensions', () => {
			const dimensions = {
				'foo': 'bar',
				'baz': 42
			};
			const encodedDimensions = {
				'FOO': 'bar',
				'BAZ': 42
			};

			expect(Mfp3Encoder.encodeDimensions(dimensions)).toEqual(encodedDimensions);
		});
	});
});
