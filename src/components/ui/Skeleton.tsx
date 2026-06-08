import React from 'react';

interface SkeletonProps {
    className?: string;
    width?: string;
    height?: string;
    rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

/**
 * Base Skeleton component for loading states
 * Displays an animated placeholder while content is loading
 */
export default function Skeleton({
    className = '',
    width,
    height,
    rounded = 'md'
}: SkeletonProps) {
    const roundedClass = {
        'sm': 'rounded-sm',
        'md': 'rounded-md',
        'lg': 'rounded-lg',
        'xl': 'rounded-xl',
        '2xl': 'rounded-2xl',
        'full': 'rounded-full'
    }[rounded];

    const style: React.CSSProperties = {};
    if (width) style.width = width;
    if (height) style.height = height;

    return (
        <div
            className={`bg-gray-200 animate-pulse ${roundedClass} ${className}`}
            style={style}
        />
    );
}

/**
 * Skeleton for text lines
 */
export function SkeletonText({
    lines = 1,
    className = ''
}: {
    lines?: number;
    className?: string;
}) {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    height="16px"
                    width={i === lines - 1 ? '80%' : '100%'}
                />
            ))}
        </div>
    );
}

/**
 * Skeleton for circular avatars or icons
 */
export function SkeletonCircle({
    size = '40px',
    className = ''
}: {
    size?: string;
    className?: string;
}) {
    return (
        <Skeleton
            width={size}
            height={size}
            rounded="full"
            className={className}
        />
    );
}

/**
 * Skeleton for rectangular cards
 */
export function SkeletonCard({
    className = '',
    children
}: {
    className?: string;
    children?: React.ReactNode;
}) {
    return (
        <div className={`bg-white border border-gray-100 rounded-2xl p-6  ${className}`}>
            {children || (
                <div className="space-y-4">
                    <Skeleton height="24px" width="60%" />
                    <SkeletonText lines={3} />
                </div>
            )}
        </div>
    );
}
