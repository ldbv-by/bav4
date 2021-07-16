import { html } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat.js';
import { AbstractToolContent } from '../toolContainer/AbstractToolContent';
import { $injector } from '../../../../injection';
import css from './shareToolContent.css';
import { openModal } from '../../../modal/store/modal.action';


/**
 * @class
 * @author bakir_en
 * @author thiloSchlemmer
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
		this._tools = this._buildTools();
	}

	_buildTools() {
		const translate = (key) => this._translationService.translate(key);
		return [{
			id: 1,
			name: 'share-api',
			title: translate('toolbox_shareTool_share'),
			icon: 'share'
		}, {
			id: 2,
			name: 'mail',
			title: translate('toolbox_shareTool_mail'),
			icon: 'mail',
			href: 'mailto:?body='
		}, {
			id: 3,
			name: 'qr',
			title: translate('toolbox_shareTool_qr'),
			icon: 'qr',
			href: 'https://v.bayern.de?url='
		}];
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
			const shortenUrl = await this._urlService.shorten(url);
			return shortenUrl;
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
		const toolTemplate = (tool) => {

			const buttonContent =
				html`
					<div class="tool-container__background"></div>
					<div class="tool-container__icon ${tool.icon}"></div>  
					<div class="tool-container__button-text">${tool.title}</div>
				`;

			const onClickFunction = () => {
				if (tool.name === 'share-api') {
					if (this._isShareApiAvailable()) {
						return async () => {
							try {
								const shortUrl = await this._generateShortUrl();

								const shareData = {
									title: translate('toolbox_shareTool_title'),
									url: shortUrl,
								};

								await this._window.navigator.share(shareData);

							}
							catch (e) {
								this._root.getElementById(tool.name).classList.add('disabled_tool__button');
								console.warn('Share API not available: ' + e);
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

							if (this._window.open(tool.href + shortUrl) === null) {
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
					<div 
						id=${tool.name}
						class="tool-container__button" 
						title=${tool.title}
						role="button" tabindex="0" 
						@click=${onClickFunction()}
						target="_blank"
						> 
						${buttonContent}
					</div>`;

		};
		return html`
        <style>${css}</style>
            <div class="ba-tool-container">
				<div class="ba-tool-container__title">
						${translate('toolbox_shareTool_header')}						
				</div>
				<div class="ba-tool-container__content divider">                						     				
					<div class="tool-container__buttons">                                    
						${repeat(this._tools, (tool) => tool.id, (tool) => toolTemplate(tool))}
					</div>              
				</div>  
				<div class="ba-tool-container__title ">
				${translate('toolbox_shareTool_embed')}							
				</div>
				<div class="ba-tool-container__content">      					                  					
					<div class="tool-container__checkbox">						
						<ba-checkbox tabindex='0' @toggle=${onToggle} checked=false> 
							<span class="disclaimer-text">${translate('toolbox_shareTool_disclaimer')}</span>
							<a href='https://geoportal.bayern.de/geoportalbayern/seiten/nutzungsbedingungen.html' target="_blank" tabindex='0'>${translate('toolbox_shareTool_termsOfUse')}</a>
						</ba-checkbox>						
					</div>    
				</div>				
				<div class="ba-tool-container__actions">           
					<ba-button class="preview_button" type=primary label=${translate('toolbox_shareTool_preview')} disabled=true></ba-button>
				</div>           
            </div>	  
        `;

	}

	static get tag() {
		return 'ba-tool-share-content';
	}
}