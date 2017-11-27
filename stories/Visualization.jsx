import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import Visualization from '../src/Visualization';
import fixtureDataSets, * as fixtures from './test_data/fixtures';
import { wrap, screenshotWrap } from './utils/wrap';
import { immutableSet } from '../src/utils/common';

import '../src/styles/charts.scss';

class DynamicVisualization extends React.Component {
    constructor(props) {
        super(props);
        this.fixtures = {
            ...fixtureDataSets,
            updatedBarChartWith3MetricsAndViewByAttribute: (dataSet => immutableSet(
                dataSet,
                'executionResult.data[1]',
                dataSet.executionResult.data[1].map(pointValue => pointValue * 2)
            ))(fixtures.barChartWith3MetricsAndViewByAttribute)
        };

        this.legendOptions = {
            'no legend': { enabled: false },
            'legend top': { enabled: true, position: 'top' },
            'legend right': { enabled: true, position: 'right' },
            'legend bottom': { enabled: true, position: 'bottom' },
            'legend left': { enabled: true, position: 'left' }
        };

        this.chartTypes = [
            'column',
            'bar',
            'line',
            'pie'
        ];

        this.state = {
            chartType: 'column',
            dataSet: this.fixtures.barChartWith3MetricsAndViewByAttribute,
            legendOption: this.legendOptions['legend top']
        };
    }

    setDataSet(dataSetName) {
        this.setState({
            dataSet: this.fixtures[dataSetName]
        });
    }

    setLegend(legendOption) {
        this.setState({
            legendOption: this.legendOptions[legendOption]
        });
    }

    setChartType(chartType) {
        this.setState({
            chartType
        });
    }

    render() {
        const { dataSet, legendOption, chartType } = this.state;
        return (<div>
            <div>
                {screenshotWrap(wrap(<Visualization
                    config={{
                        type: chartType,
                        legend: legendOption
                    }}
                    {...dataSet}
                    onDataTooLarge={action('Data too large')}
                    onNegativeValues={action('Negative values in pie chart')}
                />, 600))}
            </div>
            <br />
            <div>
                { Object.keys(this.fixtures).map(dataSetName => (
                    <button key={dataSetName} onClick={() => this.setDataSet(dataSetName)} >{dataSetName}</button>
                )) }
            </div>
            <div>
                { Object.keys(this.legendOptions).map(legendOptionsItem => (
                    <button key={legendOptionsItem} onClick={() => this.setLegend(legendOptionsItem)} >
                        {legendOptionsItem}
                    </button>
                )) }
            </div>
            <div>
                { this.chartTypes.map(chartTypeOption => (
                    <button key={chartTypeOption} onClick={() => this.setChartType(chartTypeOption)} >
                        {chartTypeOption}
                    </button>
                )) }
            </div>
        </div>);
    }
}

storiesOf('Visualization')
    .add('visualization bar chart without attributes', () => {
        const dataSet = fixtures.barChartWithoutAttributes;

        return screenshotWrap(
            wrap(
                <Visualization
                    {...dataSet}
                    config={{
                        type: 'bar'
                    }}
                    onDataTooLarge={f => f}
                />
            )
        );
    })
    .add('visualization column chart with 3 metrics and view by attribute', () => {
        const dataSet = fixtures.barChartWith3MetricsAndViewByAttribute;

        return screenshotWrap(
            wrap(
                <Visualization
                    {...dataSet}
                    config={{
                        type: 'column',
                        legend: {
                            position: 'top'
                        }
                    }}
                    onDataTooLarge={f => f}
                />
            )
        );
    })
    .add('visualization bar chart with 3 metrics and view by attribute', () => {
        const dataSet = fixtures.barChartWith3MetricsAndViewByAttribute;

        return screenshotWrap(
            wrap(
                <Visualization
                    {...dataSet}
                    config={{
                        type: 'bar'
                    }}
                    onDataTooLarge={f => f}
                />
            )
        );
    })
    .add('visualization bar chart with view by attribute', () => {
        const dataSet = fixtures.barChartWithViewByAttribute;

        return screenshotWrap(
            wrap(
                <Visualization
                    {...dataSet}
                    config={{
                        type: 'bar'
                    }}
                    onDataTooLarge={f => f}
                />
            )
        );
    })
    .add('visualization bar chart with stack by and view by attributes', () => {
        const dataSet = fixtures.barChartWithStackByAndViewByAttributes;

        return screenshotWrap(
            wrap(
                <Visualization
                    {...dataSet}
                    config={{
                        type: 'bar'
                    }}
                    onDataTooLarge={f => f}
                />
            )
        );
    })
    .add('visualization bar chart with pop measure and view by attribute', () => {
        const dataSet = fixtures.barChartWithPopMeasureAndViewByAttribute;

        return screenshotWrap(
            wrap(
                <Visualization
                    {...dataSet}
                    config={{
                        type: 'bar'
                    }}
                    onDataTooLarge={f => f}
                />
            )
        );
    })
    .add('visualization pie chart with metrics only', () => {
        const dataSet = fixtures.pieChartWithMetricsOnly;

        return screenshotWrap(
            wrap(
                <Visualization
                    {...dataSet}
                    config={{
                        type: 'pie'
                    }}
                    onDataTooLarge={f => f}
                />
            )
        );
    })
    .add('dynamic visualization', () => {
        return <DynamicVisualization />;
    });
