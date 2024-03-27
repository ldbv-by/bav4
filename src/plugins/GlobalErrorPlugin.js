/**
 * @module plugins/GlobalErrorPlugin
 */
import { BaPlugin } from './BaPlugin';
import { UnavailableGeoResourceError } from '../domain/errors';
import { LevelTypes, emitNotification } from '../store/notifications/notifications.action';
import { $injector } from '../injection/index';
import { throttled } from '../utils/timer';

/**
 * This plugin catches exceptions of type `Error` and {@link BaRuntimeError} and displays a notification.
 *
 * @class
 * @author taulinger
 */
export class GlobalErrorPlugin extends BaPlugin {
	#translationService;
	#geoResourceService;
	#errorListener;
	#unhandledrejectionListener;

	constructor() {
		super();
		const { TranslationService: translationService, GeoResourceService: geoResourceService } = $injector.inject(
			'TranslationService',
			'GeoResourceService'
		);
		this.#translationService = translationService;
		this.#geoResourceService = geoResourceService;
	}
	/**
	 * @override
	 */
	async register() {
		const translate = (key, params = []) => this.#translationService.translate(key, params);

		const handleError = (error) => {
			if (error instanceof UnavailableGeoResourceError) {
				const geoResourceName = this.#geoResourceService.byId(error.geoResourceId)?.label ?? error.geoResourceId;
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
				this._emitThrottledGenericNotification();
			}
		};

		this.#errorListener = (event) => {
			handleError(event.error);
		};

		this.#unhandledrejectionListener = (event) => {
			handleError(event.reason);
		};
		window.addEventListener('error', this.#errorListener);
		window.addEventListener('unhandledrejection', this.#unhandledrejectionListener);
	}

	_emitThrottledGenericNotification() {
		const translate = (key, params = []) => this.#translationService.translate(key, params);
		emitNotificationThrottled(() => emitNotification(`${translate('global_generic_exception')}`, LevelTypes.ERROR));
	}

	/**
	 * Mainly for test purposes.
	 */
	_unregisterListeners() {
		window.removeEventListener('error', this.#errorListener);
		window.removeEventListener('unhandledrejection', this.#unhandledrejectionListener);
	}

	static get THROTTLE_NOTIFICATION_DELAY_MS() {
		return 3000;
	}
}

const emitNotificationThrottled = throttled(GlobalErrorPlugin.THROTTLE_NOTIFICATION_DELAY_MS, (action) => action());
