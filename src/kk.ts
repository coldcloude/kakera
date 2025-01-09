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

export const KKP_ZERO = {
    x: 0,
    y: 0,
    z: 0,
    dx: 0,
    dy: 0,
};
