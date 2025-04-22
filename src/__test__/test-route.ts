import { KKP2D, showP2D } from "../kk.js";
import { aStar, dijkstra } from "../kk-routing.js";
import { orthogonalDistance, orthogonalLinks } from "../grid/kk-grid-form.js";

export function testRoute(){
    const width = 7;
    const height = 5;
    const bx0 = 3;
    const bx1 = 4;
    const by0 = 1;
    const by1 = 4;
    const barrier = (x:number,y:number)=>{
        return x>=bx0&&x<bx1&&y>=by0&&y<by1;
    };
    const valid = (g:KKP2D)=>{
        return g.x>=0&&g.x<width&&g.y>=0&&g.y<height&&!barrier(g.x,g.y);
    };
    console.log("using dijkstra...");
    const rst = dijkstra({x:1,y:2},(p)=>orthogonalLinks(p,valid,10,14,14,2,2));
    rst.foreach((node,route)=>{
        console.log(showP2D(node)+"["+route.distance+"]: "+route.path.map(showP2D).join("->"));
    });
    console.log("using a star...");
    const rst2 = aStar({x:1,y:2},{x:5,y:2},(p)=>orthogonalLinks(p,valid,10,14,14,2,2),(p1,p2)=>orthogonalDistance(p1,p2,10,14,14),-1);
    console.log("["+rst2.distance+"]: "+rst2.path.map(showP2D).join("->"));
}
