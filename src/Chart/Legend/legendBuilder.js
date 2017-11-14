import { pick, partial } from 'lodash';
import { RIGHT } from './PositionTypes';
import { PIE_CHART } from '../../VisualizationTypes';

export const DEFAULT_LEGEND_CONFIG = {
    enabled: true,
    position: RIGHT
};

export function shouldBeLegendEnabled(chartOptions) {
    const seriesLength = chartOptions.data.series.length;
    // More than one measure or stackedBy more than one category
    const hasMoreThanOneSeries = seriesLength > 1;
    const isPieChartWithMoreThanOneCategory =
        (chartOptions.type === PIE_CHART && chartOptions.data.series[0].data.length > 1);

    return hasMoreThanOneSeries
        || isPieChartWithMoreThanOneCategory;
}

export function getLegendItems(chartOptions) {
    const legendDataSource = chartOptions.type === PIE_CHART
        ? chartOptions.data.series[0].data
        : chartOptions.data.series;
    return legendDataSource.map(legendDataSourceItem => pick(legendDataSourceItem, ['name', 'color', 'legendIndex']));
}

export function onLegendItemClick(type, chartRef, item, isEnabled) {
    const clickTarget = type === PIE_CHART
        ? chartRef.chart.series[0].data[item.legendIndex]
        : chartRef.chart.series[item.legendIndex];

    clickTarget.setVisible();

    if (!isEnabled && clickTarget.points) {
        clickTarget.points.filter(point => point.dataLabel)
            .map(({ dataLabel }) => dataLabel.hide());
    }
}

export default function getLegend(legendConfig = {}, chartOptions) {
    const baseConfig = {
        ...DEFAULT_LEGEND_CONFIG,
        ...legendConfig
    };
    return {
        ...baseConfig,
        enabled: baseConfig.enabled && shouldBeLegendEnabled(chartOptions),
        onItemClick: partial(onLegendItemClick, chartOptions.type),
        items: getLegendItems(chartOptions)
    };
}
