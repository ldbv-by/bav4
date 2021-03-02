import { Style, Stroke, Fill, Circle as CircleStyle } from 'ol/style';
import { easeOut } from 'ol/easing';
import { getVectorContext } from 'ol/render';

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

/**
 * inspired by https://openlayers.org/en/latest/examples/feature-animation.html
 * @param {ol.Map} map the map where the animation is injected
 * @param {ol.Feature} feature the feature (Point-Feature) which is used as center to draw the animation
 * @param {function} endCallback the callback, to finalize listeners etc.
 */
export const  getFlashAnimation = (map, feature, endCallback) => {
	const duration = 1000; // 1 second
	let start = +new Date();	
  
	const  animate = (event) =>  {
		var vectorContext = getVectorContext(event);
		var frameState = event.frameState;
		var flashGeom = feature.getGeometry().clone();
		var elapsed = frameState.time - start;
		var elapsedRatio = elapsed / duration;
		// radius will be 6 at start and 30 at end.
		var radius = easeOut(elapsedRatio) * 24 + 6;
		var opacity = easeOut(1 - elapsedRatio);
	
		var style = new Style({
			image: new CircleStyle({
				radius: radius,
				stroke: new Stroke({
					color: 'rgba(255, 0, 0, ' + opacity + ')',
					width: 0.25 + opacity,
				}),
			}),
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
