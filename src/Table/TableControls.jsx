import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';

import Button from '@gooddata/goodstrap/lib/Button/Button';

export class TableControls extends Component {
    static propTypes = {
        onMore: PropTypes.func.isRequired,
        onLess: PropTypes.func.isRequired,
        isMoreButtonDisabled: PropTypes.bool,
        isMoreButtonVisible: PropTypes.bool,
        isLessButtonVisible: PropTypes.bool,
        intl: intlShape.isRequired
    };

    static defaultProps = {
        isMoreButtonDisabled: false,
        isMoreButtonVisible: false,
        isLessButtonVisible: false
    };

    getMessage(id) {
        return this.props.intl.formatMessage({ id: `visualizations.${id}` });
    }

    renderMore() {
        if (!this.props.isMoreButtonVisible || this.props.isMoreButtonDisabled) {
            return null;
        }

        const label = this.getMessage('more');

        return (
            <Button
                className="button-secondary button-small"
                onClick={this.props.onMore}
                value={label}
                title={label}
            />
        );
    }

    renderLess() {
        if (!this.props.isLessButtonVisible) {
            return null;
        }

        const label = this.getMessage('less');

        return (
            <Button
                className="button-small button-link-dimmed"
                onClick={this.props.onLess}
                value={label}
                title={label}
            />
        );
    }

    render() {
        return (
            <div className="indigo-button-bar">
                {this.renderMore()}
                {this.renderLess()}
            </div>
        );
    }
}

export default injectIntl(TableControls);
