import { html } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { classMap } from 'lit-html/directives/class-map.js';
import { BaElement } from '../../../BaElement';
import { $injector } from '../../../../injection';
import clipboardIcon from './assets/clipboard.svg';
import shareIcon from './assets/share.svg';
import { finish, remove, reset } from '../../../map/store/measurement.action';

import css from './measureToolContent.css';
import { QueryParameters } from '../../../../services/domain/queryParameters';
/**
 * @class
 * @author thiloSchlemmer
 */
export class MeasureToolContent extends BaElement {

	constructor() {
		super();

		const { TranslationService: translationService, EnvironmentService: environmentService, UnitsService: unitsService, UrlService:urlService, ShareService:shareService } = $injector.inject('TranslationService', 'EnvironmentService', 'UnitsService', 'UrlService', 'ShareService');
		this._translationService = translationService;
		this._environmentService = environmentService;
		this._unitsService = unitsService;
		this._shareService = shareService;
		this._urlService = urlService;
		this._tool = {
			name: 'measure',
			active: false,
			title: 'toolbox_measureTool_measure',
			icon: 'measure'
		};
		this._isFirstMeasurement = true;
		this._shareAsReadOnly = false;
		this._shareUrls = null;
	}

	createView(state) {
		const translate = (key) => this._translationService.translate(key);
		const { active, statistic } = state;
		this._tool.active = active;
		const areaClasses = { 'is-area': statistic.area > 0 };
	
		const buttons = this._getButtons(state);
		const shareContainer = this._getShareContainer(state);
		const subText = this._getSubText(state);
		const buildPackage = (measurement) => {
			const splitted = measurement.split(' ');
			if (splitted.length === 2) {
				return { value:splitted[0], unit:splitted[1] };
			}
			return { value:splitted[0], unit:'?' };
		}; 
		const formattedDistance = this._unitsService.formatDistance(statistic.length, 2);		
		const formattedArea = this._unitsService.formatArea(statistic.area, 2);
		const formattedDistancePackage = buildPackage(formattedDistance);
		const formattedAreaPackage = buildPackage(formattedArea);
		const onCopyDistanceToClipboard = async () => this._copyValueToClipboard(formattedDistance);
		const onCopyAreaToClipboard = async () => this._copyValueToClipboard(formattedDistance);

		return html`
        <style>${css}</style>
            	<div class="ba-tool-container__item">
                	<div class="tool-container__header">  
						<span class='tool-container__header-text'>                
							${translate('toolbox_measureTool_header')}                   
						</span>
                	</div>      
					<div class="tool-container__text">				
					<div class='tool-container__text-item'>
						<span>
						${translate('toolbox_measureTool_stats_length')}:						
						</span>						
						<span class='prime-text-value'>${formattedDistancePackage.value}</span>		
						<span class='prime-text-unit'>${formattedDistancePackage.unit}</span>									
						<span class='copy'>
							<ba-icon class='close' icon='${clipboardIcon}' title=${translate('map_contextMenuContent_copy_icon')} size=1.5 @click=${onCopyDistanceToClipboard}} >
							</ba-icon>
						</span>											
					</div>
					<div class='tool-container__text-item area ${classMap(areaClasses)}'>
						<span>
							${translate('toolbox_measureTool_stats_area')}:		
						</span>						
						<span class='prime-text-value'>${formattedAreaPackage.value}</span>
						<span class='prime-text-unit'>${unsafeHTML(formattedAreaPackage.unit)}</span>
						<span class='copy'>
							<ba-icon class='close' icon='${clipboardIcon}' title=${translate('map_contextMenuContent_copy_icon')} size=1.5} @click=${onCopyAreaToClipboard}>
							</ba-icon>
						</ba-icon>
					</span>			
					</div>
					${shareContainer}
					<div class='sub-text'>${subText}</div>
				</div>				
				<div class="tool-container__buttons-secondary">                         						 
					${buttons}
					</div>                
            	</div>	  
            </div>	  
     
        `;

	}

	_getButtons(state) {
		const buttons = [];
		const translate = (key) => this._translationService.translate(key);
		const { active, statistic, mode } = state;
		this._isFirstMeasurement = this._isFirstMeasurement ? (statistic.length === 0 ? true : false) : false;
		this._tool.active = active;
	
		const getButton = (id, title, onClick) => {
			return html`<button id=${id} 
								class="tool-container__button" 
								title=${title}
								@click=${onClick}>${title}</button>`;
		};
		// Start-New-Button
		const startNewCompliantModes = ['draw', 'modify', 'select'];
		const finishAllowed = (this._environmentService.isTouch() ? statistic.length > 0 : statistic.area > 0) && mode === 'draw';
		if (startNewCompliantModes.includes(mode) ) {
			let id = 'startnew';
			let title = translate('toolbox_measureTool_start_new');
			let onClick =  () => reset();
			// alternate Finish-Button			
			if (finishAllowed) {
				id = 'finish';
				title = translate('toolbox_drawTool_finish');
				onClick =  () => finish();				
			}
			
			buttons.push(getButton(id, title, onClick));
		}

		// Remove-Button
		const removeAllowed = mode === 'draw' ? (this._environmentService.isTouch() ? statistic.length > 0 : statistic.area > 0 ) : statistic.length > 0 ;
		if (removeAllowed) {
			const id = 'remove';
			const title = mode === 'draw' ? translate('toolbox_measureTool_delete_point') : translate('toolbox_measureTool_delete_measure');
			const onClick =  () => remove();
			buttons.push(getButton(id, title, onClick));
		}

		
		return buttons;
	}

	_getShareContainer(state) {
		const { fileSaveResult } = state;
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
		

		const buildShareUrl =  async(id) => {
			const extraParams = { [QueryParameters.LAYER]:id };
			const url = this._shareService.encodeState(extraParams);
			const shortUrl = await this._urlService.shorten(url);
			return shortUrl;
		};

		if (isValidForSharing(fileSaveResult)) {
			const toggleShareContentClick = async () => {
				if (this._shareUrls) {
					this._shareUrls = null;
					this.render();
				}
				else {
					generateShareUrls();
				}
			};
			
			const generateShareUrls = async () => {
				const forAdminId = await buildShareUrl(fileSaveResult.adminId);
				const forFileId = await buildShareUrl(fileSaveResult.fileId);
				this._shareUrls = { adminId:forAdminId, fileId:forFileId };
				this.render();
			};

			const shareContent = this._getShareContent();	
		
			return html`<div class='share_container'>
			<ba-icon class='close share_init' icon='${shareIcon}' title=${translate('toolbox_measureTool_share_start')} size=1.5} @click=${toggleShareContentClick}>
				</ba-icon>
				${shareContent}
			</div>`;
		}
		return html.nothing;
	}

	_getShareContent() {
		const translate = (key) => this._translationService.translate(key);
		const onToggle = (event) => {
			this._shareAsReadOnly = event.detail.checked;
			this.render();
		};
		if (this._shareUrls != null) {
			const shareurl = this._shareAsReadOnly ? this._shareUrls.fileId : this._shareUrls.adminId;
			const onCopyUrlToClipBoard = async () => this._copyValueToClipboard(shareurl);

			return html`<ba-checkbox class='close' title=${translate('toolbox_measureTool_share_readonly')} checked=${this._shareAsReadOnly} @toggle=${onToggle}>${translate('toolbox_measureTool_share_readonly')}
						</ba-checkbox>
						<div class='share_content' style='display:flex'>
							<input class='share_url' type='text' id='shareurl' name='shareurl' value=${shareurl} readonly>							
							<ba-icon class='close' icon='${clipboardIcon}' title=${translate('map_contextMenuContent_copy_icon')} size=1.5} @click=${onCopyUrlToClipBoard}>
							</ba-icon>
						</div>`;

		}
		return html.nothing;

	}

	_getSubText(state) {
		const { mode } = state;
		const translate = (key) => this._translationService.translate(key);
		let subTextMessage = translate('toolbox_drawTool_info');
		if (this._environmentService.isTouch()) {
			switch (mode) {
				case 'active':
					subTextMessage =  translate('toolbox_measureTool_measure_active');	
					break;
				case 'draw':
					subTextMessage =  translate('toolbox_measureTool_measure_draw');
					break;
				case 'modify':
					subTextMessage =  translate('toolbox_measureTool_measure_modify');
					break;
				case 'select':
					subTextMessage =  translate('toolbox_measureTool_measure_select');				
			}			
		}
		return html`<span>${unsafeHTML(subTextMessage)}</span>`;
	}

	async _copyValueToClipboard(value) {
		await this._shareService.copyToClipboard(value).then(() => {}, () => {
			console.warn('Clipboard API not available');
		});
	}

	/**
	 * @override
	 * @param {Object} globalState 
	 */
	extractState(globalState) {
		const { measurement } = globalState;
		return measurement;
	}

	static get tag() {
		return 'ba-tool-measure-content';
	}
}