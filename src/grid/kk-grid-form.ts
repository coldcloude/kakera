import { KKP2D } from "../kk.js";

export default abstract class GridForm {

    tileWidth:number;
    tileHeight:number;

    constructor(tileWidth:number,tileHeight:number){
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
    }

    abstract toPixel(grid:KKP2D):KKP2D;
    
    abstract fromPixel(pixel:KKP2D):[KKP2D,KKP2D];

    abstract getRectGrids(x:number,y:number,width:number,height:number):KKP2D[];

    abstract getLinks(grid:KKP2D,valid:(x:number,y:number)=>boolean):[KKP2D,number][];

    abstract getDistance(src:KKP2D,dst:KKP2D):number;

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
}

export function orthogonalLinks(grid:KKP2D,valid:(x:number,y:number)=>boolean,d1:number,d2:number,d3:number):[KKP2D,number][]{
    const links:[KKP2D,number][] = [];
    for(const [dx,dy] of [[1,0],[0,1],[-1,0],[0,-1]]){
        const xx = grid.x+dx;
        const yy = grid.y+dy;
        if(valid(xx,yy)){
            links.push([{x:xx,y:yy},d1]);
        }
    }
    for(const [dx,dy] of [[-1,1],[1,-1]]){
        const xx = grid.x+dx;
        const yy = grid.y+dy;
        if(valid(xx,grid.y)&&valid(grid.x,yy)&&valid(xx,yy)){
            links.push([{x:xx,y:yy},d2]);
        }
    }
    for(const [dx,dy] of [[1,1],[-1,-1]]){
        const xx = grid.x+dx;
        const yy = grid.y+dy;
        if(valid(xx,grid.y)&&valid(grid.x,yy)&&valid(xx,yy)){
            links.push([{x:xx,y:yy},d3]);
        }
    }
    return links;
}

export function orthogonalDistance(src:KKP2D,dst:KKP2D,d1:number,d2:number,d3:number):number{
    const dx = dst.x-src.x;
    const dy = dst.y-src.y;
    const adx = Math.abs(dx)|0;
    const ady = Math.abs(dy)|0;
    const amin = Math.min(adx,ady);
    const amax = Math.max(adx,ady);
    if(dx>=0&&dy>=0||dx<=0&&dy<=0){
        //same direction, use d3
        return amin*d3+(amax-amin)*d1;
    }
    else{
        //different direction, use d2
        return amin*d2+(amax-amin)*d1;
    }
}
