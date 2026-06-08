'use client';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
}

export default function SectionHeading({ title, subtitle, align = 'center', className = '' }: SectionHeadingProps) {
  return (
    <div className={`${align === 'center' ? 'text-center' : 'text-left'} mb-12 ${className}`}>
      <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-cream tracking-tight">
        {title.split(' ').map((word, i) => {
          // Make the last word gold
          const words = title.split(' ');
          if (i === words.length - 1) {
            return <span key={i} className="text-gradient-gold"> {word}</span>;
          }
          return <span key={i}>{i > 0 ? ' ' : ''}{word}</span>;
        })}
      </h2>
      {subtitle && (
        <p className="mt-4 text-white/50 text-lg max-w-2xl mx-auto font-light leading-relaxed">
          {subtitle}
        </p>
      )}
      <div className={`mt-6 h-px w-20 bg-gradient-to-r from-transparent via-gold-500 to-transparent ${align === 'center' ? 'mx-auto' : ''}`} />
    </div>
  );
}
