
import { getVectorContext } from 'ol/render';
import { easeOut } from 'ol/easing';
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

export const highlightAnimatedCoordinateFeatureStyleFunction = () => {

	const selectStroke = new Stroke({
		color: [50, 128, 0, 1],
		width: 3
	});

	const selectFill = new Fill({
		color: [50, 255, 0, 0.3]
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

export const createAnimation = (map, feature, endCallback) => {
	const duration = 1500; // 1 second
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

		const getStyles = (radius, opacity, index) => {
			const style = new Style({
				image: new CircleStyle({
					radius: radius,
					stroke: new Stroke({
						color: index === 0 ? 'rgba(3, 3, 3, 0.2)' : 'rgba(255, 255, 255, ' + opacity + ')',
						width: 0.4 + opacity
					}),
					fill: new Fill({
						color: 'rgba(9, 157, 221, ' + opacity + ')'
					})
				})
			});


			return radius >= 6 + 8 ? [style, ...getStyles(radius - 8, opacity, index + 1)] : [style];
		};

		getStyles(radius, opacity, 0).forEach(style => {
			vectorContext.setStyle(style);
			vectorContext.drawGeometry(flashGeom);
		});


		if (elapsed > duration) {
			endCallback();
			return;
			// TODO: a alternative solution, when the caller wants to implement a permanent
			// blinking until a defined end is reached, so the endCallback must return true/false
			// if (endCallback()) {
			// 	return;
			// }
			// else {
			// 	start = Date.now();
			// }

		}
		// tell OpenLayers to continue postrender animation
		map.render();
	};
	return animate;
};


