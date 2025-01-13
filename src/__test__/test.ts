import { KKP2D, KKP3D } from "../kk.js";

const p2d:KKP2D = {
    x: 1,
    y: 2,
};

const p3d:KKP3D = {
    x: 1,
    y: 2,
    z: 3
};

console.log("type of KKP2D = "+typeof p2d);
console.log("type of KKP3D = "+typeof p3d);
console.log("constructor of KKP2D = "+p2d.constructor);
console.log("constructor of KKP3D = "+p3d.constructor);
console.log("p2d has z property: "+Object.prototype.hasOwnProperty.call(p2d,"z"));
console.log("p3d has z property: "+Object.prototype.hasOwnProperty.call(p3d,"z"));

// import { testGrid } from "./test-grid.js";

// testGrid();
