import { SourceType, SourceTypeName } from '../domain/sourceType';
import { bvvCapabilitiesProvider } from './provider/wmsCapabilities.provider';
import { sleep } from '../utils/timer';
import { $injector } from '../injection/index';

export class WmsCapabilitiesService {
	/**
	 * @param {wmsCapabilitiesProvider} [wmsCapabilitiesProvider = bvvCapabilitiesProvider]
	 */
	constructor(wmsCapabilitiesProvider = bvvCapabilitiesProvider) {
		this._wmsCapabilitiesProvider = wmsCapabilitiesProvider;
		this._cache = {};
		this._isLocked = false;
	}

	async getWmsLayers(geoResourceId, isAuthenticated = false) {
		const { GeoResourceService } = $injector.inject('GeoResourceService');

		const georesource = GeoResourceService.byId(geoResourceId);
		if (!georesource || !georesource._layers) {
			return [];
		}

		const filterCapabilities = (georesource, capabilities) => {
			const layerFilter = georesource._layers.split(',');
			return capabilities
				.filter((l) => layerFilter.includes(l._layers))
				.map((l) => ({
					title: l._label,
					legendUrl: l._extraParams.legendUrl,
					minResolution: l._extraParams.minResolution,
					maxResolution: l._extraParams.maxResolution
				}));
		};

		if (!(georesource._url in this._cache)) {
			while (this._isLocked) {
				await sleep(50);
			}

			// check again if url was cached in the mean time
			if (georesource._url in this._cache) {
				return filterCapabilities(georesource, this._cache[georesource._url]);
			}

			this._isLocked = true;

			let capabilities = [];
			try {
				const options = {
					isAuthenticated,
					sourceType: new SourceType(SourceTypeName.WMS, '1.1.1'),
					layers: [],
					ids: []
				};
				capabilities = await this._wmsCapabilitiesProvider(georesource._url, options);
			} catch (e) {
				console.warn(e);
				console.warn('could not load capabilities for URL ' + georesource._url);
			} finally {
				this._cache[georesource._url] = capabilities;
				this._isLocked = false;
			}
		}

		return filterCapabilities(georesource, this._cache[georesource._url]);
	}
}
