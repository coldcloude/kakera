import { KKP2D, KKSize } from "../kk.js";
import { GridForm, orthogonalAreaGrids, orthogonalDistance, orthogonalGridDistance, orthogonalGridLinks, orthogonalLinks } from "./kk-grid-form.js";

const D_NEIGHBOR = 10;
const D_DIAGONAL = 14;
const VC_DIAGONAL = 2;

export default class GridFormOrthogonal extends GridForm {

    constructor(tileWidth:number,tileHeight:number){
        super(tileWidth,tileHeight);
    }

    toPixel(grid:KKP2D):KKP2D{
        return {
            x: grid.x*this.tileWidth,
            y: -grid.y*this.tileHeight
        };
    }

    fromPixel(pixel: KKP2D):[KKP2D,KKP2D]{
        const gridX = Math.round(pixel.x/this.tileWidth)|0;
        const gridY = Math.round(-pixel.y/this.tileHeight)|0;
        return [{
            x: gridX,
            y: gridY
        },{
            x: pixel.x-gridX*this.tileWidth,
            y: pixel.y+gridY*this.tileHeight
        }];
    }

    getRectGrids(o: KKP2D, s: KKSize): KKP2D[] {
        const grid0 = this.fromPixel({x:o.x,y:o.y+s.height})[0];
        const grid1 = this.fromPixel({x:o.x+s.width,y:o.y})[0];
        const grids:KKP2D[] = [];
        for(let gy = grid0.y; gy<=grid1.y; gy++){
            for(let gx = grid0.x; gx<=grid1.x; gx++){
                grids.push({
                    x: gx,
                    y: gy
                });
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
            {x:p.x+this.halfWidth,y:p.y+this.halfHeight},
            {x:p.x-this.halfWidth,y:p.y+this.halfHeight},
            {x:p.x-this.halfWidth,y:p.y-this.halfHeight},
            {x:p.x+this.halfWidth,y:p.y-this.halfHeight}
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
