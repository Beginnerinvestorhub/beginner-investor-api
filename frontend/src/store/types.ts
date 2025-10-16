// src/store/types.ts
export interface Modal {
  id: string;
  component: string;
  props: Record<string, unknown>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closable?: boolean;
}
