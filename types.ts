export enum TreeState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE'
}

export interface ParticleData {
  scatterPosition: [number, number, number];
  treePosition: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}

export interface TreeConfig {
  needleCount: number;
  ornamentCount: number;
  scatterRadius: number;
  treeHeight: number;
  treeRadius: number;
}