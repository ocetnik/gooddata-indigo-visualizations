import { DEFAULT_ROW_HEIGHT } from '../TableVisualization';

function setPosition(element, position, top, sticking = false) {
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

export function getHiddenRowsOffset(hasHiddenRows) {
    return hasHiddenRows ? (0.5 * DEFAULT_ROW_HEIGHT) : 0;
}
