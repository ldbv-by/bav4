/**
 * @module modules/olMap/utils/olRendering_provider
 */
import { Map as MapLibreMap } from 'maplibre-gl';

/**
 * Returns a (base64) encoded image of the current mabLibre canvas related to the specified @see {@link ol.layer}.
 * <br>
 * The requested mapExtent will be best fitted to the ratio of the specified mapSize.
 * @function
 * @type {module:modules/olMap/services/VtLayerRenderingService~layerRenderingProvider}
 */
export const mapLibreRenderingProvider = async (olLayer, mapExtent, mapSize) => {
	const getRenderContainer = (pixelSize) => {
		const renderContainer = document.createElement('div');
		renderContainer.id = 'VectorTileRenderContainer';
		renderContainer.style.width = `${pixelSize.width}px`;
		renderContainer.style.height = `${pixelSize.height}px`;

		return renderContainer;
	};

	const getRenderMap = (mapLibreOptions, mapLibreMap, renderContainer, mapExtent) => {
		return (
			mapLibreOptions.mock ??
			new MapLibreMap({
				container: renderContainer,
				style: mapLibreOptions.style,
				bearing: mapLibreMap.getBearing(),
				pitch: mapLibreMap.getPitch(),
				bounds: mapExtent,
				interactive: false,
				canvasContextAttributes: { preserveDrawingBuffer: true },
				// attributionControl: false,
				// hack to read transform request callback function
				// eslint-disable-next-line
				// @ts-ignore
				transformRequest: mapLibreMap._requestManager._transformRequestFn
			})
		);
	};
	const waitForRenderedImage = (mapLibreMap) => {
		return new Promise((resolve) => {
			const listener = () => {
				resolve(mapLibreMap.getCanvas().toDataURL());
			};

			mapLibreMap.once('idle', listener);
		});
	};

	if (olLayer.mapLibreMap && olLayer.get('mapLibreOptions')) {
		const { mapLibreMap } = olLayer;
		const mapLibreOptions = olLayer.get('mapLibreOptions');

		const dpi = 200; // fixed value, to get readable glyphs after transformation

		const actualPixelRatio = window.devicePixelRatio;
		const hidden = document.createElement('div');
		hidden.className = 'hidden-map';
		document.body.appendChild(hidden);

		// Create map container
		const renderContainer = getRenderContainer(mapSize);
		hidden.appendChild(renderContainer);
		try {
			window.devicePixelRatio = dpi / 96;

			const renderMap = getRenderMap(mapLibreOptions, mapLibreMap, renderContainer, mapExtent);
			const usedMapExtent = [
				renderMap.getBounds().getWest(),
				renderMap.getBounds().getSouth(),
				renderMap.getBounds().getEast(),
				renderMap.getBounds().getNorth()
			];

			const encodedImage = await waitForRenderedImage(renderMap);

			renderMap.remove();

			return { encodedImage: encodedImage, extent: usedMapExtent };
		} finally {
			hidden.parentNode?.removeChild(hidden);
			window.devicePixelRatio = actualPixelRatio;
			hidden.remove();
		}
	}
	return null;
};
