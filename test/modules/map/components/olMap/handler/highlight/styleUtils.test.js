
import { createAnimation, highlightAnimatedCoordinateFeatureStyleFunction, highlightCoordinateFeatureStyleFunction, highlightGeometryFeatureStyleFunction, highlightTemporaryCoordinateFeatureStyleFunction, highlightTemporaryGeometryFeatureStyleFunction } from '../../../../../../../src/modules/map/components/olMap/handler/highlight/styleUtils';
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

	describe('highlightTemporaryGeometryFeatureStyleFunction', () => {

		it('should return a style function', () => {

			const hlStroke = new Stroke({
				color: [255, 128, 0, 1],
				width: 6
			});

			const hlFill = new Fill({
				color: [255, 128, 0, 1]
			});

			const hlStyle = new Style({
				fill: hlFill,
				stroke: hlStroke,
				image: new CircleStyle({
					radius: 10,
					fill: hlFill,
					stroke: hlStroke
				})
			});

			const styles = highlightTemporaryGeometryFeatureStyleFunction();

			expect(styles).toEqual([hlStyle]);
		});
	});

	describe('highlightAnimatedCoordinateFeatureStyleFunction', () => {

		it('should return a style function', () => {

			const selectStroke = new Stroke({
				color: [50, 128, 0, 1],
				width: 3
			});

			const selectFill = new Fill({
				color: [50, 255, 0, 0.3]
			});

			const style = new Style({
				fill: selectFill,
				stroke: selectStroke,
				image: new CircleStyle({
					radius: 10,
					fill: selectFill,
					stroke: selectStroke
				})
			});
			const styles = highlightAnimatedCoordinateFeatureStyleFunction();

			expect(styles).toEqual([style]);
		});
	});

	describe('createAnimation', () => {

		it('should return an animation function', () => {

			expect(createAnimation()).toEqual((() => { })());
		});
	});
});
