
import { Style, Stroke, Fill, Circle as CircleStyle, Icon } from 'ol/style';
import locationIcon from './assets/location.svg';


export const nullStyleFunction = () => [new Style({})];

export const highlightStyleFunction = () => [new Style({
	fill: new Fill({
		color: [9, 157, 218, 0.1]
	}),
	stroke: new Stroke({
		color: [44, 90, 146, 0.9],
		width: 3
	}),
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

export const highlightFeatureStyleFunction = () => [new Style({
	image:new Icon({
		color: 'rgba(44, 90, 146, 0.9)',
		anchor:[0.5, 1],
		anchorXUnits: 'fraction',
		anchorYUnits:'fraction',
		src: locationIcon
	})
})];


export const highlightTemporaryFeatureStyleFunction = () => [new Style({
	image:new Icon({
		color: 'rgba(9, 157, 218, 0.9)',
		anchor:[0.5, 1],
		anchorXUnits: 'fraction',
		anchorYUnits:'fraction',
		src: locationIcon
	})
})];



