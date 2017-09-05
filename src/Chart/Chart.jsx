import Highcharts from 'highcharts';
import { noop, isEqual } from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Chart extends Component {
    static propTypes = {
        callback: PropTypes.func,
        config: PropTypes.object.isRequired,
        domProps: PropTypes.object
    };

    static defaultProps = {
        callback: noop,
        domProps: {}
    };

    constructor(props) {
        super(props);
        this.setChartRef = this.setChartRef.bind(this);
    }

    componentDidMount() {
        this.createChart(this.props.config);
    }

    shouldComponentUpdate(nextProps) {
        if (isEqual(this.props.config, nextProps.config)) {
            return false;
        }

        return true;
    }

    componentDidUpdate() {
        this.createChart(this.props.config);
    }

    componentWillUnmount() {
        this.chart.destroy();
    }

    setChartRef(ref) {
        this.chartRef = ref;
    }

    getChart() {
        if (!this.chart) {
            throw new Error('getChart() should not be called before the component is mounted');
        }

        return this.chart;
    }

    createChart(config) {
        const chartConfig = config.chart;
        this.chart = new Highcharts.Chart(
            {
                ...config,
                chart: {
                    ...chartConfig,
                    renderTo: this.chartRef
                }
            },
            this.props.callback
        );
    }

    render() {
        return (
            <div
                {...this.props.domProps}
                ref={this.setChartRef}
            />
        );
    }
}
