import cx from 'classnames';
import { first, get, has } from 'lodash';

import { ASC, DESC } from '../constants/sort';

function getSortBy(tableHeaders, sortItemLocalIdentifier) {
    const sortByColumnIndex = tableHeaders.findIndex(
        tableHeader => tableHeader.localIdentifier === sortItemLocalIdentifier
    );

    if (sortByColumnIndex === -1) {
        throw new Error(`Cannot find sort identifier ${sortItemLocalIdentifier} in table headers`);
    }

    return sortByColumnIndex;
}

function getSortItemAttributeIdentifier(sortItem) {
    const sortItemAttributeIdentifier = get(sortItem, ['attributeSortItem', 'attributeIdentifier']);

    if (!sortItemAttributeIdentifier) {
        throw new Error('Attribute sort item doesn\'t contain attribute identifier');
    }

    return sortItemAttributeIdentifier;
}

function getSortItemMeasureIdentifier(sortItem) {
    const locators = get(sortItem, ['measureSortItem', 'locators']);

    if (!locators) {
        throw new Error('Measure sort item doesn\'t contain locators');
    }

    if (locators.length > 1) {
        throw new Error('Measure sort item couldn\'t contain more than one locator');
    }

    const firstLocator = first(locators);
    const sortItemMeasureIdentifier = get(firstLocator, ['measureLocatorItem', 'measureIdentifier']);

    if (!sortItemMeasureIdentifier) {
        throw new Error('Measure sort item doesn\'t contain measure identifier');
    }

    return sortItemMeasureIdentifier;
}

export function getHeaderSortClassName(sortDir) {
    return cx({
        'gd-table-arrow-up': sortDir === ASC,
        'gd-table-arrow-down': sortDir === DESC
    });
}

export function getNextSortDir(header, currentSortDir) {
    if (!currentSortDir) {
        return header.type === 'measure' ? DESC : ASC;
    }

    return currentSortDir === ASC ? DESC : ASC;
}

export function getSortItem(executionRequest) {
    const sorts = get(executionRequest, ['resultSpec', 'sorts'], []);

    if (sorts.length === 0) {
        return null;
    }

    if (sorts.length > 1) {
        throw new Error('Table allows only one sort');
    }

    return sorts[0];
}

export function getSortInfo(sortItem, tableHeaders) {
    if (!sortItem || tableHeaders.length === 0) {
        return {};
    }

    if (has(sortItem, 'attributeSortItem')) {
        const sortItemIdentifier = getSortItemAttributeIdentifier(sortItem);
        const sortBy = getSortBy(tableHeaders, sortItemIdentifier);
        const sortDir = get(sortItem, ['attributeSortItem', 'direction']);

        if (!sortDir) {
            throw new Error('Attribute sort item doesn\'t contain direction');
        }

        return { sortBy, sortDir };
    }

    if (has(sortItem, 'measureSortItem')) {
        const sortItemIdentifier = getSortItemMeasureIdentifier(sortItem);
        const sortBy = getSortBy(tableHeaders, sortItemIdentifier);
        const sortDir = get(sortItem, ['measureSortItem', 'direction']);

        if (!sortDir) {
            throw new Error('Measure sort item doesn\'t contain direction');
        }

        return { sortBy, sortDir };
    }

    throw new Error(`Unknown sort item: ${Object.keys(sortItem)[0]}`);
}
