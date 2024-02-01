import {KLoader} from "@coldcloude/kai2";

const loader = new KLoader();

loader.onDone(()=>console.log("done"));

loader.load((cb)=>{
    setTimeout(()=>{
        console.log("triggered");
        cb();
    },3000);
});

loader.complete();
