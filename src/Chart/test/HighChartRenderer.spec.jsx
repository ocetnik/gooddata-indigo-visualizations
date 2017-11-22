import React from 'react';
import { shallow, mount } from 'enzyme';

import HighChartRenderer from '../HighChartRenderer';
import { getHighchartsOptions } from '../highChartsCreators';
import Chart from '../Chart';
import Legend from '../Legend/Legend';
import { TOP, BOTTOM, LEFT, RIGHT } from '../Legend/PositionTypes';
import { BAR_CHART } from '../../VisualizationTypes';

function createComponent(customProps = {}) {
    const chartOptions = {
        type: BAR_CHART,
        ...customProps.chartOptions
    };

    const drillConfig = {
        afm: {},
        onFiredDrillEvent: f => f
    };
    const chartProps = {
        chartOptions,
        hcOptions: getHighchartsOptions(chartOptions, drillConfig),
        legend: {
            enabled: false,
            items: []
        },
        ...customProps
    };
    return <HighChartRenderer {...chartProps} />;
}

describe('HighChartRenderer', () => {
    it('should use custom Chart renderer', () => {
        const chartRenderer = jest.fn().mockReturnValue(<div />);
        mount(createComponent({ chartRenderer }));
        expect(chartRenderer).toHaveBeenCalledTimes(1);
    });

    it('should use custom Legend renderer', () => {
        const legendRenderer = jest.fn().mockReturnValue(<div />);
        mount(createComponent({
            legend: {
                enabled: true,
                items: [
                    {
                        legendIndex: 0,
                        name: 'test',
                        color: 'rgb(0, 0, 0)'
                    }
                ]
            },
            legendRenderer
        }));
        expect(legendRenderer).toHaveBeenCalledTimes(1);
    });

    it('should render chart without legend', () => {
        const wrapper = shallow(createComponent());
        expect(wrapper.find(Chart)).toHaveLength(1);
        expect(wrapper.find(Legend)).toHaveLength(0);
    });

    it('should render legend if enabled', () => {
        const wrapper = shallow(createComponent({
            legend: {
                enabled: true,
                items: [
                    {
                        legendIndex: 0,
                        name: 'test',
                        color: 'rgb(0, 0, 0)'
                    }
                ],
                position: LEFT,
                onItemClick: () => {}
            }
        }));
        expect(wrapper.find(Chart)).toHaveLength(1);
        expect(wrapper.find(Legend)).toHaveLength(1);
    });

    it('should set chart ref', () => {
        const mockRef = {
            getChart: () => ({
                container: {
                    style: {}
                },
                reflow: jest.fn()
            })
        };
        const chartRenderer = (props) => {
            props.ref(mockRef);
            return jest.fn().mockReturnValue(<div />);
        };
        const wrapper = mount(createComponent({
            chartRenderer,
            ref: mockRef
        }));
        const chartRef = wrapper.instance().chartRef;
        expect(chartRef).toBe(mockRef);
    });

    it('should force chart reflow and set container styles when height is set', () => {
        const chartMock = {
            container: {
                style: {}
            },
            reflow: jest.fn()
        };
        const mockRef = {
            getChart: () => (chartMock)
        };
        const mockHeight = 123;

        const chartRenderer = (props) => {
            props.ref(mockRef);
            return jest.fn().mockReturnValue(<div />);
        };

        jest.useFakeTimers();
        mount(createComponent({
            chartRenderer,
            height: mockHeight,
            ref: mockRef
        }));
        jest.runAllTimers();

        expect(chartMock.reflow).toHaveBeenCalledTimes(1);
        expect(chartMock.container.style.height).toBe(mockHeight);
        expect(chartMock.container.style.position).toBe('relative');
    });

    it('should force chart reflow and set container styles when height is not set', () => {
        const chartMock = {
            container: {
                style: {}
            },
            reflow: jest.fn()
        };
        const mockRef = {
            getChart: () => chartMock
        };
        const chartRenderer = (props) => {
            props.ref(mockRef);
            return jest.fn().mockReturnValue(<div />);
        };

        jest.useFakeTimers();
        mount(createComponent({
            chartRenderer,
            ref: mockRef
        }));
        jest.runAllTimers();

        expect(chartMock.reflow).toHaveBeenCalledTimes(1);
        expect(chartMock.container.style.height).toBe('100%');
        expect(chartMock.container.style.position).toBe('absolute');
    });

    it('should not throw if chartRef has not been set', () => {
        const chartRenderer = () => {
            return jest.fn().mockReturnValue(<div />);
        };

        const doMount = () => {
            jest.useFakeTimers();
            mount(createComponent({
                chartRenderer
            }));
            jest.runAllTimers();
        };

        expect(doMount).not.toThrow();
    });

    it('should toggle legend when onLegendItemClick is called', () => {
        const wrapper = shallow(createComponent({
            legend: {
                enabled: true,
                items: [
                    {
                        legendIndex: 0,
                        name: 'test',
                        color: 'rgb(0, 0, 0)'
                    }
                ],
                position: LEFT,
                onItemClick: () => {}
            }
        }));
        wrapper.instance().onLegendItemClick({ legendIndex: 0 });
        expect(wrapper.instance().state.legendItemsEnabled).toEqual([false]);
        wrapper.instance().onLegendItemClick({ legendIndex: 0 });
        expect(wrapper.instance().state.legendItemsEnabled).toEqual([true]);
    });

    describe('render', () => {
        const customComponentProps = ({ position = TOP, responsive = false }) => ({
            legend: {
                enabled: true,
                position,
                responsive,
                items: [
                    {
                        legendIndex: 0,
                        name: 'TEST',
                        color: 'rgb(0, 0, 0)'
                    }
                ]
            }
        });

        it('should set flex-direction-column class for legend position TOP', () => {
            const wrapper = shallow(createComponent(customComponentProps({ position: TOP })));
            expect(wrapper.hasClass('flex-direction-column')).toBe(true);
        });

        it('should set flex-direction-column class for legend position BOTTOM', () => {
            const wrapper = shallow(createComponent(customComponentProps({ position: BOTTOM })));
            expect(wrapper.hasClass('flex-direction-column')).toBe(true);
        });

        it('should set flex-direction-row class for legend position LEFT', () => {
            const wrapper = shallow(createComponent(customComponentProps({ position: LEFT })));
            expect(wrapper.hasClass('flex-direction-row')).toBe(true);
        });

        it('should set flex-direction-row class for legend position RIGHT', () => {
            const wrapper = shallow(createComponent(customComponentProps({ position: RIGHT })));
            expect(wrapper.hasClass('flex-direction-row')).toBe(true);
        });

        it('should set responsive-legend class for responsive legend', () => {
            const wrapper = shallow(createComponent(customComponentProps({ responsive: true })));
            expect(wrapper.hasClass('responsive-legend')).toBe(true);
        });

        it('should set non-responsive-legend class for non responsive legend', () => {
            const wrapper = shallow(createComponent(customComponentProps({ responsive: false })));
            expect(wrapper.hasClass('non-responsive-legend')).toBe(true);
        });
    });

    describe('componentWillReceiveProps', () => {
        const chartRenderer = () => {
            return jest.fn().mockReturnValue(<div />);
        };

        const legendRenderer = () => {
            return jest.fn().mockReturnValue(<div />);
        };

        const rendererProps = {
            chartRenderer,
            legendRenderer,
            legend: {
                enabled: true,
                position: LEFT,
                items: [
                    {
                        legendIndex: 0,
                        name: 'TEST',
                        color: 'rgb(0, 0, 0)'
                    }
                ]
            }
        };

        it('should reset legend if legend props change', () => {
            const wrapper = mount(createComponent(rendererProps));
            const props = wrapper.instance().props;
            const getLegendItems = () => wrapper.instance().state.legendItemsEnabled;

            const legendItemsEnabledState = getLegendItems();

            const updatedProps = {
                ...props,
                legend: {
                    ...props.legend,
                    items: [
                        {
                            legendIndex: 0,
                            name: 'UPDATED TEST',
                            color: 'rgb(0, 0, 0)'
                        }
                    ]
                }
            };

            wrapper.setState({ legendItemsEnabled: [false] });
            wrapper.setProps(updatedProps);

            const updatedLegendItemsEnabledState = getLegendItems();
            expect(legendItemsEnabledState).toEqual([true]);
            expect(updatedLegendItemsEnabledState).toEqual([true]);
        });

        it('should not reset legend if props change but legend items stay the same', () => {
            const wrapper = mount(createComponent(rendererProps));
            const props = wrapper.instance().props;
            const getLegendItems = () => wrapper.instance().state.legendItemsEnabled;

            const legendItemsEnabledState = getLegendItems();

            const updatedProps = {
                ...props,
                legendRenderer,
                legend: {
                    ...props.legend,
                    position: RIGHT
                }
            };

            wrapper.setState({ legendItemsEnabled: [false] });
            wrapper.setProps(updatedProps);

            const updatedLegendItemsEnabledState = getLegendItems();

            expect(legendItemsEnabledState).toEqual([true]);
            expect(updatedLegendItemsEnabledState).toEqual([false]);
        });
    });
});
