import React from 'react';
import { storiesOf } from '@storybook/react';

import Visualization from '../src/Visualization';
import LineFamilyChartTransformation from '../src/Chart/LineFamilyChartTransformation';
import ChartTransformation from '../src/Chart/ChartTransformation';
import { FLUID_LEGEND_THRESHOLD } from '../src/Chart/Legend/Legend';

import * as TestConfig from './test_data/test_config';
import * as TestData from './test_data/test_data';
import * as fixtures from './test_data/fixtures';

import IntlWrapper from './utils/IntlWrapper';
import { wrap, screenshotWrap } from './utils/wrap';
import { createMock } from './utils/mockGenerator';

import barChartWithPagedLegend from './test_data/bar_chart_with_paged_legend';

import '../src/styles/charts.scss';

function createLineChart(legendPosition) {
    const mock = createMock('line', [
        {
            title: 'x',
            fn: x => x
        }, {
            title: '2x',
            fn: x => 2 * x
        }, {
            title: 'x^2',
            fn: x => x * x
        }, {
            title: 'log(x)',
            fn: x => Math.log(x)
        }
    ], 20);

    return (
        <LineFamilyChartTransformation
            config={{
                ...mock.config,
                legend: {
                    position: legendPosition
                }
            }}
            data={mock.data}
        />
    );
}

storiesOf('Chart')
    .add('Legend positions', () => {
        return screenshotWrap(
            <div>
                {wrap(createLineChart('top'))}
                {wrap(createLineChart('bottom'))}
                {wrap(createLineChart('left'))}
                {wrap(createLineChart('right'))}
            </div>
        );
    })
    .add('Legend right with paging', () => (
        screenshotWrap(
            wrap(
                <LineFamilyChartTransformation
                    config={{
                        ...barChartWithPagedLegend.config,
                        legend: {
                            enabled: true,
                            position: 'right',
                            responsive: false
                        }
                    }}
                    data={barChartWithPagedLegend.data}
                />
            )
        )
    ))
    .add('Legend with mobile paging', () => (
        <IntlWrapper>
            <div>
                Resize window to {FLUID_LEGEND_THRESHOLD}px or less
                {screenshotWrap(
                    <div style={{ minHeight: '300px', width: '100%', border: '1px solid pink' }}>
                        <LineFamilyChartTransformation
                            config={{
                                ...barChartWithPagedLegend.config,
                                legend: {
                                    enabled: true,
                                    position: 'right',
                                    responsive: true
                                }
                            }}
                            data={barChartWithPagedLegend.data}
                        />
                    </div>
                )}
            </div>
        </IntlWrapper>
    ))
    .add('Custom color pallete', () => (
        screenshotWrap(
            wrap(
                <LineFamilyChartTransformation
                    config={{
                        ...TestConfig.barChart2Series,
                        legend: {
                            enabled: false
                        },
                        colors: [
                            '#980F5F',
                            '#872D62',
                            '#69525F',
                            '#764361',
                            '#A50061'
                        ]
                    }}
                    data={TestData.barChart2Series}
                />
            )
        )
    ))
    .add('Responsive width', () => (
        screenshotWrap(
            <IntlWrapper>
                <div>
                    <div style={{ height: 500, width: '100%', marginBottom: 30, border: '1px solid pink' }}>
                        {createLineChart('top')}
                    </div>
                    <div style={{ height: 500, width: '100%', marginBottom: 30, border: '1px solid pink' }}>
                        {createLineChart('bottom')}
                    </div>
                    <div style={{ height: 500, width: '100%', marginBottom: 30, border: '1px solid pink' }}>
                        {createLineChart('left')}
                    </div>
                    <div style={{ height: 500, width: '100%', marginBottom: 30, border: '1px solid pink' }}>
                        {createLineChart('right')}
                    </div>
                </div>
            </IntlWrapper>
        )
    ))
    .add('Fill parent without legend', () => (
        screenshotWrap(
            <IntlWrapper>
                <div style={{ height: 500, width: '100%' }}>
                    <LineFamilyChartTransformation
                        config={{
                            ...TestConfig.stackedBar,
                            legend: {
                                enabled: false
                            }
                        }}
                        data={TestData.stackedBar}
                    />
                </div>
            </IntlWrapper>
        )
    ))
    .add('new transformation column chart without attributes', () => {
        const executionData = fixtures.barChartWithoutAttributes;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: executionData.executionResponse.dimensions[1]
                                .headers[0].measureGroupHeader.items[0].measureHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'column',
                        legend: {
                            enabled: true,
                            position: 'top'
                        },
                        legendLayout: 'horizontal',
                        colorPalette: TestData.lgbtPalette
                    }}
                    {...executionData}
                    onDataTooLarge={f => f}
                />
            )
        );
    })
    .add('new transformation column chart with 3 metrics and view by attribute', () => {
        const executionData = fixtures.barChartWith3MetricsAndViewByAttribute;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: executionData.executionResponse.dimensions[1]
                                .headers[0].measureGroupHeader.items[1].measureHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'column',
                        legend: {
                            enabled: true,
                            position: 'top'
                        },
                        legendLayout: 'horizontal',
                        colorPalette: TestData.lgbtPalette
                    }}
                    {...executionData}
                    onDataTooLarge={f => f}
                />
            )
        );
    })
    .add('new transformation column chart with 18 measures and view by attribute', () => {
        const dataSet = fixtures.barChartWith18MetricsAndViewByAttribute;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResponse.dimensions[1]
                                .headers[0].measureGroupHeader.items[1].measureHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'column',
                        legend: {
                            enabled: true,
                            position: 'top'
                        },
                        legendLayout: 'horizontal',
                        colorPalette: TestData.lgbtPalette
                    }}
                    {...dataSet}
                    onDataTooLarge={f => f}
                />
            )
        );
    })
    .add('new transformation column chart with view by attribute', () => {
        const executionData = fixtures.barChartWithViewByAttribute;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: executionData.executionResponse.dimensions[0].headers[0].attributeHeader.uri
                        }
                    ]}
                    config={{
                        type: 'column',
                        legend: {
                            enabled: true,
                            position: 'right'
                        },
                        legendLayout: 'horizontal',
                        colorPalette: TestData.lgbtPalette
                    }}
                    {...executionData}
                    onDataTooLarge={f => f}
                />
            )
        );
    })
    .add('new transformation column chart with viewBy and stackBy attribute', () => {
        const executionData = fixtures.barChartWithStackByAndViewByAttributes;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: executionData.executionResult.headerItems[0][0][0].attributeHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'column',
                        legend: {
                            enabled: true,
                            position: 'top'
                        },
                        legendLayout: 'vertical',
                        colorPalette: TestData.lgbtPalette
                    }}
                    {...executionData}
                    onDataTooLarge={f => f}
                />
            )
        );
    })
    .add('new transformation column chart with pop measure and view by attribute', () => {
        const executionData = fixtures.barChartWithPopMeasureAndViewByAttribute;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: executionData.executionResult.headerItems[0][0][0].attributeHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'column',
                        legend: {
                            enabled: true,
                            position: 'top'
                        },
                        legendLayout: 'vertical',
                        colorPalette: TestData.lgbtPalette
                    }}
                    {...executionData}
                    onDataTooLarge={f => f}
                />
            )
        );
    })
    .add('new transformation bar chart with viewBy and stackBy attribute', () => {
        const executionData = fixtures.barChartWithStackByAndViewByAttributes;
        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: executionData.executionResult.headerItems[1][0][0].attributeHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'bar',
                        legend: {
                            enabled: true,
                            position: 'bottom'
                        },
                        legendLayout: 'vertical',
                        colorPalette: TestData.lgbtPalette
                    }}
                    {...executionData}
                    onDataTooLarge={f => f}
                />
            )
        );
    })
    .add('new transformation line chart with viewBy and stackBy attribute', () => {
        const executionData = fixtures.barChartWithStackByAndViewByAttributes;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: executionData.executionResult.headerItems[0][0][0].attributeHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'line',
                        legend: {
                            enabled: true,
                            position: 'right'
                        },
                        legendLayout: 'horizontal',
                        colorPalette: TestData.lgbtPalette
                    }}
                    {...executionData}
                    onDataTooLarge={f => f}
                />
            )
        );
    })
    .add('new transformation pie chart view viewBy attribute', () => {
        const executionData = fixtures.barChartWithViewByAttribute;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: executionData.executionResult.headerItems[0][0][0].attributeHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'pie',
                        legend: {
                            enabled: true,
                            position: 'left'
                        },
                        legendLayout: 'horizontal',
                        colorPalette: TestData.lgbtPalette
                    }}
                    {...executionData}
                    onDataTooLarge={f => f}
                />
            )
        );
    })
    .add('new transformation pie chart view metrics only', () => {
        const executionData = fixtures.pieChartWithMetricsOnly;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: executionData.executionResponse.dimensions[0]
                                .headers[0].measureGroupHeader.items[1].measureHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'pie',
                        legend: {
                            enabled: true,
                            position: 'left'
                        },
                        legendLayout: 'horizontal',
                        colorPalette: TestData.lgbtPalette
                    }}
                    {...executionData}
                    onDataTooLarge={f => f}
                />
            )
        );
    })
    .add('visualization bar chart without attributes', () => {
        const executionData = fixtures.barChartWithoutAttributes;

        return screenshotWrap(
            wrap(
                <Visualization
                    {...executionData}
                    config={{
                        type: 'column'
                    }}
                />
            )
        );
    })
    .add('visualization column chart with 3 metrics and view by attribute', () => {
        const executionData = fixtures.barChartWith3MetricsAndViewByAttribute;

        return screenshotWrap(
            wrap(
                <Visualization
                    {...executionData}
                    config={{
                        type: 'column'
                    }}
                />
            )
        );
    })
    .add('visualization bar chart with 3 metrics and view by attribute', () => {
        const executionData = fixtures.barChartWith3MetricsAndViewByAttribute;

        return screenshotWrap(
            wrap(
                <Visualization
                    {...executionData}
                    config={{
                        type: 'column'
                    }}
                />
            )
        );
    })
    .add('visualization bar chart with view by attribute', () => {
        const executionData = fixtures.barChartWithViewByAttribute;

        return screenshotWrap(
            wrap(
                <Visualization
                    {...executionData}
                    config={{
                        type: 'column'
                    }}
                />
            )
        );
    })
    .add('visualization bar chart with stack by and view by attributes', () => {
        const executionData = fixtures.barChartWithStackByAndViewByAttributes;

        return screenshotWrap(
            wrap(
                <Visualization
                    {...executionData}
                    config={{
                        type: 'column'
                    }}
                />
            )
        );
    })
    .add('visualization bar chart with pop measure and view by attribute', () => {
        const executionData = fixtures.barChartWithPopMeasureAndViewByAttribute;

        return screenshotWrap(
            wrap(
                <Visualization
                    {...executionData}
                    config={{
                        type: 'column'
                    }}
                />
            )
        );
    })
    .add('visualization pie chart with metrics only', () => {
        const executionData = fixtures.pieChartWithMetricsOnly;

        return screenshotWrap(
            wrap(
                <Visualization
                    {...executionData}
                    config={{
                        type: 'pie'
                    }}
                />
            )
        );
    });
