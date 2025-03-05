import { KMap, KNumTree, KPair } from "@coldcloude/kai2";
import { compareZIndex, KKP2D, KKP2DTable, KKP2DTree } from "./kk.js";

export type KKRoute = {
    path: KKP2D[],
    distance: number
};

export function dijkstra(startNode:KKP2D, getLinks:(src:KKP2D)=>[KKP2D,number][]):KMap<KKP2D,KKRoute>{
    const closeMap = new KKP2DTable<KKRoute>();
    const openMap = new KKP2DTable<KKRoute>();
    openMap.set(startNode,{
        path: [],
        distance: 0
    });
    while(openMap.size>0){
        //find least
        let currNodeRoute:KPair<KKP2D,KKRoute>|undefined = undefined;
        openMap.foreach((node,route)=>{
            if(currNodeRoute===undefined||route.distance<currNodeRoute.value.distance){
                currNodeRoute = {
                    key: node,
                    value: route
                };
            }
        });
        const currNode = currNodeRoute!.key;
        const currRoute = currNodeRoute!.value;
        openMap.get(currNode,true);
        closeMap.set(currNode,currRoute);
        //update links' routes
        const links = getLinks(currNode);
        if(links.length>0){
            for(const [node,weight] of links){
                if(!closeMap.contains(node)){
                    //new node
                    const route = openMap.computeIfAbsent(node,()=>{
                        return {
                            path: [],
                            distance: -1
                        };
                    })!;
                    const newDistance = currRoute.distance+weight;
                    if(route.distance<0||newDistance<route.distance){
                        //find shorter path
                        route.path = [...currRoute.path,node];
                        route.distance = newDistance;
                    }
                }
            }
        }
    }
    return closeMap;
}

export function aStar(startNode:KKP2D, targetNode:KKP2D, getLinks:(src:KKP2D)=>[KKP2D,number][], calcRange:(src:KKP2D,dst:KKP2D)=>number, limit:number):KKRoute{
    const closeMap = new KKP2DTable<KKRoute>();
    const openMap = new KNumTree<KKP2DTree<KKRoute>>();
    const fMap = new KKP2DTable<number>();
    let rstRange = calcRange(startNode,targetNode);
    let rstRoute:KKRoute = {
        path: [],
        distance: 0
    };
    openMap.computeIfAbsent(rstRange,()=>new KKP2DTree<KKRoute>())!.set(startNode,rstRoute);
    fMap.set(startNode,rstRange);
    while(openMap.size>0){
        //remove one of least f from openMap
        const curr$ = openMap.getLeastNode()!;
        const currMap = curr$.value;
        const currNodeRoute = currMap.getFirst(true)!;
        if(currMap.size===0){
            openMap.removeNode(curr$);
        }
        const currNode = currNodeRoute.key;
        const currRoute = currNodeRoute.value;
        //move to close
        fMap.get(currNode,true);
        closeMap.set(currNode,currRoute);
        //save best result for limit
        const currentRange = calcRange(currNode,targetNode);
        if(currentRange<rstRange||currentRange===rstRange&&currRoute.distance<rstRoute.distance){
            rstRange = currentRange;
            rstRoute = currRoute;
        }
        //search next if not reach limit
        if(limit<0||currRoute.path.length<limit){
            const links = getLinks(currNode);
            if(links.length>0){
                for(const [node,weight] of links){
                    if(!closeMap.contains(node)){
                        const route = {
                            path: [...currRoute.path,node],
                            distance: currRoute.distance+weight,
                        };
                        if(compareZIndex(node,targetNode)===0){
                            //found result
                            return route;
                        }
                        //update f and openMap
                        const f = route.distance+calcRange(node,targetNode);
                        fMap.set(node,f);
                        openMap.computeIfAbsent(f,()=>new KKP2DTree<KKRoute>())!.set(node,route);
                    }
                }
            }
        }
    }
    return rstRoute;
}
