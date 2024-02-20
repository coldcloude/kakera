import { KEvent, KHashTable, KMap, strcmp, strhash} from "@coldcloude/kai2";

/**
 * @template C command type
 * @template A action type
 */
export interface KKAgent<C>{
    updateCommands(commands:C[]):void;
}

/**
 * @template C command type
 * @template A action type
 */
export interface KKStepAgent<C,A> extends KKAgent<C>{
    requestAction():Promise<A>;
}

/**
 * @template A action type
 */
export abstract class KKCompleteInfoPlayer<A> implements KKStepAgent<void,A>{
    activeEvent = new KEvent<void>();
    actionEvent = new KEvent<A>();
    onActive(handler:()=>void){
        this.activeEvent.register(handler);
    }
    updateCommands(){
        this.activeEvent.trigger();
    }
    requestAction(){
        return new Promise<A>((cb)=>this.actionEvent.register(cb));
    }
    abstract checkAction(action:A):boolean;
    trySelectAction(action:A):boolean{
        if(this.checkAction(action)){
            this.actionEvent.trigger(action);
            return true;
        }
        else{
            return false;
        }
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
    onDraw(draw:(view:V)=>void){
        this.drawEvent.register(draw);
    }
    async updateViews(views:V[]){
        if(views.length>0){
            await (async ()=>this.drawEvent.trigger(views[views.length-1]))();
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
            // request actions
            const agentCommandsMap = this.generateAgentCommandsMap();
            const requests:{id:string,request:Promise<A>}[] = [];
            agentCommandsMap.foreach((id:string,commands:C[])=>{
                const agent = this.agentMap.get(id);
                if(agent){
                    agent.updateCommands(commands);
                    requests.push({id:id,request:agent.requestAction()});                }
            });
            // actions buffer
            const actionMap = new KHashTable<string,A>(strcmp,strhash);
            for(const {id:id,request:request} of requests){
                actionMap.set(id,await request);
            }
            //execute logic
            this.execute(actionMap);
            //update views
            const observerViewsMap = this.generateObserverViewsMap();
            observerViewsMap.foreach((id:string,views:V[])=>{
                const observer = this.observerMap.get(id);
                if(observer){
                    observer.updateViews(views);
                }
            });
        }
    }
}
