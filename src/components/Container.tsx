import type { PropsWithChildren } from 'react'

interface Props {
    className?: string;
}

const Container = ({ children, className }: PropsWithChildren<Props>) => {
    return (
        <div className={`px-2 w-full max-w-7xl mx-auto ${className ? className : ""}`}>{children}</div>
    )
}

export default Container
