import { DEFAULT_ROW_HEIGHT, DEFAULT_HEADER_HEIGHT, DEFAULT_FOOTER_ROW_HEIGHT } from './TableVisualization';

export function setPosition(element, position = 'absolute', top = 0, sticking = false) {
    const { style, classList } = element;

    classList[sticking ? 'add' : 'remove']('sticking');
    style.position = position;
    style.top = `${Math.round(top)}px`;
}

export function updatePosition(element, isDefaultPosition, isEdgePosition, positions, isScrollingStopped) {
    const { defaultTop, edgeTop, fixedTop, absoluteTop } = positions;

    if (isDefaultPosition) {
        return setPosition(element, 'absolute', defaultTop);
    }

    if (isEdgePosition) {
        return setPosition(element, 'absolute', edgeTop, true);
    }

    if (isScrollingStopped) {
        return setPosition(element, 'absolute', absoluteTop, true);
    }

    return setPosition(element, 'fixed', fixedTop, true);
}

export function getFooterHeight(aggregations) {
    return aggregations.length * DEFAULT_FOOTER_ROW_HEIGHT;
}

export function getHiddenRowsOffset(hasHiddenRows) {
    return hasHiddenRows ? (0.5 * DEFAULT_ROW_HEIGHT) : 0;
}

export function getHeaderOffset(hasHiddenRows) {
    return DEFAULT_HEADER_HEIGHT + ((hasHiddenRows ? 1.5 : 1) * DEFAULT_ROW_HEIGHT);
}

export function isHeaderAtDefaultPosition(stickyHeaderOffset, tableTop) {
    return tableTop >= stickyHeaderOffset;
}

export function isHeaderAtEdgePosition(stickyHeaderOffset, hasHiddenRows, aggregations, tableBottom) {
    const footerHeight = getFooterHeight(aggregations);
    const hiddenRowsOffset = getHiddenRowsOffset(hasHiddenRows);
    const headerOffset = getHeaderOffset(hasHiddenRows);

    return tableBottom >= stickyHeaderOffset &&
        tableBottom < (stickyHeaderOffset + headerOffset + footerHeight + hiddenRowsOffset);
}

export function getHeaderPositions(stickyHeaderOffset, hasHiddenRows, aggregations, tableHeight, tableTop) {
    const footerHeight = getFooterHeight(aggregations);
    const hiddenRowsOffset = getHiddenRowsOffset(hasHiddenRows);
    const headerOffset = getHeaderOffset(hasHiddenRows);

    return {
        defaultTop: 0,
        edgeTop: tableHeight - headerOffset - footerHeight - hiddenRowsOffset,
        fixedTop: stickyHeaderOffset,
        absoluteTop: stickyHeaderOffset - tableTop
    };
}

export function isFooterAtDefaultPosition(hasHiddenRows, tableBottom, windowHeight) {
    const hiddenRowsOffset = getHiddenRowsOffset(hasHiddenRows);

    return (tableBottom - hiddenRowsOffset) <= windowHeight;
}

export function isFooterAtEdgePosition(hasHiddenRows, aggregations, tableHeight, tableBottom, windowHeight) {
    const footerHeight = getFooterHeight(aggregations);
    const headerOffset = getHeaderOffset(hasHiddenRows);

    const footerHeightTranslate = tableHeight - footerHeight;

    return (tableBottom + headerOffset) >= (windowHeight + footerHeightTranslate);
}

export function getFooterPositions(hasHiddenRows, aggregations, tableHeight, tableBottom, windowHeight) {
    const footerHeight = getFooterHeight(aggregations);
    const hiddenRowsOffset = getHiddenRowsOffset(hasHiddenRows);
    const headerOffset = getHeaderOffset(hasHiddenRows);

    const footerHeightTranslate = tableHeight - footerHeight;

    return {
        defaultTop: -hiddenRowsOffset,
        edgeTop: headerOffset - footerHeightTranslate,
        fixedTop: windowHeight - footerHeightTranslate - footerHeight,
        absoluteTop: windowHeight - tableBottom
    };
}
