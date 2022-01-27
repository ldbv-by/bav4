import { render } from 'lit-html';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { fromLonLat } from 'ol/proj';
import { getBvvFeatureInfo } from '../../../../../../../src/modules/map/components/olMap/handler/featureInfo/featureInfoItem.provider';
import { createDefaultLayer, createDefaultLayerProperties } from '../../../../../../../src/store/layers/layers.reducer';
import GeoJSON from 'ol/format/GeoJSON';
import { FeatureInfoGeometryTypes } from '../../../../../../../src/store/featureInfo/featureInfo.action';
import { $injector } from '../../../../../../../src/injection';
import { GeometryInfo } from '../../../../../../../src/modules/featureInfo/components/GeometryInfo';
import { TestUtils } from '../../../../../../test-utils';

window.customElements.define(GeometryInfo.tag, GeometryInfo);

describe('FeatureInfo provider', () => {
	const mapServiceMock = {
		getSrid: () => 3857,
		getDefaultGeodeticSrid: () => 25832
	};

	const coordinateServiceMock = {
		stringify() { },
		toLonLat() { }
	};

	const unitsServiceMock = {
		formatDistance: (distance) => {
			return distance + ' m';
		},

		formatArea: (area) => {
			return area + ' m²';
		} };



	beforeAll(() => {
		TestUtils.setupStoreAndDi();
		$injector
			.registerSingleton('MapService', mapServiceMock)
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('CoordinateService', coordinateServiceMock)
			.registerSingleton('UnitsService', unitsServiceMock);

	});
	const coordinate = fromLonLat([11, 48]);

	describe('Bvv featureInfo provider', () => {

		describe('and no suitable properties are available', () => {

			it('returns null', () => {

				const layer = createDefaultLayer('foo');
				const feature = new Feature({ });

				const featureInfo = getBvvFeatureInfo(feature, layer);

				expect(featureInfo).toBeNull();
			});
		});

		describe('and suitable properties are available', () => {

			it('returns a LayerInfo item', () => {
				const target = document.createElement('div');
				const layerProperties = { ...createDefaultLayerProperties(), label: 'foo' };
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
					title: 'name - foo', content: jasmine.any(Object),
					geometry: expectedFeatureInfoGeometry
				});
				expect(target.innerText).toBe('');
				expect(target.querySelector('ba-geometry-info')).toBeTruthy();

				//no name property, but description property
				feature = new Feature({ geometry: new Point(coordinate) });
				feature.set('description', 'description');

				featureInfo = getBvvFeatureInfo(feature, layerProperties);
				render(featureInfo.content, target);

				expect(featureInfo).toEqual({
					title: 'foo', content: jasmine.any(Object),
					geometry: expectedFeatureInfoGeometry
				});
				expect(target.innerText).toBe('description');
				expect(target.querySelector('ba-geometry-info')).toBeTruthy();


				//no name property, but desc property
				feature = new Feature({ geometry: new Point(coordinate) });
				feature.set('desc', 'desc');

				featureInfo = getBvvFeatureInfo(feature, layerProperties);
				render(featureInfo.content, target);

				expect(featureInfo).toEqual({
					title: 'foo', content: jasmine.any(Object),
					geometry: expectedFeatureInfoGeometry
				});
				expect(target.innerText).toBe('desc');
				expect(target.querySelector('ba-geometry-info')).toBeTruthy();

			});
		});
	});
});
