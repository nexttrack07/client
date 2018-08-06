import * as React from 'react';
import {
  Tab,
  Tabs,
  Button,
  NonIdealState,
  Spinner,
  Intent
} from '@blueprintjs/core';

import { IRegion, IRealm, IProfile } from '@app/types/global';
import { AuthLevel, FetchUserPreferencesLevel } from '@app/types/main';
import { IPricelist, GetPricelistsLevel, CreatePricelistLevel } from '@app/types/price-lists';
import PriceListPanel from '@app/containers/App/PriceLists/PriceListPanel';
import { LastModified } from '@app/components/util';
import { priceListEntryTabId, didRealmChange } from '@app/util';
import { IGetPricelistsOptions } from '@app/api/price-lists';

export type StateProps = {
  pricelists: IPricelist[]
  selectedList: IPricelist | null
  currentRegion: IRegion | null
  currentRealm: IRealm | null
  isAddListDialogOpen: boolean
  getPricelistsLevel: GetPricelistsLevel
  profile: IProfile | null
  authLevel: AuthLevel
  fetchUserPreferencesLevel: FetchUserPreferencesLevel
  createPricelistLevel: CreatePricelistLevel
};

export type DispatchProps = {
  changeSelectedList: (list: IPricelist) => void
  changeIsAddListDialogOpen: (isDialogOpen: boolean) => void
  refreshPricelists: (opts: IGetPricelistsOptions) => void
};

export type OwnProps = {};

export type Props = Readonly<StateProps & DispatchProps & OwnProps>;

export class Listing extends React.Component<Props> {
  componentDidMount() {
    const {
      refreshPricelists,
      currentRegion,
      currentRealm,
      profile,
      authLevel,
      fetchUserPreferencesLevel,
      pricelists
    } = this.props;

    if (currentRealm === null || currentRegion === null) {
      return;
    }

    const shouldRefreshPricelists = authLevel === AuthLevel.authenticated
      && fetchUserPreferencesLevel === FetchUserPreferencesLevel.success
      && pricelists.length === 0;
    
    if (shouldRefreshPricelists) {
      refreshPricelists({
        token: profile!.token,
        realmSlug: currentRealm.slug,
        regionName: currentRegion.name
      });
    }
  }

  componentDidUpdate(prevProps: Props) {
    const {
      refreshPricelists,
      currentRegion,
      currentRealm,
      profile,
      authLevel,
      fetchUserPreferencesLevel,
      createPricelistLevel
    } = this.props;

    if (currentRealm === null || currentRegion === null) {
      return;
    }
    
    if (authLevel === AuthLevel.authenticated && fetchUserPreferencesLevel === FetchUserPreferencesLevel.success) {
      const shouldRefreshPricelists = didRealmChange(prevProps.currentRealm, currentRealm)
        || (prevProps.createPricelistLevel === CreatePricelistLevel.fetching
          && createPricelistLevel === CreatePricelistLevel.success
        );
      if (shouldRefreshPricelists) {
        refreshPricelists({
          token: profile!.token,
          realmSlug: currentRealm.slug,
          regionName: currentRegion.name
        });
      }
    }
  }

  toggleDialog() {
    this.props.changeIsAddListDialogOpen(!this.props.isAddListDialogOpen);
  }

  renderTab(list: IPricelist, index: number) {
    return (
      <Tab
        key={index}
        id={priceListEntryTabId(list)}
        title={list.name}
        panel={<PriceListPanel list={list} />}
      />
    );
  }

  onTabChange(id: React.ReactText) {
    const list = this.props.pricelists.reduce(
      (result, v) => {
        if (result !== null) {
          return result;
        }

        if (priceListEntryTabId(v) === id.toString()) {
          return v;
        }

        return null;
      },
      null
    );

    if (list === null) {
      return;
    }

    this.props.changeSelectedList(list);
  }

  renderPricelists() {
    const { pricelists, selectedList, currentRealm } = this.props;

    if (pricelists.length === 0) {
      return (
        <NonIdealState
          title="No price lists"
          description={`You have no price lists in ${currentRealm!.name}.`}
          visual="list"
          action={<Button
            className="pt-fill"
            icon="plus"
            onClick={() => this.toggleDialog()}
          >
            Add List to {currentRealm!.name}
          </Button>}
        />
      );
    }

    return (
      <>
        <Tabs
          id="price-lists"
          className="price-lists"
          selectedTabId={selectedList ? `tab-${selectedList.id}` : ''}
          onChange={(id) => this.onTabChange(id)}
          vertical={true}
          renderActiveTabPanelOnly={true}
        >
          {pricelists.map((v, i) => this.renderTab(v, i))}
        </Tabs>
        <LastModified targetDate={new Date(currentRealm!.last_modified * 1000)} />
      </>
    );
  }

  renderContent() {
    const { getPricelistsLevel } = this.props;

    switch (getPricelistsLevel) {
      case GetPricelistsLevel.initial:
      return (
        <NonIdealState
          title="Loading"
          visual={<Spinner className="pt-large" intent={Intent.NONE} value={0} />}
        />
      );
      case GetPricelistsLevel.fetching:
        return (
          <NonIdealState
            title="Loading"
            visual={<Spinner className="pt-large" intent={Intent.PRIMARY} />}
          />
        );
      case GetPricelistsLevel.success:
        return this.renderPricelists();
      default:
        break;
    }

    return;
  }

  render() {
    return (
      <div style={{ marginTop: '20px' }}>
        {this.renderContent()}
      </div>
    );
  }
}
