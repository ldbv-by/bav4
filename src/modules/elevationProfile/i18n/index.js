import { $injector } from '../../../injection';
import { provide as elevationProfileProvider } from './elevationProfile.provider';

const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('elevationProfileProvider', elevationProfileProvider);
