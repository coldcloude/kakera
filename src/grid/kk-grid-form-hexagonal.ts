import { ceil, floor } from "@coldcloude/kai2";
import { KKP2D, KKSize } from "../kk.js";
import { GridForm, orthogonalDistance, orthogonalLinks } from "./kk-grid-form.js";

const D_NEIGHBOR = 10;
const D_DIAGONAL = 17;
const VC_NEIGHBOR = 0;
const VC_DIAGONAL = 2;

export default class GridFormHexagonal extends GridForm {

    readonly tileSide:number;

    readonly halfSide:number;

    constructor(tileWidth:number,tileHeight:number,tileSide:number){
        super(tileWidth,tileHeight);
        this.tileSide = tileSide;
        this.halfSide = this.tileSide>>1;
    }

    toPixel(grid:KKP2D): KKP2D {
        return {
            x: (grid.x+grid.y)*(this.halfWidth+this.halfSide),
            y: (grid.x-grid.y)*this.halfHeight
        };
    }

    fromPixel(pixel: KKP2D):[KKP2D,KKP2D]{
        let halfRectX = Math.floor(pixel.x/(this.halfWidth+this.halfSide))|0;
        let halfRectY = Math.floor(pixel.y/this.halfHeight)|0;
        const offsetX = pixel.x-halfRectX*(this.halfWidth+this.halfSide);
        const offsetY = pixel.y-halfRectY*this.halfHeight;
        const rx = (offsetX-this.halfSide)/(this.halfWidth-this.halfSide);
        const ry = offsetY/this.halfHeight;
        if(((halfRectX+halfRectY)&0x01)===0){
            //even
            if(offsetX>=this.halfWidth){
                halfRectX++;
                halfRectY++;
            }
            else if(offsetX>=this.halfSide){
                if(rx+ry>=1){
                    halfRectX++;
                    halfRectY++;
                }
            }
        }else{
            //odd
            if(offsetX>=this.halfWidth){
                halfRectX++;
            }
            else if(offsetX>=this.halfSide){
                if(rx-ry<0){
                    halfRectY++;
                }
                else{
                    halfRectX++;
                }
            }
            else{
                halfRectY++;
            }
        }
        //re calculate
        return [{
            x: (halfRectX+halfRectY)>>1,
            y: (halfRectX-halfRectY)>>1
        },{
            x: pixel.x-halfRectX*this.halfWidth,
            y: pixel.y-halfRectY*this.halfHeight
        }];
    }

    getRectGrids(o: KKP2D, s: KKSize): KKP2D[] {
        const grids:KKP2D[] = [];
        const lt = this.fromPixel({x:o.x,y:o.y+s.height-1})[0];
        const rt = this.fromPixel({x:o.x+s.width-1,y:o.y+s.height-1})[0];
        const lb = this.fromPixel({x:o.x,y:o.y})[0];
        const rb = this.fromPixel({x:o.x+s.width-1,y:o.y})[0];
        const maxXsub2Y = ceil(lt.x-(lt.y<<1),rt.x-(rt.y<<1));
        const minX = floor(lt.x,lb.x);
        const minXsub2Y = floor(lb.x-(lb.y<<1),rb.x-(rb.y<<1));
        const maxX = ceil(rt.x,rb.x);
        for(let xS2y = maxXsub2Y; xS2y>=minXsub2Y; xS2y--){
            for(let xx = minX; xx<=maxX; xx++){
                const y2 = xx-xS2y;
                if((y2&0x01)===0){
                    grids.push({
                        x: xx,
                        y: y2>>1
                    });
                }
            }
        }
        return grids;
    }

    getLinks(grid: KKP2D, valid:(p:KKP2D)=>boolean): [KKP2D,number][] {
        return orthogonalLinks(grid,valid,D_NEIGHBOR,D_NEIGHBOR,D_DIAGONAL,VC_NEIGHBOR,VC_DIAGONAL);
    }

    getDistance(src: KKP2D, dst: KKP2D): number {
        return orthogonalDistance(src,dst,D_NEIGHBOR,D_NEIGHBOR,D_DIAGONAL);
    }

    getBorderPixels(grid:KKP2D):KKP2D[]{
        const p = this.toPixel(grid);
        return [
            {x:p.x+this.halfWidth,y:p.y},
            {x:p.x+this.halfSide,y:p.y+this.halfHeight},
            {x:p.x-this.halfSide,y:p.y+this.halfHeight},
            {x:p.x-this.halfWidth,y:p.y},
            {x:p.x-this.halfSide,y:p.y-this.halfHeight},
            {x:p.x+this.halfSide,y:p.y-this.halfHeight}
        ];
    }

    getAreaGrids(centerGrid:KKP2D,radiusGrid:number):KKP2D[]{
        const area:KKP2D[] = [];
        area.push(centerGrid);
        const cx = centerGrid.x;
        const cy = centerGrid.y;
        for(let r=1; r<=radiusGrid; r++){
            //left up
            for(let d=0; d<radiusGrid; d++){
                area.push({
                    x: cx+r-d,
                    y: cy+d
                });
            }
            //left down
            for(let d=0; d<radiusGrid; d++){
                area.push({
                    x: cx-d,
                    y: cy+r
                });
            }
            //down
            for(let d=0; d<radiusGrid; d++){
                area.push({
                    x: cx-r,
                    y: cy+r-d
                });
            }
            //right down
            for(let d=0; d<radiusGrid; d++){
                area.push({
                    x: cx-r+d,
                    y: cy-d
                });
            }
            //right up
            for(let d=0; d<radiusGrid; d++){
                area.push({
                    x: cx+d,
                    y: cy-r
                });
            }
            //up
            for(let d=0; d<radiusGrid; d++){
                area.push({
                    x: cx+r,
                    y: cy-r+d
                });
            }
        }
        return area;
    }

    getGridLinks(grid:KKP2D,valid:(p:KKP2D)=>boolean):[KKP2D,number][]{
        const links:[KKP2D,number][] = [];
        for(const [dx,dy] of [[1,0],[0,1],[-1,1],[-1,0],[0,-1],[1,-1]]){
            const xx = grid.x+dx;
            const yy = grid.y+dy;
            const g = {x:xx,y:yy};
            if(valid(g)){
                links.push([g,1]);
            }
        }
        return links;
    }

    getGridDistance(src:KKP2D,dst:KKP2D):number{
        const dx = dst.x-src.x;
        const dy = dst.y-src.y;
        const adx = Math.abs(dx)|0;
        const ady = Math.abs(dy)|0;
        if(dx>=0&&dy>=0||dx<=0&&dy<=0){
            //same direction
            return adx+ady;
        }
        else{
            //different direction, use d2
            return Math.max(adx,ady);
        }
    }
}
