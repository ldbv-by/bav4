/**
 * @module modules/olMap/handler/highlight/styleUtils
 */
import { getVectorContext } from 'ol/render';
import { easeIn, easeOut } from 'ol/easing';
import { Style, Icon, Stroke, Fill } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { $injector } from '../../../../injection/index';
import { GeometryCollection, MultiLineString, MultiPoint, MultiPolygon, Point, SimpleGeometry } from 'ol/geom';
import { getCenter } from 'ol/extent';
import { round } from '../../../../utils/numberUtils';

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

export const highlightExtentFeatureStyleFunction = (feature, resolution) => {
	// Define your fixed corner size in pixels
	const pixelLen = 15;
	const style = [
		new Style({
			renderer(coordinates, state) {
				const context = state.context;
				// coordinates contains the screen pixel coordinates: [topLeft, bottomLeft, bottomRight, topRight, topLeft]
				const ring = coordinates[0];

				const p1 = ring[0]; // Top-Left
				const p2 = ring[1]; // Bottom-Left
				const p3 = ring[2]; // Bottom-Right
				const p4 = ring[3]; // Top-Right

				context.save();

				// 1. Draw the semi-transparent background fill first
				context.beginPath();
				context.moveTo(p1[0], p1[1]);
				context.lineTo(p2[0], p2[1]);
				context.lineTo(p3[0], p3[1]);
				context.lineTo(p4[0], p4[1]);
				context.closePath();

				context.fillStyle = 'rgba(9, 157, 221, 0.3)';
				context.fill();

				// 2. Draw the inverted/swapped inward-pointing L-shaped corners
				context.beginPath();
				context.strokeStyle = 'rgb(242, 31, 186)';
				context.lineWidth = 3;
				context.lineCap = 'square';

				// --- Bottom-Left Corner (Points Inward: Down and Right) ---
				context.moveTo(p1[0], p1[1] - pixelLen);
				context.lineTo(p1[0], p1[1]);
				context.lineTo(p1[0] + pixelLen, p1[1]);

				// --- Top-Left Corner (Points Inward: Up and Right) ---
				context.moveTo(p2[0], p2[1] + pixelLen);
				context.lineTo(p2[0], p2[1]);
				context.lineTo(p2[0] + pixelLen, p2[1]);

				// --- Top-Right Corner (Points Inward: Up and Left) ---
				context.moveTo(p3[0], p3[1] + pixelLen);
				context.lineTo(p3[0], p3[1]);
				context.lineTo(p3[0] - pixelLen, p3[1]);

				// --- Bottom-Right Corner (Points Inward: Down and Left) ---
				context.moveTo(p4[0], p4[1] - pixelLen);
				context.lineTo(p4[0], p4[1]);
				context.lineTo(p4[0] - pixelLen, p4[1]);

				context.stroke();
				context.restore();
			}
		})
	];

	return withResolutionFallback(feature, resolution, style, highlightTemporaryCoordinateFeatureStyleFunction(), pixelLen);
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

const withResolutionFallback = (feature, resolution, styles, fallbackStyles, minPixelBoxSize = 10) => {
	const geometry = feature.getGeometry();
	const getPixelBoxSize = (geometry) => {
		const getSize = (extent) => {
			const a = extent[2] - extent[0];
			const b = extent[3] - extent[1];
			const size = Math.min(a, b) / resolution;
			return size;
		};

		if (geometry instanceof GeometryCollection) {
			return geometry.getGeometries().reduce((sum, cur) => sum + getSize(cur.getExtent()), 0);
		}

		if (geometry instanceof SimpleGeometry) {
			return getSize(geometry.getExtent());
		}
		return null;
	};

	const getCenterPoint = (geometry) => {
		if (geometry instanceof GeometryCollection) {
			return new MultiPoint(geometry.getGeometries().map((l) => getCenter(l.getExtent())));
		}

		if (geometry instanceof MultiLineString) {
			return new MultiPoint(geometry.getLineStrings().map((l) => getCenter(l.getExtent())));
		}

		if (geometry instanceof MultiPolygon) {
			return new MultiPoint(geometry.getPolygons().map((l) => getCenter(l.getExtent())));
		}

		// everything else should be a SimpleGeometry
		return new Point(getCenter(geometry.getExtent()));
	};

	const pixelBoxSize = getPixelBoxSize(feature.getGeometry()) ?? Infinity;
	if (minPixelBoxSize > pixelBoxSize) {
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
		const opacity = Math.max(round(easeIn(1 - elapsedRatio), 1), 0);

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
