import {KEvent,KHashTable,KLoader,KMap, strcmp, strhash} from "@coldcloude/kai2";

/**
 * @template C command type
 * @template A action type
 */
export abstract class KKAgent<C,A>{
    abstract updateCommands(commands:C[]):void;
    abstract selectAction(action:A):void;
    abstract checkAction(action:A):boolean;
    trySelectAction(action:A):boolean{
        if(this.checkAction(action)){
            this.selectAction(action);
            return true;
        }
        else{
            return false;
        }
    }
}

/**
 * @template C command type
 * @template A action type
 */
export abstract class KKStepAgent<C,A> extends KKAgent<C,A>{
    actionEvent = new KEvent<A,void>(1);
    abstract updateCommands(commands:C[]):void;
    abstract checkAction(action:A):boolean;
    onRequestAction(commands:C[],responseHandle:(action:A)=>void){
        this.updateCommands(commands);
        this.actionEvent.once(responseHandle);
    }
    selectAction(action:A){
        this.actionEvent.trigger(action);
    }
}

/**
 * @template C command type
 * @template A action type
 */
export abstract class KKPushAgent<C,A> extends KKAgent<C,A>{
    actionEvent = new KEvent<A,void>(1);
    abstract updateCommands(commands:C[]):void;
    abstract checkAction(action:A):boolean;
    onSelectAction(selectHandle:(action:A)=>void){
        this.actionEvent.register(selectHandle);
    }
    selectAction(action:A){
        this.actionEvent.trigger(action);
    }
}

/**
 * @template A action type
 */
export abstract class KKCompleteInfoPlayer<A> extends KKStepAgent<void,A>{
    activeEvent = new KEvent<void,void>(1);
    updateCommands(){
        this.activeEvent.trigger();
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
    abstract receiveViews(views:V[],receiveHandler:()=>void):void;
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
        setTimeout(onReceived,0);
        if(views.length>0){
            this.drawEvent.trigger(views[views.length-1]);
        }
    }
}

/**
 * @template G agent type
 * @template O observer type
 * @template S scene type
 * @template C cammand type
 * @template A action type
 */
export abstract class KKBroker<G extends KKAgent<C,A>,O extends KKObserver<V>,C,A,V>{
    running = false;
    agentMap:KMap<string,G>;
    observerMap:KMap<string,O>;
    constructor(agentMap:KMap<string,G>,observerMap:KMap<string,O>){
        this.agentMap = agentMap;
        this.observerMap = observerMap;
    }
    init():void{

    }
    abstract generateAgentCommandsMap():KMap<string,C[]>;
    abstract generateObserverViewsMap():KMap<string,V[]>;
    abstract execute(actionMap:KMap<string,A>):boolean;
}

/**
 * @template G agent type
 * @template O observer type
 * @template C cammand type
 * @template A action type
 * @template V view type
 */
export abstract class KKStepBroker<G extends KKStepAgent<C,A>,O extends KKObserver<V>,C,A,V> extends KKBroker<G,O,C,A,V>{
    round = 0;
    start(){
        const endTick = ()=>{
            if(this.running){
                setTimeout(()=>{
                    this.tick(endTick);
                },0);
            }
        };
        this.running = true;
        endTick();
    }
    tick(onTicked:()=>void){
        if(this.running){
            this.round++;
            // actions buffer
            const actionMap = new KHashTable<string,A>(strcmp,strhash);
            // request actions
            const requestActionLoader = new KLoader();
            const agentCommandsMap = this.generateAgentCommandsMap();
            agentCommandsMap.foreach((id:string,commands:C[])=>{
                const agent = this.agentMap.get(id);
                if(agent){
                    requestActionLoader.load((cb)=>{
                        setTimeout(()=>{
                            agent.onRequestAction(commands,(action)=>{
                                actionMap.set(id,action);
                                cb();
                            },);
                        },0);
                    });
                }
            });
            requestActionLoader.onDone(()=>{
                //execute logic
                this.execute(actionMap);
                //update views
                const sendViewsLoader = new KLoader();
                const observerViewsMap = this.generateObserverViewsMap();
                observerViewsMap.foreach((id:string,views:V[])=>{
                    sendViewsLoader.load((cb)=>{
                        const observer = this.observerMap.get(id);
                        if(observer){
                            setTimeout(()=>{
                                observer.receiveViews(views,cb);
                            },0);
                        }
                    });
                });
                //end tick
                sendViewsLoader.onDone(onTicked);
                sendViewsLoader.complete();
            });
            requestActionLoader.complete();
        }
    }
}
