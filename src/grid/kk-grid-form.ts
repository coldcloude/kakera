import { KAVLTree, KHashTable, numcmp } from "@coldcloude/kai2";
import { compareZIndex, hashP2D, KKP2D, KKSize } from "../kk.js";

export type GridEdge = KAVLTree<number,{
    readonly min: number,
    readonly max: number
}>;

export abstract class GridForm {

    readonly tileWidth:number;
    readonly tileHeight:number;

    readonly halfWidth:number;
    readonly halfHeight:number;

    constructor(tileWidth:number,tileHeight:number){
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.halfWidth = tileWidth>>1;
        this.halfHeight = tileHeight>>1;
    }

    abstract toPixel(grid:KKP2D):KKP2D;
    
    abstract fromPixel(pixel:KKP2D):[KKP2D,KKP2D];

    abstract getRectGrids(origin:KKP2D,size:KKSize):KKP2D[];

    abstract getLinks(grid:KKP2D,valid:(p:KKP2D)=>boolean):[KKP2D,number][];

    abstract getDistance(src:KKP2D,dst:KKP2D):number;

    abstract getBorderPixels(grid:KKP2D):KKP2D[];

    abstract getAreaGrids(centerGrid:KKP2D,radiusGrid:number):KKP2D[];

    abstract getGridLinks(grid:KKP2D,valid:(p:KKP2D)=>boolean):[KKP2D,number][];

    abstract getGridDistance(src:KKP2D,dst:KKP2D):number;

    combine(grid:KKP2D,pixel:KKP2D):[KKP2D,KKP2D]{
        const [dg,dp] = this.fromPixel({
            x: pixel.x,
            y: pixel.y
        });
        return [{
            x: grid.x+dg.x,
            y: grid.y+dg.y
        },{
            x: dp.x,
            y: dp.y
        }];
    }

    edge(grid:KKP2D,size:KKSize):GridEdge{
        const map = new KAVLTree<number,{readonly min: number,readonly max: number}>(numcmp);
        for(let dy=0; dy<size.height; dy++){
            for(let dx=0; dx<size.width; dx++){
                const g = {x:grid.x+dx,y:grid.y+dy};
                const ps = this.getBorderPixels(g);
                for(const p of ps){
                    map.compute(p.x,(kv)=>{
                        if(kv===undefined){
                            return {
                                key: p.x,
                                value: {
                                    min: p.y,
                                    max: p.y
                                }
                            };
                        }
                        else{
                            kv.value = {
                                min: Math.min(kv.value.min,p.y),
                                max: Math.max(kv.value.max,p.y)
                            };
                            return kv;
                        }
                    });
                }
            }
        }
        return map;
    }

    compareEdge(edge1:GridEdge,edge2:GridEdge):{
        result: number,
        trust: boolean
    }{
        const left1 = edge1.getFirst()!;
        const right1 = edge1.getLast()!;
        const left2 = edge2.getFirst()!;
        const right2 = edge2.getLast()!;
        let e1 = left1;
        let e2 = left2;
        if(left1.key<=left2.key){
            //1l -- 2l
            if(right1.key>left2.key){
                //1l -- 2l -- 1r
                e1 = edge1.getOrBefore(left2.key)!;
                e2 = left2;
            }
            else{
                //1l -- 1r 2l -- 2r
                return {
                    result: 0,
                    trust: false
                };
            }
        }
        else{
            //2l -- 1l
            if(left1.key<right2.key){
                //2l -- 1l -- 2r
                e1 = left1;
                e2 = edge2.getOrBefore(left1.key)!;
            }
            else{
                //2l -- 2r 1l -- 1r
                return {
                    result: 0,
                    trust: false
                };
            }
        }
        return {
            result: e1.value.min>=e2.value.max?-1:e1.value.max<=e2.value.min?1:0,
            trust: true
        };
    }

    compareZIndexWithSize(grid1:KKP2D,size1:KKSize,grid2:KKP2D,size2:KKSize):number{
        const edge1 = this.edge(grid1,size1);
        const edge2 = this.edge(grid2,size2);
        return this.compareEdge(edge1,edge2).result;
    }

    compareZIndex(grid1:KKP2D,grid2:KKP2D):number{
        const pos1 = this.toPixel(grid1);
        const pos2 = this.toPixel(grid2);
        return compareZIndex(pos1,pos2);
    }
}

export function orthogonalLinks(grid:KKP2D,valid:(p:KKP2D)=>boolean,dNear:number,dOppo:number,dSame:number,vcOppo:number,vcSame:number):[KKP2D,number][]{
    const links:[KKP2D,number][] = [];
    const validCount = new KHashTable<KKP2D,number>(compareZIndex,hashP2D);
    for(const [dx,dy] of [[1,0],[0,1],[-1,0],[0,-1]]){
        const xx = grid.x+dx;
        const yy = grid.y+dy;
        const g = {x:xx,y:yy};
        if(valid(g)){
            links.push([g,dNear]);
            for(const dd of [-1,1]){
                const xxx = dx===0?xx+dd:xx;
                const yyy = dy===0?yy+dd:yy;
                const gg = {x:xxx,y:yyy};
                validCount.compute(gg,(kv)=>{
                    if(kv===undefined){
                        return {
                            key: gg,
                            value: 1
                        };
                    }
                    else {
                        kv.value++;
                    }
                });
            }
        }
    }
    for(const [dx,dy] of [[1,1],[-1,1],[-1,-1],[1,-1]]){
        const xx = grid.x+dx;
        const yy = grid.y+dy;
        const g = {x:xx,y:yy};
        const d = dx+dy;
        const vc = validCount.get(g)||0;
        if(vc>=(d===0?vcOppo:vcSame)&&valid(g)){
            links.push([g,d===0?dOppo:dSame]);
        }
    }
    return links;
}

export function orthogonalDistance(src:KKP2D,dst:KKP2D,dNear:number,dOppo:number,dSame:number):number{
    const dx = dst.x-src.x;
    const dy = dst.y-src.y;
    const adx = Math.abs(dx)|0;
    const ady = Math.abs(dy)|0;
    const amin = Math.min(adx,ady);
    const amax = Math.max(adx,ady);
    if(dx>=0&&dy>=0||dx<=0&&dy<=0){
        //same direction
        return amin*dSame+(amax-amin)*dNear;
    }
    else{
        //different direction, use d2
        return amin*dOppo+(amax-amin)*dNear;
    }
}

export function orthogonalAreaGrids(centerGrid:KKP2D,radiusGrid:number):KKP2D[]{
    const area:KKP2D[] = [];
    area.push(centerGrid);
    const cx = centerGrid.x;
    const cy = centerGrid.y;
    for(let r=1; r<=radiusGrid; r++){
        //left
        for(let d=0; d<radiusGrid; d++){
            area.push({
                x: cx+r-d,
                y: cy+d
            });
        }
        //down
        for(let d=0; d<radiusGrid; d++){
            area.push({
                x: cx-d,
                y: cy+r-d
            });
        }
        //right
        for(let d=0; d<radiusGrid; d++){
            area.push({
                x: cx-r+d,
                y: cy-d
            });
        }
        //up
        for(let d=0; d<radiusGrid; d++){
            area.push({
                x: cx+d,
                y: cy-r+d
            });
        }
    }
    return area;
}

export function orthogonalGridLinks(grid:KKP2D,valid:(p:KKP2D)=>boolean):[KKP2D,number][]{
    const links:[KKP2D,number][] = [];
    for(const [dx,dy] of [[1,0],[0,1],[-1,0],[0,-1]]){
        const xx = grid.x+dx;
        const yy = grid.y+dy;
        const g = {x:xx,y:yy};
        if(valid(g)){
            links.push([g,1]);
        }
    }
    return links;
}

export function orthogonalGridDistance(src:KKP2D,dst:KKP2D):number{
    const dx = dst.x-src.x;
    const dy = dst.y-src.y;
    const adx = Math.abs(dx)|0;
    const ady = Math.abs(dy)|0;
    return adx+ady;
}
