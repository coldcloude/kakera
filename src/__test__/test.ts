import {KLoader} from "@coldcloude/kai2";

const loader = new KLoader();

loader.load((cb)=>{
    setTimeout(()=>{
        console.log("triggered");
        cb();
    },3000);
});

loader.onDone(()=>console.log("done"));

loader.complete();
