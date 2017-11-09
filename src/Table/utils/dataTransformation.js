import { difference, get, has, isObject, zip } from 'lodash';

const REQUIRED_ATTRIBUTE_TABLE_HEADER_ELEMENTS = ['uri', 'identifier', 'localIdentifier', 'name'];

function getAttributeAndMeasureResponseDimensions(executionResponse) {
    const dimensions = get(executionResponse, 'dimensions', []);

    // two dimensions must be always returned (and requested)
    if (dimensions.length !== 2) {
        throw new Error('Number of dimensions must be equal two');
    }

    // attributes are always returned (and requested) in first dimension
    const attributeResponseDimension = dimensions[0];

    // measures are always returned (and requested) in second dimension
    const measureResponseDimension = dimensions[1];

    return { attributeResponseDimension, measureResponseDimension };
}

function validateAttributeTableHeaderElements(attributeTableHeader) {
    if (difference(REQUIRED_ATTRIBUTE_TABLE_HEADER_ELEMENTS, Object.keys(attributeTableHeader)).length > 0) {
        throw new Error(
            'Attribute table header doesn\'t contain all of required elements. ' +
            `Required attribute table header elements are: ${REQUIRED_ATTRIBUTE_TABLE_HEADER_ELEMENTS}.`
        );
    }

    return attributeTableHeader;
}

function validateMeasureTableHeaderElements(measureTableHeader) {
    const requiredMeasureTableHeaderElements = REQUIRED_ATTRIBUTE_TABLE_HEADER_ELEMENTS.concat(['format']);

    if (difference(requiredMeasureTableHeaderElements, Object.keys(measureTableHeader)).length > 0) {
        throw new Error(
            'Measure table header doesn\'t contain all of required elements. ' +
            `Required measure table header elements are: ${requiredMeasureTableHeaderElements}.`
        );
    }

    return measureTableHeader;
}

function getAttributeHeaders(attributeDimension) {
    return get(attributeDimension, 'headers', [])
        .map(
            (attributeHeader) => {
                return {
                    ...validateAttributeTableHeaderElements(get(attributeHeader, 'attributeHeader')),
                    type: 'attribute'
                };
            }
        );
}

function getMeasureHeaders(measureDimension) {
    const measureDimensionHeaders = get(measureDimension, 'headers');

    return get(measureDimensionHeaders[0], ['measureGroupHeader', 'items'], [])
        .map(
            (measureHeader) => {
                return {
                    ...validateMeasureTableHeaderElements(get(measureHeader, 'measureHeaderItem')),
                    type: 'measure'
                };
            }
        );
}

export function getHeaders(executionResponse) {
    const {
        attributeResponseDimension,
        measureResponseDimension
    } = getAttributeAndMeasureResponseDimensions(executionResponse);

    const attributeHeaders = getAttributeHeaders(attributeResponseDimension);
    const measureHeaders = getMeasureHeaders(measureResponseDimension);

    return [...attributeHeaders, ...measureHeaders];
}

export function getRows(executionResult) {
    // two dimensional headerItems array are always returned (and requested)
    // attributes are always returned (and requested) in first dimension
    const attributeValues = get(executionResult, 'headerItems')[0]
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
    if (rows.length > 0 && headers.length !== rows[0].length) {
        throw new Error('Number of table columns must be equal to number of table headers');
    }
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

function getAttributeElementIdFromAttributeElementUri(attributeElementUri) {
    const match = '/elements?id=';
    return attributeElementUri.slice(attributeElementUri.lastIndexOf(match) + match.length);
}

export function getBackwardCompatibleRowForDrilling(row) {
    return row.map((cell) => {
        return isObject(cell) ?
            {
                id: getAttributeElementIdFromAttributeElementUri(cell.uri),
                name: cell.name
            } :
            cell;
    });
}
