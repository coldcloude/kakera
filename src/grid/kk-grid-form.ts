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
            dx: dg.dx,
            dy: dg.dy
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
        let dx = grid1.dx+grid2.dx;
        let dy = grid1.dy+grid2.dy;
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

    sub(grid1:KKGrid,grid2:KKGrid):KKGrid{
        return this.add(grid1,{
            x: -grid2.x,
            y: -grid2.y,
            dx: -grid2.dx,
            dy: -grid2.dy
        });
    }
}
