import { provide as altitudeProfileProvider } from './altitudeProfile.provider';
import { $injector } from '../../../injection';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('altitudeProfileProvider', altitudeProfileProvider);
