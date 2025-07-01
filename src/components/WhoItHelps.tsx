import React from 'react';
import { FiCheck } from 'react-icons/fi';
import { whoItHelps } from '@/data/whoItHelps';
import Container from './Container';
import SectionTitle from './SectionTitle';

const WhoItHelps: React.FC = () => {
  return (
    <section id="who-it-helps" className="py-16 bg-surface">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-5xl lg:leading-tight font-bold text-foreground mb-4">
            Who It Helps
          </h2>
          <p className="text-xl text-foreground-accent max-w-2xl mx-auto">
            Xtara serves everyone in the career guidance ecosystem
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {whoItHelps.map((item, index) => (
            <div
              key={index}
              className="bg-background rounded-2xl p-8 shadow-lg border border-divider hover:shadow-xl transition-shadow duration-300"
            >
              <h3 className="text-2xl font-bold text-foreground mb-4">
                {item.title}
              </h3>
              
              <p className="text-foreground-accent mb-6 leading-relaxed">
                {item.description}
              </p>
              
              <ul className="space-y-3">
                {item.highlights.map((highlight, highlightIndex) => (
                  <li key={highlightIndex} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <FiCheck className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-foreground-accent">
                      {highlight}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default WhoItHelps; 