import { KKGrid, KKP2D } from "../kk.js";

export default abstract class GridForm {

    tileWidth:number;
    tileHeight:number;

    constructor(tileWidth:number,tileHeight:number){
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
    }

    abstract toPixel(grid:KKGrid):KKP2D;
    
    abstract fromPixel(pixel:KKP2D):KKGrid;

    abstract getRectGrids(x:number,y:number,width:number,height:number):KKGrid[];

    forward(grid:KKGrid,offset:KKP2D):KKGrid{
        const dg = this.fromPixel({
            x: grid.dx+offset.x,
            y: grid.dy+offset.y
        });
        return {
            x: grid.x+dg.x,
            y: grid.y+dg.y,
            z: grid.z+dg.z,
            dx: grid.dx+dg.dx,
            dy: grid.dy+dg.dy
        };
    }

    backward(grid:KKGrid,offset:KKP2D):KKGrid{
        return this.forward(grid,{
            x: -offset.x,
            y: -offset.y
        });
    }

    add(grid1:KKGrid,grid2:KKGrid):KKGrid{
        let x = grid1.x+grid2.x;
        let y = grid1.y+grid2.y;
        let z = grid1.z+grid2.z;
        let dx = grid1.dx+grid2.dx;
        let dy = grid1.dy+grid2.dy;
        if(dx!=0||dy!=0){
            const dg = this.fromPixel({x:dx,y:dy});
            x += dg.x;
            y += dg.y;
            z += dg.z;
            dx = dg.dx;
            dy = dg.dy;
        }
        return {
            x: x,
            y: y,
            z: z,
            dx: dx,
            dy: dy
        };
    }

    sub(grid1:KKGrid,grid2:KKGrid):KKGrid{
        return this.add(grid1,{
            x: -grid2.x,
            y: -grid2.y,
            z: -grid2.z,
            dx: -grid2.dx,
            dy: -grid2.dy
        });
    }

    compareZIndex(grid1:KKGrid,grid2:KKGrid):number{
        const pixel1 = this.toPixel(grid1);
        const pixel2 = this.toPixel(grid2);
        return pixel1.y===pixel2.y?
            (pixel1.x<pixel2.x?-1:pixel1.x===pixel2.x?0:1):
            (pixel1.y<pixel2.y?-1:1);
    }
}
