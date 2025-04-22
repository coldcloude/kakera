import { approxSort } from "@coldcloude/kai2";
import GridFormRhomboid from "../grid/kk-grid-form-rhomboid.js";
import { KKP2D, KKSize, showP2D } from "../kk.js";

export function testGrid(){
    const gridForm = new GridFormRhomboid(64,48);
    const grids = gridForm.getRectGrids({x:-320,y:-180},{width:640,height:360});
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

export function testGridSort(){
    const gridForm = new GridFormRhomboid(2,2);
    const list:[KKP2D,KKSize][] = [[{x:2,y:2},{width:1,height:1}],[{x:5,y:5},{width:1,height:1}],[{x:6,y:4},{width:1,height:1}],[{x:0,y:3},{width:7,height:1}]];
    console.log("using sort ...");
    for(let i1 = 0; i1<4; i1++){
        for(let i2 = 0; i2<3; i2++){
            for(let i3 = 0; i3<2; i3++){
                const l1:[KKP2D,KKSize][] = [...list];
                const l2:[KKP2D,KKSize][] = [];
                l2.push(l1.splice(i1,1)[0]);
                l2.push(l1.splice(i2,1)[0]);
                l2.push(l1.splice(i3,1)[0]);
                l2.push(l1[0]);
                l2.sort((v1,v2)=>gridForm.compareZIndexWithSize(v1[0],v1[1],v2[0],v2[1]));
                const log = l2.map(v=>showP2D(v[0])).join(" ");
                console.log(log);
            }
        }
    }
    console.log("using approx sort ...");
    for(let i1 = 0; i1<4; i1++){
        for(let i2 = 0; i2<3; i2++){
            for(let i3 = 0; i3<2; i3++){
                const l1:[KKP2D,KKSize][] = [...list];
                const l2:[KKP2D,KKSize][] = [];
                l2.push(l1.splice(i1,1)[0]);
                l2.push(l1.splice(i2,1)[0]);
                l2.push(l1.splice(i3,1)[0]);
                l2.push(l1[0]);
                approxSort(l2,(v1,v2)=>gridForm.compareZIndexWithSize(v1[0],v1[1],v2[0],v2[1]));
                const log = l2.map(v=>showP2D(v[0])).join(" ");
                console.log(log);
            }
        }
    }
}
