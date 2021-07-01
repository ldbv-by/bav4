
import { Style, Stroke, Fill, Circle as CircleStyle, Icon } from 'ol/style';
import locationIcon from './assets/location.svg';
import tempLocationIcon from './assets/temporaryLocation.svg';


export const nullStyleFunction = () => [new Style({})];

export const highlightCircleStyleFunction = () => [new Style({
	image: new CircleStyle({
		radius: 6,
		fill: new Fill({
			color: [9, 157, 218, 0.9],
		}),
		stroke: new Stroke({
			color: [44, 90, 146, 1],
			width: 2,
		}),
	}),
})];

export const highlightTemporaryCircleStyleFunction = () => [new Style({

	image: new CircleStyle({
		radius: 4,
		fill: new Fill({
			color: [44, 90, 146, 0.9],
		}),
		stroke: new Stroke({
			color: [9, 157, 218, 1],
			width: 3,
		}),
	}),
})];

export const highlightFeatureStyleFunction = () => [new Style({
	image: new Icon({
		color: 'rgba(44, 90, 146, 0.9)',
		anchor: [0.5, 1],
		anchorXUnits: 'fraction',
		anchorYUnits: 'fraction',
		src: locationIcon
	})
})];


export const highlightTemporaryFeatureStyleFunction = () => [new Style({
	image: new Icon({
		color: 'rgba(9, 157, 218, 0.9)',
		anchor: [0.5, 1],
		anchorXUnits: 'fraction',
		anchorYUnits: 'fraction',
		src: tempLocationIcon
	})
})];



