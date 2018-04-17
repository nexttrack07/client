import { connect, Dispatch } from 'react-redux';

import { Topbar, StateProps, DispatchProps, OwnProps } from '../../components/App/Topbar';
import { StoreState } from '../../types';
import { Actions } from '../../actions';

const mapStateToProps = (state: StoreState): StateProps => {
  const user = state.profile === null ? null : state.profile.user;
  return { user };
};

const mapDispatchToProps = (dispatch: Dispatch<Actions>): DispatchProps => {
  return {};
};

export default connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(Topbar);