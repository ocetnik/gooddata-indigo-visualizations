import {
    map,
    indexOf,
    get,
    set,
    find,
    keys,
    includes,
    isNumber,
    escape,
    sortBy,
    zip,
    values,
    assign
} from 'lodash';

import {
    colors2Object,
    numberFormat
} from '@gooddata/numberjs';

import { getColorPalette } from './transformation';
import { enrichHeaders } from './transformation/EnrichHeaders';
import { getChartData } from './transformation/SeriesTransformation';
import { transposeMetrics } from './transformation/MetricTransposition';
import { enableDrillablePoint } from '../utils/drilldownEventing';
import { parseValue, getMeasureHeader, getAttributeHeader } from '../utils/common';

export function propertiesToHeaders(config, _headers) { // TODO export for test only
    const { headers } = enrichHeaders(_headers);
    const res = keys(config).reduce((result, field) => {
        const fieldContent = get(config, field);
        return set(result, field, find(headers, ['uri', fieldContent]));
    }, {});
    return res;
}

export function getIndices(config, headers) { // TODO export only for test
    const headerUris = map(headers, 'uri');
    const metric = indexOf(headerUris, '/metricValues');
    const category = indexOf(headerUris, config.x);
    const series = indexOf(headerUris, config.color);

    return { metric, category, series };
}

export function isMetricNamesInSeries(config, headers) { // TODO export only for test
    return get(propertiesToHeaders(config, headers), 'color.id') === 'metricNames';
}

export function getLineFamilyChartData(config, rawData, afm = {}, drillableItems = []) {
    const data = transposeMetrics(rawData, afm);

    // prepare series, categories and data
    const indices = getIndices(config, data.headers);

    // configure transformation. Sort data only if metric names not in series.
    const configuration = {
        indices,
        sortSeries: !isMetricNamesInSeries(config, data.headers)
    };

    return getChartData(data, configuration, drillableItems);
}

const enrichPieDataHeaders = (data, afm) =>
    set(data, ['headers'], data.headers.map((header) => {
        if (header.type === 'metric') {
            return assign(header, getMeasureHeader(header, afm));
        } else if (header.type === 'attrLabel') {
            return assign(header, getAttributeHeader(header));
        }
        return header;
    }));

function getPieContext(index, data, headers) {
    const { id, name } = data[index][0];

    return headers.map((item) => {
        if (item.type === 'attrLabel') {
            return {
                id,
                name,
                identifier: item.identifier,
                uri: item.uri
            };
        }

        return item;
    });
}

export function getPieFamilyChartData(config, data, drillableItems = [], afm = {}) {
    const { metricsOnly } = config;
    const sortDesc = ([, value]) => -value;

    const enrichedData = enrichPieDataHeaders(data, afm);

    function getMetricsOnlyData(executionData) {
        const { headers, rawData } = executionData;
        return zip(
            headers.map(header => ({ name: header.title })),
            rawData[0],
            headers.map(header => (header.format || ''))
        );
    }

    function getMetricAttrData(executionData) {
        const { headers, rawData } = executionData;

        const metricHeader = find(headers, header => header.type === 'metric');
        const format = get(metricHeader, 'format', '');

        return rawData.map(dataPoint => [...dataPoint, format]);
    }

    const unsortedData = metricsOnly ? getMetricsOnlyData(enrichedData) : getMetricAttrData(enrichedData);
    const unsortedDataWithExtendedInfo = unsortedData.map((row, index) => {
        row.push(values(enrichedData.headers)[index]); // push data.headers into values, so that it is sorted
        return row;
    });
    const sortedData = sortBy(unsortedDataWithExtendedInfo, sortDesc);

    return {
        series: [{
            data: sortedData.map(([attr, y, format, header], i) => {
                return enableDrillablePoint(
                    drillableItems,
                    {
                        name: attr.name,
                        y: parseValue(y),
                        color: config.colorPalette[i % config.colorPalette.length],
                        legendIndex: i,
                        format
                    },
                    metricsOnly ? [header] : getPieContext(i, sortedData, enrichedData.headers)
                );
            })
        }]
    };
}

export function getLegendLayout(config, headers) { // TODO export only for test
    return (isMetricNamesInSeries(config, headers)) ? 'horizontal' : 'vertical';
}

export function getCategoryAxisLabel(config, headers) { // TODO export only for test
    return get(propertiesToHeaders(config, headers), 'x.title', '');
}

export function getMetricAxisLabel(config, headers) {
    const metrics = get(propertiesToHeaders(config, headers), 'color.metrics', []);

    if (!metrics.length) {
        return get(propertiesToHeaders(config, headers), 'y.title', '');
    } else if (metrics.length === 1) {
        return get(metrics, '0.header.title', '');
    }

    return '';
}

export function showInPercent(config, headers) { // TODO export only for test
    return includes(get(propertiesToHeaders(config, headers), 'y.format', ''), '%');
}

export const unEscapeAngleBrackets = str => str && str.replace(/&lt;|&#60;/g, '<').replace(/&gt;|&#62;/g, '>');

export function generateTooltipFn(options) {
    const { categoryAxisLabel } = options;
    const formatValue = (val, format) => {
        return colors2Object(numberFormat(val, format));
    };

    return (point) => {
        const formattedValue = escape(formatValue(point.y, point.format).label);
        const category = isNumber(point.category) ? '' :
            escape(unEscapeAngleBrackets(point.category));

        return `
            <table class="tt-values"><tr>
                <td class="title">${escape(categoryAxisLabel)}</td>
                <td class="value">${category}</td>
            </tr>
            <tr>
                <td class="title">${escape(unEscapeAngleBrackets(point.series.name))}</td>
                <td class="value">${formattedValue}</td>
            </tr></table>`;
    };
}

export function generatePieTooltipFn({ categoryLabel, metricLabel, metricsOnly }) {
    const formatValue = (val, format) => {
        return colors2Object(numberFormat(val, format));
    };

    return (point) => {
        const formattedValue = escape(formatValue(point.y, point.format).label);
        const category = isNumber(point.name) ? '' :
            escape(unEscapeAngleBrackets(point.name));

        const categoryRow = !metricsOnly ? `<tr>
                <td class="title">${escape(categoryLabel)}</td>
                <td class="value">${category}</td>
            </tr>` : '';

        const metricTitle = metricsOnly ? point.name : metricLabel;

        return `
            <table class="tt-values">
                ${categoryRow}
                <tr>
                    <td class="title">${escape(unEscapeAngleBrackets(metricTitle))}</td>
                    <td class="value">${formattedValue}</td>
                </tr>
            </table>`;
    };
}

export function getLineFamilyChartOptions(config, data) {
    const categoryAxisLabel = getCategoryAxisLabel(config, data.headers);
    const metricAxisLabel = getMetricAxisLabel(config, data.headers);

    return {
        type: config.type,
        stacking: config.stacking,
        colorPalette: getColorPalette(data, config.colorPalette),
        legendLayout: getLegendLayout(config, data.headers),
        actions: {
            tooltip: generateTooltipFn({
                categoryAxisLabel
                // TODO: pass formatValue fn here
            })
        },
        title: {
            x: categoryAxisLabel,
            y: metricAxisLabel,
            yFormat: get(propertiesToHeaders(config, data.headers), 'y.format')
        },
        showInPercent: showInPercent(config, data.headers)
    };
}

function getEmptyHeader() {
    return { title: '' };
}

export function getPieChartOptions(config, data) {
    const metricsOnly = !!(
        data.headers.length >= 1 &&
        data.headers.every(header => header.type === 'metric'));

    const attrHeader = data.headers.find(header => header.type === 'attrLabel') || getEmptyHeader();
    const metricHeader = data.headers.find(header => header.type === 'metric') || getEmptyHeader();

    const categoryLabel = attrHeader.title;
    const metricLabel = metricHeader.title;

    return {
        type: config.type,
        chart: {
            height: config.height
        },
        colorPalette: getColorPalette(data, config.colors),
        actions: {
            tooltip: generatePieTooltipFn({
                categoryLabel,
                metricLabel,
                data,
                metricsOnly
            })
        },
        metricsOnly
    };
}
