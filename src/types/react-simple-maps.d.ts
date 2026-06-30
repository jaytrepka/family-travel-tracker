declare module 'react-simple-maps' {
  import React from 'react';

  export const ComposableMap: React.FC<{
    projectionConfig?: Record<string, unknown>;
    style?: React.CSSProperties;
    children?: React.ReactNode;
  }>;

  export const ZoomableGroup: React.FC<{
    zoom?: number;
    center?: [number, number];
    onMoveEnd?: (pos: { coordinates: [number, number]; zoom: number }) => void;
    maxZoom?: number;
    children?: React.ReactNode;
  }>;

  export const Geographies: React.FC<{
    geography: string;
    children: (args: { geographies: GeoFeature[] }) => React.ReactNode;
  }>;

  export interface GeoFeature {
    rsmKey: string;
    properties: Record<string, string | number | undefined>;
    geometry: unknown;
  }

  export const Geography: React.FC<{
    geography: GeoFeature;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    style?: {
      default?: React.CSSProperties;
      hover?: React.CSSProperties;
      pressed?: React.CSSProperties;
    };
    onClick?: () => void;
  }>;
}
