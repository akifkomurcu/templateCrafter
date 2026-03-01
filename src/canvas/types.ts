export interface HitBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface HitRegions {
  title?: HitBox;
  subtitle?: HitBox;
  device?: HitBox;
}
