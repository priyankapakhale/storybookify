// core/types.ts
export type PropInfo = {
  name: string;
  type: string;
  required: boolean;
};

export type ComponentMeta = {
  name: string;
  filePath: string;
  props: PropInfo[];
};
