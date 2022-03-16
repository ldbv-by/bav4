
import { initialHintsProvide } from './initialHints.provider';
import { $injector } from '../../../injection';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('initialHintsProvide', initialHintsProvide);


