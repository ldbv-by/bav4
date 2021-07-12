import { html } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat.js';
import { BaElement } from '../../../BaElement';
import { $injector } from '../../../../injection';
import css from './shareToolContent.css';
import { openModal } from '../../../modal/store/modal.action';


/**
 * @class
 * @author bakir_en
 */
export class ShareToolContent extends BaElement {
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
			name: 'mail',
			available: true,
			title: translate('toolbox_shareTool_mail'),
			icon: 'mail',
			href: 'mailto:?body='
		}, {
			id: 2,
			name: 'qr',
			available: true,
			title: translate('toolbox_shareTool_qr'),
			icon: 'qr',
			href: 'https://v.bayern.de?url='
		}, {
			id: 3,
			name: 'share-api',
			available: this._isShareApiAvailable(),
			title: translate('toolbox_shareTool_share'),
			icon: 'share'
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
			const checked = event.detail.checked;
			if (!checked) {
				this._root.querySelector('.preview_button').classList.add('disabled-preview');
			}
			else {
				this._root.querySelector('.preview_button').classList.remove('disabled-preview');
			}
		};


		const onClick = async () => {
			const shortUrl = await this._generateShortUrl();
			const title = translate('toolbox_shareTool_share');
			const content = html`<ba-sharetool-dialog .shareUrl=${shortUrl}></ba-sharetool-dialog>`;
			openModal(title, content);
		};

		const toolTemplate = (tool) => {
			if (!tool.available) {
				return;
			}

			const activateShareApi = async () => {
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

			const shareContent = async () => {
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

			const buttonContent =
				html`
					<div class="tool-container__background"></div>
					<div class="tool-container__icon ${tool.icon}"></div>  
					<div class="tool-container__button-text">${tool.title}</div>
				`;

			return html`
			${tool.name === 'share-api'
					? html`
				<div 
					id=${tool.name}
					class="tool-container__button" 
					title=${tool.title}
					role="button" 
					tabindex="0" 
					@click="${activateShareApi}" 
					target="_blank"
					> 
					${buttonContent}
				</div>`
					: html`
				<div 
					id=${tool.name}
					class="tool-container__button" 
					title=${tool.title}
					role="button" tabindex="0" 
					@click=${shareContent}
					target="_blank"
					> 
					${buttonContent}
				</div>`
				}`;
		};

		return html`
        <style>${css}</style>
            <div class="container">
                <div class="ba-tool-container__item">
					<div>
						<span class="tool-container__header">
							${translate('toolbox_shareTool_header')}
						</span>
					</div>      
						<div class="tool-container__buttons">                                    
							${repeat(this._tools, (tool) => tool.id, (tool) => toolTemplate(tool))}
						</div>   
					<div class="tool-container__buttons-secondary">                         						 
						<button class='modal_button' @click=${onClick} >
							${translate('toolbox_shareTool_button_modal')}
						</button>
					</div>            
					<div class="tool-container__embed"> 
						<span>
							${translate('toolbox_shareTool_embed')}
						</span>
					</div>
					<div class="tool-container__buttons-secondary">                         						 
						<button class='preview_button disabled-preview'>                            
							${translate('toolbox_shareTool_preview')}
						</button>
					</div> 
					<div class="tool-container__checkbox">
						<div><ba-checkbox  checked=false tabindex='0' @toggle=${onToggle}> 
							<span class="disclaimer-text">${translate('toolbox_shareTool_disclaimer')}</span>
							<a href='https://geoportal.bayern.de/geoportalbayern/seiten/nutzungsbedingungen.html' target="_blank" tabindex='0'>${translate('toolbox_shareTool_termsOfUse')}</a>
						</ba-checkbox></div>
					</div>               
                </div>
            </div>	  
        </div>
        `;

	}

	static get tag() {
		return 'ba-tool-share-content';
	}
}