import React from 'react';
import { mount } from 'enzyme';

import TableTransformation from '../TableTransformation';
import {
    EXECUTION_REQUEST_2A_3M,
    EXECUTION_RESPONSE_2A_3M,
    EXECUTION_RESULT_2A_3M
} from '../fixtures/2attributes3measures';

describe('TableTransformation', () => {
    function createComponent(customProps = {}) {
        const defaultProps = {
            executionRequest: EXECUTION_REQUEST_2A_3M,
            executionResponse: EXECUTION_RESPONSE_2A_3M,
            executionResult: EXECUTION_RESULT_2A_3M
        };
        const props = { ...defaultProps, ...customProps };
        return <TableTransformation {...props} />;
    }

    it('should use default renderer', () => {
        const component = mount(createComponent());
        expect(component.prop('tableRenderer')).toBeDefined();
    });

    it('should use custom renderer', () => {
        const tableRenderer = jest.fn().mockImplementation(() => <div />);
        mount(createComponent({ tableRenderer }));
        expect(tableRenderer).toHaveBeenCalled();
    });

    it('should pass containerHeight if height is set in props', () => {
        const tableRenderer = jest.fn().mockImplementation(() => <div />);
        mount(createComponent({ tableRenderer, height: 255 }));
        expect(tableRenderer.mock.calls[0][0].containerHeight).toEqual(255);
    });

    it('should pass containerWidth if width is set in props', () => {
        const tableRenderer = jest.fn().mockImplementation(() => <div />);
        mount(createComponent({ tableRenderer, width: 700 }));
        expect(tableRenderer.mock.calls[0][0].containerWidth).toEqual(700);
    });
});
