import { $injector } from '../../injection';
import { BaPlugin } from '../BaPlugin';
import { setIsMinWidth, setIsPortrait, setPortrait } from './media.action';
import { MIN_WIDTH_MEDIA_QUERY, ORIENTATION_MEDIA_QUERY } from './media.reducer';


/**
 * @class
 * @author taulinger
 */
export class MediaPlugin extends BaPlugin {

	/**
	 * @override
	 */
	async register() {

		const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');

		const _window = environmentService.getWindow();

		//MediaQuery for 'orientation'
		const orientationMediaQuery = _window.matchMedia(ORIENTATION_MEDIA_QUERY);
		const handleOrientationChange = (e) => {
			setIsPortrait(e.matches);
		};
		orientationMediaQuery.addEventListener('change', handleOrientationChange);
		//initial update
		handleOrientationChange(orientationMediaQuery);

		// MediaQuery for 'min-width'
		const mediaQueryMinWidth = _window.matchMedia(MIN_WIDTH_MEDIA_QUERY);
		const handleMinWidthChange = (e) => {
			setIsMinWidth(e.matches);
		};
		mediaQueryMinWidth.addEventListener('change', handleMinWidthChange);
		//initial update
		handleMinWidthChange(mediaQueryMinWidth);
	}
}
