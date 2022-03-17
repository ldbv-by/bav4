
import { helpProvide } from './help.provider';
import { $injector } from '../../../injection';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('initialHintsProvide', helpProvide);


