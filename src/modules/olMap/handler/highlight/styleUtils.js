/**
 * @module modules/olMap/handler/highlight/styleUtils
 */
import { getVectorContext } from 'ol/render';
import { toContext as toCanvasContext } from 'ol/render';
import { easeIn, easeOut } from 'ol/easing';
import { Style, Icon, Stroke, Fill } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { $injector } from '../../../../injection/index';
import { MultiPolygon, Point, Polygon, SimpleGeometry } from '../../../../../node_modules/ol/geom';
import { getCenter } from '../../../../../node_modules/ol/extent';

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

const withResolutionFallback = (feature, resolution, styles, fallbackStyles) => {
	const geometry = feature.getGeometry();
	const getPixelBoxSize = (geometry) => {
		if (geometry instanceof Polygon || geometry instanceof MultiPolygon) {
			const extent = geometry.getExtent();
			const a = extent[2] - extent[0];
			const b = extent[3] - extent[1];
			const size = Math.min(a, b) / resolution;
			return size;
		}
		return null;
	};

	const getCenterPoint = (geometry) => {
		if (geometry instanceof SimpleGeometry) {
			return new Point(getCenter(geometry.getExtent()));
		}

		return geometry;
	};

	const Minimum_Visible_Pixelbox_Size = 10;
	const pixelBoxSize = getPixelBoxSize(feature.getGeometry()) ?? Infinity;
	if (Minimum_Visible_Pixelbox_Size > pixelBoxSize) {
		const baseStyle = fallbackStyles[0];
		return [new Style({ geometry: getCenterPoint(geometry), image: baseStyle.getImage() })];
	}
	return styles;
};

export const highlightTemporaryGeometryOrCoordinateFeatureStyleFunction = (feature, resolution) => {
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

	return withResolutionFallback(feature, resolution, [hlStyle], highlightTemporaryCoordinateFeatureStyleFunction());
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
