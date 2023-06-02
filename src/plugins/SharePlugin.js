/**
 * @module plugins/SharePlugin
 */
import { html } from 'lit-html';
import { Tools } from '../domain/tools';
import { $injector } from '../injection';
import { emitNotification, LevelTypes } from '../store/notifications/notifications.action';
import { observe } from '../utils/storeUtils';
import { BaPlugin } from './BaPlugin';

/**
 * Checks if the current map contains layers that cannot be shared, e.g. locally imported data like KML, and GPX files.
 * If so the user will be informed by a notification.
 * @class
 */
export class SharePlugin extends BaPlugin {
	constructor() {
		super();
		const { TranslationService: translationService, GeoResourceService: geoResourceService } = $injector.inject(
			'TranslationService',
			'GeoResourceService'
		);
		this._translationService = translationService;
		this._geoResourceService = geoResourceService;
	}

	/**
	 * @override
	 * @param {Store} store
	 */
	async register(store) {
		const checkAndEmit = () => {
			const state = store.getState();

			const {
				layers: { active: activeLayers }
			} = state;

			const grLabels = activeLayers
				.filter((l) => !l.constraints.hidden)
				.map((l) => this._geoResourceService.byId(l.geoResourceId))
				.filter((gr) => gr.hidden)
				.map((gr) => gr.label);

			if (grLabels.length) {
				const warningContent = html`<div>
					<p style="color: var(--text3);">${this._translationService.translate('global_share_unsupported_geoResource_warning')}</p>
					<ul style="margin-left:2em;">
						${grLabels.map((label) => html`<li style="color: var(--text3);">${label}</li>`)}
					</ul>
				</div>`;

				emitNotification(warningContent, LevelTypes.WARN);
			}
		};

		const onToolChanged = (toolId) => {
			if (toolId === Tools.SHARE) {
				checkAndEmit();
			}
		};

		observe(store, (state) => state.tools.current, onToolChanged, false);
	}
}
