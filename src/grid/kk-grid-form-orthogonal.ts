import { KKP2D } from "../kk.js";
import GridForm, { orthogonalDistance, orthogonalLinks } from "./kk-grid-form.js";

const D1 = 10;
const D2 = 14;
const D3 = 14;

export default class GridFormOrthogonal extends GridForm {

    constructor(tileWidth:number,tileHeight:number){
        super(tileWidth,tileHeight);
    }

    toPixel(grid:KKP2D):KKP2D{
        return {
            x: grid.x*this.tileWidth,
            y: grid.y*this.tileHeight
        };
    }

    fromPixel(pixel: KKP2D):[KKP2D,KKP2D]{
        const gridX = Math.round(pixel.x/this.tileWidth)|0;
        const gridY = Math.round(pixel.y/this.tileHeight)|0;
        return [{
            x: gridX,
            y: gridY
        },{
            x: pixel.x-gridX*this.tileWidth,
            y: pixel.y-gridY*this.tileHeight
        }];
    }

    getRectGrids(x: number, y: number, width: number, height: number):KKP2D[]{
        const grid0 = this.fromPixel({x:x,y:y})[0];
        const grid1 = this.fromPixel({x:x+width,y:y+height})[0];
        const grids:KKP2D[] = [];
        for(let gy = grid1.y; gy>=grid0.y; gy--){
            for(let gx = grid0.x; gx<=grid1.x; gx++){
                grids.push({
                    x: gx,
                    y: gy
                });
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
