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

const modalComponents: Record<string, React.ComponentType<unknown>> = {
  ConfirmModal,
  // Add more modal components here as needed
};

// --- Individual Modal Component Wrapper ---

const ModalItem: React.FC<{
  modal: Modal;
  isTopmost: boolean;
  zIndexOffset: number;
}> = ({ modal, isTopmost, zIndexOffset }) => {
  const { closeModal } = useUI();

  const isClosable = modal.closable !== false;

  // onClose is triggered by backdrop click or escape key
  const handleClose = (_open: boolean) => {
    // Only close if it's the topmost modal and it's allowed to be closed
    if (isTopmost && isClosable) {
      closeModal(modal.id);
    }
  };

  const ModalComponent = modalComponents[modal.component];

  if (!ModalComponent) {
    console.error(`Modal component "${modal.component}" not found`);
    return null;
  }

  return (
    // We use `show={true}` and rely on the ModalSystem parent to conditionally mount/unmount
    // when the modal is added/removed from the store, allowing the Transition to work.
    <Transition appear show={true} as={Fragment}>
      <Dialog
        open={true} // Dialog is open as long as it's mounted
        as="div"
        // Use inline style for dynamic z-index for proper stacking
        className="relative"
        style={{ zIndex: 50 + zIndexOffset }}
        // Only allow closing on the topmost modal via backdrop/ESC
        {...(isTopmost ? { onClose: handleClose } : {})}
      >
        {/* Backdrop: Only the topmost modal has a visible backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className={`fixed inset-0 bg-black transition-opacity ${isTopmost ? 'bg-opacity-25 dark:bg-opacity-50' : 'bg-opacity-0'}`}
          />
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
              <Dialog.Panel
                // Only the topmost modal should accept pointer events
                className={`w-full ${modalSizes[modal.size || 'md']} transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all ${isTopmost ? 'pointer-events-auto' : 'pointer-events-none'}`}
              >
                {/* Close Button: Only show/enable for the topmost, closable modal */}
                {isTopmost && isClosable && (
                  <div className="absolute right-0 top-0 pr-4 pt-4">
                    <button
                      type="button"
                      onClick={() => handleClose(false)}
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
