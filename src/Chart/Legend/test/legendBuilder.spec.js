import { mockChartOptions } from '../../test/chartOptionsBuilder.spec';
import * as fixtures from '../../../../stories/test_data/fixtures';
import getLegend, {
    shouldBeLegendEnabled,
    getLegendItems,
    onLegendItemClick,
    DEFAULT_LEGEND_CONFIG
} from '../legendBuilder';

describe('shouldBeLegendEnabled', () => {
    it('should return false by default', () => {
        const chartOptions = mockChartOptions(fixtures.barChartWithViewByAttribute);
        expect(shouldBeLegendEnabled(chartOptions)).toBe(false);
    });

    it('should return true if chart has more than one series', () => {
        const chartOptions = mockChartOptions(fixtures.barChartWith3MetricsAndViewByAttribute);
        expect(shouldBeLegendEnabled(chartOptions)).toBe(true);
    });

    it('should return true if pie chart has more than one value', () => {
        const chartOptions = mockChartOptions(fixtures.pieChartWithMetricsOnly, { type: 'pie' });
        expect(shouldBeLegendEnabled(chartOptions)).toBe(true);
    });
});

describe('getLegendItems', () => {
    it('should return correct legend items for regular charts', () => {
        const chartOptions = mockChartOptions(fixtures.barChartWithStackByAndViewByAttributes);
        expect(getLegendItems(chartOptions)).toEqual([
            {
                color: 'rgb(20,178,226)',
                legendIndex: 0,
                name: 'East Coast'
            },
            {
                color: 'rgb(0,193,141)',
                legendIndex: 1,
                name: 'West Coast'
            }
        ]);
    });

    it('should return correct legend items for pie charts', () => {
        const chartOptions = mockChartOptions(fixtures.pieChartWithMetricsOnly, { type: 'pie' });
        expect(getLegendItems(chartOptions)).toEqual([
            {
                color: 'rgb(20,178,226)',
                legendIndex: 0,
                name: 'Lost'
            },
            {
                color: 'rgb(0,193,141)',
                legendIndex: 1,
                name: 'Won'
            },
            {
                color: 'rgb(229,77,66)',
                legendIndex: 2,
                name: 'Expected'
            }
        ]);
    });
});

describe('onLegendItemClick', () => {
    const type = 'column';
    function getChartRef(setVisible = jest.fn(), hide = jest.fn()) {
        return {
            chart: {
                series: [
                    {
                        data: [{
                            setVisible
                        }],
                        setVisible,
                        points: [
                            {
                                dataLabel: {
                                    hide
                                }
                            }
                        ]
                    }
                ]
            }
        };
    }
    const item = { legendIndex: 0 };
    const isEnabled = true;

    it('should call setVisible on target series in usecase of general charts', () => {
        const setVisible = jest.fn();
        const chartRef = getChartRef(setVisible);
        onLegendItemClick(type, chartRef, item, isEnabled);
        expect(setVisible).toHaveBeenCalledTimes(1);
    });

    it('should call setVisible on target series in usecase of pie charts', () => {
        const setVisible = jest.fn();
        const chartRef = getChartRef(setVisible);
        onLegendItemClick('pie', chartRef, item, isEnabled);
        expect(setVisible).toHaveBeenCalledTimes(1);
    });

    it('should call hide on target series in usecase of general charts only if item is not enabled', () => {
        const hide = jest.fn();
        const chartRef = getChartRef(undefined, hide);
        onLegendItemClick(type, chartRef, item, isEnabled);
        expect(hide).toHaveBeenCalledTimes(0);
        onLegendItemClick(type, chartRef, item, false);
        expect(hide).toHaveBeenCalledTimes(1);
    });
});

describe('getLegend', () => {
    const chartOptions = mockChartOptions(fixtures.barChartWith3MetricsAndViewByAttribute);
    const legend = getLegend({}, chartOptions);

    it('should assign enabled: false if disabled by config', () => {
        const disabledLegend = getLegend({ enabled: false }, chartOptions);
        expect(disabledLegend.enabled).toBe(false);
    });

    it('should assign enabled: true for multi metric graph', () => {
        expect(legend.enabled).toBe(true);
    });

    it('should assign onItemClick', () => {
        expect(legend.onItemClick).toBeDefined();
    });

    it('should assign default position', () => {
        expect(legend.position).toBe(DEFAULT_LEGEND_CONFIG.position);
    });

    it('should be able to override default position', () => {
        const legendWithCustomPosition = getLegend({ position: 'left' }, chartOptions);
        expect(legendWithCustomPosition.position).toBe('left');
    });

    it('should assign items', () => {
        const legendItems = getLegendItems(chartOptions);
        expect(legend.items).toEqual(legendItems);
    });
});
