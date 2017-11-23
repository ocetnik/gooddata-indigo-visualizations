import React from 'react';
import { storiesOf, action } from '@storybook/react';
import { range } from 'lodash';

import TableTransformation from '../src/Table/TableTransformation';
import ResponsiveTable from '../src/Table/ResponsiveTable';
import IntlWrapper from './utils/IntlWrapper';
import { screenshotWrap } from './utils/wrap';
import '../src/styles/table.scss';

import {
    EXECUTION_REQUEST_2A_1M,
    EXECUTION_RESPONSE_2A_1M,
    EXECUTION_RESULT_2A_1M
} from '../src/Table/fixtures/2attributes1measure';

function generateExecutionRequest() {
    // no needed exact executionRequest for these storybook usages where is no sorting
    return {
        afm: {},
        resultSpec: {}
    };
}

function generateAttributeUriForColumn(rowNumber) {
    return `/gdc/md/project_id/obj/attr_${rowNumber}_uri_id`;
}

function generateAttributeDisplayFormUriForColumn(rowNumber) {
    return `${generateAttributeUriForColumn(rowNumber)}_df`;
}

function generateAttributeHeaders(columns) {
    return range(columns).map((columnNumber) => {
        return {
            attributeHeader: {
                uri: generateAttributeDisplayFormUriForColumn(columnNumber),
                identifier: `identifier_${columnNumber}`,
                localIdentifier: `df_local_identifier_${columnNumber}`,
                name: `Column DF ${columnNumber}`,
                formOf: {
                    name: `Column ${columnNumber}`,
                    uri: generateAttributeUriForColumn(columnNumber),
                    identifier: `local_identifier_${columnNumber}`
                }
            }
        };
    });
}

function generateHeaderItems(columns, rows) {
    return [
        range(columns).map((columnNumber) => {
            return range(rows).map((rowNumber) => {
                return {
                    attributeHeaderItem: {
                        uri: `${generateAttributeDisplayFormUriForColumn(columnNumber)}/elements?id=${rowNumber}`,
                        name: columnNumber.toString()
                    }
                };
            });
        }),
        [] // empty array => empty 1-st dimension
    ];
}

function generateExecutionResponse(columns, rows) {
    return {
        dimensions: [
            {
                headers: generateAttributeHeaders(columns, rows)
            },
            {
                headers: [] // empty array => empty 1-st dimension
            }
        ],
        links: {
            executionResult: '/gdc/app/projects/project_id/executionResults/foo?q=bar&c=baz&dimension=a&dimension=m'
        }
    };
}

function generateExecutionResult(columns, rows) {
    return {
        data: [],
        headerItems: generateHeaderItems(columns, rows),
        paging: {
            count: [
                20,
                1
            ],
            offset: [
                0,
                0
            ],
            total: [
                20,
                1
            ]
        }
    };
}

function generateAggregations(columns, aggregationsTypes) {
    return aggregationsTypes.map((type, typeIndex) => {
        return {
            name: type,
            values: range(columns).map((column, columnIndex) => typeIndex + columnIndex)
        };
    });
}

storiesOf('Table')
    .add('Fixed dimensions', () => (
        screenshotWrap(
            <div>
                <TableTransformation
                    executionRequest={EXECUTION_REQUEST_2A_1M}
                    executionResponse={EXECUTION_RESPONSE_2A_1M}
                    executionResult={EXECUTION_RESULT_2A_1M}
                    height={400}
                    onSortChange={action('Sort changed')}
                    width={600}
                />
            </div>
        )
    ))
    .add('Fill parent', () => (
        screenshotWrap(
            <div style={{ width: '100%', height: 500 }}>
                <TableTransformation
                    executionRequest={EXECUTION_REQUEST_2A_1M}
                    executionResponse={EXECUTION_RESPONSE_2A_1M}
                    executionResult={EXECUTION_RESULT_2A_1M}
                    onSortChange={action('Sort changed')}
                />
            </div>
        )
    ))
    .add('Sticky header', () => (
        screenshotWrap(
            <div style={{ width: '100%', height: 600 }}>
                <TableTransformation
                    config={{
                        stickyHeader: 0
                    }}
                    executionRequest={EXECUTION_REQUEST_2A_1M}
                    executionResponse={EXECUTION_RESPONSE_2A_1M}
                    executionResult={EXECUTION_RESULT_2A_1M}
                    height={400}
                    onSortChange={action('Sort changed')}
                />
                <div style={{ height: 800 }} />
            </div>
        )
    ))
    .add('Vertical scroll', () => (
        screenshotWrap(
            <div>
                <TableTransformation
                    executionRequest={generateExecutionRequest()}
                    executionResponse={generateExecutionResponse(20, 20)}
                    executionResult={generateExecutionResult(20, 20)}
                    height={400}
                    onSortChange={action('Sort changed')}
                    width={600}
                />
            </div>
        )
    ))
    .add('Show more/Show less', () => (
        screenshotWrap(
            <IntlWrapper>
                <TableTransformation
                    config={{
                        onMore: action('More clicked'),
                        onLess: action('Less clicked')
                    }}
                    executionRequest={generateExecutionRequest()}
                    executionResponse={generateExecutionResponse(20, 20)}
                    executionResult={generateExecutionResult(20, 20)}
                    height={400}
                    onSortChange={action('Sort changed')}
                    tableRenderer={props => (<ResponsiveTable {...props} rowsPerPage={10} />)}
                />
            </IntlWrapper>
        )
    ))
    .add('Aggregations', () => (
        screenshotWrap(
            <IntlWrapper>
                <TableTransformation
                    config={{
                        onMore: action('More clicked'),
                        onLess: action('Less clicked'),
                        stickyHeaderOffset: 0
                    }}
                    executionRequest={EXECUTION_REQUEST_2A_1M}
                    executionResponse={EXECUTION_RESPONSE_2A_1M}
                    executionResult={EXECUTION_RESULT_2A_1M}
                    height={400}
                    onSortChange={action('Sort changed')}
                    tableRenderer={props => (<ResponsiveTable {...props} rowsPerPage={10} />)}
                    aggregations={generateAggregations(3, ['Sum', 'Avg', 'Rollup'])}
                />
            </IntlWrapper>
        )
    ));
