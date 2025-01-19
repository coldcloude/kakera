export type KKSpriteFrameInfo = {
    id: string,
    positionX: number,
    positionY: number,
    width: number,
    height: number
};

export type KKAtlasFrameInfo = {
    positionX: number,
    positionY: number,
    frame: KKSpriteFrameInfo
};

export type KKAtlasInfo = {
    width: number,
    height: number,
    frames: KKAtlasFrameInfo[]
};

export type KKSpriteAnimeInfo = {
    direction: number,
    action: number,
    duration: number,
    frameIds: string[]
};

export type KKSpriteAnimeCollectionInfo = {
    id: string,
    animes: KKSpriteAnimeInfo[],
    frames: KKSpriteFrameInfo[]
};

export type KKMapTileInfo = KKSpriteFrameInfo&{
    mapId: number
    gridWidth: number,
    gridHeight: number,
};

export type KKMapLayerInfo = {
    name: string,
    type: "tile"|"object"|"tag"
    grids: number[],
};

export type KKMapInfo = {
    name: string,
    tileWidth: number,
    tileHeight: number,
    gridWidth: number,
    gridHeight: number,
    layers: KKMapLayerInfo[],
    tiles: KKMapTileInfo[],
    objects: KKMapTileInfo[]
};

export type KKP2D = {
    readonly x: number,
    readonly y: number
};

export type KKSize = {
    readonly width: number,
    readonly height: number,
};

export const KK_ZERO:KKP2D = {
    x: 0,
    y: 0,
};

export const UNIT_SIZE:KKSize = {
    width: 1,
    height: 1
};

export function addP2D(p1:KKP2D,p2:KKP2D){
    return {
        x: p1.x+p2.x,
        y: p1.y+p2.y
    };
}

export function subP2D(p1:KKP2D,p2:KKP2D){
    return addP2D(p1,{
        x: -p2.x,
        y: -p2.y
    });
}

export function compareZIndex(p1:KKP2D,p2:KKP2D){
    return p1.y===p2.y?(p1.x<p2.x?-1:p1.x===p2.x?0:1):(p1.y<p2.y?1:-1);
}

export function hashP2D(p:KKP2D){
    return p.x^p.y;
}

export function showP2D(p:KKP2D){
    return "("+p.x+","+p.y+")";
}

export type KKCallback = ()=>void;

export type KKHandler<T> = (v:T)=>void;

export type KKRetriever<R> = ()=>R;

export type KKTransformer<T,R> = (v:T)=>R;
