/**
 * @module plugins/MediaPlugin
 */
import { $injector } from '../injection';
import { BaPlugin } from './BaPlugin';
import { setIsDarkSchema, setIsMinWidth, setIsPortrait, setIsHighContrast } from '../store/media/media.action';
import {
	MIN_WIDTH_MEDIA_QUERY,
	ORIENTATION_MEDIA_QUERY,
	PREFERS_COLOR_SCHEMA_QUERY,
	FORCED_COLORS_QUERY,
	PRINT_MEDIA_QUERY
} from '../store/media/media.reducer';

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

		// MediaQuery for 'dark-schema'
		const mediaQueryColorSchema = _window.matchMedia(PREFERS_COLOR_SCHEMA_QUERY);
		const handleColorSchemaChange = (e) => {
			/*
			 * On chrome, window.print() enforces the user-agent's preferred schema to be in light mode.
			 * Thus, the following prevents "theme-flipping" when the user-agent is in dark mode before printing.
			 */
			if (!_window.matchMedia(PRINT_MEDIA_QUERY).matches) {
				setIsDarkSchema(e.matches);
			}
		};
		mediaQueryColorSchema.addEventListener('change', handleColorSchemaChange);

		// MediaQuery for 'high-contrast'
		const mediaQueryForcedColor = _window.matchMedia(FORCED_COLORS_QUERY);
		const handleForcedColor = (e) => {
			setIsHighContrast(e.matches);
		};
		mediaQueryForcedColor.addEventListener('change', handleForcedColor);

		//initial update
		handleMinWidthChange(mediaQueryMinWidth);
	}
}
