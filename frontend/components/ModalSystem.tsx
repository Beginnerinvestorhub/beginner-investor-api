/**
 * Modal System Component
 * Global modal display and management system using Headless UI (Dialog/Transition).
 * Uses an integrated Zustand store implementation to manage the modal stack.
 */

import React, { Fragment, ComponentType, FC } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { create } from 'zustand'; // Imported Zustand locally

// --- Modal Type Definition (Integrated from ./types) ---
// This type represents a modal instance in the global state array
export interface Modal {
  id: string;
  component: string; // Key name from ModalComponentsRegistry
  props: Record<string, unknown>; // Changed 'any' to 'unknown' for type safety
  closable?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}


// --- Integrated Zustand Store Logic (from modalStore.ts) ---

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

// --- Configuration ---

// Modal size configurations (Tailwind classes)
const modalSizes: Record<string, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

// --- Confirm Modal Component (Specific Implementation) ---

interface ConfirmModalProps {
  // Required props when opening a ConfirmModal
  id: string; // The ID of the modal instance (passed from the ModalItem)
  title: string;
  message: string;
  onConfirm: () => void;
  // Optional props
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger';
}

const ConfirmModal: FC<ConfirmModalProps> = ({
  id,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
}) => {
  // Uses the local useUI hook
  const { closeModal } = useUI(); 

  const handleConfirm = () => {
    onConfirm();
    closeModal(id); // Use the provided ID to close the correct modal instance
  };

  const handleCancel = () => {
    onCancel?.();
    closeModal(id); // Use the provided ID to close the correct modal instance
  };

  const confirmButtonClass =
    confirmVariant === 'danger'
      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
      : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500';

  return (
    <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
      <div className="sm:flex sm:items-start">
        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
          <Dialog.Title
            as="h3"
            className="text-lg leading-6 font-medium text-gray-900 dark:text-white"
          >
            {title}
          </Dialog.Title>
          <div className="mt-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {message}
            </p>
          </div>
        </div>
      </div>
      {/* Button layout with improved responsiveness */}
      <div className="mt-5 sm:mt-4 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 sm:space-x-reverse space-y-3 sm:space-y-0">
        <button
          type="button"
          onClick={handleCancel}
          className="w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-auto sm:text-sm ${confirmButtonClass}`}
        >
          {confirmText}
        </button>
      </div>
    </div>
  );
};

// --- Modal Components Registry ---

// Generic props type for components in the registry. Allows for dynamic prop spreading.
type ModalComponentProps = Record<string, unknown>;

const ModalComponentsRegistry: Record<string, ComponentType<ModalComponentProps>> = {
  // FIX: Cast ConfirmModal to 'unknown' first to satisfy TypeScript's strict type checker 
  // when assigning a component with required props (ConfirmModalProps) to a registry
  // with generic props (ModalComponentProps).
  ConfirmModal: ConfirmModal as unknown as ComponentType<ModalComponentProps>, 
  // Add other components here: 'OtherModal': OtherModal,
};

// --- Individual Modal Component Wrapper ---

/**
 * Individual modal component wrapper.
 * Manages the modal's visibility, backdrop, close button, and stacking.
 */
const ModalItem: FC<{
  modal: Modal;
  isTopmost: boolean;
  zIndexOffset: number;
}> = ({ modal, isTopmost, zIndexOffset: modalZIndexOffset }) => {
  // Uses the local useUI hook
  const { closeModal } = useUI();

  // Dialog requires an onClose handler, which we set to close the modal instance.
  const isModalClosable = modal.closable !== false;

  const handleModalClose = (open: boolean) => {
    // Only allow closing via backdrop/escape if it's the topmost modal and is closable
    if (open === false && isTopmost && isModalClosable) {
      closeModal(modal.id);
    }
  };

  const ModalComponent = ModalComponentsRegistry[modal.component];

  if (!ModalComponent) {
    console.error(`Modal component "${modal.component}" not found in registry.`);
    return null; 
  }

  const modalSizeClass = modalSizes[modal.size || 'md'];

  return (
    <Transition appear show={true} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[1000]" // Base Z-index for modal system
        open={isTopmost} // Only the topmost modal is truly interactive
        onClose={handleModalClose}
        style={{ zIndex: 1000 + modalZIndexOffset }} // Apply stacking offset
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {/* Backdrop (visible only for the topmost modal) */}
          <div
            className={`fixed inset-0 bg-gray-500/75 dark:bg-gray-900/80 transition-opacity backdrop-blur-sm ${
              isTopmost ? '' : 'hidden'
            }`}
            aria-hidden="true"
          />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                className={`relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full ${modalSizeClass}`}
              >
                {/* Close button (always visible, but functionally disabled if not closable) */}
                {isModalClosable && (
                  <button
                    type="button"
                    className={`absolute right-0 top-0 z-20 m-4 rounded-full p-1 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 ${
                      !isTopmost ? 'pointer-events-none opacity-50' : ''
                    }`}
                    onClick={() => isTopmost && closeModal(modal.id)}
                    disabled={!isTopmost}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                )}
                
                {/* Render the specific Modal Component, spreading its props and adding the instance ID */}
                <ModalComponent {...modal.props} id={modal.id} />

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// --- Main Modal System Component ---

export const ModalSystem: FC = () => {
  // Uses the local useModals hook
  const modals = useModals(); 
  
  const topIndex = modals.length - 1; 

  return (
    <>
      {modals.map((modal, index) => (
        <ModalItem
          key={modal.id}
          modal={modal}
          // Simple z-index offset for stacking: base Z + 10 per modal in the stack
          zIndexOffset={index * 10}
          // Flag the last modal as the interactive one
          isTopmost={index === topIndex}
        />
      ))}
    </>
  );
};

export default ModalSystem;
