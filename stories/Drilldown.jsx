import React from 'react';
import { storiesOf } from '@storybook/react';
import { decorateAction } from '@storybook/addon-actions';
import LineFamilyChartTransformation from '../src/Chart/LineFamilyChartTransformation';
import TableTransformation from '../src/Table/TableTransformation';
import * as TestConfig from './test_data/test_config';
import * as TestData from './test_data/test_data';
import IntlWrapper from './utils/IntlWrapper';
import { wrap, screenshotWrap } from './utils/wrap';

import '../src/styles/charts.scss';
import '../src/styles/table.scss';

const eventAction = decorateAction([
    (...args) => {
        return [args[0][0].detail];
    }
]);

document.addEventListener('drill', eventAction('drill'));

storiesOf('Drilldown')
    .add('Line chart', () => (
        screenshotWrap(
            wrap(
                <LineFamilyChartTransformation
                    drillableItems
                    config={{
                        ...TestConfig.barChart2Series,
                        legend: {
                            enabled: false
                        }
                    }}
                    data={TestData.barChart2Series}
                />
            )
        )
    ))
    .add('Stacked bar chart', () => (
        screenshotWrap(
            <IntlWrapper>
                <div style={{ height: 500, width: '100%' }}>
                    <LineFamilyChartTransformation
                        drillableItems
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
    .add('Table', () => (
        screenshotWrap(
            <div>
                <TableTransformation
                    drillableItems
                    config={TestConfig.table}
                    data={TestData.stackedBar}
                    width={600}
                    height={400}
                />
            </div>
        )
    ));