/**
 * @module modules/chips/components/assistChips/ShareChip
 */
import { html } from 'lit-html';
import { QueryParameters } from '../../../../domain/queryParameters';
import { $injector } from '../../../../injection/index';
import { openModal } from '../../../../store/modal/modal.action';
import { LevelTypes, emitNotification } from '../../../../store/notifications/notifications.action';
import { isCoordinate } from '../../../../utils/checks';
import { AbstractAssistChip } from './AbstractAssistChip';
import shareIcon from './assets/share.svg';

const Update = 'update';

/**
 * A chip to share the current state by a generated URL, optionally centered at a specified position.
 * If the center is given, the link refers to the webapp containing the current state but centered and showing a highlight-feature at the specified position.
 * Without a given center, the link refers to the webapp containing the current state at the current position.
 * @class
 * @extends {AbstractAssistChip}
 * @property {module:domain/coordinateTypeDef~Coordinate} [center] The center coordinate of the shared position
 * @author thiloSchlemmer
 */
export class ShareChip extends AbstractAssistChip {
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
		const { center } = this.getModel();
		const translate = (key) => this._translationService.translate(key);
		return center ? translate('chips_assist_chip_share_position_label') : translate('chips_assist_chip_share_state_label');
	}

	isVisible() {
		return true;
	}

	async onClick() {
		const { center } = this.getModel();
		const useShareApi = this._environmentService.getWindow().navigator.share ? true : false;
		const translate = (key) => this._translationService.translate(key);
		const title = center ? translate('chips_assist_chip_share_position_label') : translate('chips_assist_chip_share_state_label');
		const url = await this._buildShareUrl(center);
		const shareAction = useShareApi ? (url) => this._shareUrlWithApi(url) : (url) => this._shareUrlDialog(url, title);
		shareAction(url);
	}

	async _buildShareUrl(center) {
		const getStateAndOverridePosition = () => {
			const extraParams = { [QueryParameters.CROSSHAIR]: true };
			return new URL(this._shareService.encodeStateForPosition({ center: center }, extraParams));
		};

		const getState = () => {
			return new URL(this._shareService.encodeState());
		};

		const url = center ? getStateAndOverridePosition() : getState();
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
			emitNotification(this._translationService.translate('chips_assist_chip_share_position_api_failed'), LevelTypes.WARN);
		}
	}

	async _shareUrlDialog(url, title) {
		const content = html`<ba-share-content .urls=${url}></ba-share-content>`;

		openModal(title, content);
	}

	set center(value) {
		if (isCoordinate(value)) {
			this.signal(Update, value);
		}
	}

	static get tag() {
		return 'ba-share-chip';
	}
}
