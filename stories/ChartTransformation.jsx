import React from 'react';
import { storiesOf } from '@storybook/react';

import ChartTransformation from '../src/Chart/ChartTransformation';
import { FLUID_LEGEND_THRESHOLD } from '../src/Chart/Legend/Legend';
import { immutableSet } from '../src/utils/common';
import { VIEW_BY_DIMENSION_INDEX, STACK_BY_DIMENSION_INDEX } from '../src/Chart/constants';

import * as fixtures from './test_data/fixtures';

import { wrap, screenshotWrap } from './utils/wrap';

import '../src/styles/charts.scss';

function getChart({
    type = 'column',
    legendEnabled = true,
    legendPosition = 'top',
    legendResponsive = false,
    dataSet = fixtures.barChartWithoutAttributes,
    colors,
    width,
    height,
    minHeight,
    minWidth,
    chartHeight,
    chartWidth,
    key
}) {
    return wrap(<ChartTransformation
        config={{
            type,
            legend: {
                enabled: legendEnabled,
                position: legendPosition,
                responsive: legendResponsive
            },
            colors
        }}
        height={chartHeight}
        width={chartWidth}
        {...dataSet}
        onDataTooLarge={f => f}
    />, height, width, minHeight, minWidth, key);
}

storiesOf('ChartTransformation')
    .add('Column chart without attributes', () => {
        const dataSet = fixtures.barChartWithoutAttributes;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResponse.dimensions[STACK_BY_DIMENSION_INDEX]
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
                        colors: fixtures.lgbtPalette
                    }}
                    {...dataSet}
                    onDataTooLarge={f => f}
                />
            )
        );
    })
    .add('Column chart with 3 metrics and view by attribute', () => {
        const dataSet = fixtures.barChartWith3MetricsAndViewByAttribute;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResponse.dimensions[STACK_BY_DIMENSION_INDEX]
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
                        colors: fixtures.lgbtPalette
                    }}
                    {...dataSet}
                    onDataTooLarge={f => f}
                />
            )
        );
    })
    .add('Column chart with 18 measures and view by attribute', () => {
        const dataSet = fixtures.barChartWith18MetricsAndViewByAttribute;
        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResponse.dimensions[STACK_BY_DIMENSION_INDEX]
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
                        colors: fixtures.lgbtPalette
                    }}
                    {...dataSet}
                    onDataTooLarge={f => f}
                />
            )
        );
    })
    .add('Column chart with view by attribute', () => {
        const dataSet = fixtures.barChartWithViewByAttribute;
        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResponse
                                .dimensions[VIEW_BY_DIMENSION_INDEX].headers[0].attributeHeader.uri
                        }
                    ]}
                    config={{
                        type: 'column',
                        legend: {
                            enabled: true,
                            position: 'right'
                        },
                        legendLayout: 'horizontal',
                        colors: fixtures.lgbtPalette
                    }}
                    {...dataSet}
                    onDataTooLarge={f => f}
                />
            )
        );
    })
    .add('Column chart with viewBy and stackBy attribute', () => {
        const dataSet = fixtures.barChartWithStackByAndViewByAttributes;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResult
                                .headerItems[VIEW_BY_DIMENSION_INDEX][0][0].attributeHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'column',
                        legend: {
                            enabled: true,
                            position: 'top'
                        },
                        legendLayout: 'vertical',
                        colors: fixtures.lgbtPalette
                    }}
                    {...dataSet}
                    onDataTooLarge={f => f}
                />
            )
        );
    })
    .add('Column chart with 6 pop measures and view by attribute', () => {
        const dataSet = fixtures.barChartWith6PopMeasuresAndViewByAttribute;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResult
                                .headerItems[VIEW_BY_DIMENSION_INDEX][0][0].attributeHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'column',
                        legend: {
                            enabled: true,
                            position: 'top'
                        },
                        legendLayout: 'vertical',
                        colors: fixtures.lgbtPalette
                    }}
                    {...dataSet}
                    onDataTooLarge={f => f}
                />
            )
        );
    })
    .add('Bar chart with viewBy and stackBy attribute', () => {
        const dataSet = fixtures.barChartWithStackByAndViewByAttributes;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResult
                                .headerItems[STACK_BY_DIMENSION_INDEX][0][0].attributeHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'bar',
                        legend: {
                            enabled: true,
                            position: 'bottom'
                        },
                        legendLayout: 'vertical',
                        colors: fixtures.lgbtPalette
                    }}
                    {...dataSet}
                    onDataTooLarge={f => f}
                />
            )
        );
    })
    .add('Line chart with viewBy and stackBy attribute', () => {
        const dataSet = fixtures.barChartWithStackByAndViewByAttributes;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResult
                                .headerItems[VIEW_BY_DIMENSION_INDEX][0][0].attributeHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'line',
                        legend: {
                            enabled: true,
                            position: 'right'
                        },
                        legendLayout: 'horizontal',
                        colors: fixtures.lgbtPalette
                    }}
                    {...dataSet}
                    onDataTooLarge={f => f}
                />
            )
        );
    })
    .add('Pie chart view viewBy attribute', () => {
        const dataSet = fixtures.barChartWithViewByAttribute;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResult
                                .headerItems[VIEW_BY_DIMENSION_INDEX][0][0].attributeHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'pie',
                        legend: {
                            enabled: true,
                            position: 'left'
                        },
                        legendLayout: 'horizontal',
                        colors: fixtures.lgbtPalette
                    }}
                    {...dataSet}
                    onDataTooLarge={f => f}
                />
            )
        );
    })
    .add('Pie chart with measures only', () => {
        const dataSet = fixtures.pieChartWithMetricsOnly;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResponse.dimensions[VIEW_BY_DIMENSION_INDEX]
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
                        colors: fixtures.lgbtPalette
                    }}
                    {...dataSet}
                    onDataTooLarge={f => f}
                />
            )
        );
    })
    .add('Pie chart view viewBy attribute with empty value', () => {
        const dataSet = immutableSet(fixtures.barChartWithViewByAttribute, 'executionResult.data[0][0]', null);

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResult
                                .headerItems[VIEW_BY_DIMENSION_INDEX][0][0].attributeHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'pie',
                        legend: {
                            enabled: true,
                            position: 'left'
                        },
                        legendLayout: 'horizontal',
                        colors: fixtures.lgbtPalette
                    }}
                    {...dataSet}
                    onDataTooLarge={f => f}
                />
            )
        );
    })
    .add('Legend positions', () => {
        return screenshotWrap(
            <div>
                {getChart({
                    legendPosition: 'top',
                    dataSet: fixtures.barChartWith3MetricsAndViewByAttribute
                })}
                {getChart({
                    legendPosition: 'bottom',
                    dataSet: fixtures.barChartWith3MetricsAndViewByAttribute
                })}
                {getChart({
                    legendPosition: 'left',
                    dataSet: fixtures.barChartWith3MetricsAndViewByAttribute
                })}
                {getChart({
                    legendPosition: 'right',
                    dataSet: fixtures.barChartWith3MetricsAndViewByAttribute
                })}
            </div>
        );
    })
    .add('Legend right with paging', () => (
        screenshotWrap(
            getChart({
                legendPosition: 'right',
                dataSet: fixtures.barChartWith60MetricsAndViewByAttribute
            })
        )
    ))
    .add('Legend with mobile paging', () => (
        <div>
            Resize window to {FLUID_LEGEND_THRESHOLD}px or less
            {screenshotWrap(
                getChart({
                    legendPosition: 'right',
                    legendResponsive: true,
                    dataSet: fixtures.barChartWith60MetricsAndViewByAttribute,
                    width: '100%',
                    height: '100%',
                    minHeight: 300,
                    chartHeight: 300
                })
            )}
        </div>
    ))
    .add('Custom color pallete', () => (
        screenshotWrap(
            getChart({
                dataSet: fixtures.barChartWith3MetricsAndViewByAttribute,
                colors: [
                    '#000000',
                    '#ff0000'
                ]
            })
        )
    ))
    .add('Responsive width', () => (
        screenshotWrap(
            [
                getChart({
                    dataSet: fixtures.barChartWith3MetricsAndViewByAttribute,
                    legendPosition: 'top',
                    width: '100%',
                    key: 'top'
                }),
                getChart({
                    dataSet: fixtures.barChartWith3MetricsAndViewByAttribute,
                    legendPosition: 'bottom',
                    width: '100%',
                    key: 'bottom'
                }),
                getChart({
                    dataSet: fixtures.barChartWith3MetricsAndViewByAttribute,
                    legendPosition: 'left',
                    width: '100%',
                    key: 'left'
                }),
                getChart({
                    dataSet: fixtures.barChartWith3MetricsAndViewByAttribute,
                    legendPosition: 'right',
                    width: '100%',
                    key: 'right'
                })
            ]
        )
    ))
    .add('Fill parent without legend', () => (
        screenshotWrap(
            getChart({
                dataSet: fixtures.barChartWith3MetricsAndViewByAttribute,
                legendEnabled: false,
                height: 500,
                width: '100%'
            })
        )
    ));
