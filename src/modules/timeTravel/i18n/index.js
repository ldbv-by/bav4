import { $injector } from '../../../injection';
import { provide as timeTravelProvide } from './timeTravel.provider';

const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('timeTravelProvide', timeTravelProvide);
