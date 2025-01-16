import { KKGrid, KKP2D } from "../kk.js";

export default abstract class GridForm {

    tileWidth:number;
    tileHeight:number;

    constructor(tileWidth:number,tileHeight:number){
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
    }

    abstract toPixel(grid:KKP2D):KKP2D;
    
    abstract fromPixel(pixel:KKP2D):KKGrid;

    abstract getRectGrids(x:number,y:number,width:number,height:number):KKGrid[];

    abstract getLinks(grid:KKP2D,valid:(x:number,y:number)=>boolean):[KKP2D,number][];

    abstract getDistance(src:KKP2D,dst:KKP2D):number;

    forward(grid:KKP2D,offset:KKP2D):KKGrid{
        const dg = this.fromPixel({
            x: offset.x+getDx(grid),
            y: offset.y+getDy(grid)
        });
        return {
            x: grid.x+dg.x,
            y: grid.y+dg.y,
            dx: dg.dx,
            dy: dg.dy
        };
    }

    backward(grid:KKP2D,offset:KKP2D):KKGrid{
        return this.forward(grid,{
            x: -offset.x,
            y: -offset.y
        });
    }

    add(grid1:KKP2D,grid2:KKP2D):KKGrid{
        let x = grid1.x+grid2.x;
        let y = grid1.y+grid2.y;
        let dx = getDx(grid1)+getDx(grid2);
        let dy = getDy(grid1)+getDy(grid2);
        if(dx!=0||dy!=0){
            const dg = this.fromPixel({x:dx,y:dy});
            x += dg.x;
            y += dg.y;
            dx = dg.dx;
            dy = dg.dy;
        }
        return {
            x: x,
            y: y,
            dx: dx,
            dy: dy
        };
    }

    sub(grid1:KKP2D,grid2:KKP2D):KKGrid{
        return this.add(grid1,{
            x: -grid2.x,
            y: -grid2.y,
            dx: -getDx(grid2),
            dy: -getDy(grid2),
        } as KKGrid);
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

export function getDx(grid:KKP2D){
    return Object.prototype.hasOwnProperty.call(grid,"dx")?(grid as KKGrid).dx:0;
}

export function getDy(grid:KKP2D){
    return Object.prototype.hasOwnProperty.call(grid,"dy")?(grid as KKGrid).dy:0;
}
