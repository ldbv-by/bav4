import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import css from './toolBox.css';
import { DrawToolContent } from '../../../toolbox/components/drawToolContent/DrawToolContent';
import { MeasureToolContent } from '../../../toolbox/components/measureToolContent/MeasureToolContent';
import { toggleToolBox } from '../../store/toolBox.action';
import { toggleToolContainer, setContainerContent, openToolContainer } from '../../../toolbox/store/toolContainer.action';
import { $injector } from '../../../../injection';


/**
 * Container for Tools 
 *  
 * @class
 * @author alsturm
 */
export class ToolBox extends BaElement {

	constructor() {
		super();

		const {		
			EnvironmentService: environmentService,
			TranslationService: translationService
		}
			= $injector.inject( 'EnvironmentService', 'TranslationService');

		this._environmentService = environmentService;
		this._translationService = translationService;
		this._portrait = false;
		this._minWidth = false;
	}

	initialize() {

		const _window = this._environmentService.getWindow();
		//MediaQuery for 'orientation'
		const mediaQuery = _window.matchMedia('(orientation: portrait)');
		const handleOrientationChange = (e) => {
			this._portrait = e.matches;
			//trigger a re-render
			this.render();
		};
		mediaQuery.addEventListener('change', handleOrientationChange);
		//initial set of local state
		handleOrientationChange(mediaQuery);


		//MediaQuery for 'min-width'
		const mediaQueryMinWidth = _window.matchMedia('(min-width: 80em)');
		const handleMinWidthChange = (e) => {
			this._minWidth = e.matches;
			//trigger a re-render
			this.render();
		};
		mediaQueryMinWidth.addEventListener('change', handleMinWidthChange);
		//initial set of local state
		handleMinWidthChange(mediaQueryMinWidth);
	}

	/**
	 * @override
	 */
	createView() {

		const { toolBox, toolContainer } = this._state;
		const toolBoxOpen = toolBox.open;
		const activeToolId = toolContainer.contentId;
		const getOrientationClass = () => {
			return this._portrait ? 'is-portrait' : 'is-landscape';
		};

		const getMinWidthClass = () => {
			return this._minWidth ?  'is-desktop'  : 'is-tablet';
		};

		const getOverlayClass = () => {
			return toolBoxOpen ? 'is-open' : '';
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

		const translate = (key) => this._translationService.translate(key);

		return html`
			<style>${css}</style>		
			<div class="${getOrientationClass()} ${getMinWidthClass()}">  
				<button  @click="${toggleToolBox}"  class="action-button">
					<div class="action-button__icon">
					</div>
				</button>
				<div class="tool-box ${getOverlayClass()}">    	
					<div  @click="${toggleMeasureTool}" class="tool-box__button">
						<div class="tool-box__button_icon measure">							
						</div>
						<div class="tool-box__button-text">
							${translate('menu_toolbox_measure_button')}
						</div>  
					</div>  	
					<div  @click="${toggleDrawTool}" class="tool-box__button">
						<div class="tool-box__button_icon pencil">							
						</div>
						<div class="tool-box__button-text">
							${translate('menu_toolbox_draw_button')}
						</div>  
					</div>  				               
					<div  class="tool-box__button">
						<div class="tool-box__button_icon share">							
						</div>
						<div class="tool-box__button-text">
							${translate('menu_toolbox_share_button')}
						</div>  
					</div>  				               				               				 				           					 				               				               				 				            				               				               				 				           
				</div>		
			</div>		
		`;
	}

	isRenderingSkipped() {
		return this._environmentService.isEmbedded();
	}

	/**
	 * @override
	 * @param {Object} state 
	 */
	extractState(state) {
		const { toolBox, toolContainer } = state;
		return { toolBox:toolBox, toolContainer:toolContainer };
	}

	static get tag() {
		return 'ba-tool-box';
	}
}
