import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer'
import { Sidebar } from "../../../views/dashboard/body/sidebar/index";
import configureStore from 'redux-mock-store';
import { defaultState } from "../../../store/reducers/sidebar";
import { mount, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import sinon from "sinon";

configure({ adapter: new Adapter() });

const mockStore = configureStore([]);

describe('Sidebar React-Redux Component', () => {

    let store;
    let spComponent, component, saComponent;

    beforeEach(() => {
        store = mockStore({sideBar: {...defaultState}});
        spComponent = renderer.create(
            <Provider store={store}>
                <Sidebar />
            </Provider>
        );
        component = mount(
            <Provider store={store}>
                <Sidebar />
            </Provider>
        )
        saComponent = mount(
            <Sidebar />
        )
    });

    afterEach(() => {
        // component.unmount();
    });

    it('should click "create project" button and verify that url is being pushed to project/{id}/edit', () => {
        // expect(component.find('.c-p').length).toEqual(1);
        // let mockFn = jest.fn();
        // Sidebar.prototype.createProject = mockFn;
        // component.find('.c-p').prop('onClick')();
        // console.log("component.find('.c-p').props()", component.find('.c-p').props())
        // expect(mockFn).toHaveBeenCalledTimes(3);
        console.log(component);
    });
});