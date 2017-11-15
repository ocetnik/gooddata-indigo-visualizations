import React from 'react';
import { storiesOf } from '@storybook/react';
import { action, decorateAction } from '@storybook/addon-actions';
import Visualization from '../src/Visualization';
import { wrap, screenshotWrap } from './utils/wrap';
import * as fixtures from './test_data/fixtures';
import { VIEW_BY_DIMENSION_INDEX, STACK_BY_DIMENSION_INDEX } from '../src/Chart/constants';

import {
    EXECUTION_REQUEST_2A_1M,
    EXECUTION_RESPONSE_2A_1M,
    EXECUTION_RESULT_2A_1M,
    TABLE_HEADERS_2A_1M
} from '../src/Table/fixtures/2attributes1measure';

import '../src/styles/charts.scss';
import '../src/styles/table.scss';

const eventAction = decorateAction([
    (...args) => {
        return [args[0][0].detail];
    }
]);

const defaultColumnChartProps = {
    config: {
        type: 'column'
    },
    onDataTooLarge: f => f
};

document.addEventListener('drill', eventAction('drill'));

storiesOf('Drilldown')
    .add('Line chart drillable by measure', () => {
        const dataSet = fixtures.barChartWithStackByAndViewByAttributes;
        return screenshotWrap(
            wrap(
                <Visualization
                    config={{
                        type: 'line',
                        legend: {
                            enabled: false
                        }
                    }}
                    onDataTooLarge={f => f}
                    drillableItems={[
                        {
                            uri: dataSet.executionRequest.afm.measures[0].definition.measure.item.uri
                        }
                    ]}
                    {...dataSet}
                />,
                500,
                '100%'
            )
        );
    })
    .add('Line chart with onFiredDrillEvent', () => {
        const dataSet = fixtures.barChartWithStackByAndViewByAttributes;
        return screenshotWrap(
            <div>
                <p>Line chart with standard onFiredDrillEvent callback</p>
                {
                    wrap(
                        <Visualization
                            onFiredDrillEvent={action('onFiredDrillEvent')}
                            config={{
                                type: 'line',
                                legend: {
                                    enabled: false
                                }
                            }}
                            onDataTooLarge={f => f}
                            drillableItems={[
                                {
                                    uri: dataSet.executionRequest.afm.measures[0].definition.measure.item.uri
                                }
                            ]}
                            {...dataSet}
                        />,
                        500,
                        '100%'
                    )
                }
                <p>Line chart with onFiredDrillEvent where drillEvent
                    is logged into console and default event is prevented</p>
                {
                    wrap(
                        <Visualization
                            onFiredDrillEvent={({ executionContext, drillContext }) => {
                                // eslint-disable-next-line no-console
                                console.log('onFiredDrillEvent', { executionContext, drillContext });
                                return false;
                            }}
                            config={{
                                type: 'line',
                                legend: {
                                    enabled: false
                                }
                            }}
                            onDataTooLarge={f => f}
                            drillableItems={[
                                {
                                    uri: dataSet.executionRequest.afm.measures[0].definition.measure.item.uri
                                }
                            ]}
                            {...dataSet}
                        />,
                        500,
                        '100%'
                    )
                }
            </div>
        );
    })
    .add('Bar chart with view by attribute drillable by measure', () => {
        const dataSet = fixtures.barChartWithViewByAttribute;
        return screenshotWrap(
            wrap(
                <Visualization
                    {...defaultColumnChartProps}
                    drillableItems={[
                        {
                            uri: dataSet.executionRequest.afm.measures[0].definition.measure.item.uri
                        }
                    ]}
                    {...dataSet}
                />,
                500,
                '100%'
            )
        );
    })
    .add('Bar chart with view by attribute drillable by attribute', () => {
        const dataSet = fixtures.barChartWithViewByAttribute;
        return screenshotWrap(
            wrap(
                <Visualization
                    {...defaultColumnChartProps}
                    drillableItems={[
                        {
                            uri: dataSet.executionRequest.afm.attributes[0].displayForm.uri
                        }
                    ]}
                    {...dataSet}
                />,
                500,
                '100%'
            )
        );
    })
    .add('Bar chart with view by attribute drillable by attribute value', () => {
        const dataSet = fixtures.barChartWithViewByAttribute;
        return screenshotWrap(
            wrap(
                <Visualization
                    {...defaultColumnChartProps}
                    drillableItems={[
                        {
                            uri: dataSet.executionResult
                                .headerItems[VIEW_BY_DIMENSION_INDEX][0][0].attributeHeaderItem.uri
                        }
                    ]}
                    {...dataSet}
                />,
                500,
                '100%'
            )
        );
    })
    .add('Stacked bar chart drillable by measure', () => {
        const dataSet = fixtures.barChartWithStackByAndViewByAttributes;
        return screenshotWrap(
            wrap(
                <Visualization
                    {...defaultColumnChartProps}
                    drillableItems={[
                        {
                            uri: dataSet.executionRequest.afm.measures[0].definition.measure.item.uri
                        }
                    ]}
                    {...dataSet}
                />,
                500,
                '100%'
            )
        );
    })
    .add('Stacked bar chart drillable by view by attribute value', () => {
        const dataSet = fixtures.barChartWithStackByAndViewByAttributes;
        return screenshotWrap(
            wrap(
                <Visualization
                    {...defaultColumnChartProps}
                    drillableItems={[
                        {
                            uri: dataSet.executionResult
                                .headerItems[VIEW_BY_DIMENSION_INDEX][0][0].attributeHeaderItem.uri
                        }
                    ]}
                    {...dataSet}
                />,
                500,
                '100%'
            )
        );
    })
    .add('Stacked bar chart drillable by stack by attribute value', () => {
        const dataSet = fixtures.barChartWithStackByAndViewByAttributes;
        return screenshotWrap(
            wrap(
                <Visualization
                    {...defaultColumnChartProps}
                    drillableItems={[
                        {
                            uri: dataSet.executionResult
                                .headerItems[STACK_BY_DIMENSION_INDEX][0][0].attributeHeaderItem.uri
                        }
                    ]}
                    {...dataSet}
                />,
                500,
                '100%'
            )
        );
    })
    .add('Table', () => (
        screenshotWrap(
            <div>
                <Visualization
                    config={{ type: 'table' }}
                    executionRequest={EXECUTION_REQUEST_2A_1M}
                    executionResponse={EXECUTION_RESPONSE_2A_1M}
                    executionResult={EXECUTION_RESULT_2A_1M}
                    width={600}
                    height={400}
                    drillableItems={[
                        {
                            uri: TABLE_HEADERS_2A_1M[2].uri,
                            identifier: TABLE_HEADERS_2A_1M[2].localIdentifier
                        }, {
                            uri: TABLE_HEADERS_2A_1M[0].uri,
                            identifier: TABLE_HEADERS_2A_1M[0].localIdentifier
                        }
                    ]}
                />
            </div>
        )
    ));
