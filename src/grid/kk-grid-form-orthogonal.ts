import { KKGrid, KKP2D } from "../kk.js";
import GridForm from "./kk-grid-form.js";

export default class GridFormOrthogonal extends GridForm {

    constructor(tileWidth:number,tileHeight:number){
        super(tileWidth,tileHeight);
    }

    toPixel(grid:KKGrid): KKP2D {
        return {
            x: grid.x*this.tileWidth+grid.dx,
            y: grid.y*this.tileHeight+grid.dy
        };
    }

    fromPixel(pixel: KKP2D):KKGrid{
        const gridX = Math.round(pixel.x/this.tileWidth)|0;
        const gridY = Math.round(pixel.y/this.tileHeight)|0;
        return {
            x: gridX,
            y: gridY,
            z: 0,
            dx: pixel.x-gridX*this.tileWidth,
            dy: pixel.y-gridY*this.tileHeight
        };
    }

    getRectGrids(x: number, y: number, width: number, height: number):KKGrid[] {
        const grid0 = this.fromPixel({x:x,y:y});
        const grid1 = this.fromPixel({x:x+width,y:y+height});
        const grids:KKGrid[] = [];
        for(let gy = grid1.y; gy>=grid0.y; gy--){
            for(let gx = grid0.x; gx<=grid1.x; gx++){
                grids.push({
                    x: gx,
                    y: gy,
                    z: 0,
                    dx: 0,
                    dy: 0
                });
            }
        }
        return grids;
    }
}