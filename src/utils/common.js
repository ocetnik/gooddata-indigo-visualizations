import { setWith, clone } from 'lodash';
import { Observable } from 'rxjs/Rx';

export function parseValue(value) {
    const parsedValue = parseFloat(value);
    return isNaN(parsedValue) ? null : parsedValue;
}

export const immutableSet = (dataSet, path, newValue) => setWith({ ...dataSet }, path, newValue, clone);

export const repeatItemsNTimes = (array, n) => new Array(n).fill(null).reduce(result => [...result, ...array], []);

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

export function getAttributeElementIdFromAttributeElementUri(attributeElementUri) {
    const match = '/elements?id=';
    return attributeElementUri.slice(attributeElementUri.lastIndexOf(match) + match.length);
}
