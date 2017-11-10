import { isArray, has, setWith, clone } from 'lodash';
import { Observable } from 'rxjs/Rx';

export function parseValue(value) {
    const parsedValue = parseFloat(value);
    return isNaN(parsedValue) ? null : parsedValue;
}

export const immutableSet = (dataSet, path, newValue) => setWith({ ...dataSet }, path, newValue, clone);

export const repeatItemsNTimes = (array, n) => Array(n).fill(null).reduce(result => [...result, ...array], []);

export function getMeasureHeader(item, afm) {
    const { id, uri = '', identifier = '' } = item;

    const header = {
        identifier: '',
        uri: ''
    };

    if (uri.length || identifier.length) {
        header.identifier = identifier;
        header.uri = uri;

        return header;
    }


    if (isArray(afm.measures)) {
        const afmMeasure = afm.measures.find(measure => measure.id === id);

        if (has(afmMeasure, ['definition', 'baseObject', 'lookupId'])) {
            const lookupId = afmMeasure.definition.baseObject.lookupId;
            return getMeasureHeader({ id: lookupId }, afm);
        }

        if (has(afmMeasure, ['definition', 'baseObject', 'id'])) {
            header.uri = afmMeasure.definition.baseObject.id;
        }
    }

    return header;
}

export const getAttributeHeader = header => ({
    identifier: header.id,
    uri: header.uri
});

export function subscribeEvents(func, events) {
    return events.map((event) => {
        if (event.debounce > 0) {
            return Observable
                .fromEvent(window, event.name)
                .debounceTime(event.debounce)
                .subscribe(func);
        }

        return Observable
            .fromEvent(window, event.name)
            .subscribe(func);
    });
}

export const unEscapeAngleBrackets = str => str && str.replace(/&lt;|&#60;/g, '<').replace(/&gt;|&#62;/g, '>');
