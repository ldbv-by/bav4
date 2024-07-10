/**
 * @module modules/chips/components/assistChips/ShareDataChip
 */
import { html } from 'lit-html';
import { QueryParameters } from '../../../../domain/queryParameters';
import { $injector } from '../../../../injection/index';
import { openModal } from '../../../../store/modal/modal.action';
import { AbstractAssistChip } from './AbstractAssistChip';
import shareIcon from './assets/share.svg';
import { setQueryParams } from '../../../../utils/urlUtils';

const Update = 'update';
/**
 * A chip to share a stored file. The file is stored by the backend and
 * consist of drawings or measurements created within the application.
 * @class
 * @extends {AbstractAssistChip}
 * @author thiloSchlemmer
 */
export class ShareDataChip extends AbstractAssistChip {
	constructor() {
		super({ fileSaveResult: null });
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
		this.observe(
			(state) => state.shared,
			(data) => this.signal(Update, data)
		);
	}

	update(type, data, model) {
		switch (type) {
			case Update:
				return {
					...model,
					fileSaveResult: data.fileSaveResult
				};
		}
	}

	getIcon() {
		return shareIcon;
	}

	getLabel() {
		const translate = (key) => this._translationService.translate(key);
		return translate('chips_assist_chip_share_stored_data');
	}

	isVisible() {
		const { fileSaveResult } = this.getModel();

		return !!(fileSaveResult?.adminId && fileSaveResult?.fileId);
	}

	async onClick() {
		const { fileSaveResult } = this.getModel();
		const translate = (key) => this._translationService.translate(key);
		const title = translate('chips_assist_chip_share_stored_data');
		const buildShareUrl = async (id) => {
			const extraParams = { [QueryParameters.LAYER]: id };
			/**
			 * Todo: For now as a workaround for https://github.com/ldbv-by/bav4/issues/2478 we always set an existing TOOL_ID query parameter to "",
			 * but in the future it does make sense to activate the draw or measurement tool when the file is shared with admin privileges.
			 */
			const url = setQueryParams(this._shareService.encodeState(extraParams), { [QueryParameters.TOOL_ID]: '' });
			try {
				const shortUrl = await this._urlService.shorten(url);
				return shortUrl;
			} catch (error) {
				console.warn('Could not shorten url', error);
				return url;
			}
		};
		const generateShareUrls = async () => {
			const forAdminId = await buildShareUrl(fileSaveResult.adminId);
			const forFileId = await buildShareUrl(fileSaveResult.fileId);
			return { adminId: forAdminId, fileId: forFileId };
		};

		const urls = await generateShareUrls();
		openModal(title, html`<ba-share-content .urls=${urls}></ba-share-content>`);
	}

	static get tag() {
		return 'ba-share-data-chip';
	}
}
