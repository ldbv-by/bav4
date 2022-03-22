
import { firstStepsProvide } from './firstSteps.provider';
import { $injector } from '../../../injection';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('firstStepsProvider', firstStepsProvide);


