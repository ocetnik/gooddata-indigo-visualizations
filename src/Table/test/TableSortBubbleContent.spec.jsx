import React from 'react';
import { mount } from 'enzyme';
import { TableSortBubbleContent } from '../TableSortBubbleContent';
import { ASC, DESC } from '../constants/sort';
import { withIntl } from '../../test/utils';

describe('TableSortBubbleContent', () => {
    function createBubble(customProps = {}) {
        const props = {
            title: 'Foo',
            ...customProps
        };
        const WrappedBubble = withIntl(TableSortBubbleContent);
        return mount(
            <WrappedBubble {...props} />
        );
    }

    it('should render 2 sort buttons', () => {
        const wrapper = createBubble();
        expect(wrapper.find('.button-sort-asc')).toHaveLength(1);
        expect(wrapper.find('.button-sort-desc')).toHaveLength(1);
    });

    it('should trigger sort callback on button click & close', () => {
        const props = {
            onSortChange: jest.fn(),
            onClose: jest.fn()
        };
        const wrapper = createBubble(props);

        wrapper.find('.button-sort-asc').simulate('click');
        expect(props.onSortChange.mock.calls[0][0]).toEqual(ASC);

        wrapper.find('.button-sort-desc').simulate('click');
        expect(props.onSortChange.mock.calls[1][0]).toEqual(DESC);

        expect(props.onClose).toHaveBeenCalledTimes(2);
    });

    it('should trigger close callback on cross button click', () => {
        const props = {
            onClose: jest.fn()
        };
        const wrapper = createBubble(props);
        wrapper.find('.close-button').simulate('click');

        expect(props.onClose).toHaveBeenCalledTimes(1);
    });
});
