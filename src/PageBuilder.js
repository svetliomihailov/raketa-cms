import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import NoSSR from 'react-no-ssr';
import {
  RaketaUIProvider,
  Title,
  Text,
} from 'raketa-ui';

import {
  add,
  removeById,
  updateFieldById,
  reorder,
  randomString,
} from './lists';

import SortableList from 'react-sortablejs';
import AdminSidebar from './lib/AdminSidebar';
import AdminWidget from './lib/AdminWidget';
import ReorderDialog from './dialogs/ReorderDialog';

const EmptyCanvas = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

class PageBuilder extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      page: props.page,
      dirty: false,
      reorderOpen: false,
    };
  }

  getChildContext() {
    const { host, mediaManager } = this.props;

    return {
      host,
      mediaManager,
    };
  }

  factory(widgetName) {
    const { library } = this.props;
    const widget = library[widgetName];

    return {
      widgetId: randomString(6),
      component: widgetName,
      settings: widget.defaults,
    };
  }

  handleAdd(widgetName) {
    const { page } = this.state;
    this.setState({
      page: Object.assign({}, page, { widgets: add(page.widgets, this.factory(widgetName)) })
    }, () => this.notifyChange(page));
  }

  handleUpdate(id, settings) {
    const { page } = this.state;
    this.setState({
      page: Object.assign({}, page, { widgets: updateFieldById(page.widgets, 'settings', settings, id, 'widgetId') })
    }, () => this.notifyChange(page));
  }

  handleRemove(id) {
    const { page } = this.state;
    this.setState({
      page: Object.assign({}, page, { widgets: removeById(page.widgets, id, 'widgetId') })
    }, () => this.notifyChange(page));
  }

  handleReorder(order) {
    const { page } = this.state;
    this.setState({
      page: Object.assign({}, page, { widgets: reorder(page.widgets, order) })
    }, () => this.notifyChange(page));
  }

  notifyChange(page) {
    this.props.onChange(page);
  }

  handleSave() {
    const { page } = this.state;
    this.props.onSave(page);
  }

  render() {
    const { library, navigation, dirty, themes, spacings, onExit } = this.props;
    const { page, reorderOpen } = this.state;
    const { widgets } = page;

    return (
      <NoSSR>
        <RaketaUIProvider>
          <div style={{ paddingLeft: '64px' }}>
            <ReorderDialog
              open={reorderOpen}
              library={library}
              onClose={() => this.setState({ reorderOpen: false })}
              onChange={order => this.handleReorder(order)}
              onDelete={widgetId => this.handleRemove(widgetId)}
              widgets={widgets}
            />

            <AdminSidebar
              library={library}
              navigation={navigation}
              dirty={dirty}
              onSave={() => this.handleSave()}
              onAddWidget={widget => this.handleAdd(widget)}
              onReorderDialog={() => this.setState({ reorderOpen: true })}
              onExit={onExit}
            />

            {widgets.length > 0 ?
              (
                <SortableList
                  tag="div"
                  options={{ handle: '[data-drag]', animation: 150 }}
                  onChange={order => this.handleReorder(order)}
                >
                  {widgets.map((widget, idx) =>
                    <div key={widget.widgetId} data-id={idx}>
                      <AdminWidget
                        library={library}
                        themes={themes}
                        spacings={spacings}
                        widgetId={widget.widgetId}
                        widgetComponent={widget.component}
                        onUpdate={(widgetId, settings) => this.handleUpdate(widgetId, settings)}
                        onDelete={widgetId => this.handleRemove(widgetId)}
                        {...widget.settings}
                      />
                    </div>)}
                </SortableList>
              ) : (
                <EmptyCanvas>
                  <div>
                    <Title primary>It's always good to start with a clean slate. </Title>
                    <Text>Use the sidebar to add content. </Text>
                  </div>
                </EmptyCanvas>
                )
              }
          </div>
        </RaketaUIProvider>
      </NoSSR>
    );
  }
}

PageBuilder.defaultProps = {
  themes: [['none', 'None'], ['light', 'Light'], ['dark', 'Dark']],
  spacings: [['none', 'None'], ['both', 'Both'], ['top', 'Top'], ['bottom', 'Bottom']],
};

PageBuilder.childContextTypes = {
  host: PropTypes.string,
  mediaManager: PropTypes.object,
};

export default PageBuilder;
