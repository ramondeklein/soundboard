import { Subscription } from 'rxjs';

export class SubscriptionContainer {
    private subscriptions: Subscription[];

    constructor(...subscriptions: Subscription[]) {
        this.subscriptions = subscriptions || [];
    }

    addSubscription(...subscriptions: Subscription[]) {
        this.subscriptions = [ ...this.subscriptions, ...subscriptions];
    }

    unSubscribeAll() {
        this.subscriptions.map((s) => s.unsubscribe());
        this.subscriptions = [];
    }
}
