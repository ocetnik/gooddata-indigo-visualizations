import React from 'react';
import { mount } from 'enzyme';
import TableTransformation from '../TableTransformation';
import { data, config } from '../../test/fixtures';

describe('TableTransformation', () => {
    function createComponent(customProps = {}) {
        const defaultProps = {
            onDataTooLarge: () => {},
            config,
            data
        };
        const props = { ...defaultProps, ...customProps };
        return <TableTransformation {...props} />;
    }

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
});
