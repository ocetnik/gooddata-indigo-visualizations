import React from 'react';
import { storiesOf } from '@storybook/react';

import Visualization from '../src/Visualization';

import * as fixtures from './test_data/fixtures';

import { wrap, screenshotWrap } from './utils/wrap';

import '../src/styles/charts.scss';

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
    });
