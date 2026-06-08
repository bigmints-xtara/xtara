"use client"
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

import SectionTitle from "./SectionTitle";
import { useTranslations } from "@/i18n/language-provider";

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const { t, messages } = useTranslations();
    const faqs = messages.home.faq.items;
    const contactEmail = messages.home.faq.contactEmail;

    const toggleIndex = (index: number) => {
        setOpenIndex(prev => (prev === index ? null : index));
    };

    return (
        <section id="faq" className="py-10 lg:py-20">
            <div className="flex flex-col lg:flex-row gap-10">
                <div className="">
                    <p className="hidden lg:block text-muted-foreground">{t("home.faq.label")}</p>
                    <SectionTitle>
                        <h2 className="my-3 !leading-snug lg:max-w-sm text-center lg:text-left">{t("home.faq.title")}</h2>
                    </SectionTitle>
                    <p className="lg:mt-10 text-muted-foreground text-center lg:text-left">
                        {t("home.faq.subtitle")}
                    </p>
                    <a href={`mailto:${contactEmail}`} className="mt-3 block text-xl lg:text-4xl text-secondary font-semibold hover:underline text-center lg:text-left">{contactEmail}</a>
                </div>

                <div className="w-full lg:max-w-2xl mx-auto">
                    {faqs.map((faq, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <Card key={index} className="mb-5 py-0">
                                <CardContent className="px-4 py-0">
                                    <button
                                        type="button"
                                        onClick={() => toggleIndex(index)}
                                        className="flex items-center justify-between w-full py-5 text-lg text-left"
                                    >
                                        <span className="text-xl font-semibold">{faq.question}</span>
                                        {isOpen ? (
                                            <Minus className="w-5 h-5 text-secondary" />
                                        ) : (
                                            <Plus className="w-5 h-5 text-secondary" />
                                        )}
                                    </button>
                                    {isOpen && (
                                        <div className="pb-5 text-muted-foreground">
                                            {faq.answer}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
