import { colors2Object, numberFormat } from '@gooddata/numberjs';
import invariant from 'invariant';

import { range, get, without, escape, unescape } from 'lodash';
import { parseValue, getAttributeElementIdFromAttributeElementUri } from '../utils/common';
import { DEFAULT_COLOR_PALETTE, getLighterColor } from '../utils/color';
import { PIE_CHART, CHART_TYPES } from '../VisualizationTypes';
import { isDataOfReasonableSize } from './highChartsCreators';
import { VIEW_BY_DIMENSION_INDEX, STACK_BY_DIMENSION_INDEX, PIE_CHART_LIMIT } from './constants';

import { DEFAULT_CATEGORIES_LIMIT } from './highcharts/commonConfiguration';

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
    let updatedColorPalette = [];
    const isAttributePieChart = type === PIE_CHART && afm.attributes && afm.attributes.length > 0;

    if (stackByAttribute || isAttributePieChart) {
        const itemsCount = stackByAttribute ? stackByAttribute.items.length : viewByAttribute.items.length;
        updatedColorPalette = range(itemsCount)
            .map(itemIndex => colorPalette[itemIndex % colorPalette.length]);
    } else {
        let linkedPopMeasureCounter = 0;
        measureGroup.items.forEach((measureItem, measureItemIndex) => {
            // skip linked popMeasures in color palete
            const colorIndex = (measureItemIndex - linkedPopMeasureCounter) % colorPalette.length;
            let color = colorPalette[colorIndex];

            // if this is a pop measure and we found it`s original measure
            if (isPopMeasure(measureItem, afm)) {
                // find source measure
                const sourceMeasureIdentifier = afm.measures[measureItemIndex].definition.popMeasure.measureIdentifier;
                const sourceMeasureIndex = afm.measures.findIndex(
                    measure => measure.localIdentifier === sourceMeasureIdentifier
                );
                if (sourceMeasureIndex > -1) {
                    linkedPopMeasureCounter += 1;
                    // copy sourceMeasure color and lighten it if it exists, then insert it at pop measure position
                    const sourceMeasureColorIndex =
                        (sourceMeasureIndex - linkedPopMeasureCounter) % colorPalette.length;
                    const sourceMeasureColor = colorPalette[sourceMeasureColorIndex];
                    const popMeasureColor = getLighterColor(normalizeColorToRGB(sourceMeasureColor), 0.6);
                    color = popMeasureColor;
                }
            }
            updatedColorPalette.push(color);
        });
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
                return unwrap(wrappedMeasure).name;
            }).join(', ');
        } else {
            // otherwise seriesName is a measure name of index seriesIndex
            seriesItemConfig.name = measureGroup.items[seriesIndex].measureHeaderItem.name;
        }

        return seriesItemConfig;
    });
}

export const customEscape = str => str && escape(unescape(str));

export function generateTooltipFn(viewByAttribute, type) {
    const formatValue = (val, format) => {
        return colors2Object(numberFormat(val, format));
    };

    return (point) => {
        const formattedValue = customEscape(formatValue(point.y, point.format).label);
        const textData = [[customEscape(point.series.name), formattedValue]];

        if (viewByAttribute) {
            // For some reason, highcharts ommit categories for pie charts with attribute. Use point.name instead.
            // use attribute name instead of attribute display form name
            textData.unshift([customEscape(viewByAttribute.formOf.name), customEscape(point.category || point.name)]);
        } else if (type === PIE_CHART) {
            // Pie charts with measure only have to use point.name instead of series.name to get the measure name
            textData[0][0] = customEscape(point.name);
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
        format, // measure format
        localIdentifier,
        attribute // attribute header if available
    }) => {
        return {
            id: attribute
                ? getAttributeElementIdFromAttributeElementUri(uri)
                : localIdentifier, // attribute value id or measure localIndentifier
            ...(attribute ? {} : {
                format
            }),
            value: name, // text label of attribute value or formatted measure value
            identifier: attribute ? attribute.identifier : identifier, // identifier of attribute or measure
            uri: attribute ? attribute.uri : uri // uri of attribute or measure
        };
    });
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

function getCategories(type, viewByAttribute, measureGroup) {
    // Categories make up bar/slice labels in charts. These usually match view by attribute values.
    // Measure only pie charts geet categories from measure names
    if (viewByAttribute) {
        return viewByAttribute.items.map(({ attributeHeaderItem }) => attributeHeaderItem.name);
    }
    if (type === PIE_CHART) {
        // Pie chart with measures only (no viewByAttribute) needs to list
        return measureGroup.items.map(wrappedMeasure => unwrap(wrappedMeasure).name);
        // Pie chart categories are later sorted by seriesItem pointValue
    }
    return [];
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

    invariant(config && CHART_TYPES.includes(config.type), `config.type must be defined and match one of supported chart types: ${CHART_TYPES.join(', ')}`);

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

    invariant(measureGroup, 'missing measureGroup');

    const colorPalette =
        getColorPalette(config.colors, measureGroup, viewByAttribute, stackByAttribute, afm, type);

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

    let categories = getCategories(type, viewByAttribute, measureGroup);

    // Pie charts dataPoints are sorted by default by value in descending order
    if (type === PIE_CHART) {
        const dataPoints = series[0].data;
        const indexSortOrder = [];
        const sortedDataPoints = dataPoints.sort((pointDataA, pointDataB) => {
            if (pointDataA.y === pointDataB.y) { return 0; }
            return pointDataB.y - pointDataA.y;
        }).map((dataPoint, dataPointIndex) => {
            // Legend index equals original dataPoint index
            indexSortOrder.push(dataPoint.legendIndex);
            return {
                // after sorting, colors need to be reassigned in original order and legendIndex needs to be reset
                ...dataPoint,
                color: dataPoints[dataPoint.legendIndex].color,
                legendIndex: dataPointIndex
            };
        });
        // categories need to be sorted in exactly the same order as dataPoints
        categories = categories.map((_category, dataPointIndex) => categories[indexSortOrder[dataPointIndex]]);
        series[0].data = sortedDataPoints;
    }

    // Attribute axis labels come from attribute instead of attribute display form.
    // They are listed in attribute headers. So we need to find one attribute header and read the attribute name
    const xLabel = config.xLabel || (viewByAttribute ? viewByAttribute.formOf.name : '');
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
