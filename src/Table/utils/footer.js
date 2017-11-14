import { getHeaderOffset } from './header';
import { getHiddenRowsOffset } from './row';
import { DEFAULT_FOOTER_ROW_HEIGHT } from '../TableVisualization';

export function getFooterHeight(aggregations) {
    return aggregations.length * DEFAULT_FOOTER_ROW_HEIGHT;
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
