import { render } from 'lit-html';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { fromLonLat } from 'ol/proj';
import { bvvFeatureInfoProvider } from '../../../../../src/modules/olMap/handler/featureInfo/featureInfoItem.provider';
import { FeatureCollectionPanel } from '../../../../../src/modules/featureInfo/components/collection/FeatureCollectionPanel';
import { ExportVectorDataChip } from '../../../../../src/modules/chips/components/assistChips/ExportVectorDataChip';
import { ElevationProfileChip } from '../../../../../src/modules/chips/components/assistChips/ElevationProfileChip';
import { GeometryInfo } from '../../../../../src/modules/info/components/geometryInfo/GeometryInfo';
import { createDefaultLayer, createDefaultLayerProperties } from '../../../../../src/store/layers/layers.reducer';
import GeoJSON from 'ol/format/GeoJSON';
import { $injector } from '../../../../../src/injection';
import { TestUtils } from '../../../../test-utils';
import { SourceType, SourceTypeName } from '../../../../../src/domain/sourceType';
import { BaGeometry } from '../../../../../src/domain/geometry';

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
		// eslint-disable-next-line no-unused-vars
		formatDistance: (distance, decimals) => {
			return { value: distance, localizedValue: distance, unit: 'm' };
		},
		// eslint-disable-next-line no-unused-vars
		formatArea: (area, decimals) => {
			return { value: area, localizedValue: area, unit: 'm²' };
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

				const featureInfo = bvvFeatureInfoProvider(feature, layer);

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
					feature.setId('id');
					const expectedFeatureInfoGeometry = new BaGeometry(new GeoJSON().writeGeometry(geometry), new SourceType(SourceTypeName.GEOJSON));

					let featureInfo = bvvFeatureInfoProvider(feature, layerProperties);
					render(featureInfo.content, target);

					expect(featureInfo).toEqual({
						title: 'name - foo',
						content: jasmine.any(Object),
						geometry: expectedFeatureInfoGeometry
					});
					expect(target.innerText.trim()).toBe('');
					expect(target.querySelectorAll(GeometryInfo.tag)).toHaveSize(1);
					expect(target.querySelector(GeometryInfo.tag).statistic).toEqual({
						geometryType: 'Point',
						coordinate: jasmine.any(Array),
						azimuth: null,
						length: null,
						area: null
					});
					expect(target.querySelectorAll(ElevationProfileChip.tag)).toHaveSize(1);
					expect(target.querySelectorAll(ExportVectorDataChip.tag)).toHaveSize(1);

					//no name property, but description property
					feature = new Feature({ geometry: new Point(coordinate) });
					feature.set('description', 'description');
					feature.setId('id');

					featureInfo = bvvFeatureInfoProvider(feature, layerProperties);
					render(featureInfo.content, target);

					expect(featureInfo).toEqual({
						title: 'foo',
						content: jasmine.any(Object),
						geometry: expectedFeatureInfoGeometry
					});
					expect(target.querySelector('.content').innerText).toBe('description');
					expect(target.querySelectorAll(GeometryInfo.tag)).toHaveSize(1);
					expect(target.querySelector(GeometryInfo.tag).statistic).toEqual({
						geometryType: 'Point',
						coordinate: jasmine.any(Array),
						azimuth: null,
						length: null,
						area: null
					});
					expect(target.querySelectorAll(ElevationProfileChip.tag)).toHaveSize(1);
					expect(target.querySelectorAll(ExportVectorDataChip.tag)).toHaveSize(1);

					//no name property, but desc property
					feature = new Feature({ geometry: new Point(coordinate) });
					feature.set('desc', 'desc');
					feature.setId('id');

					featureInfo = bvvFeatureInfoProvider(feature, layerProperties);
					render(featureInfo.content, target);

					expect(featureInfo).toEqual({
						title: 'foo',
						content: jasmine.any(Object),
						geometry: expectedFeatureInfoGeometry
					});
					expect(target.querySelector('.content').innerText).toBe('desc');
					expect(target.querySelectorAll(GeometryInfo.tag)).toHaveSize(1);
					expect(target.querySelector(GeometryInfo.tag).statistic).toEqual({
						geometryType: 'Point',
						coordinate: jasmine.any(Array),
						azimuth: null,
						length: null,
						area: null
					});
					expect(target.querySelectorAll(ElevationProfileChip.tag)).toHaveSize(1);
					expect(target.querySelectorAll(ExportVectorDataChip.tag)).toHaveSize(1);
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
					feature.setId('id');
					const sanitizeSpy = spyOn(securityServiceMock, 'sanitizeHtml').withArgs('description').and.callThrough();
					const featureInfo = bvvFeatureInfoProvider(feature, layerProperties);
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
					feature.setId('id');
					const sanitizeSpy = spyOn(securityServiceMock, 'sanitizeHtml').withArgs('name').and.callThrough();
					const featureInfo = bvvFeatureInfoProvider(feature, layerProperties);
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
					feature.setId('id');
					const expectedFeatureInfoGeometry = new BaGeometry(new GeoJSON().writeGeometry(geometry), new SourceType(SourceTypeName.GEOJSON));

					let featureInfo = bvvFeatureInfoProvider(feature, layerProperties);
					render(featureInfo.content, target);

					expect(featureInfo).toEqual({
						title: 'name',
						content: jasmine.any(Object),
						geometry: expectedFeatureInfoGeometry
					});
					expect(target.innerText.trim()).toBe('');
					expect(target.querySelectorAll(GeometryInfo.tag)).toHaveSize(1);
					expect(target.querySelectorAll(ElevationProfileChip.tag)).toHaveSize(1);
					expect(target.querySelectorAll(ExportVectorDataChip.tag)).toHaveSize(1);
					expect(target.querySelectorAll(FeatureCollectionPanel.tag)).toHaveSize(1);

					//no name property
					feature = new Feature({ geometry: new Point(coordinate) });
					feature.setId('id');

					featureInfo = bvvFeatureInfoProvider(feature, layerProperties);
					render(featureInfo.content, target);

					expect(featureInfo).toEqual({
						title: '',
						content: jasmine.any(Object),
						geometry: expectedFeatureInfoGeometry
					});
					expect(target.querySelectorAll(GeometryInfo.tag)).toHaveSize(1);
					expect(target.querySelectorAll(ElevationProfileChip.tag)).toHaveSize(1);
					expect(target.querySelectorAll(ExportVectorDataChip.tag)).toHaveSize(1);
					expect(target.querySelectorAll(FeatureCollectionPanel.tag)).toHaveSize(1);
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
					feature.setId('id');

					const featureInfo = bvvFeatureInfoProvider(feature, layerProperties);
					render(featureInfo.content, target);

					expect(sanitizeSpy).toHaveBeenCalledOnceWith('name');
				});
			});

			it('should supply ExportVectorDataChip with exportData as KML', () => {
				const target = document.createElement('div');
				const geoResourceId = 'geoResourceId';
				spyOn(geoResourceServiceMock, 'byId').withArgs(geoResourceId).and.returnValue({ label: 'foo' } /*fake GeoResource */);
				const layerProperties = { ...createDefaultLayerProperties(), geoResourceId: geoResourceId };
				const geometry = new Point(coordinate);
				let feature = new Feature({ geometry: geometry });
				feature = new Feature({ geometry: new Point(coordinate) });
				feature.setId('id');
				feature.set('name', 'name');

				const featureInfo = bvvFeatureInfoProvider(feature, layerProperties);
				render(featureInfo.content, target);

				const chipElement = target.querySelector(ExportVectorDataChip.tag);

				expect(chipElement.exportData.startsWith('<kml')).toBeTrue();
			});

			it('should supply the FeatureCollectionPanel with a geometry and a featureId', () => {
				const target = document.createElement('div');
				const geoResourceId = 'geoResourceId';
				spyOn(geoResourceServiceMock, 'byId').withArgs(geoResourceId).and.returnValue({ label: 'foo', id: geoResourceId } /*fake GeoResource */);
				const layerProperties = { ...createDefaultLayerProperties(), geoResourceId };
				const geometry = new Point(coordinate);
				let feature = new Feature({ geometry: geometry });
				feature = new Feature({ geometry: new Point(coordinate) });
				feature.set('name', 'name');
				feature.setId(12345);

				const featureInfo = bvvFeatureInfoProvider(feature, layerProperties);
				render(featureInfo.content, target);

				const panel = target.querySelector(FeatureCollectionPanel.tag);

				expect(panel.configuration.feature.id).toBe('12345');
				expect(panel.configuration.feature.geometry.data.startsWith('<kml')).toBeTrue();
				expect(panel.configuration.feature.geometry.sourceType).toEqual(SourceType.forKml());
				expect(panel.configuration.geoResourceId).toBe(geoResourceId);
			});
		});
	});
});
