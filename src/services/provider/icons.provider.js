/**
 * @module services/provider/icons_provider
 */
import { $injector } from '../../injection';
import { IconResult } from '../IconService';

const loadRoutingIcons = () => {
	const { ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
	const url = configService.getValueAsPath('BACKEND_URL') + 'icons';
	const matcher = (id) => {
		return (idOrUrl) => idOrUrl === id || !!idOrUrl?.endsWith(`/${id}.png`);
	};

	const urlFactoryFunction = (url, id) => {
		const resourceUrl = `${url}/${id}.png`;
		return () => resourceUrl;
	};
	return [
		new IconResult(
			'rt_start',
			'<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="rgba(9, 157, 218, 1)" viewBox="0 0 16 16"><path fill="#fff" d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/><path d="M8.028 14.624s5.203-4.931 5.203-8.671c0-6.937-10.406-6.937-10.406 0 0 3.741 5.203 8.671 5.203 8.671z" style="fill:#369dc9"/><ellipse cx="8.026" cy="5.976" rx="4.06" ry="3.981" style="opacity:.15500004;fill:#000;stroke-width:1.09297371;paint-order:stroke fill markers"/><path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" style="fill:#fff" transform="translate(4.483 1.786)scale(.50331)"/></svg>',
			matcher('rt_start'),
			urlFactoryFunction(url, 'rt_start'),
			false
		),
		new IconResult(
			'rt_intermediate',
			'<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="30" height="30" viewBox="0 0 308.621 308.621"><circle cx="154.311" cy="154.311" r="142.325" style="opacity:1;fill:#369dc9;fill-opacity:1;fill-rule:nonzero;stroke:#fff;stroke-width:23.97122383;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1"/><circle cx="154.311" cy="154.311" r="92.116" style="opacity:1;fill:#fff;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:22.86945724;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1"/></svg>',
			matcher('rt_intermediate'),
			urlFactoryFunction(url, 'rt_intermediate'),
			false
		),
		new IconResult(
			'rt_destination',
			'<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="rgba(9, 157, 218, 1)" viewBox="0 0 16 16"><path fill="#fff" d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/><path d="M8.028 14.624s5.203-4.931 5.203-8.671c0-6.937-10.406-6.937-10.406 0 0 3.741 5.203 8.671 5.203 8.671z" style="fill:#369dc9"/><ellipse cx="8.026" cy="5.976" rx="4.06" ry="3.981" style="opacity:.15500004;fill:#000;stroke-width:1.09297371;paint-order:stroke fill markers"/><path d="M14.778.085A.5.5 0 0 1 15 .5V8a.5.5 0 0 1-.314.464L14.5 8l.186.464-.003.001-.006.003-.023.009a12.435 12.435 0 0 1-.397.15c-.264.095-.631.223-1.047.35-.816.252-1.879.523-2.71.523-.847 0-1.548-.28-2.158-.525l-.028-.01C7.68 8.71 7.14 8.5 6.5 8.5c-.7 0-1.638.23-2.437.477A19.626 19.626 0 0 0 3 9.342V15.5a.5.5 0 0 1-1 0V.5a.5.5 0 0 1 1 0v.282c.226-.079.496-.17.79-.26C4.606.272 5.67 0 6.5 0c.84 0 1.524.277 2.121.519l.043.018C9.286.788 9.828 1 10.5 1c.7 0 1.638-.23 2.437-.477a19.587 19.587 0 0 0 1.349-.476l.019-.007.004-.002h.001" style="fill:#fff" transform="translate(5.228 3.1)scale(.35398)"/></svg>',
			matcher('rt_destination'),
			urlFactoryFunction(url, 'rt_destination'),
			false
		)
	];
};

/**
 * Bvv specific implementation of {@link module:services/IconService~iconProvider}
 * @function
 * @type {module:services/IconService~iconProvider}
 */
export const loadBvvIcons = async () => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
	const url = configService.getValueAsPath('BACKEND_URL') + 'icons';
	const result = await httpService.get(`${url}/available`);
	if (result.ok) {
		const icons = [];
		const payload = await result.json();
		const routingIcons = loadRoutingIcons();

		const matcher = (id) => {
			return (idOrUrl) => idOrUrl === id || !!idOrUrl?.endsWith(`/${id}.png`);
		};

		const urlFactoryFunction = (id) => {
			return (color) => `${url}/${color[0]},${color[1]},${color[2]}/${id}.png`;
		};

		payload.forEach((bvvIcon) => {
			const { id, svg } = bvvIcon;

			if (svg) {
				icons.push(new IconResult(id, svg, matcher(id), urlFactoryFunction(id)));
			} else {
				const candidate = routingIcons.find((iconResult) => iconResult.id === id);
				if (candidate) {
					icons.push(candidate);
				} else {
					console.warn(`Could not find or replace a svg resource for icon '${id}'`);
				}
			}
		});

		if (icons.length === 0) {
			console.warn('The backend provides no icons');
		}
		return icons;
	}
	throw new Error('Icons could not be retrieved');
};
