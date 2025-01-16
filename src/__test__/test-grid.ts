import GridFormRhomboid from "../grid/kk-grid-form-rhomboid.js";
import { showP2D } from "../kk.js";

export function testGrid(){
    const gridForm = new GridFormRhomboid(64,48);
    const grids = gridForm.getRectGrids(-320,-180,640,360);
    let xSy = grids[0].x-grids[0].y;
    let gs:string[] = [];
    for(const grid of grids){
        const _xSy = grid.x-grid.y;
        if(_xSy!==xSy){
            console.log(gs.join(" "));
            xSy = _xSy;
            gs = [];
        }
        gs.push(showP2D(grid));
    }
    console.log(gs.join(" "));
}
