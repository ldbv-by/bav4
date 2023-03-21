import { html } from 'lit-html';
import { $injector } from '../injection';
import { emitNotification, LevelTypes } from '../store/notifications/notifications.action';
import { ToolId } from '../store/tools/tools.action';
import { observe } from '../utils/storeUtils';
import { BaPlugin } from './BaPlugin';

/**
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

			const warningContent = html`<div>
				<p style="color: var(--text3);">${this._translationService.translate('global_share_unsupported_geoResource_warning')}</p>
				<ul style="margin-left:2em;">
					${grLabels.map((label) => html`<li style="color: var(--text3);">${label}</li>`)}
				</ul>
			</div>`;

			if (grLabels.length) {
				emitNotification(warningContent, LevelTypes.WARN);
			}
		};

		const onToolChanged = (toolId) => {
			if (toolId === ToolId.SHARING) {
				checkAndEmit();
			}
		};

		observe(store, (state) => state.tools.current, onToolChanged, false);
	}
}
