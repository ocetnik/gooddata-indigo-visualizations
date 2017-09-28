import React from 'react';
import { mount } from 'enzyme';
import { range } from 'lodash';

import { withIntl } from '../../test/utils';

import ResponsiveTable from '../ResponsiveTable';
import Table from '../Table';

const HEADERS = [
    {
        type: 'attrLabel',
        title: 'Name'
    }, {
        type: 'metric',
        title: '# of Open Opps.',
        format: '#,##0'
    }, {
        type: 'metric',
        title: '# of Opportunities',
        format: '[red]#,##0'
    }
];

const DATA_ROW = ['Wile E. Coyote', '30', '1324'];

const ROWS_PER_PAGE = 10;
const WrappedTable = withIntl(ResponsiveTable);

const getMore = wrapper => wrapper.find('.s-show_more');
const getLess = wrapper => wrapper.find('.s-show_less');

describe('Responsive Table', () => {
    function renderTable(data, customProps = {}) {
        const props = {
            onMore: () => {},
            onLess: () => {},
            ...customProps
        };
        return mount(
            <WrappedTable
                containerWidth={600}
                rows={data.rawData}
                headers={data.headers}
                rowsPerPage={ROWS_PER_PAGE}
                {...props}
            />
        );
    }

    it('should set container width', () => {
        const wrapper = renderTable({ headers: [], rawData: [] });

        expect(wrapper.find(Table).prop('containerWidth')).toEqual(600);
    });

    describe('when data contains less than 1 page of rows', () => {
        const fixture = {
            headers: HEADERS,
            rawData: [DATA_ROW]
        };

        it('should not show "More" button', () => {
            const wrapper = renderTable(fixture);
            expect(getMore(wrapper)).toHaveLength(0);
        });

        it('should not show "Less" button', () => {
            const wrapper = renderTable(fixture);
            expect(getLess(wrapper)).toHaveLength(0);
        });

        it('should set correct number of rows', () => {
            const wrapper = renderTable(fixture);
            expect(wrapper.find(Table).prop('rows').length).toEqual(1);
        });
    });

    describe('when data contains more than 1 page of rows', () => {
        const fixture = {
            headers: HEADERS,
            rawData: range(0, 25).map(() => DATA_ROW)
        };

        describe('and table is showing first page', () => {
            it('should show "More" button', () => {
                const wrapper = renderTable(fixture);
                expect(getMore(wrapper)).toHaveLength(1);
            });

            it('should not show "Less" button', () => {
                const wrapper = renderTable(fixture);
                expect(getLess(wrapper)).toHaveLength(0);
            });

            it('should set correct number of rows', () => {
                const wrapper = renderTable(fixture);
                expect(wrapper.find(Table).prop('rows').length).toEqual(ROWS_PER_PAGE);
            });

            it('should call onMore callback with number of rows and page when user clicks "More"', () => {
                const onMore = jest.fn();
                const wrapper = renderTable(fixture, { onMore });
                getMore(wrapper).simulate('click');
                expect(onMore).toBeCalledWith({
                    rows: ROWS_PER_PAGE * 2,
                    page: 2
                });
            });
        });

        describe('and table is showing some page', () => {
            function prepareComponent(props = {}) {
                const wrapper = renderTable(fixture, props);
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
                const wrapper = renderTable(fixture, props);
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
