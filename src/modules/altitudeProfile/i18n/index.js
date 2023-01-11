import { provide as elevationProfileProvider } from './elevationProfile.provider';
import { $injector } from '../../../injection';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('altitudeProfileProvider', elevationProfileProvider);
