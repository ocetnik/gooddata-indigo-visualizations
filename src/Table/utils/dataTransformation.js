import invariant from 'invariant';
import { get, has, isObject, zip } from 'lodash';
import { getAttributeElementIdFromAttributeElementUri } from '../../utils/common';

function getAttributeHeaders(attributeDimension) {
    return attributeDimension.headers
        .map((attributeHeader) => {
            return {
                ...attributeHeader.attributeHeader,
                type: 'attribute'
            };
        });
}

function getMeasureHeaders(measureDimension) {
    return get(measureDimension.headers[0], ['measureGroupHeader', 'items'], [])
        .map((measureHeader) => {
            return {
                ...measureHeader.measureHeaderItem,
                type: 'measure'
            };
        });
}

export function getHeaders(executionResponse) {
    const dimensions = get(executionResponse, 'dimensions', []);

    // two dimensions must be always returned (and requested)
    invariant(dimensions.length === 2, 'Number of dimensions must be equal two');

    // measures are always returned (and requested) in 0-th dimension
    const measureHeaders = getMeasureHeaders(dimensions[0]);

    // attributes are always returned (and requested) in 1-st dimension
    const attributeHeaders = getAttributeHeaders(dimensions[1]);

    return [...attributeHeaders, ...measureHeaders];
}

export function getRows(executionResult) {
    // two dimensional headerItems array are always returned (and requested)
    // attributes are always returned (and requested) in 1-st dimension
    const attributeValues = executionResult.headerItems[1]
        .filter( // filter only arrays which contains only attribute header items
            headerItem => headerItem.every(item => has(item, 'attributeHeaderItem'))
        )
        .map(
            attributeHeaderItems => attributeHeaderItems
                .map(
                    attributeHeaderItem => get(attributeHeaderItem, 'attributeHeaderItem')
                )
        );

    const measureValues = get(executionResult, 'data');

    return zip(...attributeValues, ...measureValues);
}

export function validateTableProportions(headers, rows) {
    invariant(
        rows.length === 0 || headers.length === rows[0].length,
        'Number of table columns must be equal to number of table headers'
    );
}

export function getBackwardCompatibleHeaderForDrilling(header) {
    if (header.type === 'attribute') {
        return {
            type: 'attrLabel',
            id: header.localIdentifier,
            identifier: header.localIdentifier,
            uri: header.uri,
            title: header.name
        };
    }

    return {
        type: 'metric',
        id: header.localIdentifier,
        identifier: '',
        uri: header.uri,
        title: header.name,
        format: header.format
    };
}

export function getBackwardCompatibleRowForDrilling(row) {
    return row.map((cell) => {
        return isObject(cell)
            ? {
                id: getAttributeElementIdFromAttributeElementUri(cell.uri),
                name: cell.name
            }
            : cell;
    });
}
