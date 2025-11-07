


export type XOR<T, U> =
    // Helper TypeScript function for Either/Or is required, but not both
    (T & { [K in keyof U]?: never }) | (U & { [K in keyof T]?: never });


export type SmallMediumLarge = 'sm' | 'md' | 'lg';