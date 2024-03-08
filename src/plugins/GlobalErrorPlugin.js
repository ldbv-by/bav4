/**
 * @module plugins/GlobalErrorPlugin
 */
import { BaPlugin } from './BaPlugin';
import { UnavailableGeoResourceError } from '../domain/errors';
import { LevelTypes, emitNotification } from '../store/notifications/notifications.action';
import { $injector } from '../injection/index';

/**
 * This plugin catches and handles all errors of type {@link BaRuntimeError}.
 *
 * @class
 * @author taulinger
 */
export class GlobalErrorPlugin extends BaPlugin {
	/**
	 * @override
	 */
	async register() {
		const { TranslationService: translationService } = $injector.inject('TranslationService');
		const translate = (key, params = []) => translationService.translate(key, params);

		const handleError = (error) => {
			if (error instanceof UnavailableGeoResourceError) {
				switch (error.httpStatus) {
					case 401:
						emitNotification(
							`${translate('global_geoResource_not_available', [error.geoResourceId, translate('global_geoResource_unauthorized')])}`,
							LevelTypes.WARN
						);
						break;
					case 403:
						emitNotification(
							`${translate('global_geoResource_not_available', [error.geoResourceId, translate('global_geoResource_forbidden')])}`,
							LevelTypes.WARN
						);
						break;
					default:
						emitNotification(`${translate('global_geoResource_not_available', [error.geoResourceId])}`, LevelTypes.WARN);
						break;
				}
			} else {
				emitNotification(`${translate('global_generic_exception')}`, LevelTypes.ERROR);
			}
		};

		window.addEventListener('error', (event) => {
			handleError(event.error);
		});

		window.addEventListener('unhandledrejection', (event) => {
			handleError(event.reason);
		});

		// Promise.reject(new UnavailableGeoResourceError('foo', 'geoId', 403));
		// throw new Error('foo');
	}
}
