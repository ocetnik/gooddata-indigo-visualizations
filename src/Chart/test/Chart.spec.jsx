import Highcharts from 'highcharts';
import React from 'react';
import { mount } from 'enzyme';

import Chart from '../Chart';

jest.mock('highcharts', () => {
    return {
        Chart: (options, callback) => {
            callback();
        }
    };
});


describe('Chart', () => {
    function createComponent(props = {}) {
        return mount(<Chart config={{}} {...props} />);
    }

    it('should render highcharts', () => {
        const spy = jest.spyOn(Highcharts, 'Chart');
        const wrapper = createComponent();
        const component = wrapper.instance();
        expect(component.chart).toBeTruthy();
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should rerender highcharts on props change', () => {
        const createChartSpy = jest.spyOn(Chart.prototype, 'createChart');
        const wrapper = createComponent();

        expect(createChartSpy).toHaveBeenCalledTimes(1);

        wrapper.setProps({ config: { foo: 'bar' } });
        expect(createChartSpy).toHaveBeenCalledTimes(2);

        createChartSpy.mockReset();
        createChartSpy.mockRestore();
    });

    it('should call callback on componentDidMount', () => {
        const callback = jest.fn();
        createComponent({ callback });
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should call destroy callback on componentWillUnmount', () => {
        const wrapper = createComponent();
        const component = wrapper.instance();
        component.chart.destroy = jest.fn();

        component.componentWillUnmount();
        expect(component.chart.destroy).toHaveBeenCalledTimes(1);
    });
});
