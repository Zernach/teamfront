import { Children, isValidElement, ReactNode } from 'react';

const childToString = (child?: ReactNode): string => {
    if (
        typeof child === 'undefined' ||
        child === null ||
        typeof child === 'boolean'
    ) {
        return '';
    }
    if (JSON.stringify(child) === '{}') {
        return '';
    }
    return (child as number | string).toString();
};

export const onlyText = (children: ReactNode | ReactNode[]): string => {
    if (!(children instanceof Array) && !isValidElement(children)) {
        return childToString(children);
    }
    return Children.toArray(children).reduce(
        (text: string, child: ReactNode): string => {
            let newText = '';
            // if has children, recursively call onlyText
            // @ts-expect-error - this works
            if (isValidElement(child) && Boolean(child?.props?.children)) {
                newText = onlyText(
                    // @ts-expect-error - this works
                    child?.props?.children);
            } else if (isValidElement(child)) {
                newText = '';
            } else {
                newText = childToString(child);
            }

            return text.concat(newText);
        },
        '',
    );
};
