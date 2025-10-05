import * as React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

declare module 'react' {
  // Fix for JSX type errors
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    // Add any custom HTML attributes here
    class?: string;
    className?: string;
    style?: React.CSSProperties;
  }

  // Add type for functional components with children
  type FC<P = {}> = FunctionComponent<P>;
  
  interface FunctionComponent<P = {}> {
    (props: React.PropsWithChildren<P>, context?: unknown): React.ReactElement<React.PropsWithChildren<P>, React.ComponentType<React.PropsWithChildren<P>>> | null;
    propTypes?: React.WeakValidationMap<P> | undefined;
    contextTypes?: React.ValidationMap<unknown> | undefined;
    defaultProps?: Partial<P> | undefined;
    displayName?: string | undefined;
  }

  // Add missing types
  type ReactNode = ReactElement | string | number | ReactFragment | ReactPortal | boolean | null | undefined;
  type ReactText = string | number;
  type ReactChild = ReactElement | ReactText;
  type ReactFragment = {} | Iterable<ReactNode>;
  
  interface ReactElement<P = unknown, T extends string | React.JSXElementConstructor<unknown> = string | React.JSXElementConstructor<unknown>> {
    type: T;
    props: P;
    key: React.Key | null;
  }
  
  type Key = string | number;
  
  interface PropsWithChildren {
    children?: ReactNode | undefined;
    [key: string]: React.ReactNode | string | number | boolean | null | undefined;
  }
  
  interface CSSProperties extends CSS.Properties<string | number> {}
}

// Add global JSX namespace
declare namespace JSX {
  interface Element extends React.ReactElement<unknown, React.ComponentType<unknown>> {}
  interface ElementClass {
    props: React.ReactNode | string | number | boolean | null | undefined;
  }
  interface ElementAttributesProperty {
    props: {};
  }
  interface ElementChildrenAttribute {
    children: {};
  }
  interface IntrinsicAttributes extends React.Attributes {}
  interface IntrinsicClassAttributes<T> extends React.ClassAttributes<T> {}
  interface IntrinsicElements {
    [elemName: string]: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  }
}
