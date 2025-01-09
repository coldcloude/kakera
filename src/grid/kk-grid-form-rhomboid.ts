import { KKGrid, KKP2D } from "../kk.js";
import GridForm from "./kk-grid-form.js";

export default class GridFormRhomboid extends GridForm {

    constructor(tileWidth:number,tileHeight:number){
        super(tileWidth,tileHeight);
    }

    halfWidth = this.tileWidth>>1;
    halfHeight = this.tileHeight>>1;

    toPixel(grid:KKGrid): KKP2D {
        return {
            x: (grid.x+grid.y)*this.halfWidth+grid.dx,
            y: (grid.x-grid.y)*this.halfHeight+grid.y
        };
    }

    fromPixel(pixel: KKP2D):KKGrid{
        let halfRectX = Math.round(pixel.x/this.halfWidth)|0;
        let halfRectY = Math.round(pixel.y/this.halfHeight)|0;
        let offsetX = pixel.x-halfRectX*this.halfWidth;
        let offsetY = pixel.y-halfRectY*this.halfHeight;
        let gridX = (halfRectX+halfRectY)>>1;
        let gridY = (halfRectX-halfRectY)>>1;
        if(halfRectX+halfRectY-(gridX<<1)!==0){
            //intersection
            const rx = offsetX/this.halfWidth;
            const ry = offsetY/this.halfHeight;
            if(rx+ry<0){
                if(rx-ry<0){
                    halfRectX--;
                }
                else{
                    halfRectY--;
                }
            }
            else{
                if(rx-ry<0){
                    halfRectY++;
                }
                else{
                    halfRectX++;
                }
            }
            //re calculate
            offsetX = pixel.x-halfRectX*this.halfWidth;
            offsetY = pixel.y-halfRectY*this.halfHeight;
            gridX = (halfRectX+halfRectY)>>1;
            gridY = (halfRectX-halfRectY)>>1;
        }
        return {
            x: gridX,
            y: gridY,
            z: 0,
            dx: offsetX,
            dy: offsetY
        };
    }

    getRectGrids(x: number, y: number, width: number, height: number):KKGrid[] {
        const grids:KKGrid[] = [];
        for(let oy = y+height; oy>y; oy-=this.halfHeight){
            const grid0 = this.fromPixel({x:x,y:oy});
            const grid1 = this.fromPixel({x:x+width-1,y:oy});
            for(let d = 0; grid0.x+d+grid0.y+d<=grid1.x+grid1.y; d++){
                grids.push({
                    x: grid0.x+d,
                    y: grid0.y+d,
                    z: 0,
                    dx: 0,
                    dy: 0
                });
            }
        }
        return grids;
    }
}
