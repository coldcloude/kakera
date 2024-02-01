import {KEvent,KLoader} from "@coldcloude/kai2";

/**
 * @template A action type
 */
export interface KKAgent<A>{
    updateActions(actions:A[]):void
}

/**
 * @template A action type
 */
export abstract class KKStepAgent<A> implements KKAgent<A>{
    onActionEvent:KEvent<A,undefined> = new KEvent();
    abstract updateActions(actions:A[]):void
    onRequestAction(actions:A[],onResponse:(action:A)=>void){
        this.updateActions(actions);
        this.onActionEvent.once(onResponse);
    }
    selectAction(action:A){
        this.onActionEvent.trigger(action);
    }
}

/**
 * @template V view type
 */
export interface KKObserver<V>{
    onNewViews(views:V[],onReceived:()=>void):void
}

/**
 * @template V view type
 */
export interface KKRenderer<V> extends KKObserver<V>{
    render(view:V):void
}

/**
 * @template V view type
 */
export abstract class KKFrameRenderer<V> implements KKRenderer<V>{
    curr:V;
    buffer:V[] = [];
    _save(views:V[]){
        for(const view of views){
            this.buffer.push(view);
        }
    }
    constructor(views:V[]){
        this._save(views);
        const v = this.buffer.shift();
        if(v){
            this.curr = v;
        }
        else{
            throw new Error("no init view");
        }
    }
    onNewViews(views:V[],onReceived:()=>void):void{
        this._save(views);
        onReceived();
    }
    onDraw():void{
        const v = this.buffer.shift();
        if(v){
            this.curr = v;
        }
        this.render(this.curr);
    }
    abstract render(view:V):void
}

/**
 * @template V view type
 */
export abstract class KKDirectRenderer<V> implements KKRenderer<V>{
    onNewViews(views:V[],onReceived:()=>void):void{
        setImmediate(onReceived);
        const view = views.pop();
        if(view){
            this.render(view);
        }
    }
    abstract render(view:V):void
}

/**
 * @template G agent type
 * @template O observer type
 * @template S scene type
 * @template A action type
 */
export abstract class KKBroker<G extends KKStepAgent<A>,O extends KKObserver<V>,A,V>{
    curr = 0;
    running = true;
    agentMap = new Map<string,G>();
    observerMap = new Map<string,O>();
    abstract generateAgentActionsMap():Map<string,A[]>
    abstract generateObserverViewsMap():Map<string,V[]>
    abstract execute(actionMap:Map<string,A>):void
}

/**
 * @template G agent type
 * @template O observer type
 * @template A action type
 * @template V view type
 */
export abstract class KKStepBroker<G extends KKStepAgent<A>,O extends KKObserver<V>,A,V> extends KKBroker<G,O,A,V>{
    tick(onTicked:()=>void){
        if(this.running){
            // actions buffer
            const actionMap = new Map<string,A>();
            // request actions
            const requestActionLoader = new KLoader();
            const agentActionsMap = this.generateAgentActionsMap();
            for(const [id,actions] of agentActionsMap){
                const agent = this.agentMap.get(id);
                if(agent){
                    requestActionLoader.load((onDone)=>{
                        setImmediate(()=>{
                            agent.onRequestAction(actions,(action)=>{
                                actionMap.set(id,action);
                                onDone();
                            },);
                        });
                    });
                }
            }
            requestActionLoader.onDone(()=>{
                //execute logic
                this.execute(actionMap);
                //update views
                const sendViewsLoader = new KLoader();
                const observerViewsMap = this.generateObserverViewsMap();
                for(const [id,views] of observerViewsMap){
                    sendViewsLoader.load((onDone)=>{
                        const observer = this.observerMap.get(id);
                        if(observer){
                            setImmediate(()=>{
                                observer.onNewViews(views,onDone);
                            });
                        }
                    });
                }
                //end tick
                sendViewsLoader.onDone(onTicked);
                sendViewsLoader.complete();
            });
            requestActionLoader.complete();
        }
    }
}
