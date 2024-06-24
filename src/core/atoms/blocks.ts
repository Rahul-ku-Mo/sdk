import { atom } from "jotai";
import { splitAtom } from "jotai/utils";
import { filter, has } from "lodash-es";

// derived atoms
// @ts-ignore
export const presentBlocksAtom = atom([]);
presentBlocksAtom.debugLabel = "presentBlocksAtom";

export const pageBlocksAtomsAtom = splitAtom(presentBlocksAtom);
pageBlocksAtomsAtom.debugLabel = "pageBlocksAtomsAtom";

export const builderActivePageAtom = atom<string>("");
builderActivePageAtom.debugLabel = "builderActivePageAtom";

export const destinationDropIndexAtom = atom<number>(-1);
destinationDropIndexAtom.debugLabel = "destinationDropIndexAtom";

export const buildingBlocksAtom: any = atom<Array<any>>([]);
buildingBlocksAtom.debugLabel = "buildingBlocksAtom";

export const globalBlocksAtom = atom<Array<any>>((get) => {
  const globalBlocks = get(buildingBlocksAtom) as Array<any>;
  return filter(globalBlocks, (block) => has(block, "blockId"));
});
globalBlocksAtom.debugLabel = "globalBlocksAtom";
