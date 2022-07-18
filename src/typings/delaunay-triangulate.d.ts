declare module 'delaunay-triangulate' {
  export default function triangulate(
    points: number[][],
    includePointAtInfinity?: boolean
  ): number[][]
}
