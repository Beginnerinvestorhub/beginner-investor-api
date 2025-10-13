/**
 * Notification System Component
 * Global notification display and management system
 */

import React from 'react';
import { Transition } from '@headlessui/react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useNotifications, useUI } from '../store';
import { Notification } from '../store/types';

const NotificationIcon: React.FC<{ type: Notification['type'] }> = ({
  type,
}) => {
  const iconClass = 'h-5 w-5'; // Reduced from h-6 w-6

  switch (type) {
    case 'success':
      return <CheckCircleIcon className={`${iconClass} text-green-400`} />;
    case 'error':
      return <XCircleIcon className={`${iconClass} text-red-400`} />;
    case 'warning':
      return (
        <ExclamationTriangleIcon className={`${iconClass} text-yellow-400`} />
      );
    case 'info':
      return <InformationCircleIcon className={`${iconClass} text-blue-400`} />;
    default:
      return <InformationCircleIcon className={`${iconClass} text-gray-400`} />;
  }
};

const NotificationItem: React.FC<{ notification: Notification }> = ({
  notification,
}) => {
  const { dismissNotification } = useUI();

  const getNotificationStyles = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  const getTitleStyles = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-800 dark:text-green-200';
      case 'error':
        return 'text-red-800 dark:text-red-200';
      case 'warning':
        return 'text-yellow-800 dark:text-yellow-200';
      case 'info':
        return 'text-blue-800 dark:text-blue-200';
      default:
        return 'text-gray-800 dark:text-gray-200';
    }
  };

  const getMessageStyles = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-700 dark:text-green-300';
      case 'error':
        return 'text-red-700 dark:text-red-300';
      case 'warning':
        return 'text-yellow-700 dark:text-yellow-300';
      case 'info':
        return 'text-blue-700 dark:text-blue-300';
      default:
        return 'text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div
      className={`max-w-sm w-full border rounded-lg shadow-md p-3 ${getNotificationStyles(notification.type)}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-0.5">
          <NotificationIcon type={notification.type} />
        </div>
        <div className="ml-2.5 w-0 flex-1">
          <p
            className={`text-sm font-semibold leading-5 ${getTitleStyles(notification.type)}`}
          >
            {notification.title}
          </p>
          <p
            className={`mt-0.5 text-sm leading-5 ${getMessageStyles(notification.type)}`}
          >
            {notification.message}
          </p>
          {notification.actions && notification.actions.length > 0 && (
            <div className="mt-3 flex space-x-2">
              {notification.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    action.action();
                    dismissNotification(notification.id);
                  }}
                  className={`text-sm font-medium underline hover:no-underline ${getTitleStyles(notification.type)}`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={() => dismissNotification(notification.id)}
            className={`inline-flex rounded-md p-1.5 hover:bg-black/5 dark:hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${getTitleStyles(notification.type)}`}
          >
            <span className="sr-only">Dismiss</span>
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const NotificationSystem: React.FC = () => {
  const notifications = useNotifications();

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {notifications.map(notification => (
          <Transition
            key={notification.id}
            show={true}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="pointer-events-auto">
              <NotificationItem notification={notification} />
            </div>
          </Transition>
        ))}
      </div>
    </div>
  );
};

export default NotificationSystem;
