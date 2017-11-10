import { getHiddenRowsOffset, updatePosition } from '../row';

describe('Table utils - Row', () => {
    describe('updatePosition', () => {
        const positions = {
            defaultTop: 1,
            edgeTop: 2,
            fixedTop: 3,
            absoluteTop: 4
        };

        let element;

        beforeEach(() => {
            element = document.createElement('div');
        });

        it('should set default position and proper class to given element', () => {
            const isDefaultPosition = true;
            const isEdgePosition = false;

            updatePosition(element, isDefaultPosition, isEdgePosition, positions);

            expect(element.classList.contains('sticking')).toEqual(false);
            expect(element.style.position).toEqual('absolute');
            expect(element.style.top).toEqual(`${positions.defaultTop}px`);
        });

        it('should set edge position and proper class to given element', () => {
            const isDefaultPosition = false;
            const isEdgePosition = true;

            updatePosition(element, isDefaultPosition, isEdgePosition, positions);

            expect(element.classList.contains('sticking')).toEqual(true);
            expect(element.style.position).toEqual('absolute');
            expect(element.style.top).toEqual(`${positions.edgeTop}px`);
        });

        it('should set fixed position and proper class to given element', () => {
            const isDefaultPosition = false;
            const isEdgePosition = false;

            updatePosition(element, isDefaultPosition, isEdgePosition, positions);

            expect(element.classList.contains('sticking')).toEqual(true);
            expect(element.style.position).toEqual('fixed');
            expect(element.style.top).toEqual(`${positions.fixedTop}px`);
        });

        it('should set absolute position and proper class to given element', () => {
            const isDefaultPosition = false;
            const isEdgePosition = false;
            const stopped = true;

            updatePosition(element, isDefaultPosition, isEdgePosition, positions, stopped);

            expect(element.classList.contains('sticking')).toEqual(true);
            expect(element.style.position).toEqual('absolute');
            expect(element.style.top).toEqual(`${positions.absoluteTop}px`);
        });
    });

    describe('getHiddenRowsOffset', () => {
        it('should return proper hidden rows offset', () => {
            const hasHiddenRows = true;
            expect(getHiddenRowsOffset(hasHiddenRows)).toEqual(15);
        });

        it('should return zero hidden rows offset when table has no hidden rows', () => {
            const hasHiddenRows = false;
            expect(getHiddenRowsOffset(hasHiddenRows)).toEqual(0);
        });
    });
});
