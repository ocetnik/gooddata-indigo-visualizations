import Highcharts from 'highcharts';
import drillmodule from 'highcharts/modules/drilldown';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { cloneDeep, get, set, isEqual } from 'lodash';
import cx from 'classnames';

import { PIE_CHART } from '../VisualizationTypes';
import Chart from './Chart';
import Legend from './Legend/Legend';
import { initChartPlugins } from './highcharts/chartPlugins';
import { TOP, LEFT, BOTTOM, RIGHT } from './Legend/PositionTypes';

const CHART_TEXT_PADDING = 50;

drillmodule(Highcharts);
initChartPlugins(Highcharts, CHART_TEXT_PADDING);

export function renderChart(props) {
    return <Chart {...props} />;
}

export function renderLegend(props) {
    return <Legend {...props} />;
}

export default class HighChartRenderer extends PureComponent {
    static propTypes = {
        hcOptions: PropTypes.object.isRequired,
        chartOptions: PropTypes.object.isRequired,
        afterRender: PropTypes.func,
        height: PropTypes.number,
        legend: PropTypes.shape({
            enabled: PropTypes.bool,
            position: PropTypes.string,
            responsive: PropTypes.bool,
            items: PropTypes.arrayOf(PropTypes.shape({
                legendIndex: PropTypes.number.isRequired,
                name: PropTypes.string.isRequired,
                color: PropTypes.string.isRequired
            })).isRequired
        }),
        chartRenderer: PropTypes.func,
        legendRenderer: PropTypes.func
    };

    static defaultProps = {
        afterRender: () => {},
        height: null,
        legend: {
            enabled: true,
            responsive: false,
            position: RIGHT
        },
        chartRenderer: renderChart,
        legendRenderer: renderLegend
    };

    constructor(props) {
        super(props);
        this.state = {
            legendItemsEnabled: []
        };
        this.setChartRef = this.setChartRef.bind(this);
        this.onLegendItemClick = this.onLegendItemClick.bind(this);
    }

    componentWillMount() {
        this.resetLegendState(this.props);
    }

    componentDidMount() {
        // http://stackoverflow.com/questions/18240254/highcharts-width-exceeds-container-div-on-first-load
        setTimeout(() => {
            if (this.chartRef) {
                const chart = this.chartRef.getChart();

                chart.container.style.height = this.props.height || '100%';
                chart.container.style.position = this.props.height ? 'relative' : 'absolute';

                chart.reflow();
            }
        }, 0);
    }

    componentWillReceiveProps(nextProps) {
        const thisLegendItems = get(this.props, 'legend.items', []);
        const nextLegendItems = get(nextProps, 'legend.items', []);
        const hasLegendChanged = !isEqual(thisLegendItems, nextLegendItems);
        if (hasLegendChanged) {
            this.resetLegendState(nextProps);
        }
    }

    onLegendItemClick(item) {
        this.setState({
            legendItemsEnabled: set(
                [...this.state.legendItemsEnabled],
                item.legendIndex,
                !this.state.legendItemsEnabled[item.legendIndex]
            )
        });
    }

    setChartRef(chartRef) {
        this.chartRef = chartRef;
    }

    getFlexDirection() {
        const { legend } = this.props;

        if (legend.position === TOP || legend.position === BOTTOM) {
            return 'column';
        }

        return 'row';
    }

    resetLegendState(props) {
        const legendItemsCount = get(props, 'legend.items.length', 0);
        this.setState({
            legendItemsEnabled: new Array(legendItemsCount).fill(true)
        });
    }

    createChartConfig(chartConfig, legendItemsEnabled) {
        const config = cloneDeep(chartConfig);

        config.yAxis.title.style = {
            ...config.yAxis.title.style,
            textOverflow: 'ellipsis',
            overflow: 'hidden'
        };

        if (this.props.height) {
            // fixed chart height is used in Dashboard mobile view
            // with minHeight of the container (legend overlaps)
            config.chart.height = this.props.height;
        }

        // render chart with disabled visibility based on legendItemsEnabled
        const itemsPath = config.chart.type === PIE_CHART ? 'series[0].data' : 'series';
        set(config, itemsPath, get(config, itemsPath).map((item, itemIndex) => {
            const visible = legendItemsEnabled[itemIndex] !== undefined
                ? legendItemsEnabled[itemIndex]
                : true;
            return {
                ...item,
                visible
            };
        }));
        return config;
    }

    renderLegend() {
        const { chartOptions, legend, height, legendRenderer } = this.props;
        const { items } = legend;

        if (!legend.enabled) {
            return false;
        }

        const legendProps = {
            position: legend.position,
            responsive: legend.responsive,
            chartType: chartOptions.type,
            series: items,
            onItemClick: this.onLegendItemClick,
            legendItemsEnabled: this.state.legendItemsEnabled,
            height
        };

        return legendRenderer(legendProps);
    }

    renderHighcharts() {
        const style = { flex: '1 1 auto', position: 'relative' };
        const chartProps = {
            domProps: { className: 'viz-react-highchart-wrap', style },
            ref: this.setChartRef,
            config: this.createChartConfig(this.props.hcOptions, this.state.legendItemsEnabled),
            callback: this.props.afterRender
        };
        return this.props.chartRenderer(chartProps);
    }

    render() {
        const { legend } = this.props;

        const classes = cx(
            'viz-line-family-chart-wrap',
            legend.responsive ? 'responsive-legend' : 'non-responsive-legend',
            {
                [`flex-direction-${this.getFlexDirection()}`]: true
            }
        );

        const renderLegendFirst = !legend.responsive && (
            legend.position === TOP || legend.position === LEFT
        );

        return (
            <div className={classes}>
                {renderLegendFirst && this.renderLegend()}
                {this.renderHighcharts()}
                {!renderLegendFirst && this.renderLegend()}
            </div>
        );
    }
}
