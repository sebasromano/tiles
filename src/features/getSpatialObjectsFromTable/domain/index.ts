export type Position = [longitude: number, latitude: number];

export interface Point {
    type: "Point";
    coordinates: Position;
}

export interface LineString {
    type: "LineString";
    coordinates: Position[];
}

export interface Polygon {
    type: "Polygon";
    coordinates: Position[][];
}

export interface MultiPoint {
    type: "MultiPoint";
    coordinates: Position[];
}

export interface MultiLineString {
    type: "MultiLineString";
    coordinates: Position[][];
}

export interface MultiPolygon {
    type: "MultiPolygon";
    coordinates: Position[][][];
}

export interface GeometryCollection {
    type: "GeometryCollection";
    geometries: Geometry[];
}

export type Geometry =
    | Point
    | LineString
    | Polygon
    | MultiPoint
    | MultiLineString
    | MultiPolygon
    | GeometryCollection;

export interface SpatialObject {
    geometry: Geometry;
}
