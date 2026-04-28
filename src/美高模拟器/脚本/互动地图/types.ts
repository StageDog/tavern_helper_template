// ============================================================================
// 互动地图 —— 类型定义
// ============================================================================

export const PinFloorSchema = z.object({
  name: z.string(),
  desc: z.string().default(''),
});

export const PinSchema = z.object({
  id: z.string(),
  name: z.string(),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  desc: z.string().default(''),
  color: z.string().default('#e74c3c'),
  type: z.enum(['portal', 'location', 'building']),
  targetMapId: z.string().optional(),
  floors: z.array(PinFloorSchema).optional(),
});

export const MapLayerSchema = z.object({
  name: z.string(),
  image: z.string(),
  parentMapId: z.string().optional(),
  pins: z.array(PinSchema).default([]),
});

export const MapPackSchema = z.object({
  name: z.string(),
  version: z.string().default('1.0.0'),
  author: z.string().default(''),
  baseUrl: z.string(),
  defaultMapId: z.string(),
  maps: z.record(z.string(), MapLayerSchema),
});

export type PinFloor = z.infer<typeof PinFloorSchema>;
export type Pin = z.infer<typeof PinSchema>;
export type MapLayer = z.infer<typeof MapLayerSchema>;
export type MapPack = z.infer<typeof MapPackSchema>;

export interface InstalledPack {
  name: string;
  version: string;
  sourceUrl: string;
  data: MapPack;
}

export const CSSPresetSchema = z.object({
  name: z.string(),
  content: z.string().default(''),
});
export type CSSPreset = z.infer<typeof CSSPresetSchema>;

/** 脚本变量持久化结构 */
export const StoreStateSchema = z
  .object({
    installed_packs: z
      .array(
        z.object({
          name: z.string(),
          version: z.string(),
          sourceUrl: z.string().default(''),
          data: MapPackSchema,
        }),
      )
      .default([]),
    active_pack_index: z.number().default(0),
    current_map_id: z.string().default(''),
    map_history: z.array(z.string()).default([]),
    custom_css: z.string().default(''),
    css_presets: z.array(CSSPresetSchema).default([]),
    active_preset_index: z.number().default(-1),
    should_send_directly: z.boolean().default(false),
  })
  .prefault({});

export type StoreState = z.infer<typeof StoreStateSchema>;
