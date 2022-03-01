import { html } from 'lit-html';
import css from './toolBar.css';
import { $injector } from '../../../../injection';
import { setCurrentTool, ToolId } from '../../../../store/tools/tools.action';
import { MvuElement } from '../../../MvuElement';


const Update_IsOpen = 'update_isOpen';
const Update_Fetching = 'update_fetching';
const Update_IsPortrait_HasMinWidth = 'update_isPortrait_hasMinWidth';

/**
 *
 * @class
 * @author alsturm
 * @author thiloSchlemmer
 * @author taulinger
 */
export class ToolBar extends MvuElement {

	constructor() {
		super({
			isOpen: false,
			isFetching: false,
			isPortrait: false,
			hasMinWidth: false
		});

		const {
			EnvironmentService: environmentService,
			TranslationService: translationService
		}
			= $injector.inject('EnvironmentService', 'TranslationService');

		this._environmentService = environmentService;
		this._translationService = translationService;
		this._toolId = null;
	}

	update(type, data, model) {
		switch (type) {
			case Update_IsOpen:
				return { ...model, isOpen: data };
			case Update_Fetching:
				return { ...model, isFetching: data };
			case Update_IsPortrait_HasMinWidth:
				return { ...model, ...data };
		}
	}

	onInitialize() {
		this.observe(state => state.network.fetching, fetching => this.signal(Update_Fetching, fetching));
		this.observe(state => state.media, media => this.signal(Update_IsPortrait_HasMinWidth, { isPortrait: media.portrait, hasMinWidth: media.minWidth }));
		this.observe(state => state.tools.current, current => this._toolId = current);
	}

	/**
	 * @override
	 */
	createView(model) {

		const { isFetching, isPortrait, hasMinWidth, isOpen } = model;

		const getOrientationClass = () => {
			return isPortrait ? 'is-portrait' : 'is-landscape';
		};

		const getMinWidthClass = () => {
			return hasMinWidth ? 'is-desktop' : 'is-tablet';
		};

		const getOverlayClass = () => {
			return isOpen ? 'is-open' : '';
		};

		const toggleTool = (id) => {
			if (this._toolId === id) {
				setCurrentTool(null);
			}
			else {
				setCurrentTool(id);
			}
		};

		const getAnimatedBorderClass = () => {
			return isFetching ? 'animated-action-button__border__running' : '';
		};

		const translate = (key) => this._translationService.translate(key);

		return html`
			<style>${css}</style>		
			<div class="${getOrientationClass()} ${getMinWidthClass()}">  															
				<button id='action-button' data-test-id class="action-button" @click="${() => this.signal(Update_IsOpen, !isOpen)}">
					<div class="action-button__border animated-action-button__border ${getAnimatedBorderClass()}">
					</div>
					<div class="action-button__icon">
						<div class="ba">
						</div>
					</div>
					<div class='toolbar__logo-badge'>										
						${translate('toolbox_toolbar_logo_badge')}
					</div>	
				</button>
				<div class="tool-bar ${getOverlayClass()}">    	
					<button id='measure-button' data-test-id @click="${() => toggleTool(ToolId.MEASURING)}" class="tool-bar__button">
						<div class="tool-bar__button_icon measure">							
						</div>
						<div class="tool-bar__button-text">
							${translate('toolbox_toolbar_measure_button')}
						</div>  
					</button>  	
					<button id="draw-button" data-test-id @click="${() => toggleTool(ToolId.DRAWING)}" class="tool-bar__button">
						<div class="tool-bar__button_icon pencil">							
						</div>
						<div class="tool-bar__button-text">
							${translate('toolbox_toolbar_draw_button')}
						</div>  					
					</button>  				               
					<button  id="import-button" data-test-id @click="${() => toggleTool(ToolId.IMPORT)}" class="tool-bar__button">
						<div class="tool-bar__button_icon import">							
						</div>
						<div class="tool-bar__button-text">
						${translate('toolbox_toolbar_import_button')}							
						</div>  					
					</button>  				               
					<button  id="share-button" data-test-id @click="${() => toggleTool(ToolId.SHARING)}" class="tool-bar__button">
						<div class="tool-bar__button_icon share">							
						</div>
						<div class="tool-bar__button-text">
							${translate('toolbox_toolbar_share_button')}
						</div>  
					</button>  				               				               				 				           					 				               				               				 				            				               				               				 				           
				</div>		
			</div>		
		`;
	}

	isRenderingSkipped() {
		return this._environmentService.isEmbedded();
	}

	static get tag() {
		return 'ba-tool-bar';
	}
}
