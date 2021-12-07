import { html, nothing } from 'lit-html';
import { BaElement } from '../../../BaElement';
import { $injector } from '../../../../injection';
import { DrawToolContent } from '../drawToolContent/DrawToolContent';
import { MeasureToolContent } from '../measureToolContent/MeasureToolContent';
import { ShareToolContent } from '../shareToolContent/ShareToolContent';
import { activate as activateMeasurement, deactivate as deactivateMeasurement } from '../../../../store/measurement/measurement.action';
import { activate as activateDraw, deactivate as deactivateDraw } from '../../../../store/draw/draw.action';
import css from './toolContainer.css';
import { closeToolContainer } from '../../../../store/toolContainer/toolContainer.action';
import { emitNotification } from '../../../../store/notifications/notifications.action';
import { LevelTypes } from '../../../../store/notifications/notifications.action';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import closeIcon from './assets/x-square.svg';

/**
 * @class
 * @author thiloSchlemmer
 * @author taulinger
 */
export class ToolContainer extends BaElement {

	constructor() {
		super();

		const {
			EnvironmentService: environmentService,
			TranslationService: translationService
		}
			= $injector.inject('EnvironmentService', 'TranslationService');

		this._environmentService = environmentService;
		this._translationService = translationService;
		this._lastContentId = false;
	}



	/**
	 * @override
	 */
	createView(state) {

		const { open, contentId, portrait, minWidth } = state;
		const translate = (key) => this._translationService.translate(key);
		const getContent = (contentId) => {
			switch (contentId) {
				case DrawToolContent.tag:
					return html`${unsafeHTML(`<${DrawToolContent.tag}/>`)}`;
				case MeasureToolContent.tag:
					return html`${unsafeHTML(`<${MeasureToolContent.tag}/>`)}`;
				case ShareToolContent.tag:
					return html`${unsafeHTML(`<${ShareToolContent.tag}/>`)}`;
				default:
					return null;
			}
		};


		const getNextActiveContent = () => {
			if (this._lastContentId !== contentId && open) {
				if (this._lastContentId) {
					return this._lastContentId;
				}

			}
			if (!open) {
				return null;
			}
			return contentId;
		};
		const nextActiveContentId = getNextActiveContent();
		if (nextActiveContentId === this._lastContentId) {
			emitNotification(translate('toolbox_prevent_switching_tool'), LevelTypes.WARN);
		}
		else {
			if (nextActiveContentId) {
				this._lastContentId = nextActiveContentId;
				this._activateByContentId(nextActiveContentId);
			}
			else {
				this._deactivateByContentId(this._lastContentId);
			}
		}

		const getOrientationClass = () => {
			return portrait ? 'is-portrait' : 'is-landscape';
		};

		const getMinWidthClass = () => {
			return minWidth ? 'is-desktop' : 'is-tablet';
		};

		const getOverlayClass = () => {
			return open ? 'is-open' : '';
		};
		const content = getContent(nextActiveContentId);
		if (content == null) {
			return nothing;
		}

		return html`
			<style>${css}</style>		
			<div class=" ${getOrientationClass()} ${getMinWidthClass()}">  	
			<div class="tool-container"> 			
				<div class="tool-container__content ${getOverlayClass()}">    
				<div class="tool-container__tools-nav">                         
						<ba-icon class='tool-container__close-button' .icon='${closeIcon}' .size=${1.5} .color=${'var(--text2)'} .color_hover=${'var(--text2)'} @click=${closeToolContainer}>						
                </div>		
					${content}    				               				 				           					 				               				               				 				            				               				               				 				           
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
* @param {Object} globalState
*/
	extractState(globalState) {
		const { toolContainer: { open, contentId }, media: { portrait, minWidth } } = globalState;
		return { open, contentId, portrait, minWidth };
	}

	static get tag() {
		return 'ba-tool-container';
	}

	_activateByContentId(contentId) {
		switch (contentId) {
			case MeasureToolContent.tag:
				activateMeasurement();
				break;
			case DrawToolContent.tag:
				activateDraw();
				break;
		}
	}

	_deactivateByContentId(contentId) {
		switch (contentId) {
			case MeasureToolContent.tag:
				deactivateMeasurement();
				break;
			case DrawToolContent.tag:
				deactivateDraw();
				break;
		}
		this._lastContentId = false;
	}
}
