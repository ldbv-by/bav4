
import { SearchResult } from './SearchResult';
import { $injector } from '../../../injection';

/**
 * SearchService implementation which uses the BVV "Ortssuchdienst auf Adressen".
 * @see https://geodatenonline.bayern.de/geodatenonline/seiten/osd_adressen
 * @class
 * @author aul
 */
export class BvvSearchService {

	constructor() {
		const { ConfigService } = $injector.inject('ConfigService');
		this._configService = ConfigService;
		const { HttpService } = $injector.inject('HttpService');
		this._httpService = HttpService;
	}

	async getData(query) {
		try {

			const api_key = this._configService.getValue('SEARCH_SERVICE_API_KEY');
			const regex = /(<([^>]+)>)/ig;
			const source = await this._httpService.fetch(`https://geoservices.bayern.de/services/ortssuche/v1/adressen/${query}?srid=4326&api_key=${api_key}`);
			const raw = await source.json();
			const data = raw.results.map(o => {
				return new SearchResult(o.attrs.label.replace(regex, ''), o.attrs.label, 'adress', [o.attrs.x, o.attrs.y]);
			});
			return data;
		}
		catch (e) {
			console.error(e);
			return [];
		}
	}
}