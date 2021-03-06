import { IAuctionState } from "./auction";
import { IMainState } from "./main";
import { IPostsState } from "./posts";
import { IPriceListsState } from "./price-lists";

export { defaultMainState } from "./main";
export { defaultAuctionState } from "./auction";
export { defaultPostsState } from "./posts";
export { defaultPriceListsState } from "./price-lists";

export interface IStoreState {
    Main: IMainState;
    Auction: IAuctionState;
    PriceLists: IPriceListsState;
    Posts: IPostsState;
}
