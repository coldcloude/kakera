import { testGrid, testGridSort } from "./test-grid.js";

console.log(">>>>>>>>>>>>>>>>test grid");
testGrid();

console.log(">>>>>>>>>>>>>>>>test grid 2");
testGridSort();

import { testRoute } from "./test-route.js";

console.log(">>>>>>>>>>>>>>>>test route");
testRoute();

function ax(op:(r:number)=>void){
    console.log("ax");
    op(1);
}

async function xx():Promise<number>{
    console.log("xx");
    return 1;
}

function axx():Promise<number>{
    console.log("axx");
    return new Promise<number>((cb)=>ax(cb));
}

console.log("init");

const y = xx();

const ay = axx();

console.log("await");

await y;
await ay;

console.log("end");
