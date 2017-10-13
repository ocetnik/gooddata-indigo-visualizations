import cx from 'classnames';
import { clamp } from 'lodash';
import { string } from '@gooddata/js-utils';

import { ALIGN_LEFT } from '../constants/align';

const HEADER_PADDING = 8;
const MOBILE_SORT_TOOLTIP_OFFSET = 20;

const isLeftAligned = columnAlign => columnAlign === ALIGN_LEFT;
const getPoints = (x, y = -HEADER_PADDING) => ({ x, y }); // y has always offset
const simplifyText = string.simplifyText;

function getCssClass(value, prefix) {
    return prefix + simplifyText(value);
}

export function calculateArrowPositions(column, tableScrollX, tableWrapRef) {
    const tableWrapRect = tableWrapRef.getBoundingClientRect();

    // diff between table position and fixed tooltip left offset
    const offsetLeft = tableWrapRect.left - MOBILE_SORT_TOOLTIP_OFFSET;

    // prevent arrow to show outside the table
    const min = offsetLeft + HEADER_PADDING;
    const max = tableWrapRect.right - MOBILE_SORT_TOOLTIP_OFFSET - HEADER_PADDING;

    const left = ((column.width * column.index) - tableScrollX)
        + (isLeftAligned(column.align) ? HEADER_PADDING : (column.width - HEADER_PADDING))
        + offsetLeft;

    return { left: `${clamp(left, min, max)}px` };
}

export function getHeaderClassNames(header) {
    return cx('gd-table-header-ordering', getCssClass(header.localIdentifier, 's-id-'));
}

export const getTooltipAlignPoints = (columnAlign) => {
    return isLeftAligned(columnAlign) ? [
        { align: 'bl tl', offset: getPoints(HEADER_PADDING, 0) },
        { align: 'bl tc', offset: getPoints(HEADER_PADDING, 0) },
        { align: 'bl tr', offset: getPoints(HEADER_PADDING, 0) }
    ] : [
        { align: 'br tr', offset: getPoints(-HEADER_PADDING, 0) },
        { align: 'br tc', offset: getPoints(-HEADER_PADDING, 0) },
        { align: 'br tl', offset: getPoints(-HEADER_PADDING, 0) }
    ];
};

export function getTooltipSortAlignPoints(columnAlign) {
    // TODO Known issue - wrong tooltip alignment when
    // distance between table left side and window is more than cca 20px,
    // header cell is not fully visible (is scrolled)

    // last align point is used when header cell is not fully visible (scroll)
    return isLeftAligned(columnAlign) ? [
        { align: 'bl tl', offset: getPoints(HEADER_PADDING) },
        { align: 'bl tc', offset: getPoints(HEADER_PADDING) },
        { align: 'bl tr', offset: getPoints(HEADER_PADDING) },
        { align: 'br tl', offset: getPoints(-HEADER_PADDING) },
        { align: 'tl bl', offset: getPoints(HEADER_PADDING, HEADER_PADDING) },
        { align: 'tl bc', offset: getPoints(HEADER_PADDING, HEADER_PADDING) },
        { align: 'tl br', offset: getPoints(HEADER_PADDING, HEADER_PADDING) },
        { align: 'tr bl', offset: getPoints(-HEADER_PADDING, HEADER_PADDING) }
    ] : [
        { align: 'br tr', offset: getPoints(-HEADER_PADDING) },
        { align: 'br tc', offset: getPoints(-HEADER_PADDING) },
        { align: 'br tl', offset: getPoints(-HEADER_PADDING) },
        { align: 'bl tr', offset: getPoints(HEADER_PADDING) },
        { align: 'tr br', offset: getPoints(-HEADER_PADDING, HEADER_PADDING) },
        { align: 'tr bc', offset: getPoints(-HEADER_PADDING, HEADER_PADDING) },
        { align: 'tr bl', offset: getPoints(-HEADER_PADDING, HEADER_PADDING) },
        { align: 'tl br', offset: getPoints(HEADER_PADDING, HEADER_PADDING) }
    ];
}
