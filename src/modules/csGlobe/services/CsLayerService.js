/**
 * @module modules/csGlobe/services/CsLayerService
 */
import { UnavailableGeoResourceError } from '@src/domain/errors';
import { GeoResourceAuthenticationType, GeoResourceTypes } from '@src/domain/geoResources';
import { $injector } from '@src/injection';
import { ImageryLayer, UrlTemplateImageryProvider, WebMapServiceImageryProvider } from 'cesium';

/**
 * Converts a GeoResource to a ol layer instance.
 * @class
 * @author herrmutig
 */
export class CsLayerService {
	constructor() {}

	/**
	 *
	 * @param {string} id layerId
	 * @param {GeoResource} geoResource
	 * @param {Viewer} csViewer
	 * @throws UnavailableGeoResourceError
	 * @returns ImageryLayer
	 */
	toCsLayer(id, geoResource, csViewer) {
		const { GeoResourceService: geoResourceService, BaaCredentialService: baaCredentialService } = $injector.inject(
			'GeoResourceService',
			'VectorLayerService',
			'BaaCredentialService',
			'RtVectorLayerService'
		);

		const imageryLayerAsProxy = (geoResource, imageryLayer) => {
			const handler = {
				get: function () {
					return Reflect.get(...arguments);
				}
			};

			const proxy = new Proxy(imageryLayer, handler);
			proxy.geoResourceId = geoResource.id;
			return proxy;
		};

		// const { minZoom, maxZoom, opacity } = geoResource;

		/**
		 * Here we just check if a BA-authenticated GeoResource can access its credentials.
		 * Note: This does not mean that the concrete loader of the GeoResource actually supports BAA.
		 */
		if (geoResource.authenticationType === GeoResourceAuthenticationType.BAA && geoResource.url) {
			const credential = baaCredentialService.get(geoResource.url);
			if (!credential) {
				throw new UnavailableGeoResourceError(
					`No credential available for GeoResource with id '${geoResource.id}' and url '${geoResource.url}'`,
					geoResource.id
				);
			}
		}

		switch (geoResource.getType()) {
			case GeoResourceTypes.FUTURE: {
				// in that case we return a placeholder layer
				//	return new CsLayer(geoResource.id, new ImageryLayer());
				break;
			}
			case GeoResourceTypes.WMS: {
				const wmsImageryProvider = new WebMapServiceImageryProvider({
					url: geoResource.url,
					layers: geoResource.layers,
					parameters: {
						FORMAT: geoResource.format,
						VERSION: '1.1.1',
						...geoResource.extraParams
					}
				});

				/*
				switch (geoResource.authenticationType) {
					case GeoResourceAuthenticationType.BAA: {
						imageWmsSource.setImageLoadFunction(
							this._imageLoadFunctionProvider(geoResource.id, baaCredentialService.get(geoResource.url), geoResource.maxSize)
						);
						break;
					}
					default: {
						imageWmsSource.setImageLoadFunction(this._imageLoadFunctionProvider(geoResource.id, null, geoResource.maxSize));
					}
				} */

				// this._registerUpdateIntervalHandler(layer, geoResource, olMap);
				return imageryLayerAsProxy(geoResource, new ImageryLayer(wmsImageryProvider));
			}
			case GeoResourceTypes.XYZ: {
				const buildSubDomainPattern = (urls) => {
					const subdomain_keyword = '{s}';
					const subdomains = Array.from(
						new Set(
							urls.map((url) => {
								const domain = url.split('://')[1].split('/')[0];
								return domain.split('.')[0];
							})
						)
					);

					if (subdomains.length === urls.length) {
						return { pattern: urls[0].replace(subdomains[0], subdomain_keyword), subdomains: subdomains };
					}
					return null;
				};

				const subDomainPattern = buildSubDomainPattern(geoResource.urls);
				const urlTemplateProvider = subDomainPattern
					? new UrlTemplateImageryProvider({
							url: subDomainPattern.pattern,
							hasAlphaChannel: true,
							subdomains: subDomainPattern.subdomains
						})
					: new UrlTemplateImageryProvider({
							url: geoResource.urls[0]
						});

				return imageryLayerAsProxy(geoResource, new ImageryLayer(urlTemplateProvider));
			}
			case GeoResourceTypes.AGGREGATE: {
				//const imageryLayerCollection = new ImageryLayerCollection();
				const csLayers = geoResource.geoResourceIds.map((id) => this.toCsLayer(id, geoResourceService.byId(id), csViewer));
				return csLayers;
			}

			/*	case GeoResourceTypes.VECTOR:
			case GeoResourceTypes.STA:
			case GeoResourceTypes.OAF: {
				const vectorLayer = vectorLayerService.createLayer(id, geoResource, olMap);
				return this._registerUpdateIntervalHandler(vectorLayer, geoResource, olMap);
			}
			case GeoResourceTypes.RT_VECTOR: {
				return rtVectorLayerService.createLayer(id, geoResource, olMap);
			}

			case GeoResourceTypes.VT: {
				return new MapLibreLayer({
					id: id,
					geoResourceId: geoResource.id,
					opacity: opacity,
					minZoom: minZoom ?? undefined,
					maxZoom: maxZoom ?? undefined,
					mapLibreOptions: {
						style: geoResource.styleUrl
					}
				});
			}
 */
		}
		throw new Error(`GeoResource type "${geoResource.getType().description}" currently not supported`);
	}
}
