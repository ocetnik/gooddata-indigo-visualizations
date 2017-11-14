import React from 'react';
import { mount } from 'enzyme';
import { noop, range } from 'lodash';

import { withIntl } from '../../test/utils';
import ResponsiveTable from '../ResponsiveTable';
import Table from '../Table';

import { EXECUTION_REQUEST_1A_2M, TABLE_HEADERS_1A_2M, TABLE_ROWS_1A_2M } from '../fixtures/1attribute2measures';

const ROWS_PER_PAGE = 10;
const WrappedTable = withIntl(ResponsiveTable);

const getMore = wrapper => wrapper.find('.s-show_more');
const getLess = wrapper => wrapper.find('.s-show_less');

describe('Responsive Table', () => {
    const TABLE_DATA = {
        executionRequest: EXECUTION_REQUEST_1A_2M,
        headers: TABLE_HEADERS_1A_2M,
        rows: TABLE_ROWS_1A_2M
    };

    function renderTable(tableData, customProps = {}) {
        const props = {
            onMore: noop,
            onLess: noop,
            ...customProps
        };
        return mount(
            <WrappedTable
                containerWidth={600}
                rowsPerPage={ROWS_PER_PAGE}
                {...props}
                {...tableData}
            />
        );
    }

    it('should set container width', () => {
        const wrapper = renderTable(TABLE_DATA);
        expect(wrapper.find(Table).prop('containerWidth')).toEqual(600);
    });

    describe('page', () => {
        it('should set new page when it is sent in props', () => {
            const wrapper = renderTable(TABLE_DATA);
            expect(wrapper.find(Table).prop('page')).toEqual(1);
            wrapper.setProps({ page: 2 });
            expect(wrapper.find(Table).prop('page')).toEqual(2);
        });

        it('should not set new page when it isn\'t sent in props', () => {
            const wrapper = renderTable(TABLE_DATA);
            expect(wrapper.find(Table).prop('page')).toEqual(1);
            wrapper.setProps({ foo: 'baz' });
            expect(wrapper.find(Table).prop('page')).toEqual(1);
        });
    });

    describe('when data contains less than 1 page of rows', () => {
        it('should not show "More" button', () => {
            const wrapper = renderTable(TABLE_DATA);
            expect(getMore(wrapper)).toHaveLength(0);
        });

        it('should not show "Less" button', () => {
            const wrapper = renderTable(TABLE_DATA);
            expect(getLess(wrapper)).toHaveLength(0);
        });

        it('should set correct number of rows', () => {
            const wrapper = renderTable(TABLE_DATA);
            expect(wrapper.find(Table).prop('rows').length).toEqual(1);
        });
    });

    describe('when data contains more than 1 page of rows', () => {
        const tableData = {
            executionRequest: EXECUTION_REQUEST_1A_2M,
            headers: TABLE_HEADERS_1A_2M,
            rows: range(0, 25).map(() => TABLE_ROWS_1A_2M)
        };

        describe('and table is showing first page', () => {
            it('should show "More" button', () => {
                const wrapper = renderTable(tableData);
                expect(getMore(wrapper)).toHaveLength(1);
            });

            it('should not show "Less" button', () => {
                const wrapper = renderTable(tableData);
                expect(getLess(wrapper)).toHaveLength(0);
            });

            it('should set correct number of rows', () => {
                const wrapper = renderTable(tableData);
                expect(wrapper.find(Table).prop('rows').length).toEqual(ROWS_PER_PAGE);
            });

            it('should call onMore callback with number of rows and page when user clicks "More"', () => {
                const onMore = jest.fn();
                const wrapper = renderTable(tableData, { onMore });
                getMore(wrapper).simulate('click');
                expect(onMore).toBeCalledWith({
                    rows: ROWS_PER_PAGE * 2,
                    page: 2
                });
            });
        });

        describe('and table is showing some page', () => {
            function prepareComponent(props = {}) {
                const wrapper = renderTable(tableData, props);
                getMore(wrapper).simulate('click');
                return wrapper;
            }

            it('should show "Less" button', () => {
                const wrapper = prepareComponent();
                expect(getLess(wrapper)).toHaveLength(1);
            });

            it('should set correct number of rows', () => {
                const wrapper = prepareComponent();
                expect(wrapper.find(Table).prop('rows').length).toEqual(ROWS_PER_PAGE * 2);
            });

            it('should return to first page when user clicks "Less"', () => {
                const wrapper = prepareComponent();
                getLess(wrapper).simulate('click');
                expect(wrapper.find(Table).prop('rows').length).toEqual(ROWS_PER_PAGE);
            });

            it('should call onLess callback with number of rows when user clicks "Less"', () => {
                const onLess = jest.fn();
                const wrapper = prepareComponent({ onLess });
                getLess(wrapper).simulate('click');
                expect(onLess).toBeCalledWith({ rows: ROWS_PER_PAGE });
            });
        });

        describe('and table is showing last page', () => {
            function prepareComponent(props = {}) {
                const wrapper = renderTable(tableData, props);
                getMore(wrapper).simulate('click');
                getMore(wrapper).simulate('click');
                return wrapper;
            }

            it('should hide "More" button', () => {
                const wrapper = prepareComponent();
                expect(getMore(wrapper)).toHaveLength(0);
            });

            it('should show "Less" button', () => {
                const wrapper = prepareComponent();
                expect(getLess(wrapper)).toHaveLength(1);
            });

            it('should set correct number of rows', () => {
                const wrapper = prepareComponent();
                expect(wrapper.find(Table).prop('rows').length).toEqual(25);
            });

            it('should return to first page when user clicks "Less"', () => {
                const wrapper = prepareComponent();
                getLess(wrapper).simulate('click');
                expect(wrapper.find(Table).prop('rows').length).toEqual(ROWS_PER_PAGE);
            });
        });
    });
});
