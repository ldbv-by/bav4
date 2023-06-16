/**
 * @module modules/map/components/assistChips/SharePositionChip
 */
import { GlobalCoordinateRepresentations } from '../../../../domain/coordinateRepresentation';
import { QueryParameters } from '../../../../domain/queryParameters';
import { $injector } from '../../../../injection/index';
import { LevelTypes, emitNotification } from '../../../../store/notifications/notifications.action';
import { isCoordinate } from '../../../../utils/checks';
import { AbstractAssistChip } from '../../../chips/components/assistChips/AbstractAssistChip';
import shareIcon from './assets/share.svg';

const Update = 'update';

/**
 * A chip to share a specified position with a link. The link refers
 * to the webapp itself with highlight-feature on the specified position.
 * @class@author thiloSchlemmer
 */
export class SharePositionChip extends AbstractAssistChip {
	constructor() {
		super({ position: null });
		const {
			TranslationService: translationService,
			EnvironmentService: environmentService,
			UrlService: urlService,
			CoordinateService: coordinateService,
			MapService: mapService,
			ShareService: shareService
		} = $injector.inject('TranslationService', 'EnvironmentService', 'UrlService', 'CoordinateService', 'MapService', 'ShareService');
		this._translationService = translationService;
		this._environmentService = environmentService;
		this._shareService = shareService;
		this._coordinateService = coordinateService;
		this._mapService = mapService;
		this._urlService = urlService;
	}

	update(type, data, model) {
		switch (type) {
			case Update:
				return {
					...model,
					position: data
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
		const { position } = this.getModel();
		return isCoordinate(position);
	}

	async onClick() {
		const { position } = this.getModel();
		const useShareApi = this._environmentService.getWindow().navigator.share ? true : false;

		const { digits, code } =
			this._mapService
				.getCoordinateRepresentations(position)
				.filter((cr) => cr.code)
				.filter((cr) => cr.code === this._mapService.getLocalProjectedSrid())[0] ?? GlobalCoordinateRepresentations.WGS84;

		const transformedPosition = this._coordinateService.transform(position, this._mapService.getSrid(), code).map((n) => n.toFixed(digits));

		const buildShareUrl = async (position) => {
			const extraParams = { [QueryParameters.CROSSHAIR]: true };
			const url = new URL(this._shareService.encodeState(extraParams));
			const searchParams = new URLSearchParams(url.search);
			searchParams.set(QueryParameters.CENTER, position);
			url.search = searchParams.toString();
			try {
				const shortUrl = await this._urlService.shorten(url.toString());
				return shortUrl;
			} catch (error) {
				console.warn('Could not shorten url', error);
				return url;
			}
		};
		const url = await buildShareUrl(transformedPosition);
		const shareAction = useShareApi ? (url) => this._shareUrlWithApi(url) : (url) => this._copyUrlToClipboard(url);
		shareAction(url);
	}

	async _shareUrlWithApi(url) {
		const translate = (key) => this._translationService.translate(key);

		try {
			await this._environmentService.getWindow().navigator.share({
				title: translate('map_assistChips_share_position_link_title'),
				url: url
			});
		} catch (error) {
			console.error('Share-API failed:', error);
		}
	}

	async _copyUrlToClipboard(url) {
		const translate = (key) => this._translationService.translate(key);
		try {
			await this._shareService.copyToClipboard(url);
			emitNotification(`"${url}" ${translate('map_assistChips_share_position_clipboard_success')}`, LevelTypes.INFO);
		} catch {
			const message = translate('map_assistChips_share_position_clipboard_error');
			emitNotification(message, LevelTypes.WARN);
			console.warn('Clipboard API not available');
		}
	}

	set position(value) {
		if (isCoordinate(value)) {
			this.signal(Update, value);
		}
	}

	static get tag() {
		return 'ba-share-position-chip';
	}
}
