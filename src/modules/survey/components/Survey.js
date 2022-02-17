import { html } from 'lit-html';
import { $injector } from '../../../injection';
import css from './survey.css';
import { MvuElement } from '../../MvuElement';
import { emitNotification, LevelTypes } from '../../../store/notifications/notifications.action';
import { NotificationItem } from '../../notifications/components/NotificationItem';


const Update_IsPortrait_HasMinWidth = 'update_isPortrait_hasMinWidth';
const Update_IsOpen_TabIndex = 'update_isOpen_tabIndex';
const Update_HasBeenVisible = 'update_hasBeenVisible';
/**
 * @class
 * @author alsturm
 */
export class Survey extends MvuElement {

	constructor() {
		super({
			isPortrait: false,
			hasMinWidth: false,
			isOpen: false,
			hasBeenVisible: false,
			timeout: 3000
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
	}

	/**
	 * @override
	 */
	createView(model) {
		const { isPortrait, hasMinWidth, isOpen, hasBeenVisible, timeout } = model;


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
				const onClose = (e) => {
					e.path.find(element => element instanceof NotificationItem).close();
				};
				return html`
						<style>${css}</style>	
						<div class='survey__notification'>					
							<div class='survey__notification-section'>
								<i class='survey__notification-icon'></i>
								<div>
									<div class='survey__notification-primary-text' >${translate('survey_notification_header')}</div>
									<div class='survey__notification-secondary-text' >${translate('survey_notification_text')}</div>
								</div>
							</div>
							<div class='survey__notification-section space-evenly'>							
								<ba-button id='button1' .label=${'Nein Danke'} @click=${onClose}></ba-button>
								<a target='_blank' href='${translate('survey_link')}' @click=${onClose} class="survey__notification-link ">
									${translate('survey_notification_open')}
								</a>
							</div>
						</div>`;
			};
			emitNotification(getContent(), LevelTypes.CUSTOM);
		};
		if (!hasBeenVisible) {
			window.setTimeout(() => showNotification(), timeout);
			this.signal(Update_HasBeenVisible, true);
		}

		return html`
			<style>${css}</style>		
			<div class=" ${getOrientationClass()} ${getMinWidthClass()}">  			
				<div class='survey__button ${getOverlayClass()}'>				
					<i class='survey__button-icon'></i>
					<a target='_blank' href='${translate('survey_link')}' class="survey__link">
						<span class="survey__button-text">${translate('survey_button')}</span>
					</a>						
				</div>		
			</div>		

		` ;

	}

	isRenderingSkipped() {
		return this._environmentService.isEmbedded();
	}

	static get tag() {
		return 'ba-survey';
	}
}
