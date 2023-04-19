/**
 * @module modules/olMap/utils/feature_provider
 */
import { $injector } from '../../../injection';

/**
 * Provides features from sources loaded over http
 * @param {Extent} extent
 * @param {Resolution} resolution
 * @param {ProjectionLike} targetProj
 */
export const load = async function (extent, resolution, targetProj) {
	//no arrow function here, cause "this" is bound to the source

	const vectorSource = this;
	const { HttpService: httpService } = $injector.inject('HttpService');

	const url = vectorSource.getUrl();
	const result = await httpService.get(url, {
		timeout: 2000
	});

	switch (result.status) {
		case 200: {
			const raw = await result.text();
			const features = vectorSource
				.getFormat()
				.readFeatures(raw)
				.filter((f) => !!f.getGeometry()) // filter out features without a geometry. Todo: let's inform the user
				.map((f) => {
					// we have to transform the features!
					f.getGeometry().transform('EPSG:4326', targetProj);
					return f;
				});
			vectorSource.addFeatures(features);
			break;
		}
		default:
			console.error(`Source could not be loaded: Http-Status ${result.status}`);
	}
};
