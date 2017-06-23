import React from 'react';
import { storiesOf } from '@storybook/react';

import PieChartTransformation from '../src/Chart/PieChartTransformation';
import * as TestData from './test_data/test_data';
import { wrap, screenshotWrap } from './utils/wrap';

storiesOf('Pie Chart')
    .add('Basic', () => (
        screenshotWrap(wrap(
            <PieChartTransformation
                config={{
                    legend: {
                        enabled: true,
                        position: 'top',
                        responsive: false
                    }
                }}
                data={TestData.pieChart}
            />
        ))
    ))
    .add('Basic with empty', () => (
        screenshotWrap(wrap(
            <PieChartTransformation
                config={{
                    legend: {
                        enabled: true,
                        position: 'top',
                        responsive: false
                    }
                }}
                data={TestData.pieChartWithEmpty}
            />
        ))
    ))
    .add('Single metric', () => (
        screenshotWrap(wrap(
            <PieChartTransformation
                config={{
                    legend: {
                        enabled: true,
                        position: 'top',
                        responsive: false
                    }
                }}
                data={TestData.singleMetricPieCart}
            />
        ))
    ))
    .add('Metrics only', () => (
        screenshotWrap(wrap(
            <PieChartTransformation
                config={{
                    legend: {
                        enabled: true,
                        position: 'top',
                        responsive: false
                    }
                }}
                data={TestData.metricsOnlyPieChart}
            />
        ))
    ));