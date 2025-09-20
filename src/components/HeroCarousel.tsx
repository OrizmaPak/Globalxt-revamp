import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { heroSlides } from '../data/siteContent';
import ImageWithFallback from './ImageWithFallback';

const autoPlayDelay = 6500;

const HeroCarousel = () => {
  const slides = useMemo(() => heroSlides, []);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, autoPlayDelay);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  const goTo = (next: number) => {
    const total = slides.length;
    const normalized = (next + total) % total;
    setIndex(normalized);
  };

  const currentSlide = slides[index];

  return (
    <section className="relative overflow-hidden bg-brand-deep text-white">
      <div className="absolute inset-0">
        {slides.map((slide, slideIndex) => (
          <div
            key={slide.id}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: slideIndex === index ? 1 : 0 }}
          >
            <ImageWithFallback src={slide.image} alt={slide.title} className="h-full w-full" />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-deep via-brand-deep/60 to-brand-deep/30" />
          </div>
        ))}
      </div>
      <div className="relative">
        <div className="container-gxt flex min-h-[520px] flex-col justify-center py-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full border border-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-brand-yellow">
              Global Reach, African Roots
            </span>
            <h1 className="mt-6 text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
              {currentSlide.title}
            </h1>
            <p className="mt-6 text-base text-white/80 sm:text-lg">{currentSlide.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to={currentSlide.ctaHref}
                className="inline-flex items-center gap-2 rounded-full bg-brand-lime px-6 py-3 text-sm font-semibold text-brand-deep shadow-lg shadow-brand-deep/20 transition hover:bg-brand-chartreuse"
              >
                {currentSlide.ctaLabel}
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white hover:text-brand-deep"
              >
                Explore Portfolio
              </Link>
            </div>
          </div>
        </div>
        <div className="container-gxt absolute inset-x-0 bottom-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {slides.map((slide, slideIndex) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => goTo(slideIndex)}
                className={'h-2 w-10 rounded-full transition ' + (slideIndex === index ? 'bg-brand-yellow' : 'bg-white/30 hover:bg-white/60')}
                aria-label={'Go to slide ' + (slideIndex + 1)}
              />
            ))}
          </div>
          <div className="hidden gap-3 md:flex">
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 text-white transition hover:bg-white hover:text-brand-deep"
              aria-label="Previous slide"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 text-white transition hover:bg-white hover:text-brand-deep"
              aria-label="Next slide"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroCarousel;
