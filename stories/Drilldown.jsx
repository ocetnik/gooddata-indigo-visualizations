import React from 'react';
import { storiesOf } from '@storybook/react';
import { action, decorateAction } from '@storybook/addon-actions';
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
                    afm={TestData.afm}
                    drillableItems={TestData.barChart2SeriesDrillableItems}
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
    .add('Line chart with onFiredDrillEvent', () => (
        screenshotWrap(
            <div>
                <p>Line chart with standard onFiredDrillEvent callback</p>
                {
                    wrap(
                        <LineFamilyChartTransformation
                            afm={TestData.afm}
                            drillableItems={TestData.barChart2SeriesDrillableItems}
                            onFiredDrillEvent={action('onFiredDrillEvent')}
                            config={{
                                ...TestConfig.barChart2Series,
                                legend: {
                                    enabled: false
                                }
                            }}
                            data={TestData.barChart2Series}
                        />
                    )
                }
                <p>Line chart with onFiredDrillEvent where drillEvent
                    is logged into console and default event is prevented</p>
                {
                    wrap(
                        <LineFamilyChartTransformation
                            afm={TestData.afm}
                            drillableItems={TestData.barChart2SeriesDrillableItems}
                            onFiredDrillEvent={({ executionContext, drillContext }) => {
                                // eslint-disable-next-line no-console
                                console.log('onFiredDrillEvent', { executionContext, drillContext });
                                return false;
                            }}
                            config={{
                                ...TestConfig.barChart2Series,
                                legend: {
                                    enabled: false
                                }
                            }}
                            data={TestData.barChart2Series}
                        />
                    )
                }
            </div>
        )
    ))
    .add('Bar chart', () => (
        screenshotWrap(
            <IntlWrapper>
                <div style={{ height: 500, width: '100%' }}>
                    <LineFamilyChartTransformation
                        afm={TestData.afm}
                        drillableItems={TestData.metricsOnlyPieChartDrillableItems}
                        config={{
                            ...TestConfig.column,
                            legend: {
                                enabled: false
                            }
                        }}
                        data={TestData.metricsOnlyPieChart}
                    />
                </div>
            </IntlWrapper>
        )
    ))
    .add('Stacked bar chart', () => (
        screenshotWrap(
            <IntlWrapper>
                <div style={{ height: 500, width: '100%' }}>
                    <LineFamilyChartTransformation
                        afm={TestData.afm}
                        drillableItems={TestData.stackedBarDrillableItems}
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
                    afm={TestData.afm}
                    drillableItems={TestData.stackedBarDrillableItems}
                    data={TestData.stackedBar}
                    width={600}
                    height={400}
                />
            </div>
        )
    ));
