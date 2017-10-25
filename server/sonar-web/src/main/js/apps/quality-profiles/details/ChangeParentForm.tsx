/*
 * SonarQube
 * Copyright (C) 2009-2017 SonarSource SA
 * mailto:info AT sonarsource DOT com
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
import { sortBy } from 'lodash';
import { changeProfileParent } from '../../../api/quality-profiles';
import Modal from '../../../components/controls/Modal';
import Select from '../../../components/controls/Select';
import { translate } from '../../../helpers/l10n';
import { Profile } from '../types';

interface Props {
  onChange: () => void;
  onClose: () => void;
  onRequestFail: (reasong: any) => void;
  profile: Profile;
  profiles: Profile[];
}

interface State {
  loading: boolean;
  selected: string | null;
}

export default class ChangeParentForm extends React.PureComponent<Props, State> {
  mounted: boolean;
  state: State = {
    loading: false,
    selected: null
  };

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  handleCancelClick = (event: React.SyntheticEvent<HTMLElement>) => {
    event.preventDefault();
    this.props.onClose();
  };

  handleSelectChange = (option: { value: string }) => {
    this.setState({ selected: option.value });
  };

  handleFormSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parent = this.state.selected;

    if (parent != null) {
      this.setState({ loading: true });
      changeProfileParent(this.props.profile.key, parent)
        .then(this.props.onChange)
        .catch((error: any) => {
          if (this.mounted) {
            this.setState({ loading: false });
          }
          this.props.onRequestFail(error);
        });
    }
  };

  render() {
    const { profiles } = this.props;

    const options = [
      { label: translate('none'), value: '' },
      ...sortBy(profiles, 'name').map(profile => ({
        label: profile.isBuiltIn
          ? `${profile.name} (${translate('quality_profiles.built_in')})`
          : profile.name,
        value: profile.key
      }))
    ];

    const submitDisabled =
      this.state.loading ||
      this.state.selected == null ||
      this.state.selected === this.props.profile.parentKey;

    return (
      <Modal
        contentLabel={translate('quality_profiles.change_parent')}
        onRequestClose={this.props.onClose}>
        <form id="change-profile-parent-form" onSubmit={this.handleFormSubmit}>
          <div className="modal-head">
            <h2>{translate('quality_profiles.change_parent')}</h2>
          </div>
          <div className="modal-body">
            <div className="modal-field">
              <label htmlFor="change-profile-parent">
                {translate('quality_profiles.parent')} <em className="mandatory">*</em>
              </label>
              <Select
                clearable={false}
                name="parentKey"
                onChange={this.handleSelectChange}
                options={options}
                value={
                  this.state.selected != null
                    ? this.state.selected
                    : this.props.profile.parentKey || ''
                }
              />
            </div>
          </div>
          <div className="modal-foot">
            {this.state.loading && <i className="spinner spacer-right" />}
            <button disabled={submitDisabled} id="change-profile-parent-submit">
              {translate('change_verb')}
            </button>
            <a href="#" id="change-profile-parent-cancel" onClick={this.handleCancelClick}>
              {translate('cancel')}
            </a>
          </div>
        </form>
      </Modal>
    );
  }
}
