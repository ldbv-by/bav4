/**
 * @module modules/share/components/assistChip/SharePositionChip
 */
import { html } from 'lit-html';
import { QueryParameters } from '../../../../domain/queryParameters';
import { $injector } from '../../../../injection/index';
import { openModal } from '../../../../store/modal/modal.action';
import { LevelTypes, emitNotification } from '../../../../store/notifications/notifications.action';
import { isCoordinate } from '../../../../utils/checks';
import { AbstractAssistChip } from '../../../chips/components/assistChips/AbstractAssistChip';
import shareIcon from './assets/share.svg';

const Update = 'update';

/**
 * A chip to share a specified position with a link. The link refers
 * to the webapp itself with highlight-feature on the specified position.
 * @class
 * @property {module:domain/coordinateTypeDef~Coordinate} center The center coordinate of the shared position
 * @author thiloSchlemmer
 */
export class SharePositionChip extends AbstractAssistChip {
	constructor() {
		super({ center: null });
		const {
			TranslationService: translationService,
			EnvironmentService: environmentService,
			UrlService: urlService,
			ShareService: shareService
		} = $injector.inject('TranslationService', 'EnvironmentService', 'UrlService', 'ShareService');
		this._translationService = translationService;
		this._environmentService = environmentService;
		this._shareService = shareService;
		this._urlService = urlService;
	}

	update(type, data, model) {
		switch (type) {
			case Update:
				return {
					...model,
					center: data
				};
		}
	}

	getIcon() {
		return shareIcon;
	}

	getLabel() {
		const translate = (key) => this._translationService.translate(key);
		return translate('map_assistChips_share_position_label');
	}

	isVisible() {
		const { center } = this.getModel();
		return isCoordinate(center);
	}

	async onClick() {
		const { center } = this.getModel();
		const useShareApi = this._environmentService.getWindow().navigator.share ? true : false;

		const url = await this._buildShareUrl(center);
		const shareAction = useShareApi ? (url) => this._shareUrlWithApi(url) : (url) => this._shareUrlDialog(url);
		shareAction(url);
	}

	async _buildShareUrl(center) {
		const extraParams = { [QueryParameters.CROSSHAIR]: true };
		const url = new URL(this._shareService.encodeStateForPosition({ center: center }, extraParams));
		try {
			const shortUrl = await this._urlService.shorten(url.toString());
			return shortUrl;
		} catch (error) {
			console.warn('Could not shorten url', error);
			return url;
		}
	}

	async _shareUrlWithApi(url) {
		try {
			const content = {
				// title-property is absent; browser automatically creates a meaningful title
				url: url
			};
			await this._environmentService.getWindow().navigator.share(content);
		} catch (error) {
			emitNotification(this._translationService.translate('map_assistChips_share_position_api_failed'), LevelTypes.WARN);
		}
	}

	async _shareUrlDialog(url) {
		const content = html`<ba-share-content .urls=${url}></ba-share-content>`;

		openModal(this._translationService.translate('map_assistChips_share_position_label'), content);
	}

	set center(value) {
		if (isCoordinate(value)) {
			this.signal(Update, value);
		}
	}

	static get tag() {
		return 'ba-share-position-chip';
	}
}
