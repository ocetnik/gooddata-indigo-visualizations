import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { FormattedMessage, injectIntl } from 'react-intl';
import { noop } from 'lodash';

import { ASC, DESC } from './constants/sort';

export class TableSortBubbleContent extends Component {
    static propTypes = {
        activeSortDir: PropTypes.oneOf([ASC, DESC]),
        onClose: PropTypes.func,
        onSortChange: PropTypes.func,
        title: PropTypes.string.isRequired
    };

    static defaultProps = {
        activeSortDir: null,
        onClose: noop,
        onSortChange: noop
    };

    constructor(props) {
        super(props);

        this.sortAsc = this.handleSort.bind(this, ASC);
        this.sortDesc = this.handleSort.bind(this, DESC);
    }

    handleSort(dir, e) {
        this.props.onSortChange(dir, e);
        this.props.onClose();
    }

    renderButton(dir) {
        const { activeSortDir } = this.props;
        const isDisabled = dir === activeSortDir;
        const buttonClasses = cx(
            'button',
            'button-primary',
            'button-small',
            'icon-dropdown',
            'icon-right', {
                'button-sort-asc': dir === ASC,
                'button-sort-desc': dir === DESC,
                disabled: isDisabled
            }
        );

        const onClick = dir === ASC ? this.sortAsc : this.sortDesc;
        const msg = dir === ASC ? 'visualizations.asc' : 'visualizations.desc';

        return (
            <button onClick={onClick} disabled={isDisabled} className={buttonClasses}>
                <FormattedMessage id={msg} />
            </button>
        );
    }

    render() {
        const { title, onClose } = this.props;

        return (
            <div>
                <button className="close-button button-link button-icon-only icon-cross" onClick={onClose} />
                <div className="gd-dialog-header gd-heading-3">{title}</div>
                <FormattedMessage id="visualizations.sorting" />
                <div className="buttons-wrap">
                    <div className="buttons">
                        {this.renderButton(ASC)}
                        {this.renderButton(DESC)}
                    </div>
                </div>
            </div>
        );
    }
}

export default injectIntl(TableSortBubbleContent);
