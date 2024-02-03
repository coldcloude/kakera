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
    actionEvent = new KEvent<A,undefined>(1);
    abstract updateActions(actions:A[]):void;
    onRequestAction(actions:A[],onResponse:(action:A)=>void){
        this.updateActions(actions);
        this.actionEvent.once(onResponse);
    }
    selectAction(action:A){
        this.actionEvent.trigger(action);
    }
}

/**
 * @template V view type
 */
export interface KKObserver<V>{
    receiveViews(views:V[],onReceived:()=>void):void
}

/**
 * @template V view type
 */
export abstract class KKRenderer<V> implements KKObserver<V>{
    drawEvent = new KEvent<V,undefined>(1);
    onDraw(h:(view:V)=>void){
        this.drawEvent.register(h);
    }
    abstract receiveViews(views:V[],onReceived:()=>void):void;
}

/**
 * @template V view type
 */
export class KKFrameRenderer<V> extends KKRenderer<V>{
    curr:V;
    buffer:V[] = [];
    _save(views:V[]){
        for(const view of views){
            this.buffer.push(view);
        }
    }
    constructor(views:V[]){
        super();
        this._save(views);
        const v = this.buffer.shift();
        if(v){
            this.curr = v;
        }
        else{
            throw new Error("no init view");
        }
    }
    receiveViews(views:V[],onReceived:()=>void):void{
        this._save(views);
        onReceived();
    }
    draw():void{
        const v = this.buffer.shift();
        if(v){
            this.curr = v;
        }
        this.drawEvent.trigger(this.curr);
    }
}

/**
 * @template V view type
 */
export class KKDirectRenderer<V> extends KKRenderer<V>{
    receiveViews(views:V[],onReceived:()=>void):void{
        setImmediate(onReceived);
        const view = views.pop();
        if(view){
            this.drawEvent.trigger(view);
        }
    }
}

/**
 * @template G agent type
 * @template O observer type
 * @template S scene type
 * @template A action type
 */
export abstract class KKBroker<G extends KKStepAgent<A>,O extends KKObserver<V>,A,V>{
    running = true;
    agentMap = new Map<string,G>();
    observerMap = new Map<string,O>();
    abstract generateAgentActionsMap():Map<string,A[]>;
    abstract generateObserverViewsMap():Map<string,V[]>;
    abstract execute(actionMap:Map<string,A>):void;
}

/**
 * @template G agent type
 * @template O observer type
 * @template A action type
 * @template V view type
 */
export abstract class KKStepBroker<G extends KKStepAgent<A>,O extends KKObserver<V>,A,V> extends KKBroker<G,O,A,V>{
    round = 0;
    tick(onTicked:()=>void){
        if(this.running){
            this.round++;
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
                                observer.receiveViews(views,onDone);
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
