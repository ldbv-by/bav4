import { Style, Stroke, Fill, Circle as CircleStyle } from 'ol/style';

export const geolocationStyleFunction = () => [new Style({
	fill: new Fill({
		color: [255, 0, 0, 0.1]
	}),
	stroke: new Stroke({
		color: [255, 0, 0, 0.9],
		width: 3
	}),
	image: new CircleStyle({
		radius: 6,
		fill: new Fill({
			color: [255, 0, 0, 0.9],
		}),
		stroke: new Stroke({
			color: [255, 255, 255, 1],
			width: 2,
		}),
	}),
})];