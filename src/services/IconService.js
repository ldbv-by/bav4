/**
 * @module services/IconService
 */
import { loadBvvIcons } from './provider/icons.provider';
import { getBvvIconColor } from './provider/iconColor.provider';
import { getBvvIconUrlFactory } from './provider/iconUrl.provider';
import { $injector } from '../injection/index';

const Svg_Encoding_B64_Flag = 'data:image/svg+xml;base64,';
const Svg_Marker_Name = 'marker';
const Svg_Marker_Content =
	'<svg id="marker" xmlns="http://www.w3.org/2000/svg" width="48.0" height="48.0" viewBox="0.0 0.0 48.0 48.0" fill="rgb(255,255,255)"><!-- SIL OFL 1.1 --><path d="M36.28125,19.28125Q36.28125,20.875,35.515625,23.0Q34.765625,25.125,33.828125,26.921875Q32.90625,28.71875,31.171875,31.28125Q29.453125,33.828125,28.515625,35.0625Q27.59375,36.28125,25.828125,38.609375Q24.0625,40.9375,24.0,41.0Q23.9375,40.9375,22.171875,38.609375Q20.421875,36.28125,19.484375,35.0625Q18.5625,33.828125,16.828125,31.28125Q15.109375,28.71875,14.171875,26.921875Q13.25,25.125,12.484375,23.0Q11.71875,20.875,11.71875,19.28125Q11.71875,14.375,15.53125,10.6875Q19.359375,7.0,24.0,7.0Q28.65625,7.0,32.46875,10.6875Q36.28125,14.375,36.28125,19.28125Z" /></svg>';

/**
 * A function that returns a promise with a Array of IconResults.
 *
 * @typedef {Function} iconProvider
 * @returns {(Promise<Array<IconResult>>)}
 */

/**
 * A function that returns a rgb-color as Array of numbers from a icon-url.
 *
 * @typedef {Function} iconColorProvider
 * @param {string} iconUrl the url for a valid icon
 * @returns {Array<number>} the rgb-color as array
 */

/**
 * A function that returns a factory to create a URL from a color.
 * @param {string} iconName the icon name
 * @typedef {Function} iconUrlProvider
 * @returns {string|null}
 */

/**
 * Service for managing icons
 *
 * This service provides a default-icon as IconResult with iconResult.id==='marker' and a list of icons based on svg-graphics as IconResult.
 * This list always contains the default-icon or a 'marker'-Icon provided by the icons.provider as first element.
 * @author thiloSchlemmer
 */
export class IconService {
	constructor(iconProvider = loadBvvIcons, iconColorProvider = getBvvIconColor, iconUrlFactoryProvider = getBvvIconUrlFactory) {
		this._iconProvider = iconProvider;
		this._iconColorProvider = iconColorProvider;
		this._iconUrlFactoryProvider = iconUrlFactoryProvider;
		this._default = this._createDefault();
		this._icons = null;
		this._load();
	}

	_createDefault() {
		const matcher = (idOrUrl) => {
			return idOrUrl === Svg_Marker_Name || !!idOrUrl?.endsWith(`/${Svg_Marker_Name}`);
		};
		const urlFactoryFunction = this._iconUrlFactoryProvider(Svg_Marker_Name);

		return new IconResult(Svg_Marker_Name, Svg_Marker_Content, matcher, urlFactoryFunction);
	}

	/**
	 *	load icons in a three-stage process:
	 *
	 *  1. load the icons from a provider
	 *  2. if provided, move the marker-icon to the first position, otherwise start
	 * 	with a default marker-icon
	 *  3. if all fails: load default marker-icon and some fallbackIcons
	 *  @returns {Promise<Array<IconResult>>}
	 */
	async _load() {
		const mockedRoutingIcons = loadRoutingIcons();
		try {
			const isMarkerIcon = (iconResult) => iconResult.id === Svg_Marker_Name;
			const providerIcons = await this._iconProvider();
			const indexOfMarkerIcon = providerIcons.findIndex(isMarkerIcon);

			this._icons =
				indexOfMarkerIcon < 0
					? [this._default, ...providerIcons, ...mockedRoutingIcons]
					: [providerIcons[indexOfMarkerIcon], ...providerIcons.filter((i) => !isMarkerIcon(i)), ...mockedRoutingIcons];
		} catch (e) {
			this._icons = [this._default, ...loadFallbackIcons(), ...mockedRoutingIcons];
			console.warn('Icons could not be fetched from backend. Using fallback icons ...');
		}
		return this._icons;
	}

	/**
	 * Creates a list of all icons as IconResult
	 * @returns {Promise<Array<IconResult>>}
	 */
	async all() {
		if (this._icons === null) {
			return await this._load();
		}
		return this._icons;
	}

	/**
	 * Returns the {@see IconResult} specified by ID, Url or a base64 encoded content-string
	 * @param {string} idOrUrlOrBase64
	 * @returns {IconResult|null}
	 */
	getIconResult(idOrUrlOrBase64) {
		if (idOrUrlOrBase64 === this._default.base64) {
			return this._icons.find((iconResult) => iconResult.matches(Svg_Marker_Name));
		}

		const findLocal = (base64) => this._icons.find((iconResult) => iconResult.base64 === base64) ?? null;
		const findRemote = (idOrUrl) => this._icons.find((iconResult) => iconResult.matches(idOrUrl)) ?? null;
		return this.isLocal(idOrUrlOrBase64) ? findLocal(idOrUrlOrBase64) : findRemote(idOrUrlOrBase64);
	}

	/**
	 *
	 * @param {string} url
	 */
	decodeColor(url) {
		return this._iconColorProvider(url);
	}

	isLocal(iconCandidate) {
		return !!iconCandidate?.startsWith(Svg_Encoding_B64_Flag);
	}

	getDefault() {
		return this._default;
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
	 * @param {function(string):(boolean)} urlMatcher a function to check, when a url is matching as remote-location for this icon
	 * @param {function(Array<number>): (string)} urlProvider a function, which provides a url as remote-location for this icon with a specified rgb-color as Array<number>
	 */
	constructor(id, svg, urlMatcher = null, urlProvider = null) {
		this._id = id;
		this._svg = svg;
		this._base64 = this._toBase64();
		this._urlMatcher = urlMatcher ? urlMatcher : () => false;
		this._urlProvider = urlProvider ? urlProvider : () => null;
	}

	/**
	 * creates a base64-encoded Version of the svg for embedding-purposes
	 * based on this article:
	 * https://newbedev.com/using-javascript-s-atob-to-decode-base64-doesn-t-properly-decode-utf-8-strings
	 * @returns {string} the encoded (base64) string
	 */
	_toBase64() {
		const b64EncodeUnicode = (str) => {
			return window.btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode(Number('0x' + p1))));
		};

		return Svg_Encoding_B64_Flag + b64EncodeUnicode(this._svg);
	}

	getUrl(color) {
		return this._urlProvider(color);
	}

	matches(url) {
		return this._urlMatcher(url);
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
 * @returns {Array<IconResult>} with fallback icons loaded locally
 */
const loadFallbackIcons = () => {
	return [
		new IconResult(
			'triangle-stroked',
			'<svg id="triangle-stroked" xmlns="http://www.w3.org/2000/svg" width="34.0" height="34.0" viewBox="0.0 0.0 48.0 48.0" fill="rgb(255,255,255)"><!-- SIL OFL 1.1 --><path d="M25.59375,10.578125Q25.0625,9.65625,24.0,9.65625Q22.9375,9.65625,22.40625,10.578125L7.203125,35.625Q7.0,36.015625,7.0,36.546875Q7.0,38.34375,8.796875,38.34375L39.203125,38.34375Q41.0,38.34375,41.0,36.546875Q41.0,36.015625,40.796875,35.625L25.59375,10.578125ZM24.0,15.03125L36.15625,34.75L11.84375,34.75L24.0,15.03125Z" /></svg>'
		),
		new IconResult(
			'triangle',
			'<svg id="triangle" xmlns="http://www.w3.org/2000/svg" width="34.0" height="34.0" viewBox="0.0 0.0 48.0 48.0" fill="rgb(255,255,255)"><!-- SIL OFL 1.1 --><path d="M25.59375,10.578125Q25.0625,9.65625,24.0,9.65625Q22.9375,9.65625,22.40625,10.578125L7.203125,35.625Q7.0,36.015625,7.0,36.546875Q7.0,38.34375,8.796875,38.34375L39.203125,38.34375Q41.0,38.34375,41.0,36.546875Q41.0,36.015625,40.796875,35.625L25.59375,10.578125Z" /></svg>'
		),
		new IconResult(
			'square-stroked',
			'<svg id="square-stroked" xmlns="http://www.w3.org/2000/svg" width="34.0" height="34.0" viewBox="0.0 0.0 48.0 48.0" fill="rgb(255,255,255)"><!-- SIL OFL 1.1 --><path d="M9.0,7.0Q8.125,7.0,7.5625,7.5625Q7.0,8.125,7.0,8.984375L7.0,39.0Q7.0,39.875,7.5625,40.4375Q8.125,41.0,9.0,41.0L39.015625,41.0Q39.875,41.0,40.4375,40.4375Q41.0,39.875,41.0,39.0L41.0,8.984375Q41.0,8.125,40.4375,7.5625Q39.875,7.0,39.015625,7.0L9.0,7.0ZM10.984375,10.984375L37.015625,10.984375L37.015625,37.015625L10.984375,37.015625L10.984375,10.984375Z" /></svg>'
		),
		new IconResult(
			'square',
			'<svg id="square" xmlns="http://www.w3.org/2000/svg" width="34.0" height="34.0" viewBox="0.0 0.0 48.0 48.0" fill="rgb(255,255,255)"><!-- SIL OFL 1.1 --><path d="M9.0,7.0L39.015625,7.0Q39.875,7.0,40.4375,7.5625Q41.0,8.125,41.0,8.984375L41.0,39.0Q41.0,39.875,40.4375,40.4375Q39.875,41.0,39.015625,41.0L9.0,41.0Q8.125,41.0,7.5625,40.4375Q7.0,39.875,7.0,39.0L7.0,8.984375Q7.0,8.125,7.5625,7.5625Q8.125,7.0,9.0,7.0Z" /></svg>'
		)
	];
};

/**
 * Temporary function to mock backend implementation supplying IconResults for routing icons
 *
 * The backend should provide a icon result object with {id:string,svg:string,staticIcon:string} for routing icons.
 * This objects will be transformed to IconResult like the result of this mock-method.
 */
const loadRoutingIcons = () => {
	const { ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
	const url = configService.getValueAsPath('BACKEND_URL') + 'icons';
	const matcher = (id) => {
		return (idOrUrl) => idOrUrl === id || !!idOrUrl?.endsWith(`/${id}.png`);
	};

	const urlFactoryFunction = (url, id) => {
		return () => {
			return `${url}/${id}.png`;
		};
	};
	return [
		new IconResult(
			'rt_mocked_start',
			'<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="rgba(9, 157, 218, 1)" viewBox="0 0 16 16"><path fill="#fff" d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/><path d="M8.028 14.624s5.203-4.931 5.203-8.671c0-6.937-10.406-6.937-10.406 0 0 3.741 5.203 8.671 5.203 8.671z" style="fill:#369dc9"/><ellipse cx="8.026" cy="5.976" rx="4.06" ry="3.981" style="opacity:.15500004;fill:#000;stroke-width:1.09297371;paint-order:stroke fill markers"/><path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" style="fill:#fff" transform="translate(4.483 1.786)scale(.50331)"/></svg>',
			matcher('rt_mocked_start'),
			urlFactoryFunction(url, 'rt_start')
		),
		new IconResult(
			'rt_mocked_intermediate',
			'<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="30" height="30" viewBox="0 0 308.621 308.621"><circle cx="154.311" cy="154.311" r="142.325" style="opacity:1;fill:#369dc9;fill-opacity:1;fill-rule:nonzero;stroke:#fff;stroke-width:23.97122383;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1"/><circle cx="154.311" cy="154.311" r="92.116" style="opacity:1;fill:#fff;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:22.86945724;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1"/></svg>',
			matcher('rt_mocked_intermediate'),
			urlFactoryFunction(url, 'rt_intermediate')
		),
		new IconResult(
			'rt_mocked_destination',
			'<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="rgba(9, 157, 218, 1)" viewBox="0 0 16 16"><path fill="#fff" d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/><path d="M8.028 14.624s5.203-4.931 5.203-8.671c0-6.937-10.406-6.937-10.406 0 0 3.741 5.203 8.671 5.203 8.671z" style="fill:#369dc9"/><ellipse cx="8.026" cy="5.976" rx="4.06" ry="3.981" style="opacity:.15500004;fill:#000;stroke-width:1.09297371;paint-order:stroke fill markers"/><path d="M14.778.085A.5.5 0 0 1 15 .5V8a.5.5 0 0 1-.314.464L14.5 8l.186.464-.003.001-.006.003-.023.009a12.435 12.435 0 0 1-.397.15c-.264.095-.631.223-1.047.35-.816.252-1.879.523-2.71.523-.847 0-1.548-.28-2.158-.525l-.028-.01C7.68 8.71 7.14 8.5 6.5 8.5c-.7 0-1.638.23-2.437.477A19.626 19.626 0 0 0 3 9.342V15.5a.5.5 0 0 1-1 0V.5a.5.5 0 0 1 1 0v.282c.226-.079.496-.17.79-.26C4.606.272 5.67 0 6.5 0c.84 0 1.524.277 2.121.519l.043.018C9.286.788 9.828 1 10.5 1c.7 0 1.638-.23 2.437-.477a19.587 19.587 0 0 0 1.349-.476l.019-.007.004-.002h.001" style="fill:#fff" transform="translate(5.228 3.1)scale(.35398)"/></svg>',
			matcher('rt_mocked_destination'),
			urlFactoryFunction(url, 'rt_destination')
		)
	];
};
