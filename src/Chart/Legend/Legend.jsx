import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { throttle } from 'lodash';
import Measure from 'react-measure';
import cx from 'classnames';

import FluidLegend from './FluidLegend';
import StaticLegend from './StaticLegend';


export const FLUID_LEGEND_THRESHOLD = 768;

export default class Legend extends PureComponent {
    static propTypes = {
        chartType: PropTypes.string.isRequired,
        series: PropTypes.array.isRequired,
        onItemClick: PropTypes.func.isRequired,
        position: PropTypes.string.isRequired,
        responsive: PropTypes.bool,
        height: PropTypes.number, // Prop is required for fixed height on Dashboards
        documentObj: PropTypes.shape({
            documentElement: PropTypes.shape({
                clientWidth: PropTypes.number.isRequired
            })
        })
    };

    static defaultProps = {
        responsive: false,
        documentObj: document,
        height: 0
    };

    constructor(props) {
        super(props);

        this.state = {
            showFluid: this.shouldShowFluid(),
            disabledSeries: []
        };

        this.onItemClick = this.onItemClick.bind(this);
        this.throttledOnWindowResize = throttle(this.onWindowResize.bind(this), 100);
    }

    componentDidMount() {
        window.addEventListener('resize', this.throttledOnWindowResize);
    }

    componentWillUnmount() {
        this.throttledOnWindowResize.cancel();
        window.removeEventListener('resize', this.throttledOnWindowResize);
    }

    onWindowResize() {
        this.setState({
            showFluid: this.shouldShowFluid()
        });
    }

    onItemClick(item) {
        const { disabledSeries } = this.state;
        const idx = disabledSeries.indexOf(item.legendIndex);
        const isDisabled = idx >= 0;
        if (isDisabled) {
            this.setState({
                disabledSeries: disabledSeries.filter(s => s !== item.legendIndex)
            });
        } else {
            this.setState({
                disabledSeries: [...disabledSeries, item.legendIndex]
            });
        }
        this.props.onItemClick(item, isDisabled);
    }

    getSeries() {
        const { series } = this.props;
        const { disabledSeries } = this.state;

        return series.map((s) => {
            return {
                ...s,
                isVisible: disabledSeries.indexOf(s.legendIndex) < 0
            };
        });
    }

    shouldShowFluid() {
        const { documentObj } = this.props;
        return documentObj.documentElement.clientWidth < FLUID_LEGEND_THRESHOLD;
    }

    renderFluid() {
        const { chartType } = this.props;

        return (
            <Measure>
                {({ width }) => (
                    <div className="viz-fluid-legend-wrap">
                        <FluidLegend
                            series={this.getSeries()}
                            chartType={chartType}
                            onItemClick={this.onItemClick}
                            containerWidth={width}
                        />
                    </div>
                )}
            </Measure>
        );
    }

    renderStatic() {
        const { chartType, position, height } = this.props;

        const classNames = cx('viz-static-legend-wrap', `position-${position}`);

        const props = {
            series: this.getSeries(),
            chartType,
            onItemClick: this.onItemClick,
            position
        };

        return (
            <Measure>
                {dimensions => (
                    <div className={classNames}>
                        <StaticLegend
                            {...props}
                            containerHeight={height || dimensions.height}
                        />
                    </div>
                )}
            </Measure>
        );
    }

    render() {
        const { responsive } = this.props;
        const { showFluid } = this.state;

        const fluidLegend = responsive && showFluid;

        if (fluidLegend) {
            return this.renderFluid();
        }

        return this.renderStatic();
    }
}
