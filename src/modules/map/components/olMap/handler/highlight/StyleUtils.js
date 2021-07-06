
import { Style, Icon } from 'ol/style';
import locationIcon from './assets/location.svg';
import tempLocationIcon from './assets/temporaryLocation.svg';


export const nullStyleFunction = () => [new Style({})];

export const highlightFeatureStyleFunction = () => [new Style({
	image: new Icon({
		anchor: [0.5, 1],
		anchorXUnits: 'fraction',
		anchorYUnits: 'fraction',
		src: locationIcon
	})
})];


export const highlightTemporaryFeatureStyleFunction = () => [new Style({
	image: new Icon({
		anchor: [0.5, 1],
		anchorXUnits: 'fraction',
		anchorYUnits: 'fraction',
		src: tempLocationIcon
	})
})];



