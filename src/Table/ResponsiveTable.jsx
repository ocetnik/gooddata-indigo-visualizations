import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { noop } from 'lodash';

import Table from './Table';
import TableControls from './TableControls';
import { DEFAULT_HEADER_HEIGHT, DEFAULT_ROW_HEIGHT, DEFAULT_FOOTER_ROW_HEIGHT } from './TableVisualization';

const HEIGHT_PADDING = 20;

const isTouchDevice = 'ontouchstart' in document.documentElement;

export default class ResponsiveTable extends Component {
    static propTypes = {
        aggregations: PropTypes.array,
        rows: PropTypes.array.isRequired,
        rowsPerPage: PropTypes.number.isRequired,
        page: PropTypes.number,
        onMore: PropTypes.func,
        onLess: PropTypes.func
    };

    static defaultProps = {
        aggregations: [],
        page: 1,
        onMore: noop,
        onLess: noop
    };

    constructor(props, ...args) {
        super(props, ...args);

        this.state = {
            page: props.page || 1
        };

        this.onMore = this.onMore.bind(this);
        this.onLess = this.onLess.bind(this);
        this.setTableRef = this.setTableRef.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.page) {
            this.setState({
                page: nextProps.page
            });
        }
    }

    onMore() {
        const page = this.state.page + 1;
        this.setState({ page });
        this.props.onMore({ page, rows: this.getRowCount(page) });
    }

    onLess() {
        const page = 1;
        this.setState({ page });
        this.props.onLess({ rows: this.getRowCount(page) });

        const header = this.table.getBoundingClientRect();
        window.scrollTo(window.pageXOffset, window.pageYOffset + header.top);
    }

    getRowCount(page) {
        return Math.min(this.props.rows.length, this.props.rowsPerPage * page);
    }

    getContainerMaxHeight() {
        const { rows, aggregations } = this.props;

        return (rows.length * DEFAULT_ROW_HEIGHT) +
            (aggregations.length * DEFAULT_FOOTER_ROW_HEIGHT) +
            DEFAULT_HEADER_HEIGHT + HEIGHT_PADDING;
    }

    setTableRef(table) {
        this.table = table;
    }

    isMoreButtonVisible() {
        return this.props.rows.length > this.props.rowsPerPage;
    }

    isMoreButtonDisabled() {
        return this.props.rows.length <= this.props.rowsPerPage * this.state.page;
    }

    isLessButtonVisible() {
        return this.state.page > 1;
    }

    render() {
        const props = this.props;

        const tableProps = {
            ...props,
            rows: props.rows.slice(0, this.getRowCount(this.state.page)),
            containerHeight: 0,
            containerMaxHeight: this.getContainerMaxHeight(),
            hasHiddenRows: !this.isMoreButtonDisabled(),
            sortInTooltip: isTouchDevice
        };

        return (
            <div className="gdc-indigo-responsive-table" ref={this.setTableRef}>
                <Table {...tableProps} />
                <TableControls
                    onMore={this.onMore}
                    onLess={this.onLess}
                    isMoreButtonDisabled={this.isMoreButtonDisabled()}
                    isMoreButtonVisible={this.isMoreButtonVisible()}
                    isLessButtonVisible={this.isLessButtonVisible()}
                />
            </div>
        );
    }
}
