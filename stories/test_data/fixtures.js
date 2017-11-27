import { range, cloneDeep } from 'lodash';
import { immutableSet, repeatItemsNTimes } from '../../src/utils/common';
import { STACK_BY_DIMENSION_INDEX } from '../../src/Chart/constants';

export const barChartWithSingleMeasureAndNoAttributes = {
    executionRequest: require('../test_data/bar_chart_with_single_measure_and_no_attributes_request.json').execution,
    executionResponse: require('../test_data/bar_chart_with_single_measure_and_no_attributes_response.json').executionResponse,
    executionResult: require('../test_data/bar_chart_with_single_measure_and_no_attributes_result.json').executionResult
};

export const barChartWithoutAttributes = {
    executionRequest: require('../test_data/bar_chart_without_attributes_request.json').execution,
    executionResponse: require('../test_data/bar_chart_without_attributes_response.json').executionResponse,
    executionResult: require('../test_data/bar_chart_without_attributes_result.json').executionResult
};

export const barChartWith3MetricsAndViewByAttribute = {
    executionRequest: require('../test_data/bar_chart_with_3_metrics_and_view_by_attribute_request.json').execution,
    executionResponse: require('../test_data/bar_chart_with_3_metrics_and_view_by_attribute_response.json').executionResponse,
    executionResult: require('../test_data/bar_chart_with_3_metrics_and_view_by_attribute_result.json').executionResult
};

export const barChartWithViewByAttribute = {
    executionRequest: require('../test_data/bar_chart_with_view_by_attribute_request.json').execution,
    executionResponse: require('../test_data/bar_chart_with_view_by_attribute_response.json').executionResponse,
    executionResult: require('../test_data/bar_chart_with_view_by_attribute_result.json').executionResult
};

export const barChartWithManyViewByAttributeValues = {
    executionRequest: require('../test_data/bar_chart_with_many_view_by_attribute_values_request.json').execution,
    executionResponse: require('../test_data/bar_chart_with_many_view_by_attribute_values_response.json').executionResponse,
    executionResult: require('../test_data/bar_chart_with_many_view_by_attribute_values_result.json').executionResult
};

export const barChartWithStackByAndViewByAttributes = {
    executionRequest: require('../test_data/bar_chart_with_stack_by_and_view_by_attributes_request.json').execution,
    executionResponse: require('../test_data/bar_chart_with_stack_by_and_view_by_attributes_response.json').executionResponse,
    executionResult: require('../test_data/bar_chart_with_stack_by_and_view_by_attributes_result.json').executionResult
};

export const barChartWithStackByAndOnlyOneStack = {
    executionRequest: require('../test_data/bar_chart_with_stack_by_and_only_one_stack_request.json').execution,
    executionResponse: require('../test_data/bar_chart_with_stack_by_and_only_one_stack_response.json').executionResponse,
    executionResult: require('../test_data/bar_chart_with_stack_by_and_only_one_stack_result.json').executionResult
};

export const barChartWithPopMeasureAndViewByAttribute = {
    executionRequest: require('../test_data/bar_chart_with_pop_measure_and_view_by_attribute_request.json').execution,
    executionResponse: require('../test_data/bar_chart_with_pop_measure_and_view_by_attribute_response.json').executionResponse,
    executionResult: require('../test_data/bar_chart_with_pop_measure_and_view_by_attribute_result.json').executionResult
};

export const pieChartWithMetricsOnly = {
    executionRequest: require('../test_data/pie_chart_with_metrics_only_request.json').execution,
    executionResponse: require('../test_data/pie_chart_with_metrics_only_response.json').executionResponse,
    executionResult: require('../test_data/pie_chart_with_metrics_only_result.json').executionResult
};


export function barChartWithNTimes3MetricsAndViewByAttribute(n = 1) {
    let dataSet = immutableSet(
        barChartWith3MetricsAndViewByAttribute,
        'executionRequest.afm.measures',
        repeatItemsNTimes(barChartWith3MetricsAndViewByAttribute.executionRequest.afm.measures, n));
    dataSet = immutableSet(
        dataSet,
        `executionResponse.dimensions[${STACK_BY_DIMENSION_INDEX}].headers[0].measureGroupHeader.items`,
        repeatItemsNTimes(dataSet.executionResponse
            .dimensions[STACK_BY_DIMENSION_INDEX].headers[0].measureGroupHeader.items, n)
    );
    dataSet = immutableSet(
        dataSet,
        'executionResult.data',
        repeatItemsNTimes(dataSet.executionResult.data, n)
    );
    return dataSet;
}

export const barChartWith18MetricsAndViewByAttribute = barChartWithNTimes3MetricsAndViewByAttribute(6);

export const barChartWith60MetricsAndViewByAttribute = barChartWithNTimes3MetricsAndViewByAttribute(18);

export const barChartWith6PopMeasuresAndViewByAttribute = (() => {
    const n = 6;
    let dataSet = immutableSet(
        barChartWithPopMeasureAndViewByAttribute,
        'executionRequest.afm.measures',
        range(n).reduce((result, measuresIndex) => {
            const measures = barChartWithPopMeasureAndViewByAttribute.executionRequest.afm.measures;
            const popMeasure = cloneDeep(measures[0]);
            const postfix = `_${measuresIndex}`;
            popMeasure.localIdentifier += postfix;
            popMeasure.definition.popMeasure.measureIdentifier += postfix;
            popMeasure.definition.popMeasure.popAttribute = {
                uri: popMeasure.definition.popMeasure.popAttribute + postfix
            };
            popMeasure.alias += postfix;
            const sourceMeasure = cloneDeep(measures[1]);
            sourceMeasure.localIdentifier += postfix;
            sourceMeasure.definition.measure.item.uri += postfix;
            sourceMeasure.alias += postfix;
            return result.concat([popMeasure, sourceMeasure]);
        }, []));
    dataSet = immutableSet(
        dataSet,
        `executionResponse.dimensions[${STACK_BY_DIMENSION_INDEX}].headers[0].measureGroupHeader.items`,
        repeatItemsNTimes(
            dataSet.executionResponse.dimensions[STACK_BY_DIMENSION_INDEX].headers[0].measureGroupHeader.items, n)
            .map((headerItem, headerItemIndex) => {
                const postfix = `_${Math.floor(headerItemIndex / 2)}`;
                return {
                    measureHeaderItem: {
                        ...headerItem.measureHeaderItem,
                        localIdentifier: headerItem.measureHeaderItem.localIdentifier + postfix
                    }
                };
            })
    );
    dataSet = immutableSet(
        dataSet,
        'executionResult.data',
        repeatItemsNTimes(dataSet.executionResult.data, n)
    );
    return dataSet;
})();

export const customPalette = [
    '#FF69B4',
    '#d40606',
    '#ee9c00',
    '#e3ff00',
    '#06bf00',
    '#001a98'
];

export default {
    barChartWithSingleMeasureAndNoAttributes,
    barChartWithoutAttributes,
    barChartWith3MetricsAndViewByAttribute,
    barChartWith18MetricsAndViewByAttribute,
    barChartWith60MetricsAndViewByAttribute,
    barChartWithViewByAttribute,
    barChartWithManyViewByAttributeValues,
    barChartWithStackByAndViewByAttributes,
    barChartWithPopMeasureAndViewByAttribute,
    barChartWith6PopMeasuresAndViewByAttribute,
    pieChartWithMetricsOnly
};
