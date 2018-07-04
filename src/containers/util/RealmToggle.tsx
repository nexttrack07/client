import { connect, Dispatch } from 'react-redux';

import { RealmToggle, StateProps, DispatchProps, OwnProps } from '@app/components/util/RealmToggle';
import { StoreState } from '@app/types';
import { Realm } from '@app/types/global';
import { Actions } from '@app/actions';
import { RealmChange } from '@app/actions/main';

const mapStateToProps = (state: StoreState): StateProps => {
  const { realms, currentRealm, fetchRealmLevel } = state.Main;
  return { realms, currentRealm, fetchRealmLevel };
};

const mapDispatchToProps = (dispatch: Dispatch<Actions>): DispatchProps => {
  return {
    onRealmChange: (realm: Realm) => dispatch(RealmChange(realm))
  };
};

export default connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(RealmToggle);