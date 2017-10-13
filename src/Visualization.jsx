import React, { Component } from 'react';
import PropTypes from 'prop-types';
import invariant from 'invariant';
import { isEqual, isFunction, omitBy } from 'lodash';
import Highcharts from 'highcharts';

import ChartTransformation from './Chart/ChartTransformation';
import TableTransformation from './Table/TableTransformation';
import * as VisualizationTypes from './VisualizationTypes';

export default class Visualization extends Component {
    static propTypes = {
        config: PropTypes.shape({
            type: PropTypes.string.isRequired
        }).isRequired,
        onFiredDrillEvent: PropTypes.func,
        numericSymbols: PropTypes.array,
        afterRender: PropTypes.func
    };

    static defaultProps = {
        numericSymbols: [],
        onFiredDrillEvent: () => {},
        afterRender: () => {}
    };

    constructor(props) {
        super(props);

        this.setNumericSymbols(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.setNumericSymbols(nextProps);
    }

    shouldComponentUpdate(nextProps) {
        return !isEqual(omitBy(this.props, isFunction), omitBy(nextProps, isFunction));
    }

    setNumericSymbols(props = {}) {
        const { numericSymbols } = props;

        if (numericSymbols && numericSymbols.length) {
            Highcharts.setOptions({
                lang: {
                    numericSymbols
                }
            });
        }
    }

    render() {
        const visType = this.props.config.type;
        const visualizationTypeList = Object.values(VisualizationTypes);

        if (visType === VisualizationTypes.TABLE) {
            return (
                <TableTransformation {...this.props} />
            );
        }

        if (visualizationTypeList.includes(visType)) {
            return (
                <ChartTransformation {...this.props} />
            );
        }

        return invariant(visualizationTypeList.includes(visType), `Unknown visualization type: ${visType}. Supported visualization types: ${visualizationTypeList.join(', ')}`);
    }
}
