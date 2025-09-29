// Individual Modal Component
// Renamed isActive to isTopmost for clarity
const ModalItem: React.FC<{ modal: Modal; isTopmost: boolean }> = ({ modal, isTopmost }) => { 
  const { closeModal } = useUI();

  // Use a stable reference to determine if the modal can be closed via backdrop/esc key
  const isClosable = modal.closable !== false; 

  // onClose is only called if the modal is dismissible AND it's the topmost one
  const handleClose = () => {
    if (isTopmost && isClosable) {
      closeModal(modal.id);
    }
  };

  const ModalComponent = modalComponents[modal.component];

  if (!ModalComponent) {
    console.error(`Modal component "${modal.component}" not found`);
    return null;
  }
  
  // NOTE: Headless UI's Dialog requires 'open' or 'show'. We'll use the presence
  // in the `modals` array to signal 'open', and rely on z-index for stacking.
  // The Transition component will manage the animation on mount/unmount.

  return (
    // We use Transition.Child to apply the backdrop to all open modals, 
    // but only the topmost one should be fully visible/interactive.
    // The Dialog element itself will be the wrapper for the entire screen overlay.
    <Transition appear show={true} as={Fragment}> 
      <Dialog 
        // We set 'open' to true for all rendered modals. Their layering is handled by z-index.
        open={true} 
        as="div" 
        // Use a dynamic z-index for stacking. Higher index for later modals in the array.
        className={`relative z-[${50 + modal.zIndexOffset || 0}]`} 
        // Only allow closing on the topmost modal
        onClose={isTopmost ? handleClose : () => {}} 
      >
        {/* Backdrop: Only apply a visible backdrop for the topmost modal */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {/* We make the backdrop darker for the top modal for focus */}
          <div className={`fixed inset-0 bg-black ${isTopmost ? 'bg-opacity-25 dark:bg-opacity-50' : 'bg-opacity-0'}`} />
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
                      onClick={handleClose}
                      className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                )}
                {/* The Modal Component itself */}
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

  // Determine the index of the topmost modal for layering/interaction control
  const topIndex = modals.length - 1;

  return (
    <>
      {modals.map((modal, index) => (
        <ModalItem
          key={modal.id}
          modal={{ ...modal, zIndexOffset: index * 10 }} // Pass an offset for z-index stacking
          isTopmost={index === topIndex} 
        />
      ))}
    </>
  );
};

export default ModalSystem;
