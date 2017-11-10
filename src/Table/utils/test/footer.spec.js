import {
    getFooterHeight,
    getFooterPositions,
    isFooterAtDefaultPosition,
    isFooterAtEdgePosition
} from '../footer';

describe('Table utils - Footer', () => {
    describe('getFooterHeight', () => {
        it('should return proper height', () => {
            const aggregations = [1, 2];
            expect(getFooterHeight(aggregations)).toEqual(60);
        });

        it('should return zero height when no aggregations are given', () => {
            const aggregations = [];
            expect(getFooterHeight(aggregations)).toEqual(0);
        });
    });

    describe('isFooterAtDefaultPosition', () => {
        const windowHeight = 500;

        it('should return true if footer is scrolled above the bottom of the viewport', () => {
            const tableBottom = 250;
            const hasHiddenRows = false;
            expect(isFooterAtDefaultPosition(hasHiddenRows, tableBottom, windowHeight))
                .toEqual(true);
        });

        it('should return true if footer is scrolled near the bottom of the viewport and table contains hidden rows', () => {
            const tableBottom = 510;
            const hasHiddenRows = true;
            expect(isFooterAtDefaultPosition(hasHiddenRows, tableBottom, windowHeight))
                .toEqual(true);
        });

        it('should return false if footer is scrolled near the bottom of the viewport and table has no hidden rows', () => {
            const tableBottom = 510;
            const hasHiddenRows = false;
            expect(isFooterAtDefaultPosition(hasHiddenRows, tableBottom, windowHeight))
                .toEqual(false);
        });


        it('should return false if footer is scrolled below the bottom of the viewport', () => {
            const tableBottom = 750;
            const hasHiddenRows = false;
            expect(isFooterAtDefaultPosition(hasHiddenRows, tableBottom, windowHeight))
                .toEqual(false);
        });
    });

    describe('isFooterAtEdgePosition', () => {
        const aggregations = [1, 2, 3];
        const hasHiddenRows = false;
        const tableHeight = 500;
        const windowHeight = 500;

        it('should return true if footer is at its edge position', () => {
            const tableBottom = 1000;
            expect(isFooterAtEdgePosition(hasHiddenRows, aggregations, tableHeight, tableBottom, windowHeight))
                .toEqual(true);
        });

        it('should return false if footer is not at its edge position', () => {
            const tableBottom = 100;
            expect(isFooterAtEdgePosition(hasHiddenRows, aggregations, tableHeight, tableBottom, windowHeight))
                .toEqual(false);
        });
    });

    describe('getFooterPositions', () => {
        it('should return proper footer positions', () => {
            const aggregations = [1, 2, 3];
            let hasHiddenRows = true;
            let tableHeight = 300;
            let tableBottom = 500;
            let windowHeight = 400;

            expect(getFooterPositions(hasHiddenRows, aggregations, tableHeight, tableBottom, windowHeight))
                .toEqual({
                    absoluteTop: -100,
                    defaultTop: -15,
                    edgeTop: -139,
                    fixedTop: 100
                });

            tableHeight = 500;
            tableBottom = 1000;
            windowHeight = 800;

            expect(getFooterPositions(hasHiddenRows, aggregations, tableHeight, tableBottom, windowHeight))
                .toEqual({
                    absoluteTop: -200,
                    defaultTop: -15,
                    edgeTop: -339,
                    fixedTop: 300
                });

            hasHiddenRows = false;
            tableHeight = 300;
            tableBottom = 100;
            windowHeight = 500;

            expect(getFooterPositions(hasHiddenRows, aggregations, tableHeight, tableBottom, windowHeight))
                .toEqual({
                    absoluteTop: 400,
                    defaultTop: -0,
                    edgeTop: -154,
                    fixedTop: 200
                });
        });
    });
});
