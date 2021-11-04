
import { highlightCoordinateFeatureStyleFunction, highlightGeometryFeatureStyleFunction, highlightTemporaryCoordinateFeatureStyleFunction } from '../../../../../../../src/modules/map/components/olMap/handler/highlight/styleUtils';
import { Point } from 'ol/geom';
import { Feature } from 'ol';
import { Fill, Icon, Stroke, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import locationIcon from '../../../../../../../src/modules/map/components/olMap/handler/highlight/assets/location.svg';
import tempLocationIcon from '../../../../../../../src/modules/map/components/olMap/handler/highlight//assets/temporaryLocation.svg';


describe('styleUtils', () => {

	describe('highlightCoordinateStyleFunction', () => {

		it('should return a style function', () => {
			const style = new Style({
				image: new Icon({
					anchor: [0.5, 1],
					anchorXUnits: 'fraction',
					anchorYUnits: 'fraction',
					src: locationIcon
				})
			});
			const styles = highlightCoordinateFeatureStyleFunction();

			expect(styles).toEqual([style]);
		});
	});

	describe('highlightCoordinateTemporaryFeatureStyleFunction', () => {

		it('should return a style function', () => {
			const style = new Style({
				image: new Icon({
					anchor: [0.5, 1],
					anchorXUnits: 'fraction',
					anchorYUnits: 'fraction',
					src: tempLocationIcon
				})
			});

			const styles = highlightTemporaryCoordinateFeatureStyleFunction();

			expect(styles).toEqual([style]);
		});
	});

	describe('highlightGeometryFeatureStyleFunction', () => {

		it('should return a style function', () => {

			const selectStroke = new Stroke({
				color: [255, 128, 0, 1],
				width: 3
			});

			const selectFill = new Fill({
				color: [255, 255, 0, 0.3]
			});
			const selectStyle = new Style({
				fill: selectFill,
				stroke: selectStroke,
				image: new CircleStyle({
					radius: 10,
					fill: selectFill,
					stroke: selectStroke
				})
			});

			const styles = highlightGeometryFeatureStyleFunction();

			expect(styles).toEqual([selectStyle]);
		});
	});
});
