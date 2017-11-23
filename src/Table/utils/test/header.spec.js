import {
    calculateArrowPositions,
    getHeaderClassNames,
    getHeaderOffset,
    isHeaderAtDefaultPosition,
    isHeaderAtEdgePosition,
    getHeaderPositions,
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
                getHeaderClassNames(ATTRIBUTE_HEADER)
            ).toEqual('gd-table-header-ordering s-id-1st_attr_df_local_identifier');
        });
    });

    describe('getHeaderOffset', () => {
        it('should return proper header offset', () => {
            const hasHiddenRows = true;
            expect(getHeaderOffset(hasHiddenRows)).toEqual(71);
        });

        it('should return zero header offset when table has no hidden rows', () => {
            const hasHiddenRows = false;
            expect(getHeaderOffset(hasHiddenRows)).toEqual(56);
        });
    });

    describe('isHeaderAtDefaultPosition', () => {
        it('should return true if header is scrolled below zero sticky header offset', () => {
            const stickyHeaderOffset = 0;
            const tableTop = 10;
            expect(isHeaderAtDefaultPosition(stickyHeaderOffset, tableTop)).toEqual(true);
        });

        it('should return true if header is scrolled exactly at zero sticky header offset', () => {
            const stickyHeaderOffset = 0;
            const tableTop = 0;
            expect(isHeaderAtDefaultPosition(stickyHeaderOffset, tableTop)).toEqual(true);
        });

        it('should return true if header is scrolled exactly at sticky header offset', () => {
            const stickyHeaderOffset = 10;
            const tableTop = 10;
            expect(isHeaderAtDefaultPosition(stickyHeaderOffset, tableTop)).toEqual(true);
        });

        it('should return false if header is scrolled above zero sticky header offset', () => {
            const stickyHeaderOffset = 0;
            const tableTop = -10;
            expect(isHeaderAtDefaultPosition(stickyHeaderOffset, tableTop)).toEqual(false);
        });

        it('should return false if header is scrolled above sticky header offset', () => {
            const stickyHeaderOffset = 10;
            const tableTop = 8;
            expect(isHeaderAtDefaultPosition(stickyHeaderOffset, tableTop)).toEqual(false);
        });
    });

    describe('isHeaderAtEdgePosition', () => {
        const stickyHeaderOffset = 0;
        const hasHiddenRows = true;
        const aggregations = [];

        it('should return true if header is at its edge position', () => {
            const tableBottom = 50;
            expect(isHeaderAtEdgePosition(stickyHeaderOffset, hasHiddenRows, aggregations, tableBottom)).toEqual(true);
        });

        it('should return false if header is not at its edge position', () => {
            const tableBottom = 500;
            expect(isHeaderAtEdgePosition(stickyHeaderOffset, hasHiddenRows, aggregations, tableBottom)).toEqual(false);
        });
    });

    describe('getHeaderPositions', () => {
        it('should return proper header positions', () => {
            const stickyHeaderOffset = 0;
            let hasHiddenRows = true;
            let aggregations = [];
            let tableHeight = 500;
            let tableTop = 50;

            expect(getHeaderPositions(stickyHeaderOffset, hasHiddenRows, aggregations, tableHeight, tableTop))
                .toEqual({
                    absoluteTop: -50,
                    defaultTop: 0,
                    edgeTop: 414,
                    fixedTop: 0
                });

            hasHiddenRows = true;
            aggregations = [1, 2, 3];
            tableHeight = 500;
            tableTop = 50;

            expect(getHeaderPositions(stickyHeaderOffset, hasHiddenRows, aggregations, tableHeight, tableTop))
                .toEqual({
                    absoluteTop: -50,
                    defaultTop: 0,
                    edgeTop: 324,
                    fixedTop: 0
                });

            hasHiddenRows = false;
            aggregations = [1, 2, 3];
            tableHeight = 500;
            tableTop = 50;

            expect(getHeaderPositions(stickyHeaderOffset, hasHiddenRows, aggregations, tableHeight, tableTop))
                .toEqual({
                    absoluteTop: -50,
                    defaultTop: 0,
                    edgeTop: 354,
                    fixedTop: 0
                });

            hasHiddenRows = true;
            aggregations = [];
            tableHeight = 200;
            tableTop = 100;

            expect(getHeaderPositions(stickyHeaderOffset, hasHiddenRows, aggregations, tableHeight, tableTop))
                .toEqual({
                    absoluteTop: -100,
                    defaultTop: 0,
                    edgeTop: 114,
                    fixedTop: 0
                });

            hasHiddenRows = false;
            aggregations = [];
            tableHeight = 200;
            tableTop = 100;

            expect(getHeaderPositions(stickyHeaderOffset, hasHiddenRows, aggregations, tableHeight, tableTop))
                .toEqual({
                    absoluteTop: -100,
                    defaultTop: 0,
                    edgeTop: 144,
                    fixedTop: 0
                });
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
