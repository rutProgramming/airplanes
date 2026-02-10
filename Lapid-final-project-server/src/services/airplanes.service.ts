import { Airplane } from "../routers/airplanes.router";
import airplanes from "../data/airplanes.json";

export const getAirplanesById = (ids: number[]): readonly Airplane[] => {
    return ids.map(id => airplanes[id]);
};