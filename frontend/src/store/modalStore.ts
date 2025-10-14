// src/store/modalStore.ts
import { create } from 'zustand';
import { Modal } from './types';

interface ModalState {
  modals: Modal[];
  addModal: (modal: Modal) => void;
  removeModal: (id: string) => void;
  clearModals: () => void;
}

export const useModalStore = create<ModalState>()((set) => ({
  modals: [],

  addModal: (modal: Modal) =>
    set((state) => ({
      modals: [...state.modals, modal],
    })),

  removeModal: (id: string) =>
    set((state) => ({
      modals: state.modals.filter((modal) => modal.id !== id),
    })),

  clearModals: () =>
    set({ modals: [] }),
}));

// Export useModals hook
export const useModals = () => {
  const { modals } = useModalStore();
  return modals;
};

// Export useUI hook
export const useUI = () => {
  const { removeModal } = useModalStore();

  const closeModal = (id: string) => {
    removeModal(id);
  };

  return { closeModal };
};
