import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import LegendItem from './LegendItem';
import { calculateFluidLegend } from './helpers';

export default class FluidLegend extends PureComponent {
    static propTypes = {
        chartType: PropTypes.string.isRequired,
        series: PropTypes.array.isRequired,
        onItemClick: PropTypes.func.isRequired,
        containerWidth: PropTypes.number
    };

    static defaultProps = {
        containerWidth: null
    };

    constructor(props) {
        super(props);

        this.state = {
            showAll: false
        };

        this.toggleShowAll = this.toggleShowAll.bind(this);
    }

    toggleShowAll() {
        this.setState({
            showAll: !this.state.showAll
        });
    }

    renderSeries(itemWidth, visibleItemsCount) {
        const { series, chartType, onItemClick } = this.props;

        const limit = this.state.showAll ? series.length : visibleItemsCount;
        const pagedSeries = series.slice(0, limit);

        return (
            <div className="series">
                {pagedSeries.map((item, index) => {
                    return (
                        <LegendItem
                            width={itemWidth}
                            chartType={chartType}
                            key={index} // eslint-disable-line react/no-array-index-key
                            item={item}
                            onItemClick={onItemClick}
                        />
                    );
                })}
            </div>
        );
    }

    renderPaging() {
        const classes = cx('button-link',
            'button-icon-only',
            'paging-button', {
                'icon-chevron-up': this.state.showAll,
                'icon-chevron-down': !this.state.showAll
            }
        );
        return (
            <div className="paging">
                <button className={classes} onClick={this.toggleShowAll} />
            </div>
        );
    }

    render() {
        const { series, containerWidth } = this.props;
        const { itemWidth, hasPaging, visibleItemsCount } =
            calculateFluidLegend(series.length, containerWidth);
        return (
            <div className="viz-legend fluid">
                {this.renderSeries(itemWidth, visibleItemsCount)}
                {hasPaging && this.renderPaging()}
            </div>
        );
    }
}
