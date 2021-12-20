import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import css from './toolBar.css';
import { DrawToolContent } from '../drawToolContent/DrawToolContent';
import { MeasureToolContent } from '../measureToolContent/MeasureToolContent';
import { ShareToolContent } from '../shareToolContent/ShareToolContent';
import { $injector } from '../../../../injection';
import { openToolContainer, setContainerContent, toggleToolContainer } from '../../../../store/toolContainer/toolContainer.action';


/**
 * Container for Tools
 *
 * @class
 * @author alsturm
 * @author taulinger
 */
export class ToolBar extends BaElement {

	constructor() {
		super();

		const {
			EnvironmentService: environmentService,
			TranslationService: translationService
		}
			= $injector.inject('EnvironmentService', 'TranslationService');

		this._environmentService = environmentService;
		this._translationService = translationService;
		this._open = false;
	}

	/**
	 * @override
	 */
	createView(state) {

		const { toolContainer, fetching, portrait, minWidth } = state;

		const activeToolId = toolContainer.contentId;
		const getOrientationClass = () => {
			return portrait ? 'is-portrait' : 'is-landscape';
		};

		const getMinWidthClass = () => {
			return minWidth ? 'is-desktop' : 'is-tablet';
		};

		const getOverlayClass = () => {
			return this._open ? 'is-open' : '';
		};

		const toggleToolBar = () => {
			this._open = !this._open;
			this.render();
		};

		const toggleTool = (toolId) => {
			setContainerContent(toolId);
			if (activeToolId === toolId) {
				toggleToolContainer();
			}
			else {
				openToolContainer();
			}
		};
		const toggleDrawTool = () => {
			const toolId = DrawToolContent.tag;
			toggleTool(toolId);
		};

		const toggleMeasureTool = () => {
			const toolId = MeasureToolContent.tag;
			toggleTool(toolId);
		};

		const toggleShareTool = () => {
			const toolId = ShareToolContent.tag;
			toggleTool(toolId);
		};

		const getAnimatedBorderClass = () => {
			return fetching ? 'animated-action-button__border__running' : '';
		};

		const translate = (key) => this._translationService.translate(key);

		return html`
			<style>${css}</style>		
			<div class="${getOrientationClass()} ${getMinWidthClass()}">  															
				<button class="action-button" @click="${toggleToolBar}">
					<div class="action-button__border animated-action-button__border ${getAnimatedBorderClass()}">
					</div>
					<div class="action-button__icon">
						<div class="ba">
						</div>
					</div>
				</button>
				<div class="tool-bar ${getOverlayClass()}">    	
					<button  @click="${toggleMeasureTool}" class="tool-bar__button">
						<div class="tool-bar__button_icon measure">							
						</div>
						<div class="tool-bar__button-text">
							${translate('toolbox_toolbar_measure_button')}
						</div>  
					</button>  	
					<button  @click="${toggleDrawTool}" class="tool-bar__button">
						<div class="tool-bar__button_icon pencil">							
						</div>
						<div class="tool-bar__button-text">
							${translate('toolbox_toolbar_draw_button')}
						</div>  					
					</button>  				               
					<button  @click="${toggleShareTool}" class="tool-bar__button">
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

	/**
		 * @override
		 * @param {Object} globalState
		 */
	extractState(globalState) {
		const { toolBar, toolContainer, network: { fetching }, media: { portrait, minWidth } } = globalState;
		return { toolBar, toolContainer, fetching, portrait, minWidth };
	}

	static get tag() {
		return 'ba-tool-bar';
	}
}
