import { loadBvvIcons } from './provider/icons.provider';

/**
 * Service for managing icons
 * @author thiloSchlemmer
 */
export class IconService {

	constructor(provider = loadBvvIcons) {
		this._provider = provider;
		this._icons = null;
	}


	async _load() {
		if (this._icons === null) {
			try {
				this._icons = await this._provider();
			}
			catch (e) {
				this._icons = loadFallbackIcons();
				//console.warn('Icons could not be fetched from backend.', e);
			}
		}
		return this._icons;
	}

	async all() {
		if (this._icons === null) {
			return await this._load();
		}
		return this._icons;
	}
}


/**
* @class
* @author thiloSchlemmer
*/
export class IconResult {

	/**
	 *
	 * @param {string} name the name of this IconResult
	 * @param {string} svg the content of this Icon as SVG
	 */
	constructor(name, svg) {

		this._name = name;
		this._svg = svg;
	}

	get name() {
		return this._name;
	}

	get svg() {
		return this._svg;
	}
}


/**
 * @returns {Map} with fallback icons loaded locally
 */
const loadFallbackIcons = async () => {
	return [
		new IconResult('marker', '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="rgb(255,255,255)" class="bi bi-geo-alt-fill" viewBox="0 0 16 16"><!-- MIT License --><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg>'),
		new IconResult('triangle-stroked', '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="rgb(255,255,255)" class="bi bi-triangle" viewBox="0 0 16 16"><!-- MIT License --><path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z"/></svg>'),
		new IconResult('triangle', '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="rgb(255,255,255)" class="bi bi-triangle-fill" viewBox="0 0 16 16"><!-- MIT License --><path fill-rule="evenodd" d="M7.022 1.566a1.13 1.13 0 0 1 1.96 0l6.857 11.667c.457.778-.092 1.767-.98 1.767H1.144c-.889 0-1.437-.99-.98-1.767L7.022 1.566z"/></svg > '),
		new IconResult('square-stroked', '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="rgb(255,255,255)" class="bi bi-square" viewBox="0 0 16 16"><!-- MIT License --><path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/></svg>'),
		new IconResult('square', '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="rgb(255,255,255)" class="bi bi-square-fill" viewBox="0 0 16 16"><!-- MIT License --><path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2z"/></svg>')
	];
};
