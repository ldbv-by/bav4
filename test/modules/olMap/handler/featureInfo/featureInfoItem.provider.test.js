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
import {
	asInternalProperty,
	EXCLUDED_COMMON_FEATURE_PROPERTY_KEYS,
	LEGACY_INTERNAL_FEATURE_PROPERTY_KEYS
} from '../../../../../src/utils/propertyUtils';
import { OafGeoResource } from '../../../../../src/domain/geoResources';
import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';

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
	const importOafServiceMock = {
		getFilterCapabilitiesFromCache: () => null
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
			.registerSingleton('UnitsService', unitsServiceMock)
			.registerSingleton('ImportOafService', importOafServiceMock);
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

		describe('olFeature style', () => {
			describe('is NOT available', () => {
				it('transfers the olLayer style to the olFeature', () => {
					const geoResourceId = 'geoResourceId';
					spyOn(geoResourceServiceMock, 'byId').withArgs(geoResourceId).and.returnValue({ label: 'foo' } /*fake GeoResource */);
					const styleFunctionSpy = jasmine.createSpy();
					const olLayer = new VectorLayer();
					olLayer.setStyle(styleFunctionSpy);
					const layer = { ...createDefaultLayerProperties(), geoResourceId: geoResourceId };
					const geometry = new Point(coordinate);
					let olFeature = new Feature({ geometry: geometry });
					olFeature = new Feature({ geometry: new Point(coordinate) });
					olFeature.setId('id');

					bvvFeatureInfoProvider(olFeature, olLayer, layer);

					expect(styleFunctionSpy).toHaveBeenCalledWith(olFeature);
				});
			});
			describe('is available', () => {
				it('does nothing', () => {
					const geoResourceId = 'geoResourceId';
					spyOn(geoResourceServiceMock, 'byId').withArgs(geoResourceId).and.returnValue({ label: 'foo' } /*fake GeoResource */);
					const styleFunctionSpy = jasmine.createSpy();
					const olLayer = new VectorLayer();
					olLayer.setStyle(styleFunctionSpy);
					const layer = { ...createDefaultLayerProperties(), geoResourceId: geoResourceId };
					const geometry = new Point(coordinate);
					let olFeature = new Feature({ geometry: geometry });
					olFeature = new Feature({ geometry: new Point(coordinate) });
					olFeature.setStyle(new Style());
					olFeature.setId('id');

					bvvFeatureInfoProvider(olFeature, olLayer, layer);

					expect(styleFunctionSpy).not.toHaveBeenCalledWith();
				});
			});
		});

		describe('and suitable properties are available', () => {
			describe('and a GeoResource is available', () => {
				it('returns a LayerInfo item', () => {
					const target = document.createElement('div');
					const geoResourceId = 'geoResourceId';
					spyOn(geoResourceServiceMock, 'byId').withArgs(geoResourceId).and.returnValue({ label: 'foo' } /*fake GeoResource */);
					const layer = { ...createDefaultLayerProperties(), geoResourceId: geoResourceId };
					const olLayer = new VectorLayer();
					const geometry = new Point(coordinate);
					let olFeature = new Feature({ geometry: geometry });
					olFeature.set('name', 'name');
					olFeature.setId('id');
					const expectedFeatureInfoGeometry = new BaGeometry(new GeoJSON().writeGeometry(geometry), new SourceType(SourceTypeName.GEOJSON));

					let featureInfo = bvvFeatureInfoProvider(olFeature, olLayer, layer);
					render(featureInfo.content, target);

					expect(featureInfo).toEqual({
						title: 'name - foo',
						content: jasmine.any(Object),
						geometry: expectedFeatureInfoGeometry
					});
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
					olFeature = new Feature({ geometry: new Point(coordinate) });
					olFeature.set('description', 'description');
					olFeature.setId('id');

					featureInfo = bvvFeatureInfoProvider(olFeature, olLayer, layer);
					render(featureInfo.content, target);

					expect(featureInfo).toEqual({
						title: 'foo',
						content: jasmine.any(Object),
						geometry: expectedFeatureInfoGeometry
					});
					expect(target.querySelector('.content').innerText).toContain('description');
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
					olFeature = new Feature({ geometry: new Point(coordinate) });
					olFeature.set('desc', 'desc');
					olFeature.setId('id');

					featureInfo = bvvFeatureInfoProvider(olFeature, olLayer, layer);
					render(featureInfo.content, target);

					expect(featureInfo).toEqual({
						title: 'foo',
						content: jasmine.any(Object),
						geometry: expectedFeatureInfoGeometry
					});
					expect(target.querySelector('.content').innerText).toContain('desc');
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
					const layer = { ...createDefaultLayerProperties(), geoResourceId: geoResourceId };
					const olLayer = new VectorLayer();
					const geometry = new Point(coordinate);
					let olFeature = new Feature({ geometry: geometry });
					olFeature = new Feature({ geometry: new Point(coordinate) });
					olFeature.set('description', 'description');
					olFeature.setId('id');
					const sanitizeSpy = spyOn(securityServiceMock, 'sanitizeHtml').withArgs('description').and.callThrough();
					const featureInfo = bvvFeatureInfoProvider(olFeature, olLayer, layer);
					render(featureInfo.content, target);

					expect(sanitizeSpy).toHaveBeenCalledWith('description');
					expect(sanitizeSpy).toHaveBeenCalledTimes(2);
				});

				it('should sanitize name content', () => {
					const target = document.createElement('div');
					const geoResourceId = 'geoResourceId';
					spyOn(geoResourceServiceMock, 'byId').withArgs(geoResourceId).and.returnValue({ label: 'foo' } /*fake GeoResource */);
					const olLayer = new VectorLayer();
					const layer = { ...createDefaultLayerProperties(), geoResourceId: geoResourceId };
					const geometry = new Point(coordinate);
					let olFeature = new Feature({ geometry: geometry });
					olFeature = new Feature({ geometry: new Point(coordinate) });
					olFeature.set('name', 'name');
					olFeature.setId('id');
					const sanitizeSpy = spyOn(securityServiceMock, 'sanitizeHtml').withArgs('name').and.callThrough();
					const featureInfo = bvvFeatureInfoProvider(olFeature, olLayer, layer);
					render(featureInfo.content, target);

					expect(sanitizeSpy).toHaveBeenCalledWith('name');
					expect(sanitizeSpy).toHaveBeenCalledTimes(2);
				});
			});

			describe('and a GeoResource is NOT available', () => {
				it('returns a LayerInfo item', () => {
					const target = document.createElement('div');
					const geoResourceId = 'geoResourceId';
					spyOn(geoResourceServiceMock, 'byId').withArgs(geoResourceId).and.returnValue(null);
					const olLayer = new VectorLayer();
					const layer = { ...createDefaultLayerProperties(), geoResourceId: geoResourceId };
					const geometry = new Point(coordinate);
					let olFeature = new Feature({ geometry: geometry });
					olFeature.set('name', 'name');
					olFeature.setId('id');
					const expectedFeatureInfoGeometry = new BaGeometry(new GeoJSON().writeGeometry(geometry), new SourceType(SourceTypeName.GEOJSON));

					let featureInfo = bvvFeatureInfoProvider(olFeature, olLayer, layer);
					render(featureInfo.content, target);

					expect(featureInfo).toEqual({
						title: 'name',
						content: jasmine.any(Object),
						geometry: expectedFeatureInfoGeometry
					});
					expect(target.querySelectorAll(GeometryInfo.tag)).toHaveSize(1);
					expect(target.querySelectorAll(ElevationProfileChip.tag)).toHaveSize(1);
					expect(target.querySelectorAll(ExportVectorDataChip.tag)).toHaveSize(1);
					expect(target.querySelectorAll(FeatureCollectionPanel.tag)).toHaveSize(1);

					//no name property
					olFeature = new Feature({ geometry: new Point(coordinate) });
					olFeature.setId('id');

					featureInfo = bvvFeatureInfoProvider(olFeature, olLayer, layer);
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
					const olLayer = new VectorLayer();
					const layer = { ...createDefaultLayerProperties(), geoResourceId: geoResourceId };
					const geometry = new Point(coordinate);
					const olFeature = new Feature({ geometry: geometry });
					olFeature.set('name', 'name');
					olFeature.setId('id');

					const featureInfo = bvvFeatureInfoProvider(olFeature, olLayer, layer);
					render(featureInfo.content, target);

					expect(sanitizeSpy).toHaveBeenCalledWith('name');
					expect(sanitizeSpy).toHaveBeenCalledTimes(2);
				});
			});

			it('should supply ExportVectorDataChip with exportData as KML', () => {
				const target = document.createElement('div');
				const geoResourceId = 'geoResourceId';
				spyOn(geoResourceServiceMock, 'byId').withArgs(geoResourceId).and.returnValue({ label: 'foo' } /*fake GeoResource */);
				const olLayer = new VectorLayer();
				const layer = { ...createDefaultLayerProperties(), geoResourceId: geoResourceId };
				const geometry = new Point(coordinate);
				let olFeature = new Feature({ geometry: geometry });
				olFeature = new Feature({ geometry: new Point(coordinate) });
				olFeature.setId('id');
				olFeature.set('name', 'name');

				const featureInfo = bvvFeatureInfoProvider(olFeature, olLayer, layer);
				render(featureInfo.content, target);

				const chipElement = target.querySelector(ExportVectorDataChip.tag);

				expect(chipElement.exportData.startsWith('<kml')).toBeTrue();
			});

			it('should supply the FeatureCollectionPanel with a geometry and a featureId', () => {
				const target = document.createElement('div');
				const geoResourceId = 'geoResourceId';
				spyOn(geoResourceServiceMock, 'byId').withArgs(geoResourceId).and.returnValue({ label: 'foo', id: geoResourceId } /*fake GeoResource */);
				const olLayer = new VectorLayer();
				const layer = { ...createDefaultLayerProperties(), geoResourceId };
				const geometry = new Point(coordinate);
				let olFeature = new Feature({ geometry: geometry });
				olFeature = new Feature({ geometry: new Point(coordinate) });
				olFeature.set('name', 'name');
				olFeature.setId(12345);

				const featureInfo = bvvFeatureInfoProvider(olFeature, olLayer, layer);
				render(featureInfo.content, target);

				const panel = target.querySelector(FeatureCollectionPanel.tag);

				expect(panel.configuration.feature.id).toBe('12345');
				expect(panel.configuration.feature.geometry.data.startsWith('<kml')).toBeTrue();
				expect(panel.configuration.feature.geometry.sourceType).toEqual(SourceType.forKml());
				expect(panel.configuration.geoResourceId).toBe(geoResourceId);
			});

			describe('property table', () => {
				it('displays a table for all properties filtering unwanted one', () => {
					const geoResourceId = 'geoResourceId';
					spyOn(geoResourceServiceMock, 'byId').withArgs(geoResourceId).and.returnValue(null);
					const olLayer = new VectorLayer();
					const layer = { ...createDefaultLayerProperties(), geoResourceId: geoResourceId };
					const sanitizeSpy = spyOn(securityServiceMock, 'sanitizeHtml').and.callThrough();
					const geometry = new Point(coordinate);
					const olFeature = new Feature({ geometry: geometry });
					olFeature.setId('id');
					olFeature.set('foo', 'bar');
					olFeature.set('some', 'thing');
					olFeature.set('array', [{ key0: 'value0' }]);
					//the following kind of properties are expected to be filtered out
					olFeature.set(asInternalProperty('myProp'), 'should_not_be_displayed');
					olFeature.set(LEGACY_INTERNAL_FEATURE_PROPERTY_KEYS[0], 'should_not_be_displayed');
					olFeature.set(EXCLUDED_COMMON_FEATURE_PROPERTY_KEYS[1], 'should_not_be_displayed');

					const featureInfo = bvvFeatureInfoProvider(olFeature, olLayer, layer);
					const wrapperElement = TestUtils.renderTemplateResult(featureInfo.content);

					expect(wrapperElement.querySelectorAll('.prop-header.ba-list-item.ba-list-item__header ')).toHaveSize(1);
					expect(wrapperElement.querySelector('.prop-header .ba-list-item__text').innerText).toBe('olMap_handler_featureInfo_feature_properties');
					expect(wrapperElement.querySelectorAll('.prop-header  .icon.icon-rotate-90.chevron ')).toHaveSize(1);
					expect(wrapperElement.querySelectorAll('.props-table')).toHaveSize(1);
					expect(wrapperElement.querySelectorAll('.props-table tr')).toHaveSize(3);
					expect(wrapperElement.querySelector('.props-table tbody tr:nth-child(1) td:nth-child(1)').innerText).toContain('foo');
					expect(wrapperElement.querySelector('.props-table tbody tr:nth-child(1) td:nth-child(2)').innerText).toContain('bar');
					expect(wrapperElement.querySelector('.props-table tbody tr:nth-child(2) td:nth-child(1)').innerText).toContain('some');
					expect(wrapperElement.querySelector('.props-table tbody tr:nth-child(2) td:nth-child(2)').innerText).toContain('thing');
					expect(wrapperElement.querySelector('.props-table tbody tr:nth-child(3) td:nth-child(1)').innerText).toContain('array');
					expect(wrapperElement.querySelector('.props-table tbody tr:nth-child(3) td:nth-child(2)').innerText).toContain(
						JSON.stringify({ key0: 'value0' })
					);
					expect(sanitizeSpy).toHaveBeenCalledTimes(4);
					expect(sanitizeSpy.calls.all()[0].args[0]).toBe('');
					expect(sanitizeSpy.calls.all()[1].args[0]).toBe('bar');
					expect(sanitizeSpy.calls.all()[2].args[0]).toBe('thing');
				});

				it('displays a collapsed table for all properties', () => {
					const geoResourceId = 'geoResourceId';
					spyOn(geoResourceServiceMock, 'byId').withArgs(geoResourceId).and.returnValue(null);
					const olLayer = new VectorLayer();
					const layer = { ...createDefaultLayerProperties(), geoResourceId: geoResourceId };

					const geometry = new Point(coordinate);
					const olFeature = new Feature({ geometry: geometry });
					olFeature.setId('id');
					olFeature.set('foo', 'bar');
					olFeature.set('some', 'thing');
					olFeature.set('desc', 'description');
					olFeature.set('description', 'description');

					const featureInfo = bvvFeatureInfoProvider(olFeature, olLayer, layer);
					const wrapperElement = TestUtils.renderTemplateResult(featureInfo.content);

					expect(wrapperElement.querySelectorAll('.prop-header.ba-list-item.ba-list-item__header.propshide')).toHaveSize(1);
				});

				it('shows and hides the properties table on click', () => {
					const geoResourceId = 'geoResourceId';
					spyOn(geoResourceServiceMock, 'byId').withArgs(geoResourceId).and.returnValue(null);
					const olLayer = new VectorLayer();
					const layer = { ...createDefaultLayerProperties(), geoResourceId: geoResourceId };

					const geometry = new Point(coordinate);
					const olFeature = new Feature({ geometry: geometry });
					olFeature.setId('id');
					olFeature.set('foo', 'bar');
					olFeature.set('some', 'thing');
					olFeature.set('desc', 'description');
					olFeature.set('description', 'description');

					const featureInfo = bvvFeatureInfoProvider(olFeature, olLayer, layer);
					const wrapperElement = TestUtils.renderTemplateResult(featureInfo.content);

					expect(wrapperElement.querySelectorAll('.prop-header.ba-list-item.ba-list-item__header.propshide')).toHaveSize(1);
					const button = wrapperElement.querySelectorAll('.prop-header.ba-list-item.ba-list-item__header.propshide')[0];

					button.click();

					expect(wrapperElement.querySelectorAll('.prop-header.ba-list-item.ba-list-item__header.propshide')).toHaveSize(0);

					button.click();

					expect(wrapperElement.querySelectorAll('.prop-header.ba-list-item.ba-list-item__header.propshide')).toHaveSize(1);
				});

				it('tries to replace a property `id` by its plain text name (title)', () => {
					const geoResourceId = 'geoResourceId';
					const oafGeoResource = new OafGeoResource(geoResourceId);
					const oafCapabilities = {
						queryables: [{ id: 'some', title: 'Real Some' }]
					};
					spyOn(geoResourceServiceMock, 'byId').withArgs(geoResourceId).and.returnValue(oafGeoResource);
					spyOn(importOafServiceMock, 'getFilterCapabilitiesFromCache').withArgs(oafGeoResource).and.returnValue(oafCapabilities);
					const olLayer = new VectorLayer();
					const layer = { ...createDefaultLayerProperties(), geoResourceId: geoResourceId };
					const sanitizeSpy = spyOn(securityServiceMock, 'sanitizeHtml').and.callThrough();
					const geometry = new Point(coordinate);
					const olFeature = new Feature({ geometry: geometry });
					olFeature.setId('id');
					olFeature.set('foo', 'bar');
					olFeature.set('some', 'thing');

					const featureInfo = bvvFeatureInfoProvider(olFeature, olLayer, layer);
					const wrapperElement = TestUtils.renderTemplateResult(featureInfo.content);

					expect(wrapperElement.querySelectorAll('.prop-header.ba-list-item.ba-list-item__header ')).toHaveSize(1);
					expect(wrapperElement.querySelector('.prop-header .ba-list-item__text').innerText).toBe('olMap_handler_featureInfo_feature_properties');
					expect(wrapperElement.querySelectorAll('.props-table')).toHaveSize(1);
					expect(wrapperElement.querySelectorAll('.props-table tr')).toHaveSize(2);
					expect(wrapperElement.querySelector('.props-table tbody tr:nth-child(1) td:nth-child(1)').innerText).toContain('foo');
					expect(wrapperElement.querySelector('.props-table tbody tr:nth-child(1) td:nth-child(2)').innerText).toContain('bar');
					expect(wrapperElement.querySelector('.props-table tbody tr:nth-child(2) td:nth-child(1)').innerText).toContain('Real Some');
					expect(wrapperElement.querySelector('.props-table tbody tr:nth-child(2) td:nth-child(2)').innerText).toContain('thing');
					expect(sanitizeSpy).toHaveBeenCalledTimes(2);
					expect(sanitizeSpy.calls.all()[0].args[0]).toBe('bar');
					expect(sanitizeSpy.calls.all()[1].args[0]).toBe('thing');
				});

				it('displays nothing when no valid properties are available', () => {
					const geoResourceId = 'geoResourceId';
					spyOn(geoResourceServiceMock, 'byId').withArgs(geoResourceId).and.returnValue(null);
					const olLayer = new VectorLayer();
					const layer = { ...createDefaultLayerProperties(), geoResourceId: geoResourceId };
					const geometry = new Point(coordinate);
					const olFeature = new Feature({ geometry: geometry });
					olFeature.setId('id');
					//the following kind of properties are expected to be filtered out
					olFeature.set(asInternalProperty('myProp'), 'should_not_be_displayed');
					olFeature.set(LEGACY_INTERNAL_FEATURE_PROPERTY_KEYS[0], 'should_not_be_displayed');
					olFeature.set(EXCLUDED_COMMON_FEATURE_PROPERTY_KEYS[1], 'should_not_be_displayed');

					const featureInfo = bvvFeatureInfoProvider(olFeature, olLayer, layer);
					const wrapperElement = TestUtils.renderTemplateResult(featureInfo.content);

					expect(wrapperElement.querySelectorAll('.props-table')).toHaveSize(0);
				});
			});
		});
	});
});
