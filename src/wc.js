import { WcEvents } from './domain/wcEvents';
import { PublicComponent } from './modules/public/components/PublicComponent';

/**
 * At first we have to load the configuration script
 */
const scriptEl = document.createElement('script');
scriptEl.setAttribute('src', document.currentScript.src.replace('wc.js', 'config.js'));
document.body.appendChild(scriptEl);

/**
 * After that we're able to import the web-component chunk, cause configuration (backend url, etc) is present now
 */
scriptEl.addEventListener('load', () => {
	// see https://webpack.js.org/guides/code-splitting/#dynamic-imports
	// eslint-disable-next-line promise/prefer-await-to-then, import/no-unresolved
	import('@chunk/public-web-component').then(() => {
		if (window.document.querySelectorAll(PublicComponent.tag).length > 1) {
			alert('Currently only one <bayern-atlas> element per page is supported');
		}
		window.dispatchEvent(new CustomEvent(WcEvents.LOAD));
	});
});
