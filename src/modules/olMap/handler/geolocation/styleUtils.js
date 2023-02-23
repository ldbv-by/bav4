import { Style, Stroke, Fill, Circle as CircleStyle } from 'ol/style';
import { easeOut } from 'ol/easing';
import { getVectorContext } from 'ol/render';

export const geolocationStyleFunction = () => [
	new Style({
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
				color: [255, 0, 0, 0.9]
			}),
			stroke: new Stroke({
				color: [255, 255, 255, 1],
				width: 2
			})
		})
	})
];

export const nullStyleFunction = () => [new Style({})];

/**
 * inspired by https://openlayers.org/en/latest/examples/feature-animation.html
 * creates a AnimationFunction for the postrender-event of a {ol.Layer}
 *
 * @param {ol.Map} map the map where the animation is injected
 * @param {ol.Feature} feature the feature (Point-Feature) which is used as center to draw the animation
 * @param {function} endCallback the callback, when the animation ends
 * @returns {function} the animation function
 */
export const createAnimateFunction = (map, feature, endCallback) => {
	const duration = 1000; // 1 second
	const start = Date.now();

	const animate = (event) => {
		const vectorContext = getVectorContext(event);
		const frameState = event.frameState;
		const flashGeom = feature.getGeometry().clone();
		const elapsed = frameState.time - start;
		// don't allow negative values for radius
		const elapsedRatio = (elapsed >= 0 ? elapsed : 0) / duration;
		// radius will be 6 at start and 30 at end.
		const radius = easeOut(elapsedRatio) * 24 + 6;
		const opacity = easeOut(1 - elapsedRatio);

		const style = new Style({
			image: new CircleStyle({
				radius: radius,
				stroke: new Stroke({
					color: 'rgba(255, 0, 0, ' + opacity + ')',
					width: 0.25 + opacity
				})
			})
		});

		vectorContext.setStyle(style);
		vectorContext.drawGeometry(flashGeom);
		if (elapsed > duration) {
			endCallback();
			return;
		}
		// tell OpenLayers to continue postrender animation
		map.render();
	};
	return animate;
};
