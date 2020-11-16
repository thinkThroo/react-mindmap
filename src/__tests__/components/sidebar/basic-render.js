import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer'
import { Sidebar } from "../../../views/dashboard/body/sidebar/index";
import configureStore from 'redux-mock-store';
import { defaultState } from "../../../store/reducers/sidebar";
import { mount, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

const mockStore = configureStore([]);

describe('Sidebar React-Redux Component', () => {

    let store;
    let spComponent, component;

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
    });

    it('should render sidebar with given state from Redux store and match snapshot', () => {
        expect(spComponent.toJSON()).toMatchSnapshot();
    });

    it('should verify that sidebar component contains create button, status and labels elements', () => {
        // console.log("component:", component.debug());
        expect(component.containsAllMatchingElements([
            <button className="sb-btn em c-p">Create Project</button>,
            <div className="sb-lbl">Status</div>,
            <label>
                <button className="sb-btn em">
                    <span className="btn-inr">
                        <span>Todo</span>
                        <img className="dropdown" src="/assets/web/tthroo-dropdown.svg" alt="dropdown-icon" />
                    </span>
                </button>
            </label>,
            <div className="sb-lbl">Labels</div>,
            <label>
                <button className="sb-btn em">
                    <span className="btn-inr">
                        <span>Work</span>
                        <img className="dropdown" src="/assets/web/tthroo-dropdown.svg" alt="dropdown-icon" />
                    </span>
                </button>
            </label>
          ])).toEqual(true);
    });

    it('should verify that DateTime component renders', () => {
        // makes sure the DateTime component is rendered
        expect(component.find('.rdt .rdtStatic .rdtOpen').length).toBe(1);
        expect(component.find('.rdtPicker').length).toBe(1);
        expect(component.find('.rdtDays').length).toBe(1);
    });
});