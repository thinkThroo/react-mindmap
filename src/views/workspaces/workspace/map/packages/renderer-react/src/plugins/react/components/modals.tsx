import { Classes, Dialog } from '@blueprintjs/core';
import * as React from 'react';
import { BaseWidget } from '../../../components/common';
import { BaseProps } from '../../../components/common/base-props';

interface Props extends BaseProps {
  saveRef?: Function;
}

export class Modals extends BaseWidget<Props> {
  handleClose = () => {
    const { controller } = this.props;
    const handleActiveModalClose = controller.run(
      'handleActiveModalClose',
      this.props
    );

    handleActiveModalClose && handleActiveModalClose();
  };

  render() {
    const { controller } = this.props;
    const activeModal = controller.run('renderModal', this.props);
    const activeModalProps = controller.run('getActiveModalProps', this.props);
    return (
      <Dialog
        onClose={this.handleClose}
        isOpen={activeModal !== null}
        autoFocus
        enforceFocus
        usePortal
        title={activeModalProps && activeModalProps.title}
        style={activeModalProps && activeModalProps.style}
      >
        <div className={Classes.DIALOG_BODY} style={{ minHeight: 0 }}>
          {activeModal}
        </div>
      </Dialog>
    );
  }
}
