import {
    parseValue,
    immutableSet,
    repeatItemsNTimes,
    getAttributeElementIdFromAttributeElementUri
} from '../common';

describe('Common utils', () => {
    describe('parseValue', () => {
        it('should parse string to float', () => {
            expect(parseValue('12345')).toEqual(12345);
            expect(parseValue('1.2345')).toEqual(1.2345);
            expect(parseValue('1.2345678901e-05')).toEqual(0.000012345678901);
        });

        it('should return null when value is string', () => {
            expect(parseValue('test')).toEqual(null);
        });
    });

    describe('immutableSet', () => {
        const data = {
            array: [
                {
                    modified: [1],
                    untouched: {}
                },
                { untouched: 3 }
            ]
        };
        const path = 'array[0].modified[1]';
        const newValue = 4;

        const updated = immutableSet(data, path, newValue);
        it('should set values deep in the object hierarchy', () => {
            expect(updated.array[0].modified[2]).toEqual(4);
        });
        it('should clone objects that have been updated', () => {
            expect(updated.array[0].modified).not.toBe(data.array[0].modified);
        });
        it('should not clone objects that have NOT been updated', () => {
            expect(updated.array[1]).toBe(data.array[1]);
        });
    });
});
