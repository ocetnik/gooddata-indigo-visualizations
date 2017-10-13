import { immutableSet, repeatItemsNTimes } from '../../src/utils/common';

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

export const barChartWithStackByAndViewByAttributes = {
    executionRequest: require('../test_data/bar_chart_with_stack_by_and_view_by_attributes_request.json').execution,
    executionResponse: require('../test_data/bar_chart_with_stack_by_and_view_by_attributes_response.json').executionResponse,
    executionResult: require('../test_data/bar_chart_with_stack_by_and_view_by_attributes_result.json').executionResult
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

export const barChartWith18MetricsAndViewByAttribute = (() => {
    let dataSet = immutableSet(
        barChartWith3MetricsAndViewByAttribute,
        'executionRequest.afm.measures',
        repeatItemsNTimes(barChartWith3MetricsAndViewByAttribute.executionRequest.afm.measures, 6));
    dataSet = immutableSet(
        dataSet,
        'executionResponse.dimensions[1].headers[0].measureGroupHeader.items',
        repeatItemsNTimes(barChartWith3MetricsAndViewByAttribute.executionResponse
            .dimensions[1].headers[0].measureGroupHeader.items, 6)
    );
    dataSet = immutableSet(
        dataSet,
        'executionResult.data',
        repeatItemsNTimes(barChartWith3MetricsAndViewByAttribute.executionResult.data, 6)
    );
    return dataSet;
})();

export default {
    barChartWithoutAttributes,
    barChartWith3MetricsAndViewByAttribute,
    barChartWith18MetricsAndViewByAttribute,
    barChartWithViewByAttribute,
    barChartWithStackByAndViewByAttributes,
    barChartWithPopMeasureAndViewByAttribute,
    pieChartWithMetricsOnly
};
