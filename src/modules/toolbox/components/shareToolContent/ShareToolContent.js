import { html } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat.js';
import { AbstractToolContent } from '../toolContainer/AbstractToolContent';
import { $injector } from '../../../../injection';
import css from './shareToolContent.css';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { openModal } from '../../../../store/modal/modal.action';


/**
 * @class
 * @author bakir_en
 * @author thiloSchlemmer
 * @author taulinger
 */
export class ShareToolContent extends AbstractToolContent {

	constructor() {
		super();

		const { TranslationService: translationService, UrlService: urlService, ShareService: shareService, EnvironmentService: environmentService }
			= $injector.inject('TranslationService', 'UrlService', 'ShareService', 'EnvironmentService');
		this._translationService = translationService;
		this._urlService = urlService;
		this._shareService = shareService;
		this._environmentService = environmentService;
		this._window = this._environmentService.getWindow();
	}

	_getToolsDefinitions() {

		const translate = (key) => this._translationService.translate(key);
		const shareApi = {
			id: 1,
			name: 'share-api',
			title: (this._isShareApiAvailable()) ? translate('toolbox_shareTool_share') : translate('toolbox_shareTool_link'),
			icon: (this._isShareApiAvailable()) ? 'share' : 'link'
		};

		const mail = {
			id: 2,
			name: 'mail',
			title: translate('toolbox_shareTool_mail'),
			icon: 'mail',
			href: url => `mailto:?body=${url}`
		};

		const qrCode = {
			id: 3,
			name: 'qr',
			title: translate('toolbox_shareTool_qr'),
			icon: 'qr',
			href: url => this._urlService.qrCode(url)
		};

		if (this._isShareApiAvailable()) {
			return [shareApi];
		}
		else {
			if (this._environmentService.isStandalone()) {
				return [shareApi, mail];
			}
			return [shareApi, mail, qrCode];
		}
	}

	/**
	 *@private
	 */
	_isShareApiAvailable() {
		return this._window.navigator.share ? true : false;
	}

	/**
	 *@private
	 */
	async _generateShortUrl() {
		const url = this._shareService.encodeState();
		try {
			return await this._urlService.shorten(url);
		}
		catch (e) {
			console.warn('Could not shorten url: ' + e);
			return url;
		}
	}

	/**
	 * @override
	 */
	createView() {
		const translate = (key) => this._translationService.translate(key);

		const onToggle = (event) => {
			//Todo: This is workaround until all commons components / ba-button is reworked
			//then we bind a local field to the disabled property and just call render() afterwards
			this.shadowRoot.querySelector('.preview_button').disabled = !event.detail.checked;
		};

		const getToolTemplate = (tool) => {

			const buttonContent =
				html`
					<div class="tool-container__background"></div>
					<div class="tool-container__icon ${tool.icon}"></div>  
					<div class="tool-container__button-text">${tool.title}</div>
				`;

			const getOnClickFunction = () => {
				if (tool.name === 'share-api') {
					if (this._isShareApiAvailable()) {
						return async () => {
							try {
								const shortUrl = await this._generateShortUrl();

								const shareData = {
									title: translate('toolbox_shareTool_title'),
									url: shortUrl
								};

								await this._window.navigator.share(shareData);
							}
							catch (e) {
								console.warn('ShareAPI not available: ' + e);
							}
						};
					}
					else {
						return async () => {
							const shortUrl = await this._generateShortUrl();
							const title = translate('toolbox_shareTool_share');
							const content = html`<ba-sharetool-dialog .shareUrl=${shortUrl}></ba-sharetool-dialog>`;
							openModal(title, content);
						};
					}
				}
				else {
					return async () => {
						try {
							const shortUrl = await this._generateShortUrl();

							if (this._window.open(tool.href(shortUrl)) === null) {
								throw new Error('Could not open window');
							}
						}
						catch (e) {
							console.warn('Could not share content: ' + e);
						}
					};

				}
			};

			return html`				
					<button 
						id=${tool.name}
						class="tool-container__button" 
						title=${tool.title}
						role="button" tabindex="0" 
						@click=${getOnClickFunction()}
						target="_blank"
						> 		
						${buttonContent}
					</button>`;

		};
		return html`
        <style>${css}</style>
            <div class="ba-tool-container">
				<div class="ba-tool-container__title">
						${translate('toolbox_shareTool_header')}						
				</div>
				<div class="ba-tool-container__content divider">                						     				
					<div class="tool-container__buttons">                                    
						${repeat(this._getToolsDefinitions(), (tool) => tool.id, (tool) => getToolTemplate(tool))}
					</div>              
				</div>  
				<div class="ba-tool-container__title ">
				${translate('toolbox_shareTool_embed')}							
				</div>
				<div class="ba-tool-container__content">      					                  											
						<ba-checkbox class="tool-container__checkbox" tabindex='0' @toggle=${onToggle} .checked=${false}> 
							<span class="disclaimer-text">${unsafeHTML(`${translate('toolbox_shareTool_disclaimer')}`)}</span>
						</ba-checkbox>						
				</div>				
				<div class="ba-tool-container__actions">           
					<ba-button class="preview_button" .type=${'primary'} .label=${translate('toolbox_shareTool_preview')} .disabled=${true}></ba-button>
				</div>           
            </div>	  
        `;

	}

	static get tag() {
		return 'ba-tool-share-content';
	}
}
