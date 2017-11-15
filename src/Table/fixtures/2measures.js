export const EXECUTION_REQUEST_2M = {
    afm: {
        measures: [
            {
                localIdentifier: '1st_measure_local_identifier',
                definition: {
                    measure: {
                        item: {
                            uri: '/gdc/md/project_id/obj/1st_measure_uri_id'
                        }
                    }
                }
            },
            {
                localIdentifier: '2nd_measure_local_identifier',
                definition: {
                    measure: {
                        item: {
                            identifier: '2nd_measure_identifier'
                        }
                    }
                }
            }
        ]
    },
    resultSpec: {
        dimensions: [
            {
                itemIdentifiers: ['measureGroup']
            },
            {
                itemIdentifiers: []
            }
        ]
    }
};

export const EXECUTION_RESPONSE_2M = {
    dimensions: [
        {
            headers: [
                {
                    measureGroupHeader: {
                        items: [
                            {
                                measureHeaderItem: {
                                    uri: '/gdc/md/project_id/obj/1st_measure_uri_id',
                                    identifier: '1st_measure_identifier',
                                    localIdentifier: '1st_measure_local_identifier',
                                    name: 'Lost',
                                    format: '$#,##0.00'
                                }
                            },
                            {
                                measureHeaderItem: {
                                    uri: '/gdc/md/project_id/obj/2nd_measure_uri_id',
                                    identifier: '2nd_measure_identifier',
                                    localIdentifier: '2nd_measure_local_identifier',
                                    name: 'Won',
                                    format: '[red]$#,##0.00'
                                }
                            }
                        ]
                    }
                }
            ]
        },
        {
            headers: [] // empty array => empty 1-st dimension
        }
    ],
    links: {
        executionResult: '/gdc/app/projects/project_id/executionResults/foo?q=bar&c=baz&dimension=a&dimension=m'
    }
};

export const EXECUTION_RESULT_2M = {
    data: [
        [
            '42470571.16'
        ],
        [
            '38310753.45'
        ]
    ],
    headerItems: [
        [
            [
                {
                    measureHeaderItem: {
                        name: 'Lost',
                        order: 0
                    }
                },
                {
                    measureHeaderItem: {
                        name: 'Won',
                        order: 1
                    }
                }
            ]
        ],
        [] // empty array => empty 1-st dimension
    ],
    paging: {
        count: [
            2,
            1
        ],
        offset: [
            0,
            0
        ],
        total: [
            2,
            1
        ]
    }
};

export const TABLE_HEADERS_2M = [
    {
        type: 'measure',
        uri: '/gdc/md/project_id/obj/1st_measure_uri_id',
        identifier: '1st_measure_identifier',
        localIdentifier: '1st_measure_local_identifier',
        name: 'Lost',
        format: '$#,##0.00'
    },
    {
        type: 'measure',
        uri: '/gdc/md/project_id/obj/2nd_measure_uri_id',
        identifier: '2nd_measure_identifier',
        localIdentifier: '2nd_measure_local_identifier',
        name: 'Won',
        format: '[red]$#,##0.00'
    }
];

export const TABLE_ROWS_2M = [
    [
        '42470571.16',
        '38310753.45'
    ]
];
