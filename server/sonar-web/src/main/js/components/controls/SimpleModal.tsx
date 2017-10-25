/*
 * SonarQube
 * Copyright (C) 2009-2016 SonarSource SA
 * mailto:contact AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import * as React from 'react';
import Modal from '../../components/controls/Modal';

export interface ChildrenProps {
  onCloseClick: (event: React.SyntheticEvent<HTMLElement>) => void;
  onSubmitClick: (event: React.SyntheticEvent<HTMLElement>) => void;
  submitting: boolean;
}

interface Props {
  children: (props: ChildrenProps) => React.ReactNode;
  header: string;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
}

interface State {
  submitting: boolean;
}

export default class SimpleModal extends React.PureComponent<Props, State> {
  mounted: boolean;
  state: State = { submitting: false };

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  stopSubmitting = () => {
    if (this.mounted) {
      this.setState({ submitting: false });
    }
  };

  handleCloseClick = (event: React.SyntheticEvent<HTMLElement>) => {
    event.preventDefault();
    event.currentTarget.blur();
    this.props.onClose();
  };

  handleSubmitClick = (event: React.SyntheticEvent<HTMLElement>) => {
    event.preventDefault();
    event.currentTarget.blur();
    const result = this.props.onSubmit();
    if (result) {
      this.setState({ submitting: true });
      result.then(this.stopSubmitting, this.stopSubmitting);
    }
  };

  render() {
    return (
      <Modal contentLabel={this.props.header} onRequestClose={this.props.onClose}>
        {this.props.children({
          onCloseClick: this.handleCloseClick,
          onSubmitClick: this.handleSubmitClick,
          submitting: this.state.submitting
        })}
      </Modal>
    );
  }
}
