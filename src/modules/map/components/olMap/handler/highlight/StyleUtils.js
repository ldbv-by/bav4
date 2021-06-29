import { Style, Stroke, Fill, Circle as CircleStyle } from 'ol/style';


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


