
import { getVectorContext } from 'ol/render';
import { easeIn, easeOut } from 'ol/easing';
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

	const selectStroke = new Stroke(
		{
			color: [255, 255, 255, 1],
			width: 2
		}
	);
	const selectFill = new Fill({
		color: [9, 157, 221, 1]
	});
	const selectStyle = new Style({
		fill: selectFill,
		image: new CircleStyle({
			radius: 9,
			fill: selectFill,
			stroke: selectStroke
		})
	});

	return [selectStyle];
};

export const createAnimation = (map, feature) => {
	const state = {
		duration: 1500,
		start: Date.now()
	};
	const animate = (event) => {
		const vectorContext = getVectorContext(event);
		const frameState = event.frameState;
		const flashGeom = feature.getGeometry().clone();
		const elapsed = frameState.time - state.start;
		// don't allow negative values for radius
		const elapsedRatio = (elapsed >= 0 ? elapsed : 0) / state.duration;
		// radius will be 3 at start and 20 at end.
		const radius = easeOut(elapsedRatio) * 50 + 10;
		const opacity = easeIn(1 - elapsedRatio);

		const getStyles = (radius, opacity, index) => {
			const style = new Style({
				image: new CircleStyle({
					radius: radius,
					fill: new Fill({
						color: 'rgba(9, 157, 221, ' + (opacity) * 0.6 + ')'
					})
				})
			});


			return radius >= 11 + 10 ? [style, ...getStyles(radius - 10, opacity, index + 1)] : [style];
		};

		getStyles(radius, opacity, 0).forEach(style => {
			vectorContext.setStyle(style);
			vectorContext.drawGeometry(flashGeom);
		});
		const staticStyle = highlightAnimatedCoordinateFeatureStyleFunction();
		vectorContext.setStyle(staticStyle[0]);
		vectorContext.drawGeometry(flashGeom);


		if (elapsed > state.duration) {
			state.start = Date.now();
		}
		// tell OpenLayers to continue postrender animation
		map.render();
	};
	return animate;
};


