import { ceil, floor } from "@coldcloude/kai2";
import { KKP2D } from "../kk.js";
import GridForm, { orthogonalDistance, orthogonalLinks } from "./kk-grid-form.js";

const D1 = 10;
const D2 = 10;
const D3 = 17;

export default class GridFormHexagonal extends GridForm {

    tileSide:number;

    halfWidth:number;
    halfHeight:number;
    halfSide:number;

    constructor(tileWidth:number,tileHeight:number,tileSide:number){
        super(tileWidth,tileHeight);
        this.tileSide = tileSide;
        this.halfWidth = this.tileWidth>>1;
        this.halfHeight = this.tileHeight>>1;
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

    getRectGrids(x: number, y: number, width: number, height: number):KKP2D[] {
        const grids:KKP2D[] = [];
        const lt = this.fromPixel({x:x,y:y+height-1})[0];
        const rt = this.fromPixel({x:x+width-1,y:y+height-1})[0];
        const lb = this.fromPixel({x:x,y:y})[0];
        const rb = this.fromPixel({x:x+width-1,y:y})[0];
        const maxXsub2Y = ceil(lt.x-(lt.y<<1),rt.x-(rt.y<<1));
        const minX = floor(lt.x,lb.x);
        const minXsub2Y = floor(lb.x-(lb.y<<1),rb.x-(rb.y<<1));
        const maxX = ceil(rt.x,rb.x);
        for(let xS2y = maxXsub2Y; xS2y>=minXsub2Y; xS2y--){
            for(let xx = minX; xx<=maxX; x++){
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

    getLinks(grid: KKP2D, valid:(x:number,y:number)=>boolean): [KKP2D,number][] {
        return orthogonalLinks(grid,valid,D1,D2,D3);
    }

    getDistance(src: KKP2D, dst: KKP2D): number {
        return orthogonalDistance(src,dst,D1,D2,D3);
    }
}
