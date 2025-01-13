export type KKP2D = {
    x: Readonly<number>,
    y: Readonly<number>
};

export type KKP3D = KKP2D&{
    z: Readonly<number>
};

export type KKGrid = KKP3D&{
    dx: Readonly<number>,
    dy: Readonly<number>
};

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

export const KK_ZERO = {
    x: 0,
    y: 0,
    z: 0,
    dx: 0,
    dy: 0,
};

export function addP2D(p1:KKP2D,p2:KKP2D){
    return {
        x: p1.x+p2.x,
        y: p1.y+p2.y
    };
}

export function addP3D(p1:KKP3D,p2:KKP3D){
    return {
        x: p1.x+p2.x,
        y: p1.y+p2.y,
        z: p1.z+p2.z
    };
}

export function subP2D(p1:KKP2D,p2:KKP2D){
    return addP2D(p1,{
        x: -p2.x,
        y: -p2.y
    });
}

export function subP3D(p1:KKP3D,p2:KKP3D){
    return addP3D(p1,{
        x: -p2.x,
        y: -p2.y,
        z: -p2.z
    });
}

export function addGridP3D(g:KKGrid,p:KKP3D){
    return {
        x: g.x+p.x,
        y: g.y+p.y,
        z: g.z+p.z,
        dx: g.dx,
        dy: g.dy
    };
}

export function subGridP3D(g:KKGrid,p:KKP3D){
    return addGridP3D(g,{
        x: -p.x,
        y: -p.y,
        z: -p.z
    });
}

export function compareZIndex(p1:KKP2D,p2:KKP2D){
    return p1.y===p2.y?(p1.x<p2.x?-1:p1.x===p2.x?0:1):(p1.y<p2.y?-1:1);
}

export type KKHandler = ()=>void;

export type KKP2DHandler = (pos:KKP2D)=>void;

export type KKP2DTransformer = (pos:KKP2D)=>KKP2D;

export type KKNumHandler = (v:number)=>void;

export type KKNumNumHandler = (v1:number,v2:number)=>void;
