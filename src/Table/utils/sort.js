import cx from 'classnames';
import invariant from 'invariant';
import { first, get, has } from 'lodash';

import { ASC, DESC } from '../constants/sort';

function getSortBy(tableHeaders, sortItemLocalIdentifier) {
    const sortByColumnIndex = tableHeaders.findIndex(
        tableHeader => tableHeader.localIdentifier === sortItemLocalIdentifier
    );

    invariant(sortByColumnIndex >= 0, `Cannot find sort identifier ${sortItemLocalIdentifier} in table headers`);

    return sortByColumnIndex;
}

function getSortItemAttributeIdentifier(sortItem) {
    const sortItemAttributeIdentifier = get(sortItem, ['attributeSortItem', 'attributeIdentifier']);

    invariant(sortItemAttributeIdentifier, 'Attribute sort item doesn\'t contain attribute identifier');

    return sortItemAttributeIdentifier;
}

function getSortItemMeasureIdentifier(sortItem) {
    const locators = get(sortItem, ['measureSortItem', 'locators']);

    invariant(locators, 'Measure sort item doesn\'t contain locators');

    invariant(locators.length <= 1, 'Measure sort item couldn\'t contain more than one locator');

    const firstLocator = first(locators);
    const sortItemMeasureIdentifier = get(firstLocator, ['measureLocatorItem', 'measureIdentifier']);

    invariant(sortItemMeasureIdentifier, 'Measure sort item doesn\'t contain measure identifier');

    return sortItemMeasureIdentifier;
}

export function getHeaderSortClassName(sortDir, currentSort) {
    return cx({
        'gd-table-arrow-up': sortDir === ASC,
        'gd-table-arrow-down': sortDir === DESC,
        's-sorted-asc': currentSort === ASC,
        's-sorted-desc': currentSort === DESC
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

    invariant(sorts.length === 1, 'Table allows only one sort');

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

        invariant(sortDir, 'Attribute sort item doesn\'t contain direction');

        return { sortBy, sortDir };
    }

    if (has(sortItem, 'measureSortItem')) {
        const sortItemIdentifier = getSortItemMeasureIdentifier(sortItem);
        const sortBy = getSortBy(tableHeaders, sortItemIdentifier);
        const sortDir = get(sortItem, ['measureSortItem', 'direction']);

        invariant(sortDir, 'Measure sort item doesn\'t contain direction');

        return { sortBy, sortDir };
    }

    throw new Error(`Unknown sort item: ${Object.keys(sortItem)[0]}`);
}
