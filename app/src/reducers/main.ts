import {
    CHANGE_AUTH_LEVEL,
    CHANGE_IS_LOGIN_DIALOG_OPEN,
    MainActions,
    REALM_CHANGE,
    RECEIVE_BOOT,
    RECEIVE_PING,
    RECEIVE_REALMS,
    RECEIVE_USER_PREFERENCES,
    RECEIVE_USER_RELOAD,
    REGION_CHANGE,
    REQUEST_BOOT,
    REQUEST_PING,
    REQUEST_REALMS,
    REQUEST_USER_PREFERENCES,
    USER_LOGIN,
    USER_REGISTER,
} from "@app/actions/main";
import { IRealm, IRegion } from "@app/api-types/region";
import { IItemClasses, IRealms, IRegions, ISubItemClasses } from "@app/types/global";
import { AuthLevel, defaultMainState, FetchLevel, IMainState } from "@app/types/main";

type State = Readonly<IMainState> | undefined;

export const main = (state: State, action: MainActions): State => {
    if (state === undefined) {
        return defaultMainState;
    }

    switch (action.type) {
        case REQUEST_PING:
            return { ...state, fetchPingLevel: FetchLevel.fetching };
        case RECEIVE_PING:
            if (action.payload === false) {
                return { ...state, fetchPingLevel: FetchLevel.failure };
            }

            return { ...state, fetchPingLevel: FetchLevel.success };
        case USER_REGISTER:
            return { ...state, profile: action.payload, isRegistered: true, authLevel: AuthLevel.authenticated };
        case USER_LOGIN:
            return { ...state, profile: action.payload, isLoggedIn: true, authLevel: AuthLevel.authenticated };
        case RECEIVE_USER_RELOAD:
            if (action.payload.error !== null) {
                return { ...state, authLevel: AuthLevel.unauthenticated };
            }

            return {
                ...state,
                authLevel: AuthLevel.authenticated,
                profile: { user: action.payload.user!, token: state.preloadedToken },
            };
        case CHANGE_AUTH_LEVEL:
            return { ...state, authLevel: action.payload };
        case REQUEST_USER_PREFERENCES:
            return { ...state, fetchUserPreferencesLevel: FetchLevel.fetching };
        case RECEIVE_USER_PREFERENCES:
            if (action.payload.error !== null) {
                return { ...state, fetchUserPreferencesLevel: FetchLevel.failure };
            }

            return {
                ...state,
                fetchUserPreferencesLevel: FetchLevel.success,
                userPreferences: action.payload.preference,
            };
        case REGION_CHANGE:
            return { ...state, currentRegion: action.payload, fetchRealmLevel: FetchLevel.prompted };
        case REQUEST_REALMS:
            return { ...state, fetchRealmLevel: FetchLevel.fetching };
        case RECEIVE_REALMS:
            if (action.payload === null || action.payload.length === 0) {
                return { ...state, fetchRealmLevel: FetchLevel.failure };
            }

            const currentRealm: IRealm = (() => {
                // optionally halting on blank user-preferences
                if (state.userPreferences === null) {
                    return action.payload[0];
                }

                const {
                    current_region: preferredRegionName,
                    current_realm: preferredRealmSlug,
                } = state.userPreferences;
                // defaulting to first realm in list if region is different from preferred region
                if (state.currentRegion!.name !== preferredRegionName) {
                    return action.payload[0];
                }

                // gathering preferred realm
                const foundRealm: IRealm | null = action.payload.reduce((result, v) => {
                    if (result !== null) {
                        return result;
                    }

                    if (v.slug === preferredRealmSlug) {
                        return v;
                    }

                    return null;
                }, null);

                // optionally halting on realm non-match against preferred realm name
                if (foundRealm === null) {
                    return action.payload[0];
                }

                // dumping out preferred realm
                return foundRealm;
            })();

            const realms: IRealms = action.payload.reduce((result, realm) => ({ ...result, [realm.slug]: realm }), {});

            return { ...state, fetchRealmLevel: FetchLevel.success, realms, currentRealm };
        case REALM_CHANGE:
            return { ...state, currentRealm: action.payload };
        case CHANGE_IS_LOGIN_DIALOG_OPEN:
            return { ...state, isLoginDialogOpen: action.payload };
        case REQUEST_BOOT:
            return { ...state, fetchBootLevel: FetchLevel.fetching };
        case RECEIVE_BOOT:
            if (action.payload === null) {
                return { ...state, fetchBootLevel: FetchLevel.failure };
            }

            const bootCurrentRegion: IRegion = (() => {
                if (state.userPreferences === null) {
                    return action.payload.regions[0];
                }

                const { current_region: preferredRegionName } = state.userPreferences;
                const foundRegion: IRegion | null = action.payload.regions.reduce((result: IRegion | null, v) => {
                    if (result !== null) {
                        return result;
                    }

                    if (v.name === preferredRegionName) {
                        return v;
                    }

                    return null;
                }, null);

                if (foundRegion === null) {
                    return action.payload.regions[0];
                }

                return foundRegion;
            })();

            const bootRegions: IRegions = action.payload.regions.reduce(
                (result, region) => ({ ...result, [region.name]: region }),
                {},
            );

            const bootItemClasses: IItemClasses = {};
            for (const itemClass of action.payload.item_classes) {
                const subClasses: ISubItemClasses = {};
                for (const subItemClass of itemClass.subClasses) {
                    subClasses[subItemClass.subclass] = subItemClass;
                }
                bootItemClasses[itemClass.class] = {
                    class: itemClass.class,
                    name: itemClass.name,
                    subClasses: itemClass.subClasses,
                    subClassesMap: subClasses,
                };
            }

            return {
                ...state,
                currentRegion: bootCurrentRegion,
                expansions: action.payload.expansions,
                fetchBootLevel: FetchLevel.success,
                fetchRealmLevel: FetchLevel.prompted,
                itemClasses: bootItemClasses,
                professions: action.payload.professions,
                regions: bootRegions,
            };
        default:
            return state;
    }
};
