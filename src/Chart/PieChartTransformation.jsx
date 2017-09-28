import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { get, pick } from 'lodash';

import { getPieChartOptions, getPieFamilyChartData } from './chartCreators';
import { getPieChartConfiguration } from './highChartsCreators';
import { PIE_CHART } from '../VisualizationTypes';
import { getLegendConfig } from './Legend/helpers';
import DrillableItem from '../proptypes/DrillableItem';

import HighChartRenderer from './HighChartRenderer';

function renderPieChartTransformation(props) {
    return <HighChartRenderer {...props} />;
}

export const PIE_CHART_LIMIT = 20;

function isNegative(num) {
    return parseFloat(num) < 0;
}

function getDataPoints(rawData) {
    const chartOptions = getPieChartOptions({ type: PIE_CHART }, rawData);

    const pieChartData = getPieFamilyChartData(chartOptions, rawData);

    return get(pieChartData, 'series.0.data');
}

function isLimitExceeded(rawData) {
    return getDataPoints(rawData).length > PIE_CHART_LIMIT;
}

function isNegativeValueIncluded(rawData) {
    const getYValue = dataPoint => get(dataPoint, 'y', 0);

    return getDataPoints(rawData)
        .map(getYValue)
        .some(isNegative);
}

export default class PieChartTransformation extends Component {
    static propTypes = {
        afm: PropTypes.object,
        config: PropTypes.shape({
            legend: PropTypes.shape({
                enabled: PropTypes.bool
            })
        }).isRequired,
        data: PropTypes.shape({
            rawData: PropTypes.arrayOf(PropTypes.array)
        }).isRequired,
        drillableItems: PropTypes.arrayOf(PropTypes.shape(DrillableItem)),
        height: PropTypes.number,
        width: PropTypes.number,
        onDataTooLarge: PropTypes.func,
        onNegativeValues: PropTypes.func,
        afterRender: PropTypes.func,
        pieChartRenderer: PropTypes.func.isRequired
    };

    static defaultProps = {
        afm: {},
        drillableItems: [],
        afterRender: () => {},
        onDataTooLarge: () => {},
        onNegativeValues: () => {},
        pieChartRenderer: renderPieChartTransformation,
        height: undefined,
        width: undefined
    };

    constructor(props) {
        super(props);

        this.onLegendItemClick = this.onLegendItemClick.bind(this);

        this.state = {};
    }

    componentWillMount() {
        this.checkDataPointsLimit(this.props);
        this.checkNegativeValues(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.checkDataPointsLimit(nextProps);
        this.checkNegativeValues(nextProps);
    }

    onLegendItemClick(chartRef, item) {
        const seriesItem = chartRef.chart.series[0].data[item.legendIndex];
        seriesItem.setVisible();
    }

    getLegendItems(hcOptions) {
        return hcOptions.series[0].data.map((s) => {
            return pick(s, ['name', 'color', 'legendIndex']);
        });
    }

    shouldBeLegendEnabled(chartOptions) {
        return chartOptions.data.series[0].data.length > 1;
    }

    checkDataPointsLimit({ data, onDataTooLarge }) {
        const isDataTooLarge = isLimitExceeded(data);

        this.setState({ dataTooLarge: isDataTooLarge });

        if (isDataTooLarge) {
            onDataTooLarge();
        }
    }

    checkNegativeValues({ data, onNegativeValues }) {
        if (isLimitExceeded(data)) {
            return;
        }

        const hasNegativeValue = isNegativeValueIncluded(data);

        this.setState({ hasNegativeValue });

        if (hasNegativeValue) {
            onNegativeValues();
        }
    }

    render() {
        const { dataTooLarge, hasNegativeValue } = this.state;

        if (dataTooLarge || hasNegativeValue) {
            return null;
        }

        const {
            afm,
            data,
            drillableItems,
            height,
            width,
            afterRender,
            config
        } = this.props;

        const chartOptions = getPieChartOptions({
            ...config,
            type: PIE_CHART,
            height
        }, data);

        chartOptions.data = getPieFamilyChartData(chartOptions, data, drillableItems, afm);

        const hcOptions = getPieChartConfiguration(chartOptions, afm);

        const legendItems = this.getLegendItems(hcOptions);
        const legendConfig = getLegendConfig(
            config.legend, this.shouldBeLegendEnabled(chartOptions), legendItems, this.onLegendItemClick
        );

        return this.props.pieChartRenderer({
            chartOptions,
            hcOptions,
            legend: legendConfig,
            height,
            width,
            afterRender
        });
    }
}
