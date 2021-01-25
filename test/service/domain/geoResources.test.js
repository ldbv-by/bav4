/* eslint-disable no-undef */
import { GeoResourceTypes, GeoResource, WmsGeoResource, WMTSGeoResource } from '../../../src/services/domain/geoResources';


describe('GeoResource', () => {

	describe('GeoResourceTypes', () => {

		it('provides an enum of all available types', () => {

			expect(GeoResourceTypes.WMS).toBeTruthy();
			expect(GeoResourceTypes.WMTS).toBeTruthy();
			expect(GeoResourceTypes.VECTOR).toBeTruthy();
			expect(GeoResourceTypes.VECTOR_TILES).toBeTruthy();
			expect(GeoResourceTypes.AGGREGATE).toBeTruthy();
		});
	});

	describe('abstract GeoResource', () => {

		class GeoResourceImpl extends GeoResource {
			constructor(id) {
				super(id);
			}
		}

		describe('constructor', () => {
			it('throws excepetion when instantiated without inheritance', () => {
				expect(() => new GeoResource()).toThrowError(TypeError, 'Can not construct abstract class.');
			});

			it('throws excepetion when instantiated without  id', () => {
				expect(() => new GeoResourceImpl()).toThrowError(TypeError, 'id must not be undefined');
			});
		});

		describe('methods', () => {
			it('throws excepetion when abstract #getType is called without overriding', () => {
				expect(() => new GeoResourceImpl('some').getType()).toThrowError(TypeError, 'Please implement abstract method #getType or do not call super.getType from child.');
			});
		});

		describe('properties', () => {
			it('provides default properties', () => {
				const georesource = new GeoResourceImpl('id');

				expect(georesource.label).toBe('');
				expect(georesource.background).toBeFalse();
				expect(georesource.opacity).toBe(1);
			});

			it('provides setter for properties', () => {
				const georesource = new GeoResourceImpl('id');

				georesource.opacity = .5;
				georesource.background = true;

				expect(georesource.background).toBeTrue();
				expect(georesource.opacity).toBe(.5);
			});
		});

	});

	describe('WmsGeoResource', () => {

		it('instantiates a WmsGeoResource', () => {

			const wmsGeoResource = new WmsGeoResource('id', 'label', 'url', 'layers', 'format');
			expect(wmsGeoResource.getType()).toEqual(GeoResourceTypes.WMS);
			expect(wmsGeoResource.id).toBe('id');
			expect(wmsGeoResource.label).toBe('label');
			expect(wmsGeoResource.url).toBe('url');
			expect(wmsGeoResource.layers).toBe('layers');
			expect(wmsGeoResource.format).toBe('format');
		});
	});

	describe('WmtsGeoResource', () => {

		it('instantiates a WmtsGeoResource', () => {

			const wmsGeoResource = new WMTSGeoResource('id', 'label', 'url');
			expect(wmsGeoResource.getType()).toEqual(GeoResourceTypes.WMTS);
			expect(wmsGeoResource.id).toBe('id');
			expect(wmsGeoResource.label).toBe('label');
			expect(wmsGeoResource.url).toBe('url');
		});
	});
});