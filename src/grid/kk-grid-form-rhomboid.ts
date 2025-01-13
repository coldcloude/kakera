import { addGridP3D, KKGrid, KKP2D, subGridP3D } from "../kk.js";
import GridForm from "./kk-grid-form.js";

function ceil(v1:number,v2:number){
    v1 = Math.ceil(v1)|0;
    v2 = Math.ceil(v2)|0;
    return v1===v2?v1+1:v1<v2?v2:v1;
}

function floor(v1:number,v2:number){
    v1 = Math.floor(v1)|0;
    v2 = Math.floor(v2)|0;
    return v1===v2?v1-1:v1<v2?v1:v2;
}

export default class GridFormRhomboid extends GridForm {

    constructor(tileWidth:number,tileHeight:number){
        super(tileWidth,tileHeight);
    }

    halfWidth = this.tileWidth>>1;
    halfHeight = this.tileHeight>>1;

    toPixel(grid:KKGrid): KKP2D {
        return {
            x: (grid.x+grid.y)*this.halfWidth+grid.dx,
            y: (grid.x-grid.y)*this.halfHeight+grid.dy
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
        const lt = this.fromPixel({x:x,y:y+height-1});
        const rt = this.fromPixel({x:x+width-1,y:y+height-1});
        const lb = this.fromPixel({x:x,y:y});
        const rb = this.fromPixel({x:x+width-1,y:y});
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
                        y: y2>>1,
                        z: 0,
                        dx: 0,
                        dy: 0
                    });
                }
            }
        }
        return grids;
    }
}
