import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Cell, Column, Table } from 'fixed-data-table-2';
import { assign, debounce, noop, pick, uniqueId } from 'lodash';

import Bubble from '@gooddata/goodstrap/lib/Bubble/Bubble';
import BubbleHoverTrigger from '@gooddata/goodstrap/lib/Bubble/BubbleHoverTrigger';

import TableSortBubbleContent from './TableSortBubbleContent';
import DrillableItem from '../proptypes/DrillableItem';
import { getCellClassNames, getColumnAlign, getStyledLabel } from './utils/cell';
import { getBackwardCompatibleHeaderForDrilling, getBackwardCompatibleRowForDrilling } from './utils/dataTransformation';
import { cellClick, isDrillable } from '../utils/drilldownEventing';
import { getHeaderSortClassName, getNextSortDir } from './utils/sort';
import {
    calculateArrowPositions,
    getHeaderClassNames,
    getTooltipAlignPoints,
    getTooltipSortAlignPoints
} from './utils/header';

const FULLSCREEN_TOOLTIP_VIEWPORT_THRESHOLD = 480;
const MIN_COLUMN_WIDTH = 100;

export const DEFAULT_HEADER_HEIGHT = 26;
export const DEFAULT_ROW_HEIGHT = 30;

const DEBOUNCE_SCROLL_STOP = 500;
const TOOLTIP_DISPLAY_DELAY = 1000;

export default class TableVisualization extends Component {
    static propTypes = {
        afterRender: PropTypes.func,
        containerHeight: PropTypes.number,
        containerMaxHeight: PropTypes.number,
        containerWidth: PropTypes.number.isRequired,
        drillableItems: PropTypes.arrayOf(PropTypes.shape(DrillableItem)),
        executionRequest: PropTypes.object,
        hasHiddenRows: PropTypes.bool,
        headers: PropTypes.array,
        onSortChange: PropTypes.func,
        rows: PropTypes.array,
        sortBy: PropTypes.number,
        sortDir: PropTypes.string,
        sortInTooltip: PropTypes.bool,
        stickyHeaderOffset: PropTypes.number
    };

    static defaultProps = {
        afterRender: noop,
        containerHeight: null,
        containerMaxHeight: null,
        drillableItems: [],
        executionRequest: {},
        hasHiddenRows: false,
        headers: [],
        onSortChange: noop,
        rows: [],
        sortBy: null,
        sortDir: null,
        sortInTooltip: false,
        stickyHeaderOffset: -1
    };

    static fullscreenTooltipEnabled() {
        return document.documentElement.clientWidth <= FULLSCREEN_TOOLTIP_VIEWPORT_THRESHOLD;
    }

    static isSticky(stickyHeaderOffset) {
        return stickyHeaderOffset >= 0;
    }

    constructor(props) {
        super(props);
        this.state = {
            hintSortBy: null,
            sortBubble: {
                visible: false
            },
            width: 0,
            height: 0
        };

        this.closeBubble = this.closeBubble.bind(this);
        this.renderDefaultHeader = this.renderDefaultHeader.bind(this);
        this.renderTooltipHeader = this.renderTooltipHeader.bind(this);
        this.scrolled = this.scrolled.bind(this);
        this.setTableRef = this.setTableRef.bind(this);
        this.setTableWrapRef = this.setTableWrapRef.bind(this);

        this.stopped = debounce(() => this.scrollHeader(true), DEBOUNCE_SCROLL_STOP);
    }

    componentDidMount() {
        // eslint-disable-next-line react/no-find-dom-node
        this.table = ReactDOM.findDOMNode(this.tableRef);
        this.header = this.table.querySelector('.fixedDataTableRowLayout_rowWrapper');

        if (TableVisualization.isSticky(this.props.stickyHeaderOffset)) {
            this.setListeners('add');
            this.scrolled();
            this.checkTableDimensions();
        }
    }

    componentWillReceiveProps(nextProps) {
        const current = this.props;
        const currentIsSticky = TableVisualization.isSticky(current.stickyHeaderOffset);
        const nextIsSticky = TableVisualization.isSticky(nextProps.stickyHeaderOffset);

        if (currentIsSticky !== nextIsSticky) {
            if (currentIsSticky) {
                this.setListeners('remove');
            }
            if (nextIsSticky) {
                this.setListeners('add');
            }
        }
    }

    componentDidUpdate() {
        if (TableVisualization.isSticky(this.props.stickyHeaderOffset)) {
            this.scrollHeader(true);
            this.checkTableDimensions();
        }

        this.props.afterRender();
    }

    componentWillUnmount() {
        if (TableVisualization.isSticky(this.props.stickyHeaderOffset)) {
            this.setListeners('remove');
        }
    }

    setTableRef(ref) {
        this.tableRef = ref;
    }

    setTableWrapRef(ref) {
        this.tableWrapRef = ref;
    }

    setListeners(action) {
        const method = `${action}EventListener`;
        const scrollEvents = ['scroll', 'goodstrap.scrolled', 'goodstrap.drag'];
        scrollEvents.forEach(name => window[method](name, this.scrolled));
    }

    setHeader(position = '', x = 0, y = 0) {
        const { style, classList } = this.header;

        classList[position ? 'add' : 'remove']('sticking');
        style.position = position;
        style.left = `${Math.round(x)}px`;
        style.top = `${Math.round(y)}px`;
    }

    getSortFunc(header, sort) {
        const { onSortChange } = this.props;

        const sortItem = header.type === 'attribute' ? {
            attributeSortItem: {
                direction: sort.nextDir,
                attributeIdentifier: header.localIdentifier
            }
        } : {
            measureSortItem: {
                direction: sort.nextDir,
                locators: [
                    {
                        measureLocatorItem: {
                            measureIdentifier: header.localIdentifier
                        }
                    }
                ]
            }
        };

        return onSortChange(sortItem);
    }

    getSortObj(header, index) {
        const { sortBy, sortDir } = this.props;
        const { hintSortBy } = this.state;

        const dir = (sortBy === index ? sortDir : null);
        const nextDir = getNextSortDir(header, dir);

        return {
            dir,
            nextDir,
            sortDirClass: getHeaderSortClassName(hintSortBy === index ? nextDir : dir)
        };
    }

    getMouseOverFunc(index) {
        return () => {
            // workaround glitch with fixed-data-table-2,
            // where header styles are overwritten first time user mouses over it
            this.scrolled();

            this.setState({ hintSortBy: index });
        };
    }

    checkTableDimensions() {
        if (this.table) {
            const { width, height } = this.state;
            const rect = this.table.getBoundingClientRect();

            if (width !== rect.width || height !== rect.height) {
                this.setState(pick(rect, 'width', 'height'));
            }
        }
    }

    scrollHeader(stopped = false) {
        const { stickyHeaderOffset, sortInTooltip, hasHiddenRows } = this.props;
        const boundingRect = this.table.getBoundingClientRect();

        if (!stopped && sortInTooltip && this.state.sortBubble.visible) {
            this.closeBubble();
        }

        if (boundingRect.top >= stickyHeaderOffset ||
            boundingRect.top < stickyHeaderOffset - boundingRect.height
        ) {
            this.setHeader();
            return;
        }

        const headerOffset = DEFAULT_HEADER_HEIGHT + ((hasHiddenRows ? 2 : 1) * DEFAULT_ROW_HEIGHT);

        if (boundingRect.bottom >= stickyHeaderOffset &&
            boundingRect.bottom < stickyHeaderOffset + headerOffset
        ) {
            this.setHeader('absolute', 0, boundingRect.height - headerOffset);
            return;
        }

        if (stopped) {
            this.setHeader('absolute', 0, stickyHeaderOffset - boundingRect.top);
        } else {
            this.setHeader('fixed', boundingRect.left, stickyHeaderOffset);
        }
    }

    scrolled() {
        this.scrollHeader();
        this.stopped(); // required for Edge/IE to make sticky header clickable
    }

    closeBubble() {
        this.setState({
            sortBubble: {
                visible: false
            }
        });
    }

    isBubbleVisible(index) {
        const { sortBubble } = this.state;
        return sortBubble.visible && sortBubble.index === index;
    }

    renderTooltipHeader(header, index, columnWidth) {
        const headerClasses = getHeaderClassNames(header);
        const bubbleClass = uniqueId('table-header-');
        const cellClasses = classNames(headerClasses, bubbleClass);

        const sort = this.getSortObj(header, index);

        const columnAlign = getColumnAlign(header);
        const sortingModalAlignPoints = getTooltipSortAlignPoints(columnAlign);

        const getArrowPositions = () => {
            return TableVisualization.fullscreenTooltipEnabled() ?
                calculateArrowPositions(
                    {
                        width: columnWidth,
                        align: columnAlign,
                        index
                    },
                    this.tableRef.state.scrollX,
                    this.tableWrapRef
                ) : null;
        };

        const showSortBubble = () => {
            // workaround glitch with fixed-data-table-2
            // where header styles are overwritten first time user clicks on it
            this.scrolled();

            this.setState({
                sortBubble: {
                    visible: true,
                    index
                }
            });
        };

        return props => (
            <span>
                <Cell {...props} className={cellClasses} onClick={showSortBubble}>
                    <span className="gd-table-header-title">
                        {header.name}
                    </span>
                    <span className={sort.sortDirClass} />
                </Cell>
                {this.isBubbleVisible(index) &&
                <Bubble
                    closeOnOutsideClick
                    alignTo={`.${bubbleClass}`}
                    className="gd-table-header-bubble bubble-light"
                    overlayClassName="gd-table-header-bubble-overlay"
                    alignPoints={sortingModalAlignPoints}
                    arrowDirections={{
                        'bl tr': 'top',
                        'br tl': 'top',
                        'tl br': 'bottom',
                        'tr bl': 'bottom'
                    }}
                    arrowOffsets={{
                        'bl tr': [14, 10],
                        'br tl': [-14, 10],
                        'tl br': [14, -10],
                        'tr bl': [-14, -10]
                    }}
                    arrowStyle={getArrowPositions}
                    onClose={this.closeBubble}
                >
                    <TableSortBubbleContent
                        activeSortDir={sort.dir}
                        title={header.name}
                        onClose={this.closeBubble}
                        onSortChange={this.getSortFunc(header, sort)}
                    />
                </Bubble>
                }
            </span>
        );
    }

    renderDefaultHeader(header, index) {
        const headerClasses = getHeaderClassNames(header);
        const onMouseEnter = this.getMouseOverFunc(index);
        const onMouseLeave = this.getMouseOverFunc(null);
        const sort = this.getSortObj(header, index);
        const onClick = () => this.getSortFunc(header, sort);

        const columnAlign = getColumnAlign(header);
        const tooltipAlignPoints = getTooltipAlignPoints(columnAlign);

        return props => (
            <Cell
                {...props}
                className={headerClasses}
                onClick={onClick}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            >
                <BubbleHoverTrigger className="gd-table-header-title" showDelay={TOOLTIP_DISPLAY_DELAY}>
                    {header.name}
                    <Bubble
                        closeOnOutsideClick
                        className="bubble-light"
                        overlayClassName="gd-table-header-bubble-overlay"
                        alignPoints={tooltipAlignPoints}
                    >
                        {header.name}
                    </Bubble>
                </BubbleHoverTrigger>
                <span className={sort.sortDirClass} />
            </Cell>
        );
    }

    renderCell(headers, index) {
        const { rows, drillableItems, executionRequest } = this.props;
        const header = headers[index];
        const drillable = isDrillable(drillableItems, header);

        return (cellProps) => {
            const { rowIndex, columnKey } = cellProps;
            const row = rows[rowIndex];
            const cellContent = row[columnKey];
            const classes = getCellClassNames(rowIndex, columnKey, drillable);
            const { style, label } = getStyledLabel(header, cellContent);

            const cellPropsDrill = drillable ? assign({}, cellProps, {
                onClick(e) {
                    cellClick(
                        executionRequest,
                        {
                            columnIndex: columnKey,
                            rowIndex,
                            row: getBackwardCompatibleRowForDrilling(row),
                            intersection: [getBackwardCompatibleHeaderForDrilling(header)]
                        },
                        e.target
                    );
                }
            }) : cellProps;

            return (
                <Cell {...cellPropsDrill}>
                    <span className={classes} style={style} title={label}>{label}</span>
                </Cell>
            );
        };
    }

    renderColumns(headers, columnWidth) {
        const renderHeader = this.props.sortInTooltip ? this.renderTooltipHeader : this.renderDefaultHeader;

        return headers.map((header, index) => (
            <Column
                key={`${index}.${header.localIdentifier}`} // eslint-disable-line react/no-array-index-key
                width={columnWidth}
                align={getColumnAlign(header)}
                columnKey={index}
                header={renderHeader(header, index, columnWidth)}
                cell={this.renderCell(headers, index)}
                allowCellsRecycling
            />
        ));
    }

    renderStickyTableBackgroundFiller() {
        return (
            <div
                className="indigo-table-background-filler"
                style={{ ...pick(this.state, 'width', 'height') }}
            />
        );
    }

    render() {
        const {
            containerHeight,
            containerMaxHeight,
            containerWidth,
            hasHiddenRows,
            headers,
            stickyHeaderOffset
        } = this.props;

        const height = containerMaxHeight ? undefined : containerHeight;
        const columnWidth = Math.max(containerWidth / headers.length, MIN_COLUMN_WIDTH);
        const isSticky = TableVisualization.isSticky(stickyHeaderOffset);
        const componentClasses = classNames('indigo-table-component', { 'has-hidden-rows': hasHiddenRows });
        const componentContentClasses = classNames('indigo-table-component-content', { 'has-sticky-header': isSticky });

        return (
            <div className={componentClasses}>
                <div className={componentContentClasses} ref={this.setTableWrapRef}>
                    <Table
                        ref={this.setTableRef}
                        touchScrollEnabled
                        headerHeight={DEFAULT_HEADER_HEIGHT}
                        rowHeight={DEFAULT_ROW_HEIGHT}
                        rowsCount={this.props.rows.length}
                        width={containerWidth}
                        maxHeight={containerMaxHeight}
                        height={height}
                        onScrollStart={this.closeBubble}
                    >
                        {this.renderColumns(headers, columnWidth)}
                    </Table>
                </div>
                {isSticky ? this.renderStickyTableBackgroundFiller() : false}
            </div>
        );
    }
}
