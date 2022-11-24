
import { firstStepsProvide } from './chips.provider';
import { $injector } from '../../../injection';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('chipsProvider', firstStepsProvide);


