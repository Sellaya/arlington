import * as React from 'react';

import {cn} from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({className, ...props}, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[100px] w-full rounded-xl border-2 border-input/60 bg-background/90 backdrop-blur-sm px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary/60 focus-visible:shadow-3d-md focus-visible:scale-[1.01] hover:border-primary/40 hover:shadow-3d-sm disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-y transform-gpu touch-3d',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export {Textarea};
