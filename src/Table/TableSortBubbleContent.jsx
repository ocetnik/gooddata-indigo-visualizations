import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import cx from 'classnames';

import { ASC, DESC } from './Sort';

export class TableSortBubbleContent extends Component {
    static propTypes = {
        title: PropTypes.string.isRequired,
        activeSortDir: PropTypes.oneOf([
            ASC, DESC
        ]),
        onSortChange: PropTypes.func,
        onClose: PropTypes.func
    };

    static defaultProps = {
        activeSortDir: null,
        onSortChange: () => {},
        onClose: () => {}
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
            });

        const msg = dir === ASC ? 'visualizations.asc' : 'visualizations.desc';
        const onClick = dir === ASC ? this.sortAsc : this.sortDesc;

        return (
            <button
                onClick={onClick}
                disabled={isDisabled}
                className={buttonClasses}
            >
                <FormattedMessage id={msg} />
            </button>
        );
    }

    render() {
        const { title, onClose } = this.props;

        return (
            <div>
                <button
                    className="close-button button-link button-icon-only icon-cross"
                    onClick={onClose}
                />
                <div className="gd-dialog-header gd-heading-3">
                    {title}
                </div>
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
