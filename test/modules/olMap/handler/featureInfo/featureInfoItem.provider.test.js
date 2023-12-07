import { render } from 'lit-html';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { fromLonLat } from 'ol/proj';
import { getBvvFeatureInfo } from '../../../../../src/modules/olMap/handler/featureInfo/featureInfoItem.provider';
import { createDefaultLayer, createDefaultLayerProperties } from '../../../../../src/store/layers/layers.reducer';
import GeoJSON from 'ol/format/GeoJSON';
import { FeatureInfoGeometryTypes } from '../../../../../src/store/featureInfo/featureInfo.action';
import { $injector } from '../../../../../src/injection';
import { GeometryInfo } from '../../../../../src/modules/featureInfo/components/geometryInfo/GeometryInfo';
import { ExportVectorDataChip } from '../../../../../src/modules/chips/components/assistChips/ExportVectorDataChip';
import { TestUtils } from '../../../../test-utils';

window.customElements.define(GeometryInfo.tag, GeometryInfo);
window.customElements.define(ExportVectorDataChip.tag, ExportVectorDataChip);

describe('FeatureInfo provider', () => {
	const mapServiceMock = {
		getSrid: () => 3857,
		getLocalProjectedSrid: () => 25832,
		getLocalProjectedSridExtent: () => null
	};

	const securityServiceMock = {
		sanitizeHtml: (h) => h
	};

	const coordinateServiceMock = {
		stringify() {},
		toLonLat() {}
	};

	const geoResourceServiceMock = {
		byId() {}
	};

	const unitsServiceMock = {
		formatDistance: (distance) => {
			return distance + ' m';
		},

		formatArea: (area) => {
			return area + ' m²';
		}
	};

	beforeAll(() => {
		TestUtils.setupStoreAndDi();
		$injector
			.registerSingleton('MapService', mapServiceMock)
			.registerSingleton('SecurityService', securityServiceMock)
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('CoordinateService', coordinateServiceMock)
			.registerSingleton('GeoResourceService', geoResourceServiceMock)
			.registerSingleton('UnitsService', unitsServiceMock);
	});
	const coordinate = fromLonLat([11, 48]);

	describe('Bvv featureInfo provider', () => {
		describe('and no suitable properties are available', () => {
			it('returns null', () => {
				const layer = createDefaultLayer('foo');
				const feature = new Feature({});

				const featureInfo = getBvvFeatureInfo(feature, layer);

				expect(featureInfo).toBeNull();
			});
		});

		describe('and suitable properties are available', () => {
			describe('and a GeoResource is available', () => {
				it('returns a LayerInfo item', () => {
					const target = document.createElement('div');
					const geoResourceId = 'geoResourceId';
					spyOn(geoResourceServiceMock, 'byId').withArgs(geoResourceId).and.returnValue({ label: 'foo' } /*fake GeoResource */);
					const layerProperties = { ...createDefaultLayerProperties(), geoResourceId: geoResourceId };
					const geometry = new Point(coordinate);
					let feature = new Feature({ geometry: geometry });
					feature.set('name', 'name');
					const expectedFeatureInfoGeometry = {
						data: new GeoJSON().writeGeometry(geometry),
						geometryType: FeatureInfoGeometryTypes.GEOJSON
					};

					let featureInfo = getBvvFeatureInfo(feature, layerProperties);
					render(featureInfo.content, target);

					expect(featureInfo).toEqual({
						title: 'name - foo',
						content: jasmine.any(Object),
						geometry: expectedFeatureInfoGeometry
					});
					expect(target.innerText.trim()).toBe('');
					expect(target.querySelector('ba-geometry-info')).toBeTruthy();
					expect(target.querySelector('ba-profile-chip')).toBeTruthy();
					expect(target.querySelector('ba-export-vector-data-chip')).toBeTruthy();

					//no name property, but description property
					feature = new Feature({ geometry: new Point(coordinate) });
					feature.set('description', 'description');

					featureInfo = getBvvFeatureInfo(feature, layerProperties);
					render(featureInfo.content, target);

					expect(featureInfo).toEqual({
						title: 'foo',
						content: jasmine.any(Object),
						geometry: expectedFeatureInfoGeometry
					});
					expect(target.querySelector('.content').innerText).toBe('description');
					expect(target.querySelector('ba-geometry-info')).toBeTruthy();
					expect(target.querySelector('ba-profile-chip')).toBeTruthy();
					expect(target.querySelector('ba-export-vector-data-chip')).toBeTruthy();

					//no name property, but desc property
					feature = new Feature({ geometry: new Point(coordinate) });
					feature.set('desc', 'desc');

					featureInfo = getBvvFeatureInfo(feature, layerProperties);
					render(featureInfo.content, target);

					expect(featureInfo).toEqual({
						title: 'foo',
						content: jasmine.any(Object),
						geometry: expectedFeatureInfoGeometry
					});
					expect(target.querySelector('.content').innerText).toBe('desc');
					expect(target.querySelector('ba-geometry-info')).toBeTruthy();
					expect(target.querySelector('ba-profile-chip')).toBeTruthy();
					expect(target.querySelector('ba-export-vector-data-chip')).toBeTruthy();
				});

				it('should sanitize description content', () => {
					const target = document.createElement('div');
					const geoResourceId = 'geoResourceId';
					spyOn(geoResourceServiceMock, 'byId').withArgs(geoResourceId).and.returnValue({ label: 'foo' } /*fake GeoResource */);
					const layerProperties = { ...createDefaultLayerProperties(), geoResourceId: geoResourceId };
					const geometry = new Point(coordinate);
					let feature = new Feature({ geometry: geometry });
					feature = new Feature({ geometry: new Point(coordinate) });
					feature.set('description', 'description');
					const sanitizeSpy = spyOn(securityServiceMock, 'sanitizeHtml').withArgs('description').and.callThrough();
					const featureInfo = getBvvFeatureInfo(feature, layerProperties);
					render(featureInfo.content, target);

					expect(sanitizeSpy).toHaveBeenCalledOnceWith('description');
				});

				it('should sanitize name content', () => {
					const target = document.createElement('div');
					const geoResourceId = 'geoResourceId';
					spyOn(geoResourceServiceMock, 'byId').withArgs(geoResourceId).and.returnValue({ label: 'foo' } /*fake GeoResource */);
					const layerProperties = { ...createDefaultLayerProperties(), geoResourceId: geoResourceId };
					const geometry = new Point(coordinate);
					let feature = new Feature({ geometry: geometry });
					feature = new Feature({ geometry: new Point(coordinate) });
					feature.set('name', 'name');
					const sanitizeSpy = spyOn(securityServiceMock, 'sanitizeHtml').withArgs('name').and.callThrough();
					const featureInfo = getBvvFeatureInfo(feature, layerProperties);
					render(featureInfo.content, target);

					expect(sanitizeSpy).toHaveBeenCalledOnceWith('name');
				});
			});

			describe('and a GeoResource is NOT available', () => {
				it('returns a LayerInfo item', () => {
					const target = document.createElement('div');
					const geoResourceId = 'geoResourceId';
					spyOn(geoResourceServiceMock, 'byId').withArgs(geoResourceId).and.returnValue(null);
					const layerProperties = { ...createDefaultLayerProperties(), geoResourceId: geoResourceId };
					const geometry = new Point(coordinate);
					let feature = new Feature({ geometry: geometry });
					feature.set('name', 'name');
					const expectedFeatureInfoGeometry = {
						data: new GeoJSON().writeGeometry(geometry),
						geometryType: FeatureInfoGeometryTypes.GEOJSON
					};

					let featureInfo = getBvvFeatureInfo(feature, layerProperties);
					render(featureInfo.content, target);

					expect(featureInfo).toEqual({
						title: 'name',
						content: jasmine.any(Object),
						geometry: expectedFeatureInfoGeometry
					});
					expect(target.innerText.trim()).toBe('');
					expect(target.querySelector('ba-geometry-info')).toBeTruthy();
					expect(target.querySelector('ba-profile-chip')).toBeTruthy();
					expect(target.querySelector('ba-export-vector-data-chip')).toBeTruthy();

					//no name property
					feature = new Feature({ geometry: new Point(coordinate) });

					featureInfo = getBvvFeatureInfo(feature, layerProperties);
					render(featureInfo.content, target);

					expect(featureInfo).toEqual({
						title: '',
						content: jasmine.any(Object),
						geometry: expectedFeatureInfoGeometry
					});
					expect(target.querySelector('ba-geometry-info')).toBeTruthy();
					expect(target.querySelector('ba-profile-chip')).toBeTruthy();
					expect(target.querySelector('ba-export-vector-data-chip')).toBeTruthy();
				});

				it('should sanitize name content', () => {
					const sanitizeSpy = spyOn(securityServiceMock, 'sanitizeHtml').withArgs('name').and.callThrough();
					const target = document.createElement('div');
					const geoResourceId = 'geoResourceId';
					spyOn(geoResourceServiceMock, 'byId').withArgs(geoResourceId).and.returnValue(null);
					const layerProperties = { ...createDefaultLayerProperties(), geoResourceId: geoResourceId };
					const geometry = new Point(coordinate);
					const feature = new Feature({ geometry: geometry });
					feature.set('name', 'name');

					const featureInfo = getBvvFeatureInfo(feature, layerProperties);
					render(featureInfo.content, target);

					expect(sanitizeSpy).toHaveBeenCalledOnceWith('name');
				});
			});

			it('should supply exportVectorDataChip with exportData as KML', () => {
				const target = document.createElement('div');
				const geoResourceId = 'geoResourceId';
				spyOn(geoResourceServiceMock, 'byId').withArgs(geoResourceId).and.returnValue({ label: 'foo' } /*fake GeoResource */);
				const layerProperties = { ...createDefaultLayerProperties(), geoResourceId: geoResourceId };
				const geometry = new Point(coordinate);
				let feature = new Feature({ geometry: geometry });
				feature = new Feature({ geometry: new Point(coordinate) });
				feature.set('name', 'name');

				const featureInfo = getBvvFeatureInfo(feature, layerProperties);
				render(featureInfo.content, target);

				const chipElement = target.querySelector('ba-export-vector-data-chip');

				expect(chipElement.getModel().data.startsWith('<kml')).toBeTrue();
			});
		});
	});
});
