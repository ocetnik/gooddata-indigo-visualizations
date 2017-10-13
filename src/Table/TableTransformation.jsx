import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { noop, pick } from 'lodash';

import Table from './Table';
import DrillableItem from '../proptypes/DrillableItem';
import { getHeaders, getRows, validateTableProportions } from './utils/dataTransformation';
import { getSortInfo, getSortItem } from './utils/sort';
import {
    ExecutionRequestPropTypes,
    ExecutionResponsePropTypes,
    ExecutionResultPropTypes
} from '../proptypes/execution';

function renderDefaultTable(props) {
    return <Table {...props} />;
}

export default class TableTransformation extends Component {
    static propTypes = {
        afterRender: PropTypes.func,
        aggregations: PropTypes.array,
        config: PropTypes.object,
        drillableItems: PropTypes.arrayOf(PropTypes.shape(DrillableItem)),
        executionRequest: ExecutionRequestPropTypes.isRequired,
        executionResponse: ExecutionResponsePropTypes.isRequired,
        executionResult: ExecutionResultPropTypes.isRequired,
        height: PropTypes.number,
        onFiredDrillEvent: PropTypes.func,
        onSortChange: PropTypes.func,
        tableRenderer: PropTypes.func,
        width: PropTypes.number
    };

    static defaultProps = {
        afterRender: noop,
        aggregations: [],
        config: {},
        drillableItems: [],
        height: undefined,
        onFiredDrillEvent: noop,
        onSortChange: noop,
        tableRenderer: renderDefaultTable,
        width: undefined
    };

    render() {
        const {
            aggregations,
            config,
            drillableItems,
            executionRequest,
            executionResponse,
            executionResult,
            height,
            onFiredDrillEvent,
            onSortChange,
            width
        } = this.props;

        const headers = getHeaders(executionResponse);
        const rows = getRows(executionResult);

        validateTableProportions(headers, rows);

        const sortItem = getSortItem(executionRequest);
        const { sortBy, sortDir } = getSortInfo(sortItem, headers);

        const tableProps = {
            ...pick(config, ['rowsPerPage', 'onMore', 'onLess', 'sortInTooltip', 'stickyHeaderOffset']),
            afterRender: this.props.afterRender,
            aggregations,
            drillableItems,
            executionRequest,
            headers,
            onFiredDrillEvent,
            onSortChange,
            rows,
            sortBy,
            sortDir
        };

        if (height) {
            tableProps.containerHeight = height;
        }

        if (width) {
            tableProps.containerWidth = width;
        }

        return this.props.tableRenderer(tableProps);
    }
}
