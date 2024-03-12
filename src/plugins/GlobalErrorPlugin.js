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
		const { TranslationService: translationService, GeoResourceService: geoResourceService } = $injector.inject(
			'TranslationService',
			'GeoResourceService'
		);
		const translate = (key, params = []) => translationService.translate(key, params);

		const handleError = (error) => {
			if (error instanceof UnavailableGeoResourceError) {
				const geoResourceName = geoResourceService.byId(error.geoResourceId)?.label ?? error.geoResourceId;
				switch (error.httpStatus) {
					case 401:
						emitNotification(
							`${translate('global_geoResource_not_available', [geoResourceName, translate('global_geoResource_unauthorized')])}`,
							LevelTypes.WARN
						);
						break;
					case 403:
						emitNotification(
							`${translate('global_geoResource_not_available', [geoResourceName, translate('global_geoResource_forbidden')])}`,
							LevelTypes.WARN
						);
						break;
					default:
						emitNotification(`${translate('global_geoResource_not_available', [geoResourceName])}`, LevelTypes.WARN);
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
	}
}
