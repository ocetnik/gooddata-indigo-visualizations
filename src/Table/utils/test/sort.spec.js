import { getHeaderSortClassName, getNextSortDir, getSortInfo, getSortItem } from '../sort';
import { ASC, DESC } from '../../constants/sort';
import { TABLE_HEADERS_2A_3M } from '../../fixtures/2attributes3measures';

const ATTRIBUTE_SORT_ITEM = {
    attributeSortItem: {
        direction: ASC,
        attributeIdentifier: '2nd_attr_df_local_identifier'
    }
};

const MEASURE_SORT_ITEM = {
    measureSortItem: {
        direction: DESC,
        locators: [
            {
                measureLocatorItem: {
                    measureIdentifier: '2nd_measure_local_identifier'
                }
            }
        ]
    }
};

const ATTRIBUTE_SORT_ITEM_WITHOUT_DIRECTION = {
    attributeSortItem: {
        attributeIdentifier: '2nd_attr_df_local_identifier'
    }
};

const ATTRIBUTE_SORT_ITEM_WITHOUT_ATTRIBUTE_IDENTIFIER = {
    attributeSortItem: {
        direction: ASC
    }
};

const MEASURE_SORT_ITEM_WITHOUT_DIRECTION = {
    measureSortItem: {
        locators: [
            {
                measureLocatorItem: {
                    measureIdentifier: '2nd_measure_local_identifier'
                }
            }
        ]
    }
};

const MEASURE_SORT_ITEM_WITHOUT_LOCATORS = {
    measureSortItem: {
        direction: DESC
    }
};

const MEASURE_SORT_ITEM_WITHOUT_MEASURE_IDENTIFIER = {
    measureSortItem: {
        direction: DESC,
        locators: [
            {
                measureLocatorItem: {}
            }
        ]
    }
};

const MEASURE_SORT_ITEM_WITH_TWO_LOCATORS = {
    measureSortItem: {
        direction: DESC,
        locators: [
            {
                measureLocatorItem: {
                    measureIdentifier: '1st_measure_local_identifier'
                }
            },
            {
                measureLocatorItem: {
                    measureIdentifier: '2nd_measure_local_identifier'
                }
            }
        ]
    }
};

const UNKNOWN_SORT_ITEM = {
    foo: {}
};

const SORT_ITEM_WITH_UNKNOWN_IDENTIFIER = {
    attributeSortItem: {
        direction: ASC,
        attributeIdentifier: 'unknown_identifier'
    }
};

describe('Table utils - Sort', () => {
    describe('getHeaderSortClassName', () => {
        it('should create classes with hinted ASC and current sort DESC', () => {
            const classes = getHeaderSortClassName(ASC, DESC);
            expect(classes).toContain('gd-table-arrow-up');
            expect(classes).toContain('s-sorted-desc');
        });

        it('should create classes with hinted sort and without current sort', () => {
            const classes = getHeaderSortClassName(DESC, null);
            expect(classes).toContain('gd-table-arrow-down');
            expect(classes).not.toContain('s-sorted-desc');
            expect(classes).not.toContain('s-sorted-asc');
        });
    });

    describe('getNextSortDir', () => {
        it('should get nextSortDir when currentSortDir is not specified', () => {
            expect(getNextSortDir({ type: 'attribute' }, null)).toEqual(ASC);
            expect(getNextSortDir({ type: 'measure' }, null)).toEqual(DESC);
        });

        it('should get nextSortDir when currentSortDir is specified', () => {
            expect(getNextSortDir({ type: 'attribute' }, ASC)).toEqual(DESC);
            expect(getNextSortDir({ type: 'measure' }, ASC)).toEqual(DESC);
            expect(getNextSortDir({ type: 'attribute' }, DESC)).toEqual(ASC);
            expect(getNextSortDir({ type: 'measure' }, DESC)).toEqual(ASC);
        });
    });

    describe('getSortItem', () => {
        it('should return null if there are no sorts', () => {
            const executionRequest = { afm: {} };
            expect(getSortItem(executionRequest)).toEqual(null);
        });

        it('should throw error if there is more than one sort', () => {
            const executionRequest = {
                afm: {},
                resultSpec: {
                    sorts: [
                        ATTRIBUTE_SORT_ITEM,
                        MEASURE_SORT_ITEM
                    ]
                }
            };
            expect(() => {
                getSortItem(executionRequest);
            }).toThrow('Table allows only one sort');
        });

        it('should return sort item', () => {
            const executionRequest = {
                afm: {},
                resultSpec: {
                    sorts: [
                        ATTRIBUTE_SORT_ITEM
                    ]
                }
            };
            expect(getSortItem(executionRequest)).toEqual(ATTRIBUTE_SORT_ITEM);
        });
    });

    describe('getSortInfo', () => {
        it('should handle undefined sorts or empty table headers', () => {
            expect(getSortInfo(undefined, [])).toEqual({});
            expect(getSortInfo(undefined, TABLE_HEADERS_2A_3M)).toEqual({});
            expect(getSortInfo(ATTRIBUTE_SORT_ITEM, [])).toEqual({});
        });

        it('should get sortInfo for attribute', () => {
            const sortInfo = getSortInfo(ATTRIBUTE_SORT_ITEM, TABLE_HEADERS_2A_3M);
            expect(sortInfo.sortBy).toEqual(1);
            expect(sortInfo.sortDir).toEqual(ASC);
        });

        it('should get sortInfo for measure', () => {
            const sortInfo = getSortInfo(MEASURE_SORT_ITEM, TABLE_HEADERS_2A_3M);
            expect(sortInfo.sortBy).toEqual(3);
            expect(sortInfo.sortDir).toEqual(DESC);
        });

        it('should throw error for unknown sort item type', () => {
            expect(() => {
                getSortInfo(UNKNOWN_SORT_ITEM, TABLE_HEADERS_2A_3M);
            }).toThrow('Unknown sort item: foo');
        });

        it('should throw error for attribute sort item without direction', () => {
            expect(() => {
                getSortInfo(ATTRIBUTE_SORT_ITEM_WITHOUT_DIRECTION, TABLE_HEADERS_2A_3M);
            }).toThrow('Attribute sort item doesn\'t contain direction');
        });

        it('should throw error for attribute sort item without attribute identifier', () => {
            expect(() => {
                getSortInfo(ATTRIBUTE_SORT_ITEM_WITHOUT_ATTRIBUTE_IDENTIFIER, TABLE_HEADERS_2A_3M);
            }).toThrow('Attribute sort item doesn\'t contain attribute identifier');
        });

        it('should throw error for measure sort item without direction', () => {
            expect(() => {
                getSortInfo(MEASURE_SORT_ITEM_WITHOUT_DIRECTION, TABLE_HEADERS_2A_3M);
            }).toThrow('Measure sort item doesn\'t contain direction');
        });

        it('should throw error for measure sort item without locators', () => {
            expect(() => {
                getSortInfo(MEASURE_SORT_ITEM_WITHOUT_LOCATORS, TABLE_HEADERS_2A_3M);
            }).toThrow('Measure sort item doesn\'t contain locators');
        });

        it('should throw error for measure sort item without measure identifier', () => {
            expect(() => {
                getSortInfo(MEASURE_SORT_ITEM_WITHOUT_MEASURE_IDENTIFIER, TABLE_HEADERS_2A_3M);
            }).toThrow('Measure sort item doesn\'t contain measure identifier');
        });

        it('should throw error for measure sort item which contains more than one locator', () => {
            expect(() => {
                getSortInfo(MEASURE_SORT_ITEM_WITH_TWO_LOCATORS, TABLE_HEADERS_2A_3M);
            }).toThrow('Measure sort item couldn\'t contain more than one locator');
        });

        it('should throw error for sort identifier which ism\'t included in table headers', () => {
            expect(() => {
                getSortInfo(SORT_ITEM_WITH_UNKNOWN_IDENTIFIER, TABLE_HEADERS_2A_3M);
            }).toThrow('Cannot find sort identifier unknown_identifier in table headers');
        });
    });
});
