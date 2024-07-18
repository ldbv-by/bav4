/**
 * @module plugins/GlobalErrorPlugin
 */
import { BaPlugin } from './BaPlugin';
import { UnavailableGeoResourceError } from '../domain/errors';
import { LevelTypes, emitNotification } from '../store/notifications/notifications.action';
import { $injector } from '../injection/index';
import { throttled } from '../utils/timer';
import { removeLayerOf } from '../store/layers/layers.action';

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
	#environmentService;

	constructor() {
		super();
		const {
			TranslationService: translationService,
			GeoResourceService: geoResourceService,
			EnvironmentService: environmentService
		} = $injector.inject('TranslationService', 'GeoResourceService', 'EnvironmentService');
		this.#translationService = translationService;
		this.#geoResourceService = geoResourceService;
		this.#environmentService = environmentService;
	}
	/**
	 * @override
	 */
	async register() {
		const translate = (key, params = []) => this.#translationService.translate(key, params);

		const handleError = (error) => {
			if (error instanceof UnavailableGeoResourceError) {
				const geoR = this.#geoResourceService.byId(error.geoResourceId);
				/**
				 * If the corresponding GeoResource requires authentication we remove the layer in order to prevent
				 * opening the the authentication dialog periodically
				 */
				if (geoR?.authenticationType) {
					removeLayerOf(error.geoResourceId);
				}
				const geoResourceName = geoR?.label ?? error.geoResourceId;

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
			} else if (!this.#environmentService.isEmbeddedAsWC()) {
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
