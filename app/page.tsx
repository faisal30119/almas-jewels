'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { Gem, CheckCircle, Star, ShieldCheck, Truck, Quote } from 'lucide-react';

const IMAGES = {
  heroBride:
    'https://res.cloudinary.com/niagn9pn/image/upload/v1786277890/almas_bridal/assets/wfnbs0fyl677rj20wiqr.jpg',
  royal:
    'https://res.cloudinary.com/niagn9pn/image/upload/v1786277886/almas_bridal/assets/dpjqxedlu5oleauyj40l.jpg',
  solitaire:
    'https://res.cloudinary.com/niagn9pn/image/upload/v1786277888/almas_bridal/assets/uoge8dcesrge8bsgimj6.jpg',
  occasion:
    'https://res.cloudinary.com/niagn9pn/image/upload/v1786277883/almas_bridal/assets/brxuufifingum5xyjodn.jpg',
  pendant_main:
    'https://res.cloudinary.com/niagn9pn/image/upload/v1786277893/almas_bridal/assets/panbrhgotshii2pl5zkb.jpg',
  video_thumb:
    'https://res.cloudinary.com/niagn9pn/image/upload/v1786277903/almas_bridal/assets/fztrpcjlj5pg5rntxdvn.jpg',
};

function FadeInSection({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const CATEGORIES = [
  {
    name: 'Bridal Sets',
    image: IMAGES.royal,
    href: '/shop?category=Bridal+Sets',
    desc: 'Complete ensembles for your big day',
  },
  {
    name: 'Necklaces',
    image: IMAGES.solitaire,
    href: '/shop?category=Necklaces',
    desc: 'Statement pieces for every look',
  },
  {
    name: 'Earrings',
    image: IMAGES.occasion,
    href: '/shop?category=Earrings',
    desc: 'From studs to chandelier drops',
  },
  {
    name: 'All Products',
    image: IMAGES.pendant_main,
    href: '/shop',
    desc: 'Browse the full collection',
  },
];

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    location: 'Delhi',
    text: 'The Royal Emerald Heritage Set was everything I dreamed of for my wedding. The craftsmanship is extraordinary and every guest was in awe.',
  },
  {
    name: 'Aisha Khan',
    location: 'Mumbai',
    text: 'Almas Jewels delivered beyond expectations. The Rhodium Diamond Set looked stunning in photos — exactly what a bride needs.',
  },
  {
    name: 'Riya Patel',
    location: 'Jaipur',
    text: 'I ordered the Kundan Bridal Set and it arrived beautifully packaged. The quality for the price is unmatched anywhere in India.',
  },
];

const VALUE_PROPS = [
  {
    icon: <Gem size={32} className="text-gold-500" />,
    title: 'Unmatched Craftsmanship',
    desc: 'Every piece is handcrafted by master artisans using centuries-old techniques passed down through generations.',
  },
  {
    icon: <CheckCircle size={32} className="text-gold-500" />,
    title: 'Tailored for Brides',
    desc: 'Our collections are curated specifically for bridal occasions — from mehendi to reception and everything in between.',
  },
  {
    icon: <Star size={32} className="text-gold-500" />,
    title: 'Luxury Within Reach',
    desc: 'We believe every bride deserves luxury. Our pricing ensures you get heirloom quality without the heirloom price.',
  },
];

export default function HomePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  function toggleVideo() {
    const v = videoRef.current;
    if (!v) return;
    if (isPlaying) {
      v.pause();
      setIsPlaying(false);
    } else {
      v.play();
      setIsPlaying(true);
    }
  }

  return (
    <div className="bg-white">
      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <img
          src={IMAGES.heroBride}
          alt="Bridal hero"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-emerald-950/70" />
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, letterSpacing: '0.3em' }}
            animate={{ opacity: 1, letterSpacing: '0.4em' }}
            transition={{ duration: 1 }}
            className="text-gold-400 uppercase text-sm tracking-widest mb-6 font-sans"
          >
            Almas Jewels — Est. 2001
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="font-serif text-4xl md:text-6xl lg:text-7xl text-white leading-tight mb-6"
          >
            Timeless Elegance for Your Most Memorable Day
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-white/80 text-lg md:text-xl mb-10 font-sans max-w-2xl mx-auto"
          >
            Handcrafted luxury bridal jewelry — Kundan, Polki, Meenakari & more — designed for
            the woman who deserves the extraordinary.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Link
              href="/shop"
              className="inline-block bg-gold-500 hover:bg-gold-400 text-emerald-950 font-sans font-bold uppercase tracking-widest px-10 py-4 text-sm transition-colors duration-200"
            >
              Explore the Collection
            </Link>
          </motion.div>
        </div>
        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 w-px h-12 bg-gold-500/60"
        />
      </section>

      {/* ─── VALUE PROPS ─── */}
      <section className="bg-emerald-950 py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          {VALUE_PROPS.map((vp, i) => (
            <FadeInSection key={vp.title} delay={i * 0.15}>
              <div className="text-center">
                <div className="flex justify-center mb-4">{vp.icon}</div>
                <h3 className="font-serif text-xl text-white mb-3">{vp.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed font-sans">{vp.desc}</p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* ─── SHOP BY CATEGORY ─── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <FadeInSection>
            <div className="text-center mb-16">
              <p className="text-gold-600 uppercase tracking-widest text-xs font-sans mb-3">
                Collections
              </p>
              <h2 className="font-serif text-4xl md:text-5xl text-emerald-950">
                Shop By Category
              </h2>
            </div>
          </FadeInSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORIES.map((cat, i) => (
              <FadeInSection key={cat.name} delay={i * 0.12}>
                <Link href={cat.href} className="group block overflow-hidden">
                  <div className="relative overflow-hidden aspect-[3/4]">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-emerald-950/30 group-hover:bg-emerald-950/50 transition-colors duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="font-serif text-white text-xl mb-1">{cat.name}</h3>
                      <p className="text-white/70 text-xs font-sans uppercase tracking-wider">
                        {cat.desc}
                      </p>
                    </div>
                  </div>
                </Link>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── VIDEO LOOKBOOK ─── */}
      <section className="bg-emerald-900 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeInSection>
            <div className="text-center mb-12">
              <p className="text-gold-400 uppercase tracking-widest text-xs font-sans mb-3">
                Experience
              </p>
              <h2 className="font-serif text-4xl md:text-5xl text-white">The Bridal Lookbook</h2>
              <p className="text-white/60 mt-4 font-sans text-sm max-w-lg mx-auto">
                Watch our latest bridal collection come to life — craftsmanship, elegance, and
                tradition captured in every frame.
              </p>
            </div>
          </FadeInSection>
          <FadeInSection delay={0.2}>
            <div
              className="relative cursor-pointer group"
              onClick={toggleVideo}
            >
              <video
                ref={videoRef}
                poster={IMAGES.video_thumb}
                src="https://cdn.pixabay.com/video/2020/06/15/42079-429990835_large.mp4"
                loop
                playsInline
                className="w-full aspect-video object-cover"
                onEnded={() => setIsPlaying(false)}
              />
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                  <div className="w-20 h-20 flex items-center justify-center bg-gold-500/90 group-hover:bg-gold-400 transition-colors">
                    <svg className="w-8 h-8 text-emerald-950 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ─── TRUST BADGES ─── */}
      <section className="py-16 px-6 border-y border-gray-100">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          {[
            {
              icon: <ShieldCheck size={28} className="text-gold-500" />,
              label: 'Authenticity Guaranteed',
              sub: 'Every piece is certified genuine',
            },
            {
              icon: <Truck size={28} className="text-gold-500" />,
              label: 'Safe & Fast Delivery',
              sub: 'Insured shipping across India',
            },
            {
              icon: <Gem size={28} className="text-gold-500" />,
              label: 'Premium Quality',
              sub: 'Artisan crafted, heirloom grade',
            },
          ].map((b, i) => (
            <FadeInSection key={b.label} delay={i * 0.1}>
              <div className="flex flex-col items-center gap-3">
                {b.icon}
                <p className="font-sans font-semibold text-emerald-950 uppercase tracking-wider text-xs">
                  {b.label}
                </p>
                <p className="text-gray-500 text-xs">{b.sub}</p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <FadeInSection>
            <div className="text-center mb-16">
              <p className="text-gold-600 uppercase tracking-widest text-xs font-sans mb-3">
                Stories
              </p>
              <h2 className="font-serif text-4xl md:text-5xl text-emerald-950">
                Our Brides Speak
              </h2>
            </div>
          </FadeInSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <FadeInSection key={t.name} delay={i * 0.15}>
                <div className="bg-gray-50 border border-gray-100 p-8">
                  <Quote size={24} className="text-gold-500 mb-4" />
                  <p className="text-gray-700 text-sm leading-relaxed font-sans mb-6 italic">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div>
                    <p className="font-sans font-semibold text-emerald-950 text-sm uppercase tracking-wider">
                      {t.name}
                    </p>
                    <p className="text-gold-600 text-xs font-sans">{t.location}</p>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="bg-emerald-950 py-24 px-6 text-center">
        <FadeInSection>
          <p className="text-gold-400 uppercase tracking-widest text-xs font-sans mb-4">
            Begin Your Journey
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-6">
            Find Your Perfect Bridal Look
          </h2>
          <p className="text-white/60 font-sans text-sm max-w-lg mx-auto mb-10">
            Every bride is unique. Explore our full collection and find the piece that tells your
            story.
          </p>
          <Link
            href="/shop"
            className="inline-block border border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-emerald-950 font-sans font-bold uppercase tracking-widest px-10 py-4 text-sm transition-colors duration-200"
          >
            Shop the Collection
          </Link>
        </FadeInSection>
      </section>
    </div>
  );
}
