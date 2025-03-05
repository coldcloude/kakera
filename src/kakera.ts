import { KAHandler, KEvent, KMap, KStrTable } from "@coldcloude/kai2";

/**
 * @template C command type
 * @template A action type
 */
export interface KKAgent<C>{
    updateCommands(commands:C[]):Promise<void>;
}

export interface KKStepAgent<C,A> extends KKAgent<C>{
    requestAction():Promise<A>;
}

/**
 * @template C command type
 * @template A action type
 */
export interface KKRealtimeAgent<C,A> extends KKAgent<C> {
    onAction(handler:KAHandler<A>):void
}

/**
 * @template C command type
 * @template A action type
 */
export abstract class KKStepPlayer<C,A> implements KKStepAgent<C,A>{
    activeEvent = new KEvent<C[]>();
    actionTrigger:((a:A)=>void)|null = null;
    onUpdateCommands(handler:KAHandler<C[]>){
        this.activeEvent.register(handler);
    }
    async updateCommands(commands:C[]){
        await this.activeEvent.trigger(commands);
    }
    requestAction():Promise<A>{
        return new Promise<A>((cb)=>{
            this.actionTrigger = cb;
        });
    }
    responseAction(action:A){
        if(this.actionTrigger){
            this.actionTrigger(action);
            this.actionTrigger = null;
        }
    }
}

/**
 * @template C command type
 * @template A action type
 */
export abstract class KKPushAgent<C,A> implements KKRealtimeAgent<C,A> {
    actionEvent = new KEvent<A>();
    abstract updateCommands(commands:C[]):Promise<void>;
    onAction(handler:KAHandler<A>){
        this.actionEvent.register(handler);
    }
    async pushAction(a:A){
        await this.actionEvent.trigger(a);
    }
}

/**
 * @template V view type
 */
export interface KKObserver<V>{
    updateViews(views:V[]):Promise<void>
}

/**
 * @template V view type
 */
export abstract class KKFrameRenderer<V> implements KKObserver<V>{
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
    async updateViews(views:V[]){
        this._save(views);
    }
    nextFrame(){
        const v = this.buffer.shift();
        if(v){
            this.curr = v;
        }
        this.draw(this.curr);
    }
    abstract draw(view:V):void;
}

/**
 * @template V view type
 */
export class KKDirectRenderer<V> implements KKObserver<V>{
    drawEvent = new KEvent<V>(1);
    onDraw(draw:KAHandler<V>){
        this.drawEvent.register(draw);
    }
    async updateViews(views:V[]){
        if(views.length>0){
            await this.drawEvent.trigger(views[views.length-1]);
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
export abstract class KKBroker<G extends KKAgent<C>,O extends KKObserver<V>,C,A,V>{
    running = false;
    agentMap:KMap<string,G>;
    observerMap:KMap<string,O>;
    constructor(agentMap:KMap<string,G>,observerMap:KMap<string,O>){
        this.agentMap = agentMap;
        this.observerMap = observerMap;
    }
    async init(){

    }
    abstract generateAgentCommandsMap():KMap<string,C[]>;
    updateCommands(){
        const agents:[string,G,Promise<void>][] = [];
        this.generateAgentCommandsMap().foreach((id:string,commands:C[])=>{
            const agent = this.agentMap.get(id);
            if(agent){
                const p = agent.updateCommands(commands);
                agents.push([id,agent,p]);
            }
        });
        return agents;
    }
    abstract generateObserverViewsMap():KMap<string,V[]>;
    updateViews(){
        const observers:[string,O,Promise<void>][] = [];
        this.generateObserverViewsMap().foreach((id:string,views:V[])=>{
            const observer = this.observerMap.get(id);
            if(observer){
                const p = observer.updateViews(views);
                observers.push([id,observer,p]);
            }
        });
        return observers;
    }
    abstract execute(actionMap:KMap<string,A>):void;
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
    constructor(agentMap:KMap<string,G>,observerMap:KMap<string,O>){
        super(agentMap,observerMap);
    }
    async start(){
        this.running = true;
        while(this.running){
            await this.tick();
        }
    }
    async tick(){
        if(this.running){
            this.round++;
            //update commands
            const agents = this.updateCommands();
            // request actions
            const requests:[string,Promise<A>][] = [];
            for(const [id,agent,p] of agents){
                await p;
                requests.push([id,agent.requestAction()]);
            }
            // actions buffer
            const actionMap = new KStrTable<A>();
            for(const [id,request] of requests){
                actionMap.set(id,await request);
            }
            //execute logic
            this.execute(actionMap);
            //update views
            const observers = this.updateViews();
            for(const [id,observer,p] of observers){
                await p;
            }
        }
    }
}

/**
 * @template G agent type
 * @template O observer type
 * @template C cammand type
 * @template A action type
 * @template V view type
 */
export abstract class KKRealtimeBroker<G extends KKRealtimeAgent<C,A>,O extends KKObserver<V>,C,A,V> extends KKBroker<G,O,C,A,V>{
    frame = 0;
    lastActionMap = new KStrTable<A>();
    constructor(agentMap:KMap<string,G>,observerMap:KMap<string,O>){
        super(agentMap,observerMap);
        agentMap.foreach((id,agent)=>{
            agent.onAction(async (a:A)=>{
                this.lastActionMap.set(id,a);
            });
        });
    }
    start(onTick:(t:()=>void)=>void){
        this.running = true;
        onTick(()=>this.tick());
    }
    tick(){
        if(this.running){
            this.frame++;
            //update commands
            this.updateCommands();
            // pop actions
            const actionMap = this.lastActionMap;
            this.lastActionMap = new KStrTable<A>();
            //execute logic
            this.execute(actionMap);
            //update views
            this.updateViews();
        }
    }
}
