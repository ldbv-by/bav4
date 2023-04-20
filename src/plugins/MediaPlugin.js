/**
 * @module plugins/MediaPlugin
 */
import { $injector } from '../injection';
import { BaPlugin } from './BaPlugin';
import { setIsDarkSchema, setIsMinWidth, setIsPortrait } from '../store/media/media.action';
import { MIN_WIDTH_MEDIA_QUERY, ORIENTATION_MEDIA_QUERY, PREFERS_COLOR_SCHEMA_QUERY } from '../store/media/media.reducer';

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

		// MediaQuery for 'min-width'
		const mediaQueryColorSchema = _window.matchMedia(PREFERS_COLOR_SCHEMA_QUERY);
		const handleColorSchemaChange = (e) => {
			setIsDarkSchema(e.matches);
		};
		mediaQueryColorSchema.addEventListener('change', handleColorSchemaChange);
		//initial update
		handleMinWidthChange(mediaQueryMinWidth);
	}
}
