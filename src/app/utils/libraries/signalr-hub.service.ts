import { Injectable } from '@angular/core';
import { HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { Store } from '@ngxs/store';
import { environment } from '../../../environments/environment';
import { OpeningMethodAction } from '../../content/pages/modules/employer/jobs/jobs/store/opening.store';

/**
 * Methods are populated from @link /shared/api/v2.0/Dropdowns/GetHubMethodNames.
 */
export interface MethodNames {
    /// <summary>
    /// notifies when an opening created.
    /// </summary>
    openingCreated?: string;

    /// <summary>
    /// notifies when an opening get updated.
    /// </summary>
    openingUpdated?: string;

    /// <summary>
    /// notifies when an opening has removed.
    /// </summary>
    openingDeleted?: string;

    /// <summary>
    /// notifies when an opening get published.
    /// </summary>
    openingPublished?: string;
}

/**
 * Extracts properties of T
 * @generic T A type for getting properties.
 */
type MethodNameType<T> = { [P in keyof T]: P }[keyof T] | { [P in keyof T]: P }[keyof T][];


/**
 * SignalR service to make real-time client-to-server and server-to-client communications possible.
 */
@Injectable({ providedIn: 'root' })
export class SignalRHubService {

    private readonly connection = new HubConnectionBuilder()
        .configureLogging(LogLevel.Information)
        .withUrl(`${environment.baseUrl}/notify`)
        .withAutomaticReconnect()
        .build();

    constructor(private store: Store) { }

    /**
     * Call it once on the root of the app. Calling multiple times can cause error.
     */
    initSignalR() {

        this.start();

        // TODO: we need to optimize and simplify for the notification
        // this.connection.onclose(async () => {
        //     await this.start();
        // });
    }

    /**
     * Initialize hub methods to receive notification response.
     * Methods are populated from:
     * ###  /shared/api/v2.0/Dropdowns/GetHubMethodNames
     * @param props Client method names. e.g. `method1` or `['method1', 'method2']`
     * @usageNotes Must provide a generic type to auto complete property names.
     *
     * ```ts
     * class MyMethodNames{ prop1:string, prop2:string}
     *
     // auto completes property names
     *  listenHub<MyMethodNames>('prop1') //or ['prop1','prop2']
     *
     * ```
     */
    listenHub<T>(props: MethodNameType<T>) {

        const connected = this.connection.state === HubConnectionState.Connected;

        // must pass all checks
        if (!props || props instanceof Array && props.length === 0 || !connected) return;

        // either array of method names or a method name
        if (props instanceof Array) {
            props.map(k => k as string).filter(k => (k || '').trim() !== '').forEach(
                m => this.connection.on(
                    m, (res) => this.store.dispatch(new OpeningMethodAction(res))
                )
            );
        } else {
            if (typeof (props) === 'string' && (props || '').trim() !== '')
                this.connection.on(props, (res) => this.store.dispatch(new OpeningMethodAction(res)));
        }

    }

    private async  start() {
        const isDisconnected = this.connection.state === HubConnectionState.Disconnected;
        try {
            if (isDisconnected) {
                await this.connection.start();
                console.log('connected');
            }
        } catch (err) {

            console.log(err);
            setTimeout(async () => await this.start(), 5000);
        }
    }
}
