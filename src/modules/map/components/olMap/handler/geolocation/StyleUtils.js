import { Style, Stroke, Fill, Circle as CircleStyle } from 'ol/style';

export const accuracyStyleFunction = () => [new Style({
	fill: new Fill({
		color: [255, 0, 0, 0.1]
	}),
	stroke: Stroke({
		color: [255, 0, 0, 0.9],
		width: 3
	})
})];
export const positionStyleFunction = () => [new Style({
	image: new CircleStyle({
		radius6: 6,
		fill: new Fill({
			color: [255, 0, 0, 0.1],
		}),
		stroke: new Stroke({
			color: [255, 0, 0, 0.9],
			width: 2,
		}),
	}),
})];