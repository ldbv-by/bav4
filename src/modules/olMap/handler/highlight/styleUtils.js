/**
 * @module modules/olMap/handler/highlight/styleUtils
 */
import { getVectorContext } from 'ol/render';
import { toContext as toCanvasContext } from 'ol/render';
import { easeIn, easeOut } from 'ol/easing';
import { Style, Icon, Stroke, Fill } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { $injector } from '../../../../injection/index';

export const highlightCoordinateFeatureStyleFunction = () => {
	const { IconService: iconService } = $injector.inject('IconService');
	return [
		new Style({
			image: new Icon({
				anchor: [0.5, 1],
				anchorXUnits: 'fraction',
				anchorYUnits: 'fraction',
				src: iconService.getIconResult('highlight_default').base64
			})
		})
	];
};

export const highlightTemporaryCoordinateFeatureStyleFunction = () => {
	const { IconService: iconService } = $injector.inject('IconService');
	return [
		new Style({
			image: new Icon({
				anchor: [0.5, 1],
				anchorXUnits: 'fraction',
				anchorYUnits: 'fraction',
				src: iconService.getIconResult('highlight_default_tmp').base64
			})
		})
	];
};

export const highlightGeometryOrCoordinateFeatureStyleFunction = () => {
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

export const highlightTemporaryGeometryOrCoordinateFeatureStyleFunction = () => {
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

	return new Style({
		geometry: (feature) => feature.getGeometry(),
		renderer: (pixelCoordinates, state) => {
			const getCanvasContextRenderFunction = (state) => {
				const renderContext = toCanvasContext(state.context, { pixelRatio: 1 });
				return (geometry, fill, stroke) => {
					renderContext.setFillStrokeStyle(fill, stroke);
					renderContext.drawGeometry(geometry);
				};
			};
			const getContextRenderFunction = (state) =>
				state.customContextRenderFunction ? state.customContextRenderFunction : getCanvasContextRenderFunction(state);
			renderHighlightFeature(pixelCoordinates, state, getContextRenderFunction(state));
		}
	});
};

export const renderHighlightFeature = (pixelCoordinates, state, contextRenderFunction) => {
	const geometry = state.geometry.clone();
	const pixelRatio = state.pixelRatio;
	const pixelBox = pixelCoordinates.reduce(
		(acc, cur) => {
			return [
				acc[0] === null ? cur[0] : Math.min(acc[0], cur[0]),
				acc[1] === null ? cur[1] : Math.min(acc[1], cur[1]),
				acc[2] === null ? cur[0] : Math.max(acc[2], cur[0]),
				acc[3] === null ? cur[1] : Math.max(acc[3], cur[1])
			];
		},
		[null, null, null, null]
	);
	const a = pixelBox[2] - pixelBox[0];
	const b = pixelBox[1] - pixelBox[3];

	const fill = new Fill({ color: [255, 255, 0, 0.3] });
	const stroke = new Stroke({
		color: [255, 128, 0, 1],
		width: 6 * pixelRatio
	});

	// baseLine
	geometry.setCoordinates(pixelCoordinates);
	contextRenderFunction(geometry, fill, stroke);
};

export const highlightAnimatedCoordinateFeatureStyleFunction = () => {
	const selectStroke = new Stroke({
		color: [255, 255, 255, 1],
		width: 2
	});
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
						color: 'rgba(9, 157, 221, ' + opacity * 0.6 + ')'
					})
				})
			});

			return radius >= 11 + 10 ? [style, ...getStyles(radius - 10, opacity, index + 1)] : [style];
		};

		getStyles(radius, opacity, 0).forEach((style) => {
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
