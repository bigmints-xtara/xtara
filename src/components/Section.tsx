import SectionTitle from "./SectionTitle";
import type { PropsWithChildren } from "react";

interface Props {
    id: string;
    title: string;
    description: string;
}

const Section = ({ id, title, description, children }: PropsWithChildren<Props>) => {
    return (
        <section id={id} className="py-10 lg:py-20">
            <SectionTitle>
                <h2 className="text-center mb-4">{title}</h2>
            </SectionTitle>
            <p className="mb-12 text-center">{description}</p>
            {children}
        </section>
    )
}

export default Section
