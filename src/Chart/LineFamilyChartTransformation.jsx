import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { get, pick } from 'lodash';
import invariant from 'invariant';
import {
    transformConfigToLine
} from './chartConfigCreators';

import {
    getLineFamilyChartData,
    getLineFamilyChartOptions
} from './chartCreators';

import {
    getLineChartConfiguration,
    getColumnChartConfiguration,
    getBarChartConfiguration,
    isDataOfReasonableSize
} from './highChartsCreators';

import { hideDataLabels } from './highcharts/helpers';

import { LINE_CHART, BAR_CHART, COLUMN_CHART } from '../VisualizationTypes';
import { getLegendConfig } from './Legend/helpers';

import HighChartRenderer from './HighChartRenderer';

import DrillableItem from '../proptypes/DrillableItem';

export function renderLineFamilyChart(props) {
    return <HighChartRenderer {...props} />;
}

export default class LineFamilyChartTransformation extends Component {
    static propTypes = {
        afm: PropTypes.object,
        config: PropTypes.shape({
            buckets: PropTypes.object.isRequired,
            type: PropTypes.string.isRequired,
            legend: PropTypes.shape({
                enabled: PropTypes.bool
            }),
            colors: PropTypes.arrayOf(PropTypes.string)
        }).isRequired,
        limits: PropTypes.shape({
            series: PropTypes.number,
            categories: PropTypes.number
        }),
        data: PropTypes.shape({
            headers: PropTypes.arrayOf(PropTypes.object),
            rawData: PropTypes.arrayOf(PropTypes.array)
        }).isRequired,
        drillableItems: PropTypes.arrayOf(PropTypes.shape(DrillableItem)),
        height: PropTypes.number,
        width: PropTypes.number,

        afterRender: PropTypes.func,
        lineFamilyChartRenderer: PropTypes.func.isRequired,
        onDataTooLarge: PropTypes.func
    };

    static defaultProps = {
        afm: {},
        drillableItems: [],
        lineFamilyChartRenderer: renderLineFamilyChart,
        afterRender: () => {},
        onDataTooLarge: null,
        limits: {},
        height: undefined,
        width: undefined
    };

    constructor(props) {
        super(props);

        this.onLegendItemClick = this.onLegendItemClick.bind(this);
    }

    componentWillMount() {
        this.createChartOptions(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.createChartOptions(nextProps);
    }

    onLegendItemClick(chartRef, item, isDisabled) {
        const seriesItem = chartRef.chart.series[item.legendIndex];
        if (isDisabled) {
            seriesItem.show();
        } else {
            hideDataLabels(seriesItem.points);
            seriesItem.hide();
        }
    }

    getLegendItems(hcOptions) {
        return hcOptions.series.map((s) => {
            return pick(s, ['name', 'color', 'legendIndex']);
        });
    }

    getHcOptions() {
        const chartOptions = this.chartOptions;
        const { config: { type }, afm } = this.props;

        switch (type) {
            case COLUMN_CHART:
                return getColumnChartConfiguration(chartOptions, afm);
            case BAR_CHART:
                return getBarChartConfiguration(chartOptions, afm);
            case LINE_CHART:
                return getLineChartConfiguration(chartOptions, afm);
            default:
                return invariant(`Unknown visualization type: ${type}`);
        }
    }

    shouldBeLegendEnabled() {
        const seriesLength = get(this.chartOptions, 'data.series', []).length;

        const hasManySeries = seriesLength > 1;
        const isStackedChart = !!this.chartOptions.stacking;

        return hasManySeries || isStackedChart;
    }

    createChartOptions(props) {
        const { config, data, onDataTooLarge, limits, drillableItems, afm } = props;
        const lineConfig = transformConfigToLine(config);
        this.chartOptions = getLineFamilyChartOptions(lineConfig, data);
        this.chartOptions.data = getLineFamilyChartData(lineConfig, data, drillableItems, afm);

        if (!isDataOfReasonableSize(this.chartOptions.data, limits)) {
            if (!onDataTooLarge) {
                invariant(onDataTooLarge, 'Visualization\'s onDataTooLarge callback is missing.');
            }

            onDataTooLarge();
            this.setState({ dataTooLarge: true });
        } else {
            this.setState({ dataTooLarge: false });
        }
    }

    render() {
        if (this.state.dataTooLarge) {
            return null;
        }

        const { height, width, afterRender, config } = this.props;
        const chartOptions = this.chartOptions;

        const hcOptions = this.getHcOptions();
        const legendItems = this.getLegendItems(hcOptions);
        const legendConfig = getLegendConfig(
            config.legend, this.shouldBeLegendEnabled(), legendItems, this.onLegendItemClick
        );

        return this.props.lineFamilyChartRenderer({
            chartOptions,
            hcOptions,
            height,
            width,
            afterRender,
            legend: legendConfig
        });
    }
}
