import { loadBvvIcons } from './provider/icons.provider';
import { getBvvIconsUrl } from './provider/iconUrl.provider';
import { getBvvIconColor } from './provider/iconColor.provider';


const Svg_Encoding_B64_Flag = 'data:image/svg+xml;base64,';
const Svg_Marker_Name = 'marker';
const Svg_Marker_Content = '<svg id="marker" xmlns="http://www.w3.org/2000/svg" width="48.0" height="48.0" viewBox="0.0 0.0 48.0 48.0" fill="rgb(255,255,255)"><!-- SIL OFL 1.1 --><path d="M36.28125,19.28125Q36.28125,20.875,35.515625,23.0Q34.765625,25.125,33.828125,26.921875Q32.90625,28.71875,31.171875,31.28125Q29.453125,33.828125,28.515625,35.0625Q27.59375,36.28125,25.828125,38.609375Q24.0625,40.9375,24.0,41.0Q23.9375,40.9375,22.171875,38.609375Q20.421875,36.28125,19.484375,35.0625Q18.5625,33.828125,16.828125,31.28125Q15.109375,28.71875,14.171875,26.921875Q13.25,25.125,12.484375,23.0Q11.71875,20.875,11.71875,19.28125Q11.71875,14.375,15.53125,10.6875Q19.359375,7.0,24.0,7.0Q28.65625,7.0,32.46875,10.6875Q36.28125,14.375,36.28125,19.28125Z" /></svg>';

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
		new IconResult('triangle-stroked', '<svg id="triangle-stroked" xmlns="http://www.w3.org/2000/svg" width="34.0" height="34.0" viewBox="0.0 0.0 48.0 48.0" fill="rgb(255,255,255)"><!-- SIL OFL 1.1 --><path d="M25.59375,10.578125Q25.0625,9.65625,24.0,9.65625Q22.9375,9.65625,22.40625,10.578125L7.203125,35.625Q7.0,36.015625,7.0,36.546875Q7.0,38.34375,8.796875,38.34375L39.203125,38.34375Q41.0,38.34375,41.0,36.546875Q41.0,36.015625,40.796875,35.625L25.59375,10.578125ZM24.0,15.03125L36.15625,34.75L11.84375,34.75L24.0,15.03125Z" /></svg>'),
		new IconResult('triangle', '<svg id="triangle" xmlns="http://www.w3.org/2000/svg" width="34.0" height="34.0" viewBox="0.0 0.0 48.0 48.0" fill="rgb(255,255,255)"><!-- SIL OFL 1.1 --><path d="M25.59375,10.578125Q25.0625,9.65625,24.0,9.65625Q22.9375,9.65625,22.40625,10.578125L7.203125,35.625Q7.0,36.015625,7.0,36.546875Q7.0,38.34375,8.796875,38.34375L39.203125,38.34375Q41.0,38.34375,41.0,36.546875Q41.0,36.015625,40.796875,35.625L25.59375,10.578125Z" /></svg>'),
		new IconResult('square-stroked', '<svg id="square-stroked" xmlns="http://www.w3.org/2000/svg" width="34.0" height="34.0" viewBox="0.0 0.0 48.0 48.0" fill="rgb(255,255,255)"><!-- SIL OFL 1.1 --><path d="M9.0,7.0Q8.125,7.0,7.5625,7.5625Q7.0,8.125,7.0,8.984375L7.0,39.0Q7.0,39.875,7.5625,40.4375Q8.125,41.0,9.0,41.0L39.015625,41.0Q39.875,41.0,40.4375,40.4375Q41.0,39.875,41.0,39.0L41.0,8.984375Q41.0,8.125,40.4375,7.5625Q39.875,7.0,39.015625,7.0L9.0,7.0ZM10.984375,10.984375L37.015625,10.984375L37.015625,37.015625L10.984375,37.015625L10.984375,10.984375Z" /></svg>'),
		new IconResult('square', '<svg id="square" xmlns="http://www.w3.org/2000/svg" width="34.0" height="34.0" viewBox="0.0 0.0 48.0 48.0" fill="rgb(255,255,255)"><!-- SIL OFL 1.1 --><path d="M9.0,7.0L39.015625,7.0Q39.875,7.0,40.4375,7.5625Q41.0,8.125,41.0,8.984375L41.0,39.0Q41.0,39.875,40.4375,40.4375Q39.875,41.0,39.015625,41.0L9.0,41.0Q8.125,41.0,7.5625,40.4375Q7.0,39.875,7.0,39.0L7.0,8.984375Q7.0,8.125,7.5625,7.5625Q8.125,7.0,9.0,7.0Z" /></svg>')
	];
};
