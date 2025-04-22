import { ceil, floor } from "@coldcloude/kai2";
import { KKP2D, KKSize } from "../kk.js";
import { GridForm, orthogonalAreaGrids, orthogonalDistance, orthogonalGridDistance, orthogonalGridLinks, orthogonalLinks } from "./kk-grid-form.js";

const D_NEIGHBOR = 10;
const D_DIAGONAL = 14;
const VC_DIAGONAL = 2;

export default class GridFormRhomboid extends GridForm {

    constructor(tileWidth:number,tileHeight:number){
        super(tileWidth,tileHeight);
    }

    toPixel(grid:KKP2D): KKP2D {
        return {
            x: (grid.x+grid.y)*this.halfWidth,
            y: (grid.x-grid.y)*this.halfHeight
        };
    }

    fromPixel(pixel: KKP2D):[KKP2D,KKP2D]{
        let halfRectX = Math.floor(pixel.x/this.halfWidth)|0;
        let halfRectY = Math.floor(pixel.y/this.halfHeight)|0;
        const rx = (pixel.x-halfRectX*this.halfWidth)/this.halfWidth;
        const ry = (pixel.y-halfRectY*this.halfHeight)/this.halfHeight;
        if(((halfRectX+halfRectY)&0x01)===0){
            //even
            if(rx+ry>=1){
                halfRectX++;
                halfRectY++;
            }
        }else{
            //odd
            if(rx-ry<0){
                halfRectY++;
            }
            else{
                halfRectX++;
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
        const maxXsubY = ceil(lt.x-lt.y,rt.x-rt.y);
        const minXaddY = floor(lt.x+lt.y,lb.x+lb.y);
        const minXsubY = floor(lb.x-lb.y,rb.x-rb.y);
        const maxXaddY = ceil(rt.x+rt.y,rb.x+rb.y);
        for(let xSy = maxXsubY; xSy>=minXsubY; xSy--){
            for(let xAy = minXaddY; xAy<=maxXaddY; xAy++){
                const x2 = xAy+xSy;
                const y2 = xAy-xSy;
                if((x2&0x01)===0&&(y2&0x01)===0){
                    grids.push({
                        x: x2>>1,
                        y: y2>>1
                    });
                }
            }
        }
        return grids;
    }

    getLinks(grid: KKP2D, valid:(p:KKP2D)=>boolean): [KKP2D,number][] {
        return orthogonalLinks(grid,valid,D_NEIGHBOR,D_DIAGONAL,D_DIAGONAL,VC_DIAGONAL,VC_DIAGONAL);
    }

    getDistance(src: KKP2D, dst: KKP2D): number {
        return orthogonalDistance(src,dst,D_NEIGHBOR,D_DIAGONAL,D_DIAGONAL);
    }

    getBorderPixels(grid:KKP2D):KKP2D[]{
        const p = this.toPixel(grid);
        return [
            {x:p.x+this.halfWidth,y:p.y},
            {x:p.x,y:p.y+this.halfHeight},
            {x:p.x-this.halfWidth,y:p.y},
            {x:p.x,y:p.y-this.halfHeight}
        ];
    }

    getAreaGrids(centerGrid:KKP2D,radiusGrid:number):KKP2D[]{
        return orthogonalAreaGrids(centerGrid,radiusGrid);
    }

    getGridLinks(grid:KKP2D,valid:(p:KKP2D)=>boolean):[KKP2D,number][]{
        return orthogonalGridLinks(grid,valid);
    }

    getGridDistance(src:KKP2D,dst:KKP2D):number{
        return orthogonalGridDistance(src,dst);
    }
}
