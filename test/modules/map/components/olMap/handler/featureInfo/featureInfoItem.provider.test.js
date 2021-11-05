import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { fromLonLat } from 'ol/proj';
import { getBvvFeatureInfo } from '../../../../../../../src/modules/map/components/olMap/handler/featureInfo/featureInfoItem.provider';
import { createDefaultLayer, createDefaultLayerProperties } from '../../../../../../../src/store/layers/layers.reducer';
import GeoJSON from 'ol/format/GeoJSON';
import { FeatureInfoGeometryTypes } from '../../../../../../../src/store/featureInfo/featureInfo.action';

describe('FeatureInfo provider', () => {

	const coordinate = fromLonLat([11, 48]);

	describe('Bvv featureInfo provider', () => {

		describe('and no suitable properties are available', () => {

			it('returns null', () => {

				const layer = createDefaultLayer('foo');
				const feature = new Feature({ geometry: new Point(coordinate) });

				const featureInfo = getBvvFeatureInfo(feature, layer);

				expect(featureInfo).toBeNull();
			});
		});

		describe('and suitable properties are available', () => {

			it('returns a LayerInfo item', () => {

				const layer = { ...createDefaultLayerProperties(), label: 'foo' };
				const geometry = new Point(coordinate);
				let feature = new Feature({ geometry: geometry });
				feature.set('name', 'name');
				const expectedFeatureInfoGeometry = { data: new GeoJSON().writeGeometry(geometry), geometryType: FeatureInfoGeometryTypes.GEOJSON };

				let featureInfo = getBvvFeatureInfo(feature, layer);

				expect(featureInfo).toEqual({
					title: 'name - foo', content: null,
					geometry: expectedFeatureInfoGeometry
				});

				//no name property, but description property
				feature = new Feature({ geometry: new Point(coordinate) });
				feature.set('description', 'description');

				featureInfo = getBvvFeatureInfo(feature, layer);

				expect(featureInfo).toEqual({
					title: 'foo', content: 'description',
					geometry: expectedFeatureInfoGeometry
				});

				//no name property, but desc property
				feature = new Feature({ geometry: new Point(coordinate) });
				feature.set('desc', 'desc');

				featureInfo = getBvvFeatureInfo(feature, layer);

				expect(featureInfo).toEqual({
					title: 'foo', content: 'desc',
					geometry: expectedFeatureInfoGeometry
				});
			});
		});
	});
});
