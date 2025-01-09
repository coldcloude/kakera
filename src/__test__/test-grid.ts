import GridFormRhomboid from "../grid/kk-grid-form-rhomboid.js";

export function testGrid(){
    const gridForm = new GridFormRhomboid(64,48);
    const grids = gridForm.getRectGrids(13,37,640,360);
    for(const grid of grids){
        console.log(grid.x+" "+grid.y);
    }
}
