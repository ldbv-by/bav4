import { loadBvvIcons } from './provider/icons.provider';
import { getBvvIconsUrl } from './provider/iconUrl.provider';
import { getBvvIconColor } from './provider/iconColor.provider';


const Svg_Encoding_B64_Flag = 'data:image/svg+xml;base64,';
const Svg_Marker_Name = 'marker';
const Svg_Marker_Content = '<svg id="marker" xmlns="http://www.w3.org/2000/svg" width="34.0" height="34.0" viewBox="0.0 0.0 48.0 48.0" fill="rgb(255,255,255)"><!-- SIL OFL 1.1 --><path d="M36.28125,19.28125Q36.28125,20.875,35.515625,23.0Q34.765625,25.125,33.828125,26.921875Q32.90625,28.71875,31.171875,31.28125Q29.453125,33.828125,28.515625,35.0625Q27.59375,36.28125,25.828125,38.609375Q24.0625,40.9375,24.0,41.0Q23.9375,40.9375,22.171875,38.609375Q20.421875,36.28125,19.484375,35.0625Q18.5625,33.828125,16.828125,31.28125Q15.109375,28.71875,14.171875,26.921875Q13.25,25.125,12.484375,23.0Q11.71875,20.875,11.71875,19.28125Q11.71875,14.375,15.53125,10.6875Q19.359375,7.0,24.0,7.0Q28.65625,7.0,32.46875,10.6875Q36.28125,14.375,36.28125,19.28125Z" /></svg>';

/**
 * Service for managing icons
 *
 * This service provides a default-icon as IconResult with iconResult.id==='marker' and a list of icons based on svg-graphics as IconResult.
 * This list always contains the default-icon or a 'marker'-Icon provided by the icons.provider as first element.
 * @author thiloSchlemmer
 */
export class IconService {

	constructor(iconProvider = loadBvvIcons, urlProvider = getBvvIconsUrl, iconColorProvider = getBvvIconColor) {
		this._iconProvider = iconProvider;
		this._iconUrlProvider = urlProvider;
		this._iconColorProvider = iconColorProvider;
		this._icons = null;
	}

	default() {
		return new IconResult(Svg_Marker_Name, Svg_Marker_Content);
	}

	async _load() {
		try {
			const isMarkerIcon = (iconResult) => iconResult.id === Svg_Marker_Name;
			const providerIcons = await this._iconProvider();
			const indexOfMarkerIcon = providerIcons.findIndex(isMarkerIcon);
			this._icons = indexOfMarkerIcon < 0 ? [this.default(), ...providerIcons] : [providerIcons[indexOfMarkerIcon], ...providerIcons.filter((i) => !isMarkerIcon(i))];
		}
		catch (e) {
			this._icons = [this.default(), ...loadFallbackIcons()];
			console.warn('Icons could not be fetched from backend.', e);
		}
		return this._icons;
	}

	/**
	 * Creates a list of all icons as IconResult
	 * @returns {Array<IconResult>}
	 */
	async all() {
		if (this._icons === null) {
			return await this._load();
		}
		return this._icons;
	}


	/**
	 * Creates a URL for the specified icon
	 * @param {string} idOrBase64 the icon-id or the base64-encoded icon itself
	 * @param {Array<number>} color the rgb-color
	 * @returns {string} the URL
	 */
	getUrl(idOrBase64, color) {
		const getUrlByBase64 = (base64String) => {
			if (this._icons === null) {
				console.warn('icons not loaded yet');
				return null;
			}
			const iconResult = this._icons.find(iconResult => iconResult.base64 === base64String);

			return iconResult ? this._iconUrlProvider(iconResult.id, color) : (this.default().base64 === base64String ? this._iconUrlProvider(this.default().id, color) : null);
		};

		const getUrlByName = (id) => {
			return this._iconUrlProvider(id, color);
		};

		const getIconUrl = () => {
			return this.isLocal(idOrBase64) ? getUrlByBase64(idOrBase64) : getUrlByName(idOrBase64);
		};
		try {
			return getIconUrl();
		}
		catch (e) {
			return null;
		}
	}

	/**
	 *
	   * @param {string} url
	  */
	decodeColor(url) {
		return this._iconColorProvider(url);
	}

	/**
	 * creates a IconResult from a base64-encoded Version of an svg
	 * based on this article:
	 * https://newbedev.com/using-javascript-s-atob-to-decode-base64-doesn-t-properly-decode-utf-8-strings
	   * @param {string} id
	   * @param {string} encodedString
	   * @returns {IconResult|null} the IconResult
	  */
	fromBase64(id, encodedString) {
		if (encodedString.startsWith(Svg_Encoding_B64_Flag)) {
			const b64DecodeUnicode = (str) => {
				return decodeURIComponent(window.atob(str).split('').map(function (c) {
					return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
				}).join(''));
			};

			return new IconResult(id, b64DecodeUnicode(encodedString.replace(Svg_Encoding_B64_Flag, '')));
		}
		return null;
	}

	isLocal(iconCandidate) {
		return iconCandidate.startsWith(Svg_Encoding_B64_Flag);
	}

}


/**
* @class
* @author thiloSchlemmer
*/
export class IconResult {

	/**
	 *
	 * @param {string} id the id(name) of this IconResult
	 * @param {string} svg the content of this Icon as SVG
	 */
	constructor(id, svg) {

		this._id = id;
		this._svg = svg;
		this._base64 = this._toBase64(svg);
	}

	/**
	 * creates a base64-encoded Version of the svg for embedding-purposes
	 * based on this article:
	 * https://newbedev.com/using-javascript-s-atob-to-decode-base64-doesn-t-properly-decode-utf-8-strings
	   * @param {IconResult} iconResult
	   * @returns {string} the encoded (base64) string
	  */
	_toBase64() {
		const b64EncodeUnicode = (str) => {
			return window.btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
				(match, p1) => String.fromCharCode('0x' + p1)));
		};

		return Svg_Encoding_B64_Flag + b64EncodeUnicode(this._svg);
	}

	get id() {
		return this._id;
	}

	get svg() {
		return this._svg;
	}

	get base64() {
		return this._base64;
	}

}


/**
 * @returns {Map} with fallback icons loaded locally
 */
const loadFallbackIcons = () => {
	return [
		new IconResult('triangle-stroked', '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="rgb(255,255,255)" class="bi bi-triangle" viewBox="0 0 16 16"><!-- SIL OFL 1.1 --><path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z"/></svg>'),
		new IconResult('triangle', '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="rgb(255,255,255)" class="bi bi-triangle-fill" viewBox="0 0 16 16"><!-- SIL OFL 1.1 --><path fill-rule="evenodd" d="M7.022 1.566a1.13 1.13 0 0 1 1.96 0l6.857 11.667c.457.778-.092 1.767-.98 1.767H1.144c-.889 0-1.437-.99-.98-1.767L7.022 1.566z"/></svg > '),
		new IconResult('square-stroked', '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="rgb(255,255,255)" class="bi bi-square" viewBox="0 0 16 16"><!-- SIL OFL 1.1 --><path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/></svg>'),
		new IconResult('square', '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="rgb(255,255,255)" class="bi bi-square-fill" viewBox="0 0 16 16"><!-- SIL OFL 1.1 --><path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2z"/></svg>')
	];
};
