/**
 * @module modules/toolbox/components/toolContainer/ToolContainer
 */
import { html, nothing } from 'lit-html';
import { $injector } from '../../../../injection';
import { DrawToolContent } from '../drawToolContent/DrawToolContent';
import { MeasureToolContent } from '../measureToolContent/MeasureToolContent';
import { ShareToolContent } from '../shareToolContent/ShareToolContent';
import { ImportToolContent } from '../importToolContent/ImportToolContent';
import css from './toolContainer.css';
import { setCurrentTool } from '../../../../store/tools/tools.action';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import closeIcon from './assets/x-square.svg';
import { MvuElement } from '../../../MvuElement';
import { ExportMfpToolContent } from '../exportMfpToolContent/ExportMfpToolContent';
import { Tools } from '../../../../domain/tools';

const Update_IsPortrait_HasMinWidth = 'update_isPortrait_hasMinWidth';
const Update_ToolId = 'update_tooId';
/**
 * @class
 * @author thiloSchlemmer
 * @author taulinger
 */
export class ToolContainer extends MvuElement {
	constructor() {
		super({
			isPortrait: false,
			hasMinWidth: false,
			toolId: null
		});

		const { EnvironmentService: environmentService, TranslationService: translationService } = $injector.inject(
			'EnvironmentService',
			'TranslationService'
		);

		this._environmentService = environmentService;
		this._translationService = translationService;
	}

	/**
	 * @override
	 */
	update(type, data, model) {
		switch (type) {
			case Update_IsPortrait_HasMinWidth:
				return { ...model, ...data };
			case Update_ToolId:
				return { ...model, toolId: data };
		}
	}

	/**
	 * @override
	 */
	onInitialize() {
		this.observe(
			(state) => state.media,
			(media) => this.signal(Update_IsPortrait_HasMinWidth, { isPortrait: media.portrait, hasMinWidth: media.minWidth })
		);
		this.observe(
			(state) => state.tools.current,
			(current) => this.signal(Update_ToolId, current)
		);
	}

	/**
	 * @override
	 */
	createView(model) {
		const { toolId, isPortrait, hasMinWidth } = model;

		const getContentPanel = (toolId) => {
			switch (toolId) {
				case Tools.DRAW:
					return html`${unsafeHTML(`<${DrawToolContent.tag}/>`)}`;
				case Tools.MEASURE:
					return html`${unsafeHTML(`<${MeasureToolContent.tag}/>`)}`;
				case Tools.SHARE:
					return html`${unsafeHTML(`<${ShareToolContent.tag}/>`)}`;
				case Tools.IMPORT:
					return html`${unsafeHTML(`<${ImportToolContent.tag}/>`)}`;
				case Tools.EXPORT:
					return html`${unsafeHTML(`<${ExportMfpToolContent.tag}/>`)}`;
				default:
					return nothing;
			}
		};

		const close = () => {
			setCurrentTool(null);
		};

		const getOrientationClass = () => {
			return isPortrait ? 'is-portrait' : 'is-landscape';
		};

		const getMinWidthClass = () => {
			return hasMinWidth ? 'is-desktop' : 'is-tablet';
		};

		return toolId
			? html`
			<style>${css}</style>		
			<div class=" ${getOrientationClass()} ${getMinWidthClass()}">  	
			<div class="tool-container"> 			
				<div class="tool-container__content is-open">    
					<div class="tool-container__tools-nav">                         
						<ba-icon id="close-icon" data-test-id class='tool-container__close-button' .icon='${closeIcon}' .size=${1.6} .color=${'var(--text2)'} .color_hover=${'var(--text2)'} @click=${close}>						
                	</div>		
					${getContentPanel(toolId)}    				               				 				           					 				               				               				 				            				               				               				 				           
				</div>		
			</div>		
			</div>		
		`
			: nothing;
	}

	isRenderingSkipped() {
		return this._environmentService.isEmbedded();
	}

	static get tag() {
		return 'ba-tool-container';
	}
}
