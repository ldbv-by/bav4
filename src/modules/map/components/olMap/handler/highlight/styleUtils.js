
import { Style, Icon, Stroke, Fill } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import locationIcon from './assets/location.svg';
import tempLocationIcon from './assets/temporaryLocation.svg';



export const highlightCoordinateFeatureStyleFunction = () => [new Style({
	image: new Icon({
		anchor: [0.5, 1],
		anchorXUnits: 'fraction',
		anchorYUnits: 'fraction',
		src: locationIcon
	})
})];


export const highlightTemporaryCoordinateFeatureStyleFunction = () => [new Style({
	image: new Icon({
		anchor: [0.5, 1],
		anchorXUnits: 'fraction',
		anchorYUnits: 'fraction',
		src: tempLocationIcon
	})
})];


export const highlightGeometryFeatureStyleFunction = () => {

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

	return [selectStyle];
};

export const highlightTemporaryGeometryFeatureStyleFunction = () => {

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

	return [hlStyle];
};


