import {
    calculateArrowPositions,
    getHeaderClassNames,
    getTooltipAlignPoints,
    getTooltipSortAlignPoints
} from '../header';

import { ALIGN_LEFT, ALIGN_RIGHT } from '../../constants/align';
import { TABLE_HEADERS_2A_3M } from '../../fixtures/2attributes3measures';

const ATTRIBUTE_HEADER = TABLE_HEADERS_2A_3M[0];

function mockGetBoundingClientRect() {
    return {
        left: 15,
        right: 800
    };
}

describe('Table utils - Header', () => {
    describe('calculateArrowPositions', () => {
        it('should get min arrow position', () => {
            expect(calculateArrowPositions(
                { width: 5, align: ALIGN_LEFT, index: 2 },
                12,
                { getBoundingClientRect: mockGetBoundingClientRect }
            )).toEqual({ left: '3px' });
        });

        it('should get max arrow position', () => {
            expect(calculateArrowPositions(
                { width: 200, align: ALIGN_LEFT, index: 99 },
                600,
                { getBoundingClientRect: mockGetBoundingClientRect }
            )).toEqual({ left: '772px' });
        });

        it('should calculate arrow position for left aligned column', () => {
            expect(calculateArrowPositions(
                { width: 50, align: ALIGN_LEFT, index: 3 },
                12,
                { getBoundingClientRect: mockGetBoundingClientRect }
            )).toEqual({ left: '141px' });
        });

        it('should calculate arrow position for right aligned column', () => {
            expect(calculateArrowPositions(
                { width: 50, align: ALIGN_RIGHT, index: 3 },
                12,
                { getBoundingClientRect: mockGetBoundingClientRect }
            )).toEqual({ left: '175px' });
        });
    });

    describe('getHeaderClassNames', () => {
        it('should get header class names', () => {
            expect(
                getHeaderClassNames(ATTRIBUTE_HEADER)).toEqual('gd-table-header-ordering s-id-1st_attr_local_identifier'
            );
        });
    });

    describe('getTooltipAlignPoints', () => {
        it('should get tooltip align points for left aligned column', () => {
            expect(getTooltipAlignPoints(ALIGN_LEFT)).toEqual(
                [
                    {
                        align: 'bl tl',
                        offset: { x: 8, y: 0 }
                    },
                    {
                        align: 'bl tc',
                        offset: { x: 8, y: 0 }
                    },
                    {
                        align: 'bl tr',
                        offset: { x: 8, y: 0 }
                    }
                ]
            );
        });

        it('should get tooltip align points for right aligned column', () => {
            expect(getTooltipAlignPoints(ALIGN_RIGHT)).toEqual(
                [
                    {
                        align: 'br tr',
                        offset: { x: -8, y: 0 }
                    },
                    {
                        align: 'br tc',
                        offset: { x: -8, y: 0 }
                    },
                    {
                        align: 'br tl',
                        offset: { x: -8, y: 0 }
                    }
                ]
            );
        });
    });

    describe('getTooltipSortAlignPoints', () => {
        it('should get tooltip sort align points for left aligned column', () => {
            expect(getTooltipSortAlignPoints(ALIGN_LEFT)).toEqual(
                [
                    {
                        align: 'bl tl',
                        offset: { x: 8, y: -8 }
                    },
                    {
                        align: 'bl tc',
                        offset: { x: 8, y: -8 }
                    },
                    {
                        align: 'bl tr',
                        offset: { x: 8, y: -8 }
                    },
                    {
                        align: 'br tl',
                        offset: { x: -8, y: -8 }
                    },
                    {
                        align: 'tl bl',
                        offset: { x: 8, y: 8 }
                    },
                    {
                        align: 'tl bc',
                        offset: { x: 8, y: 8 }
                    },
                    {
                        align: 'tl br',
                        offset: { x: 8, y: 8 }
                    },
                    {
                        align: 'tr bl',
                        offset: { x: -8, y: 8 }
                    }
                ]
            );
        });

        it('should get tooltip sort align points for right aligned column', () => {
            expect(getTooltipSortAlignPoints(ALIGN_RIGHT)).toEqual(
                [
                    {
                        align: 'br tr',
                        offset: { x: -8, y: -8 }
                    },
                    {
                        align: 'br tc',
                        offset: { x: -8, y: -8 }
                    },
                    {
                        align: 'br tl',
                        offset: { x: -8, y: -8 }
                    },
                    {
                        align: 'bl tr',
                        offset: { x: 8, y: -8 }
                    },
                    {
                        align: 'tr br',
                        offset: { x: -8, y: 8 }
                    },
                    {
                        align: 'tr bc',
                        offset: { x: -8, y: 8 }
                    },
                    {
                        align: 'tr bl',
                        offset: { x: -8, y: 8 }
                    },
                    {
                        align: 'tl br',
                        offset: { x: 8, y: 8 }
                    }
                ]
            );
        });
    });
});
