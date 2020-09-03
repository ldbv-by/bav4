import { ZOOM_CHANGED, POSITION_CHANGED, ZOOM_POSITION_CHANGED, POINTER_POSITION_CHANGED } from "./MapReducer";
import { $injector } from '../../injection';

const getStore = () => {
    const { StoreService } = $injector.inject('StoreService');
    return StoreService.getStore();
};



export const changeZoomAndPosition = (zoomPosition) => {
    getStore().dispatch({
        type: ZOOM_POSITION_CHANGED,
        payload: zoomPosition
    });
};


export const changeZoom = (zoom) => {
    getStore().dispatch({
        type: ZOOM_CHANGED,
        payload: zoom

    });
};

export const increaseZoom = () => {

    const { map: { zoom } } = getStore().getState();
    getStore().dispatch({
        type: ZOOM_CHANGED,
        payload: zoom + 1

    });
};

export const decreaseZoom = () => {

    const { map: { zoom } } = getStore().getState();
    getStore().dispatch({
        type: ZOOM_CHANGED,
        payload: zoom - 1

    });
};

export const changePosition = (position) => {
    getStore().dispatch({
        type: POSITION_CHANGED,
        payload: position
    });
};

export const updatePointerPosition = (position) => {
    getStore().dispatch({
        type: POINTER_POSITION_CHANGED,
        payload: position
    });
};
