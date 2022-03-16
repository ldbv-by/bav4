import { html } from 'lit-html';
import { $injector } from '../../../injection';
import css from './initialHints.css';
import { MvuElement } from '../../MvuElement';
import { emitNotification, LevelTypes } from '../../../store/notifications/notifications.action';
import { clearFixedNotification } from '../../../store/notifications/notifications.action';
import { QueryParameters } from '../../../services/domain/queryParameters';

export const INITIAL_HINTS_NOTIFICATION_DELAY_TIME = 3000;

const Update_IsPortrait_HasMinWidth = 'update_isPortrait_hasMinWidth';
const Update_IsOpen_TabIndex = 'update_isOpen_tabIndex';
const Update_HasBeenVisible = 'update_hasBeenVisible';
/**
 * @class
 * @author alsturm
 */
export class InitialHints extends MvuElement {

	constructor() {
		super({
			isPortrait: false,
			hasMinWidth: false,
			isOpen: false,
			hasBeenVisible: false
		});

		const {
			EnvironmentService: environmentService,
			TranslationService: translationService
		}
			= $injector.inject('EnvironmentService', 'TranslationService');

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
			case Update_IsOpen_TabIndex:
				return { ...model, ...data };
			case Update_HasBeenVisible:
				return { ...model, hasBeenVisible: data };
		}
	}

	/**
	 * @override
	 */
	onInitialize() {
		this.observe(state => state.media, media => this.signal(Update_IsPortrait_HasMinWidth, { isPortrait: media.portrait, hasMinWidth: media.minWidth }));
		this.observe(state => state.mainMenu, mainMenu => this.signal(Update_IsOpen_TabIndex, { isOpen: mainMenu.open, tabIndex: mainMenu.tab }));

		this.signal(Update_HasBeenVisible, this._environmentService.getUrlParams().get(QueryParameters.T_DISABLE_INITIAL_UI_HINTS) === 'true');
	}

	/**
	 * @override
	 */
	createView(model) {
		const { isPortrait, hasMinWidth, isOpen, hasBeenVisible } = model;


		const getOrientationClass = () => {
			return isPortrait ? 'is-portrait' : 'is-landscape';
		};

		const getMinWidthClass = () => {
			return hasMinWidth ? 'is-desktop' : 'is-tablet';
		};

		const getOverlayClass = () => {
			return (isOpen && !isPortrait) ? 'is-open' : '';
		};

		const translate = (key) => this._translationService.translate(key);


		const showNotification = () => {
			const getContent = () => {
				const onClose = () => {
					clearFixedNotification();
				};
				return html`
						<style>${css}</style>	
						<div class='initialHints__notification'>					
							<div class='initialHints__notification-section'>
								<i class='initialHints__notification-icon'></i>
								<div>
									<div class='initialHints__notification-primary-text' >${translate('initialHints_notification_header')}</div>
									<div class='initialHints__notification-secondary-text' >${translate('initialHints_notification_text')}</div>
								</div>
							</div>
							<div class='initialHints__notification-section space-evenly'>							
								<ba-button id='closeButton' .label=${translate('initialHints_notification_close')} @click=${onClose}></ba-button>
								<a target='_blank' href='${translate('initialHints_link')}' @click=${onClose} class="initialHints__notification-link">${translate('initialHints_notification_open')}</a>
							</div>
						</div>`;
			};
			emitNotification(getContent(), LevelTypes.CUSTOM);
		};
		if (!hasBeenVisible) {
			window.setTimeout(() => showNotification(), INITIAL_HINTS_NOTIFICATION_DELAY_TIME);
			this.signal(Update_HasBeenVisible, true);
		}

		return html`
			<style>${css}</style>		
			<div class=" ${getOrientationClass()} ${getMinWidthClass()}">  			
				<div class='initialHints__button ${getOverlayClass()}'>				
					<i class='initialHints__button-icon'></i>
					<a target='_blank' href='${translate('initialHints_link')}' class="initialHints__link">
						<span class="initialHints__button-text">${translate('initialHints_button')}</span>
					</a>						
				</div>		
			</div>		

		` ;

	}

	isRenderingSkipped() {
		return this._environmentService.isEmbedded();
	}

	static get tag() {
		return 'ba-initial-hints';
	}
}
