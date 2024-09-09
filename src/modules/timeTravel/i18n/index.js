import { provide as timeTravelProvide } from './timeTravel.provider';
import { $injector } from '../../../injection';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('timeTravelProvide', timeTravelProvide);
