import { html } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { repeat } from 'lit-html/directives/repeat.js';
import { BaElement } from '../../../BaElement';
import { $injector } from '../../../../injection';
import css from './shareToolContent.css';
import clipboardIcon from './assets/clipboard.svg';


/**
 * @class
 * @author bakir_en
 */
export class ShareToolContent extends BaElement {
	constructor() {
		super();

		const { TranslationService: translationService, UrlService: urlService, ShareService: shareService } 
			= $injector.inject('TranslationService', 'UrlService', 'ShareService');
		this._translationService = translationService;
		this._urlService = urlService;
		this._shareService = shareService;
		this._tools = this._buildTools();
		this._shortUrl = this._generateShortUrl();
	}

	_buildTools() {
		const translate = (key) => this._translationService.translate(key);  
		return [{ 
			id:1,
			name:'mail', 
			active:false, 
			title: translate('toolbox_shareTool_mail'),
			icon:'mail'	
		}, {
			id:2,
			name: 'qr',
			active:false, 
			title: translate('toolbox_shareTool_qr'),
			icon:'qr'
		}] 
		;
	}

	/**
	 *@private 
	 */
	async _generateShortUrl () {
		try {
			const url = this._shareService.encodeState();
			this._shortUrl = await this._urlService.shorten(url);
		}
		catch (e) {
			this._shortUrl = '';
			console.warn(e.message);
		} 
		this.render();
	}

	createView() {
		const translate = (key) => this._translationService.translate(key); 

		const onChange = (event) => {
			const checked = event.target.checked;
			if (!checked) {
				this._root.querySelector('.preview_button').classList.add('disabled-preview');
			}
			else {
				this._root.querySelector('.preview_button').classList.remove('disabled-preview');
			} 			
		};		

		const copyCoordinate = async () => {
			try {
				await this._shareService.copyToClipboard(this._shortUrl);
			}
			catch (e) {
				console.warn(e.message);
			} 
		};
				
		const toolTemplate = (tool) => {
			const classes = { 'is-active': tool.active };

			const toggle = () => {				
			// not yet implemented
			};

			return html`
            <div id=${tool.name}
                class="tool-container__button ${classMap(classes)}" 
                title=${tool.title}
                @click=${toggle}>
                <div class="tool-container__background"></div>
                <div class="tool-container__icon ${tool.icon}">
                </div>  
                <div class="tool-container__button-text">${tool.title}</div>
            </div>
            `;
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
					<div class="tool-container__input">
						<span class='icon'><ba-icon class='close' icon='${clipboardIcon}' title=${translate('map_contextMenuContent_copy_icon')} size=1.5} @click=${copyCoordinate}></ba-icon></span>
						<input class="url-input" readonly='readonly' value=${this._shortUrl}></input>	
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
						<input type="checkbox" class="embed_checkbox" @change=${onChange}></input>
						<span class="disclaimer-text">${translate('toolbox_shareTool_disclaimer')}</span>
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