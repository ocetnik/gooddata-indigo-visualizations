import { colors2Object, numberFormat } from '@gooddata/numberjs';
import invariant from 'invariant';

import { range, get, without } from 'lodash';
import { parseValue } from '../utils/common';
import { DEFAULT_COLOR_PALETTE, _getLighterColor } from './transformation';
import { PIE_CHART, CHART_TYPES } from '../VisualizationTypes';
import { isDataOfReasonableSize } from './highChartsCreators';

import { DEFAULT_CATEGORIES_LIMIT } from './highcharts/commonConfiguration';

export const PIE_CHART_LIMIT = 20;

export const VIEW_BY_DIMENSION_INDEX = 0;
export const STACK_BY_DIMENSION_INDEX = 1;

export function unwrap(wrappedObject) {
    return wrappedObject[Object.keys(wrappedObject)[0]];
}

export function isNegativeValueIncluded(series) {
    return series
        .some(seriesItem => (
            seriesItem.data.some(({ y }) => (y < 0))
        ));
}

export function validateData(limits = {}, chartOptions) {
    const pieChartLimits = {
        series: 1, // pie charts can have just one series
        categories: Math.min(limits.categories || DEFAULT_CATEGORIES_LIMIT, PIE_CHART_LIMIT)
    };
    const isPieChart = chartOptions.type === PIE_CHART;
    return {
        // series and categories limit
        dataTooLarge: !isDataOfReasonableSize(chartOptions.data, isPieChart
            ? pieChartLimits
            : limits),
        // check pie chart for negative values
        hasNegativeValue: isPieChart && isNegativeValueIncluded(chartOptions.data.series)
    };
}

export function isPopMeasure(measureItem, afm) {
    return afm.measures.some((measure) => {
        const popMeasureIdentifier = get(measure, 'definition.popMeasure') ? measure.localIdentifier : null;
        return popMeasureIdentifier && popMeasureIdentifier === measureItem.measureHeaderItem.localIdentifier;
    });
}

export function normalizeColorToRGB(color) {
    const hexPattern = /#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})/i;
    return color.replace(hexPattern, (_match, r, g, b) => {
        return `rgb(${[r, g, b].map(value => (parseInt(value, 16).toString(10))).join(', ')})`;
    });
}

export function getColorPalette(
    colorPalette = DEFAULT_COLOR_PALETTE,
    measureGroup,
    viewByAttribute,
    stackByAttribute,
    afm,
    type
) {
    let updatedColorPalette = [...colorPalette]; // clone array
    const isAttributePieChart = type === PIE_CHART && afm.attributes && afm.attributes.length > 0;
    let itemsCount = measureGroup.items.length;

    if (stackByAttribute) {
        itemsCount = stackByAttribute.items.length;
    }
    if (isAttributePieChart) {
        itemsCount = viewByAttribute.items.length;
    }
    measureGroup.items.forEach((measureItem, measureItemIndex) => {
        if (isPopMeasure(measureItem, afm)) {
            const sourceMeasureIdentifier = afm.measures[measureItemIndex].definition.popMeasure.measureIdentifier;
            const sourceMeasureIndex = afm.measures.findIndex(
                measure => measure.localIdentifier === sourceMeasureIdentifier
            );
            if (sourceMeasureIndex) {
                // copy sourceMeasure color and lighten it if it exists, then insert it at pop measure position
                updatedColorPalette = [
                    ...updatedColorPalette.slice(0, measureItemIndex),
                    _getLighterColor(normalizeColorToRGB(updatedColorPalette[sourceMeasureIndex]), 0.6),
                    ...updatedColorPalette.slice(measureItemIndex + 1)
                ];
            }
        }
    });

    const colorCountDifference = itemsCount - updatedColorPalette.length;
    // copy colors if there are more items then colors in palette
    if (colorCountDifference > 0) {
        updatedColorPalette = [
            ...updatedColorPalette,
            ...range(colorCountDifference)
                .map(colorIndex => updatedColorPalette[colorIndex % updatedColorPalette.length])
        ];
    // remove extra colors
    } else if (colorCountDifference < 0) {
        updatedColorPalette = updatedColorPalette.slice(0, colorCountDifference);
    }
    return updatedColorPalette;
}

export function getSeriesItemData(
    seriesItem,
    seriesIndex,
    measureGroup,
    viewByAttribute,
    stackByAttribute,
    type,
    colorPalette
) {
    return seriesItem.map((pointValue, pointIndex) => {
        // by default seriesIndex corresponds to measureGroup label index
        let measureIndex = seriesIndex;
        // by default pointIndex corresponds to viewBy label index
        let viewByIndex = pointIndex;
        // drillContext can have 1 to 3 items
        // viewBy attribute label, stackby label if available
        // last drillContextItem is always current serie measure
        if (stackByAttribute) {
            // pointIndex corresponds to viewBy attribute label (if available)
            viewByIndex = pointIndex;
            // stack bar chart has always just one measure
            measureIndex = 0;
        } else if (type === PIE_CHART && !viewByAttribute) {
            measureIndex = pointIndex;
        }

        const pointData = {
            y: parseValue(pointValue),
            format: unwrap(measureGroup.items[measureIndex]).format,
            marker: {
                enabled: pointValue !== null
            }
        };
        if (stackByAttribute) {
            // if there is a stackBy attribute, then seriesIndex corresponds to stackBy label index
            pointData.name = unwrap(stackByAttribute.items[seriesIndex]).name;
        } else if (type === PIE_CHART && viewByAttribute) {
            pointData.name = unwrap(viewByAttribute.items[viewByIndex]).name;
        } else {
            pointData.name = unwrap(measureGroup.items[measureIndex]).name;
        }

        if (type === PIE_CHART) {
            // add color to pie chart points from colorPalette
            pointData.color = colorPalette[pointIndex];
            // Pie charts use pointData viewByIndex as legendIndex if available instead of seriesItem legendIndex
            pointData.legendIndex = viewByAttribute ? viewByIndex : pointIndex;
        }
        return pointData;
    });
}


export function getSeries(
    executionResultData,
    measureGroup,
    viewByAttribute,
    stackByAttribute,
    type,
    colorPalette
) {
    return executionResultData.map((seriesItem, seriesIndex) => {
        const seriesItemData = getSeriesItemData(
            seriesItem,
            seriesIndex,
            measureGroup,
            viewByAttribute,
            stackByAttribute,
            type,
            colorPalette
        );
        const seriesItemConfig = {
            color: colorPalette[seriesIndex],
            legendIndex: seriesIndex,
            data: seriesItemData
        };

        if (stackByAttribute) {
            // if stackBy attribute is available, seriesName is a stackBy attribute value of index seriesIndex
            // this is a limitiation of highcharts and a reason why you can not have multi-measure stacked charts
            seriesItemConfig.name = stackByAttribute.items[seriesIndex].attributeHeaderItem.name;
        } else if (type === PIE_CHART && !viewByAttribute) {
            // Pie charts with measures only have a single series which name would is ambiguous
            seriesItemConfig.name = measureGroup.items.map((wrappedMeasure) => {
                const measureType = Object.keys(wrappedMeasure)[0];
                const measure = wrappedMeasure[measureType];
                return measure.name;
            }).join(', ');
        } else {
            // otherwise seriesName is a measure name of index seriesIndex
            seriesItemConfig.name = measureGroup.items[seriesIndex].measureHeaderItem.name;
        }

        return seriesItemConfig;
    });
}

export const unEscapeAngleBrackets = str => str && str.replace(/&lt;/g, '<').replace(/&gt;/g, '>');

export const customEscape = str => str && unEscapeAngleBrackets(str).replace(/\W/gim, (char) => {
    if (char === '<') {
        return '&lt;';
    }
    if (char === '>') {
        return '&gt;';
    }
    if (char === '"') {
        return '&quot;';
    }
    if (char === '&') {
        return '&amp;';
    }
    return `&#${char.charCodeAt(0)};`;
});

export function generateTooltipFn(viewByAttribute, type) {
    const formatValue = (val, format) => {
        return colors2Object(numberFormat(val, format));
    };

    return (point) => {
        const formattedValue = formatValue(point.y, point.format).label;
        const textData = [[customEscape(point.series.name), formattedValue]];

        if (viewByAttribute) {
            // For some reason, highcharts ommit categories for pie charts with attribute. Use point.name instead
            textData.unshift([customEscape(viewByAttribute.name), customEscape(point.category || point.name)]);
        } else if (type === PIE_CHART) {
            // Pie charts with measure only have to use point.name instead of series.name to get the measure name
            textData[0][0] = point.name;
        }

        return `<table class="tt-values">${textData.map(line => (
            `<tr>
                <td class="title">${line[0]}</td>
                <td class="value">${line[1]}</td>
            </tr>`
        )).join('\n')}</table>`;
    };
}

export function findInDimensionHeaders(dimensions, headerCallback) {
    let returnValue = null;
    dimensions.some((dimension, dimensionIndex) => {
        dimension.headers.some((wrappedHeader, headerIndex) => {
            const headerType = Object.keys(wrappedHeader)[0];
            const header = wrappedHeader[headerType];
            const headerCount = dimension.headers.length;
            returnValue = headerCallback(headerType, header, dimensionIndex, headerIndex, headerCount);
            return !!returnValue;
        });
        return !!returnValue;
    });
    return returnValue;
}

export function findMeasureGroupInDimensions(dimensions) {
    return findInDimensionHeaders(dimensions, (headerType, header, dimensionIndex, headerIndex, headerCount) => {
        const measureGroupHeader = headerType === 'measureGroupHeader' ? header : null;
        if (measureGroupHeader) {
            invariant(headerIndex === headerCount - 1, 'MeasureGroup must be the last header in it\'s dimension');
        }
        return measureGroupHeader;
    });
}

export function findAttributeInDimension(dimension, attributeHeaderItemsDimension) {
    return findInDimensionHeaders([dimension], (headerType, header) => {
        if (headerType === 'attributeHeader') {
            return {
                ...header,
                // attribute items are delivered separately from attributeHeaderItems
                // there should ever only be maximum of one attribute on each dimension, other attributes are ignored
                items: attributeHeaderItemsDimension[0]
            };
        }
        return null;
    });
}

export function getDrillContext(stackByItem, viewByItem, measure) {
    return without([
        stackByItem,
        viewByItem,
        measure
    ], null).map(({
        uri, // header attribute value or measure uri
        identifier = '', // header attribute value or measure identifier
        name, // header attribute value or measure text label
        attribute // attribute header if available
    }) => {
        return {
            id: uri, // identifier of attribute value
            // TODO: get formatted measure value
            value: name, // text label of attribute value or formatted measure value
            identifier: attribute ? attribute.identifier : identifier, // identifier of attribute or measure
            uri: attribute ? attribute.uri : uri // uri of attribute or measure
        };
    });
    /*
        old drillable items sample
        [
            // attribute
            {
                id: "2012"
                identifier: "closed.aag81lMifn6q"
                uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/324"
                value: "2012"
            },
            // measure
            {
                id: "aaYh6Voua2yj"
                identifier: ""
                uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/13465"
                value: "aaa <b># of Open Opps.</b>"
            }
        ]
    */
}

export function getDrillableSeries(
    series,
    drillableItems,
    measureGroup,
    viewByAttribute,
    stackByAttribute,
    type
) {
    const isMetricPieChart = type === PIE_CHART && !viewByAttribute;

    return series.map((seriesItem, seriesIndex) => {
        let isSeriesDrillable = false;
        const data = seriesItem.data.map((pointData, pointIndex) => {
            // measureIndex is usually seriesIndex,
            // except for stack by attribute and metricOnly pie chart it is looped-around pointIndex instead
            // Looping around the end of items array only works when measureGroup is the last header on it's dimension
            // We do not support setups with measureGroup before attributeHeaders
            const measureIndex = !stackByAttribute && !isMetricPieChart
                ? seriesIndex
                : pointIndex % measureGroup.items.length;
            const measure = unwrap(measureGroup.items[measureIndex]);

            // attributeHeader values over multiple metrics are not a result of carthesian product
            // viewBy index needs to be devided by number of metrics
            const viewByIndex = Math.floor(pointIndex / measureGroup.items.length);
            const viewByItem = viewByAttribute ? {
                ...unwrap(viewByAttribute.items[viewByIndex]),
                attribute: viewByAttribute
            } : null;

            // stackBy item index is always equal to seriesIndex
            const stackByItem = stackByAttribute ? {
                ...unwrap(stackByAttribute.items[seriesIndex]),
                attribute: stackByAttribute
            } : null;

            // point is drillable if a drillableItem matches:
            //   point's measure,
            //   point's viewBy attribute,
            //   point's viewBy attribute item,
            //   point's stackBy attribute,
            //   point's stackBy attribute item,
            const drillableHooks = without([
                measure,
                viewByAttribute,
                viewByItem,
                stackByAttribute,
                stackByItem
            ], null);
            // drillableHooks.map(hook => (console.log(hook)));

            const drilldown = drillableItems.some(drillableItem => (
                drillableHooks.some(drillableHook =>
                    (drillableHook.uri && drillableHook.uri === drillableItem.uri)
                    || (drillableHook.identifier && drillableHook.identifier === drillableItem.identifier)
                )
            ));

            const drillableProps = {
                drilldown
            };
            if (drilldown) {
                drillableProps.drillContext = getDrillContext(measure, viewByItem, stackByItem);
                isSeriesDrillable = true;
            }
            return {
                ...pointData,
                ...drillableProps
            };
        });

        return {
            ...seriesItem,
            data,
            isDrillable: isSeriesDrillable
        };
    });
}

/**
 * Creates an object providing data for all you need to render a chart except drillability.
 *
 * @param afm <executionRequest.AFM> object listing metrics and attributes used.
 * @param resultSpec <executionRequest.resultSpec> object defining expected result dimension structure,
 * @param dimensions <executionResponse.dimensions> array defining calculated dimensions and their headers,
 * @param executionResultData <executionResult.data> array with calculated data
 * @param unfilteredHeaderItems <executionResult.headerItems> array of attribute header items mixed with measures
 * @param config object defining chart display settings
 * @param drillableItems array of items for isPointDrillable matching
 * @return Returns composed chart options object
 */
export function getChartOptions(
    afm,
    resultSpec,
    dimensions,
    executionResultData,
    unfilteredHeaderItems,
    config,
    drillableItems
) {
    // Future version of API will return measures alongside attributeHeaderItems
    // we need to filter these out in order to stay compatible
    const attributeHeaderItems = unfilteredHeaderItems.map((dimension) => {
        return dimension.filter(attributeHeaders => attributeHeaders[0].attributeHeaderItem);
    });
    invariant(config && config.type, `config.type must not be undefined. Possible values are: ${CHART_TYPES.join(', ')}`);
    const type = config.type;
    const measureGroup = findMeasureGroupInDimensions(dimensions);
    const viewByAttribute = findAttributeInDimension(
        dimensions[VIEW_BY_DIMENSION_INDEX],
        attributeHeaderItems[VIEW_BY_DIMENSION_INDEX]
    );
    const stackByAttribute = findAttributeInDimension(
        dimensions[STACK_BY_DIMENSION_INDEX],
        attributeHeaderItems[STACK_BY_DIMENSION_INDEX]
    );

    if (!measureGroup) {
        throw new Error('missing measureGroup');
    }

    const categories = viewByAttribute
        ? viewByAttribute.items.map(({ attributeHeaderItem }) => (attributeHeaderItem.name))
        : measureGroup.items.map(wrappedMeasure => unwrap(wrappedMeasure).name);

    const colorPalette =
        getColorPalette(config.colorPalette, measureGroup, viewByAttribute, stackByAttribute, afm, type);

    const seriesWithoutDrillability = getSeries(
        executionResultData,
        measureGroup,
        viewByAttribute,
        stackByAttribute,
        type,
        colorPalette
    );

    const series = getDrillableSeries(
        seriesWithoutDrillability,
        drillableItems,
        measureGroup,
        viewByAttribute,
        stackByAttribute,
        type
    );

    const xLabel = config.xLabel || (viewByAttribute ? viewByAttribute.name : '');
    // if there is only one measure, yLabel is name of this measure, otherwise an empty string
    const yLabel = config.yLabel || (measureGroup.items.length === 1 ? unwrap(measureGroup.items[0]).name : '');
    const yFormat = config.yFormat || unwrap(measureGroup.items[0]).format;

    return {
        type,
        stacking: (stackByAttribute && type !== 'line') ? 'normal' : null,
        legendLayout: config.legendLayout || 'horizontal',
        colorPalette,
        title: {
            x: xLabel,
            y: yLabel,
            yFormat
        },
        showInPercent: measureGroup.items.some((wrappedMeasure) => {
            const measure = wrappedMeasure[Object.keys(wrappedMeasure)[0]];
            return measure.format.includes('%');
        }),
        data: {
            series,
            categories
        },
        actions: {
            tooltip: generateTooltipFn(viewByAttribute, type)
        }
    };
}
