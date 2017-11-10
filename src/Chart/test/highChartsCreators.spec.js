import { getHighchartsOptions } from '../highChartsCreators';
import { BAR_CHART, COLUMN_CHART, LINE_CHART, PIE_CHART } from '../../VisualizationTypes';

const chartOptions = {
    colorPalette: [
        'rgb(20,178,226)',
        'rgb(0,193,141)'
    ],
    data: {
        series: [
            {
                isDrillable: false,
                name: 'aa',
                data: [
                    {
                        name: 'aa.0'
                    },
                    null
                ]
            },
            {
                isDrillable: true,
                name: 'bb',
                data: [
                    {
                        name: 'bb.0'
                    },
                    null
                ]
            }
        ]
    }
};

const pieChartOptions = {
    type: PIE_CHART,
    colorPalette: [
        'rgb(20,178,226)',
        'rgb(0,193,141)'
    ],
    data: {
        series: [
            {
                name: 'aa',
                data: [
                    {
                        name: 'aa.0',
                        drilldown: false
                    },
                    {
                        name: 'bb.0',
                        drilldown: true
                    }
                ]
            }
        ]
    }
};

describe('highChartCreators', () => {
    describe('Line chart configuration', () => {
        const config = getHighchartsOptions({ ...chartOptions, type: LINE_CHART }, {});

        it('contains styles for drillable', () => {
            expect(config).toHaveProperty('series.0.states.hover.halo.size', 0);

            expect(config).not.toHaveProperty('series.0.marker.states.hover.fillColor');
            expect(config).not.toHaveProperty('series.0.cursor');
        });

        it('contains styles for non-drillable', () => {
            expect(config).not.toHaveProperty('series.1.states.hover.halo.size');

            expect(config).toHaveProperty('series.1.marker.states.hover.fillColor', 'rgb(26,199,152)');
            expect(config).toHaveProperty('series.1.cursor', 'pointer');
        });
    });

    describe('Column chart configuration', () => {
        const config = getHighchartsOptions({ ...chartOptions, type: COLUMN_CHART }, {});

        it('contains styles for drillable and non-drillable', () => {
            expect(config).toHaveProperty('series.0.states.hover.brightness');
            expect(config).toHaveProperty('series.0.states.hover.enabled', false);
            expect(config).toHaveProperty('series.1.states.hover.enabled', true);
        });
    });

    describe('Column chart stacked configuration', () => {
        const config = getHighchartsOptions({ ...chartOptions, type: COLUMN_CHART, stacking: true }, {});

        it('contains drilldown label styles', () => {
            expect(config).toHaveProperty('drilldown.activeDataLabelStyle.color');
        });
    });

    describe('Bar chart configuration', () => {
        const config = getHighchartsOptions({ ...chartOptions, type: BAR_CHART }, {});

        it('contains styles for drillable and non-drillable', () => {
            expect(config).toHaveProperty('series.0.states.hover.brightness');
            expect(config).toHaveProperty('series.0.states.hover.enabled', false);
            expect(config).toHaveProperty('series.1.states.hover.enabled', true);
        });
    });

    describe('Pie chart configuration', () => {
        const config = getHighchartsOptions(pieChartOptions, {});

        it('contains styles for drillable and non-drillable', () => {
            expect(config).toHaveProperty('series.0.data.0.states.hover.brightness');
            expect(config).toHaveProperty('series.0.data.0.halo.size', 0);
            expect(config).not.toHaveProperty('series.0.data.1.halo.size');
        });
    });
});
