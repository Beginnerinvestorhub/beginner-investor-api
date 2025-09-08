/**
 * Modal System Component
 * Global modal display and management system
 */

import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useModals, useUI } from '../store';
import { Modal } from '../store/types';

// Modal size configurations
const modalSizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

// Confirm Modal Component
const ConfirmModal: React.FC<{
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger';
}> = ({ 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary'
}) => {
  const { closeModal } = useUI();

  const handleConfirm = () => {
    onConfirm();
    closeModal('');
  };

  const handleCancel = () => {
    onCancel?.();
    closeModal('');
  };

  const confirmButtonClass = confirmVariant === 'danger'
    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
    : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500';

  return (
    <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
      <div className="sm:flex sm:items-start">
        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
          <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            {title}
          </Dialog.Title>
          <div className="mt-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {message}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        <button
          type="button"
          onClick={handleConfirm}
          className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${confirmButtonClass}`}
        >
          {confirmText}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
        >
          {cancelText}
        </button>
      </div>
    </div>
  );
};

// Modal components registry
const modalComponents: Record<string, React.ComponentType<any>> = {
  ConfirmModal,
  // Add more modal components here as needed
};

// Individual Modal Component
const ModalItem: React.FC<{ modal: Modal; isActive: boolean }> = ({ modal, isActive }) => {
  const { closeModal } = useUI();

  const handleClose = () => {
    if (modal.closable !== false) {
      closeModal(modal.id);
    }
  };

  const ModalComponent = modalComponents[modal.component];

  if (!ModalComponent) {
    console.error(`Modal component "${modal.component}" not found`);
    return null;
  }

  return (
    <Transition appear show={isActive} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25 dark:bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={`w-full ${modalSizes[modal.size || 'md']} transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all`}>
                {modal.closable !== false && (
                  <div className="absolute right-0 top-0 pr-4 pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                )}
                <ModalComponent {...modal.props} />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export const ModalSystem: React.FC = () => {
  const modals = useModals();

  return (
    <>
      {modals.map((modal, index) => (
        <ModalItem
          key={modal.id}
          modal={modal}
          isActive={index === modals.length - 1} // Only the top modal is active
        />
      ))}
    </>
  );
};

export default ModalSystem;
