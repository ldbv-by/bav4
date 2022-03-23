import { html } from 'lit-html';
import { $injector } from '../../../../injection';
import { QueryParameters } from '../../../../services/domain/queryParameters';
import { openModal } from '../../../../store/modal/modal.action';
import { MvuElement } from '../../../MvuElement';

const Update = 'update';
/**
 * Common ToolContent-Component to manage state of sharing usercreated drawings and measurements
 * @author thiloSchlemmer
 */
export class ShareButton extends MvuElement {
	constructor() {
		super({ fileSaveResult: null });

		const { TranslationService: translationService, EnvironmentService: environmentService, UrlService: urlService, ShareService: shareService } = $injector.inject('TranslationService', 'EnvironmentService', 'UrlService', 'ShareService');
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
					fileSaveResult: data
				};
		}
	}


	createView(model) {
		const { fileSaveResult } = model;
		const translate = (key) => this._translationService.translate(key);
		const isValidForSharing = (fileSaveResult) => {
			if (!fileSaveResult) {
				return false;
			}
			if (!fileSaveResult.adminId || !fileSaveResult.fileId) {
				return false;
			}
			return true;
		};
		const buildShareUrl = async (id) => {
			const extraParams = { [QueryParameters.LAYER]: id };
			const url = this._shareService.encodeState(extraParams);
			try {
				const shortUrl = await this._urlService.shorten(url);
				return shortUrl;
			}
			catch (error) {
				console.warn('Could shortener-service is not working:', error);
				return url;
			}


		};
		const generateShareUrls = async () => {
			const forAdminId = await buildShareUrl(fileSaveResult.adminId);
			const forFileId = await buildShareUrl(fileSaveResult.fileId);
			return { adminId: forAdminId, fileId: forFileId };

		};
		if (isValidForSharing(fileSaveResult)) {

			const title = translate('toolbox_measureTool_share');
			const onClick = async () => {
				const shareUrls = await generateShareUrls();
				openModal(title, html`<ba-share-content .shareurls=${shareUrls}></ba-share-content>`);
			};
			return html`<ba-button id='share'  
			data-test-id class="tool-container__button" 
			.label=${title}
			@click=${onClick}></ba-button>`;
		}
		return html.nothing;
	}

	/**
	 * @property {FileSaveResult} value The FileSaveResult, which contains the data to generate share-urls
	 */
	set share(value) {
		this.signal(Update, value);
	}

	static get tag() {
		return 'ba-share-button';
	}
}
