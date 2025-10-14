/**
 * Modal System Component
 * Global modal display and management system
 */

import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
// NOTE: Assuming your store exports these correctly
import { useModals, useUI } from '../src/store/modalStore';
import { Modal } from '../src/store/types';

// --- Configuration ---

// Modal size configurations
const modalSizes: Record<string, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

// --- Confirm Modal Component ---

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
}) => {
  const { closeModal } = useUI();

  // NOTE: Assuming 'title' or another unique property is used to close the current modal.
  // In a real implementation, you'd pass the specific modal ID to this component.
  const modalIdToClose = title;

  const handleConfirm = () => {
    onConfirm();
    closeModal(modalIdToClose);
  };

  const handleCancel = () => {
    onCancel?.();
    closeModal(modalIdToClose);
  };

  const confirmButtonClass =
    confirmVariant === 'danger'
      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
      : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500';

  return (
    // Removed dark:bg-gray-800 from here, Dialog.Panel in ModalItem handles it
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
      {/* Cleaned up button layout for better mobile and desktop spacing */}
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse sm:space-x-3 sm:space-x-reverse space-y-3 sm:space-y-0">
        <button
          type="button"
          onClick={handleConfirm}
          className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-auto sm:text-sm ${confirmButtonClass}`}
        >
          {confirmText}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm"
        >
          {cancelText}
        </button>
      </div>
    </div>
  );
};

// --- Modal Components Registry ---

// Modal component props type
type ModalComponentProps = Record<string, any>;

const ModalComponentsRegistry: Record<string, React.ComponentType<ModalComponentProps>> = {
  ConfirmModal,
};

/**
 * @typedef {Record<string, React.ComponentType<ModalComponentProps>>} ModalComponentsRegistry
 * A registry of available modal components.
 */

// --- Individual Modal Component Wrapper ---

/**
 * Individual modal component wrapper.
 * Manages the modal's visibility, backdrop, close button, and stacking.
 * @param {Modal} modal - The modal to be rendered
 * @param {boolean} isTopmost - Whether the modal is currently the topmost in the stack
 * @param {number} zIndexOffset - The z-index offset for stacking modals
 */
const ModalItem: React.FC<{
  modal: Modal;
  isTopmost: boolean;
  zIndexOffset: number;
}> = ({ modal, isTopmost, zIndexOffset: modalZIndexOffset }) => {
  const { closeModal: closeModalModal } = useUI();

  const isModalClosable = modal.closable !== false;

  const handleModalClose = (_value: boolean) => {
    if (isTopmost && isModalClosable) {
      closeModalModal(modal.id);
    }
  };

  const ModalComponent = modalComponents[modal.component];

  if (!ModalComponent) {
    throw new Error(`Modal component "${modal.component}" not found`);
  }

  return (
    <Transition appear show={true}>
      <Dialog
        open={true}

// --- Main Modal System Component ---

export const ModalSystem: React.FC = () => {
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
