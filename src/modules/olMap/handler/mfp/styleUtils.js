import { Style, Stroke, Fill } from 'ol/style';
import { getVectorContext } from 'ol/render';
import { DEVICE_PIXEL_RATIO } from 'ol/has';

export const mfpBoundaryStyleFunction = () => [new Style({
	fill: new Fill({
		color: [255, 0, 0, 0.1]
	}),
	stroke: new Stroke({
		color: [255, 0, 0, 0.9],
		width: 3
	})
})];

export const nullStyleFunction = () => [new Style({})];

export const createMapMaskFunction = (map, feature) => {

	const renderMask = (event) => {
		console.log(event);
		const vectorContext = getVectorContext(event);

		const geometryToMask = feature.getGeometry().clone();

		const size = this._map.getSize();
		const width = size[0] * DEVICE_PIXEL_RATIO;
		const height = size[1] * DEVICE_PIXEL_RATIO;


		vectorContext.beginPath();
		// the outside polygon -> clockwise
		vectorContext.moveTo(0, 0);
		vectorContext.lineTo(width, 0);
		vectorContext.lineTo(width, height);
		vectorContext.lineTo(0, height);
		vectorContext.lineTo(0, 0);
		vectorContext.closePath();

		// the hole (inner polygon) -> counter-clockwise
		const hole = geometryToMask.getCoordinates(true);
		hole.forEach((element, index, array) => {
			const pixel = map.getPixelFromCoordinate(element);
			if (index === 0) { // first
				vectorContext.moveTo(pixel[0], pixel[1]);
			}
			if (index === array.length - 1) { //last
				const firstElement = map.getPixelFromCoordinate(array[0]);
				vectorContext.lineTo(pixel[0], pixel[1]);
				vectorContext.lineTo(firstElement[0], firstElement[1]);
			}
			vectorContext.lineTo(pixel[0], pixel[1]);
		});
		vectorContext.closePath();

		vectorContext.fillStyle = 'rgba(0,5,25,0.75)';
		vectorContext.fill();

		// tell OpenLayers to continue postrender animation
		map.render();
	};
	return renderMask;

};
