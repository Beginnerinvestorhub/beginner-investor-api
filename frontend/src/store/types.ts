// src/store/types.ts
export interface Modal {
  id: string;
  component: string;
  props: Record<string, any>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closable?: boolean;
}
