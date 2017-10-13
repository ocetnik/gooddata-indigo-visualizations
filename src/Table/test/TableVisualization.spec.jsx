import React from 'react';
import { mount } from 'enzyme';
import { Table } from 'fixed-data-table-2';

import TableVisualization from '../TableVisualization';
import { withIntl } from '../../test/utils';
import { ASC, DESC } from '../constants/sort';
import { EXECUTION_REQUEST_1A_2M, TABLE_HEADERS_1A_2M, TABLE_ROWS_1A_2M } from '../fixtures/1attribute2measures';

const WrappedTable = withIntl(TableVisualization);

describe('Table', () => {
    function renderTable(customProps = {}) {
        const props = {
            containerWidth: 600,
            containerHeight: 400,
            rows: TABLE_ROWS_1A_2M,
            headers: TABLE_HEADERS_1A_2M,
            executionRequest: EXECUTION_REQUEST_1A_2M,
            ...customProps
        };

        return mount(
            <WrappedTable {...props} />
        );
    }

    it('should fit container dimensions', () => {
        const wrapper = renderTable();
        expect(wrapper.find(Table).prop('width')).toEqual(600);
        expect(wrapper.find(Table).prop('height')).toEqual(400);
    });

    it('should render column headers', () => {
        const wrapper = renderTable();
        expect(wrapper.find(Table).prop('children')).toHaveLength(3);
    });

    it('should align measure columns to the right', () => {
        const wrapper = renderTable();
        const columns = wrapper.find(Table).prop('children');
        expect(columns[0].props.align).toEqual('left');
        expect(columns[1].props.align).toEqual('right');
        expect(columns[2].props.align).toEqual('right');
    });

    it('should distribute width evenly between columns', () => {
        const wrapper = renderTable();
        const columns = wrapper.find(Table).prop('children');
        expect(columns[0].props.width).toEqual(200);
    });

    describe('renderers', () => {
        function renderCell(wrapper, columnKey) {
            const columns = wrapper.find(Table).prop('children');
            const cell = columns[columnKey].props.cell({ rowIndex: 0, columnKey });
            return cell.props.children;
        }

        it('should format measures', () => {
            const wrapper = renderTable();
            const span = renderCell(wrapper, 2);
            const spanContent = span.props.children;
            expect(spanContent).toEqual('1,324');
            expect(span.props.style.color).toEqual('#FF0000');
        });

        it('should render attributes as strings', () => {
            const wrapper = renderTable();
            const span = renderCell(wrapper, 0);
            const spanContent = span.props.children;
            expect(spanContent).toEqual('Wile E. Coyote');
            expect(span.props.style).toEqual({});
        });

        it('should render title into header', () => {
            const wrapper = renderTable();
            expect(wrapper.find('.gd-table-header-title').first().text()).toEqual('Name');
        });

        it('should bind onclick when cell drillable', () => {
            const wrapper = renderTable({ drillableItems: [{ uri: '/gdc/md/project_id/obj/1st_measure_uri_id' }] });
            const columns = wrapper.find(Table).prop('children');
            const cell = columns[1].props.cell({ rowIndex: 0, columnKey: 1 });

            expect(cell.props).toHaveProperty('onClick', expect.any(Function));
        });

        it('should not bind onclick when cell not drillable', () => {
            const wrapper = renderTable({ drillableItems: [{ uri: '/gdc/md/project_id/obj/unknown_measure_uri_id' }] });
            const columns = wrapper.find(Table).prop('children');
            const cell = columns[1].props.cell({ rowIndex: 0, columnKey: 1 });

            expect(cell.props).not.toHaveProperty('onClick', expect.any(Function));
        });
    });

    describe('sort', () => {
        describe('default header renderer', () => {
            it('should render up arrow', () => {
                const wrapper = renderTable({ sortBy: 0, sortDir: ASC });
                const columns = wrapper.find(Table).prop('children');
                const header = columns[0].props.header({ columnKey: 0 });
                const sort = header.props.children[1];

                expect(sort.props.className).toEqual('gd-table-arrow-up');
            });

            it('should render down arrow', () => {
                const wrapper = renderTable({ sortBy: 0, sortDir: DESC });
                const columns = wrapper.find(Table).prop('children');
                const header = columns[0].props.header({ columnKey: 0 });
                const sort = header.props.children[1];

                expect(sort.props.className).toEqual('gd-table-arrow-down');
            });

            it('should render arrow on second column', () => {
                const wrapper = renderTable({ sortBy: 1, sortDir: ASC });
                const columns = wrapper.find(Table).prop('children');
                const header = columns[1].props.header({ columnKey: 0 });
                const sort = header.props.children[1];

                expect(sort.props.className).toEqual('gd-table-arrow-up');
            });

            it('should not render arrow if sort info is missing', () => {
                const wrapper = renderTable({ sortBy: 0, sortDir: null });
                const columns = wrapper.find(Table).prop('children');
                const header = columns[0].props.header({ columnKey: 0 });
                const sort = header.props.children[1];

                expect(sort.props.className).toEqual('');
            });
        });

        describe('tooltip header renderer', () => {
            it('should render title into header', () => {
                const wrapper = renderTable({ sortInTooltip: true });

                wrapper.find('.gd-table-header-title').first().simulate('click');

                const bubble = document.querySelector('.gd-table-header-bubble');
                expect(bubble).toBeDefined();

                // work-around to handle overlays
                document.body.innerHTML = '';
            });
        });
    });
});
